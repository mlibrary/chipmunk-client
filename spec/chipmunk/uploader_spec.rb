# frozen_string_literal: true

require "spec_helper"
require "chipmunk/uploader"

describe Chipmunk::Uploader do
  let(:client) do
    instance_double(Chipmunk::Client)
  end
  let(:bag_id) { "14d25bcd-deaf-4c94-add7-c189fdca4692" }
  let(:ext_id) { "test_ex_id_22" }
  let(:rsyncer) { instance_double(Chipmunk::BagRsyncer, upload: true) }
  let(:request) do
    # from spec/support/fixtures/test_bag
    {
      "bag_id"      => bag_id,
      "external_id" => ext_id,
      "upload_link" => "#{Faker::Internet.email}:/#{Faker::Lorem.word}/path/#{bag_id}"
    }
  end

  let(:queue_item) do
    {
      "id"      => 1,
      "status"  => "DONE",
      "package" => "/v1/packages/#{bag_id}"
    }
  end

  before(:each) do
    allow(client).to receive(:post)
      .with("/v1/requests", anything)
      .and_return(request)
    allow(client).to receive(:post)
      .with("/v1/requests/#{request["bag_id"]}/complete")
      .and_return(queue_item)
  end

  subject do
    described_class.new(fixture("test_bag"), client: client, rsyncer: rsyncer, config: double(:config, validate_before_upload: true))
  end

  context "when the bag is not already stored" do
    before(:each) { request["stored"] = false }

    context "when bag validation succeeds" do
      describe "#upload" do
        it "uploads the bag" do
          expect(rsyncer).to receive(:upload).with(request["upload_link"])
          squelch_stdout { subject.upload }
        end

        it "prints a success message" do
          expect { subject.upload }.to output(/#{request["external_id"]}.*success/).to_stdout
        end

        it "returns true" do
          expect(squelch_stdout { subject.upload }).to be true
        end
      end

      describe "#upload_without_waiting_for_result" do
        it "doesn't write anything to stdout" do
          expect{ subject.upload_without_waiting_for_result }.not_to output.to_stdout
        end

        it "uploads the bag" do
          expect(rsyncer).to receive(:upload).with(request["upload_link"])
          subject.upload_without_waiting_for_result
        end
      end

      describe "#print_result_when_done" do
        context "before running #upload_without_waiting_for_result" do
          it "returns nil" do
            expect(squelch_stdout { subject.print_result_when_done }).to be nil
          end

          it "identifies the bag awaiting upload" do
            expect { subject.print_result_when_done }.to output(/Waiting.*#{bag_id} \/ #{ext_id}/).to_stdout
          end
        end

        context "after running #upload_without_waiting_for_result" do
          before(:each) { subject.upload_without_waiting_for_result }

          it "prints a success message" do
            expect { subject.print_result_when_done }.to output(/#{request["external_id"]}.*success/).to_stdout
          end

          it "returns true" do
            expect(squelch_stdout { subject.print_result_when_done }).to be true
          end
        end
      end
    end

    context "when bag validation fails" do
      let(:queue_item) do
        {
          "status" => "FAILED",
          "error"  => "something went wrong\n" \
            "here are the details"
        }
      end

      describe "#upload" do
        it "prints an error message" do
          expect { subject.upload }.to output(/#{request["external_id"]}.*failure/).to_stdout
        end

        it "returns false" do
          expect(squelch_stdout { subject.upload }).to be false
        end

        it "formats the validation failure" do
          expect { subject.upload }.to output(/something went wrong\nhere are the details/).to_stdout
        end
      end

      describe "#upload_without_waiting_for_result" do
        it "doesn't write anything to stdout" do
          expect{ subject.upload_without_waiting_for_result }.not_to output.to_stdout
        end

        it "uploads the bag" do
          expect(rsyncer).to receive(:upload).with(request["upload_link"])
          subject.upload_without_waiting_for_result
        end
      end

      describe "#print_result_when_done" do
        context "before running #upload_without_waiting_for_result" do
          it "returns nil" do
            expect(squelch_stdout { subject.print_result_when_done }).to be nil
          end

          it "identifies the bag awaiting upload" do
            expect { subject.print_result_when_done }.to output(/Waiting.*#{bag_id} \/ #{ext_id}/).to_stdout
          end
        end

        context "after running #upload_without_waiting_for_result" do
          before(:each) { subject.upload_without_waiting_for_result }

          it "prints an error message" do
            expect { subject.print_result_when_done }.to output(/#{request["external_id"]}.*failure/).to_stdout
          end

          it "returns false" do
            expect(squelch_stdout { subject.print_result_when_done }).to be false
          end

          it "formats the validation failure" do
            expect { subject.print_result_when_done }.to output(/something went wrong\nhere are the details/).to_stdout
          end
        end
      end
    end

    context "when the bag's external ID mismatches the external ID in the request" do
      let(:different_external_id_request) { request.merge("external_id" => "gobbledygook") }

      before(:each) do
        allow(client).to receive(:post)
          .with("/v1/requests", anything)
          .and_return(different_external_id_request)
      end

      describe "#upload" do
        it "prints an error message" do
          expect { subject.upload }.to output(/expected.*"gobbledygook".*"test_ex_id_22"/).to_stdout
        end

        it "does not upload the bag" do
          expect(rsyncer).not_to receive(:upload)
          squelch_stdout { subject.upload }
        end
      end

      describe "#upload_without_waiting_for_result" do
        it "prints an error message" do
          expect { subject.upload_without_waiting_for_result }.to output(/expected.*"gobbledygook".*"test_ex_id_22"/).to_stdout
        end

        it "does not upload the bag" do
          expect(rsyncer).not_to receive(:upload)
          squelch_stdout { subject.upload_without_waiting_for_result }
        end
      end

      describe "#print_result_when_done" do
        context "before running #upload_without_waiting_for_result" do
          it "returns nil" do
            expect(squelch_stdout { subject.print_result_when_done }).to be nil
          end

          it "identifies the bag awaiting upload" do
            expect { subject.print_result_when_done }.to output(/Waiting.*#{bag_id} \/ #{ext_id}/).to_stdout
          end
        end

        context "after running #upload_without_waiting_for_result" do
          before(:each) do
            squelch_stdout { subject.upload_without_waiting_for_result }
          end

          it "returns nil" do
            expect(squelch_stdout { subject.print_result_when_done }).to be nil
          end

          it "identifies the bag awaiting upload" do
            expect { subject.print_result_when_done }.to output(/Waiting.*#{bag_id} \/ #{ext_id}/).to_stdout
          end
        end
      end
    end
  end

  context "when the bag is stored" do
    before(:each) { request["stored"] = true }

    describe "#upload" do
      it "does not attempt to upload the bag" do
        expect(rsyncer).not_to receive(:upload)
        expect { subject.upload }.to output(/been uploaded/).to_stdout
      end
    end

    describe "#upload_without_waiting_for_result" do
      it "does not attempt to upload the bag" do
        expect(rsyncer).not_to receive(:upload)
        expect { subject.upload_without_waiting_for_result }.to output(/been uploaded/).to_stdout
      end
    end

    describe "#print_result_when_done" do
      context "before running #upload_without_waiting_for_result" do
        it "returns nil" do
          expect(squelch_stdout { subject.print_result_when_done }).to be nil
        end

        it "identifies the bag awaiting upload" do
          expect { subject.print_result_when_done }.to output(/Waiting.*#{bag_id} \/ #{ext_id}/).to_stdout
        end
      end

      context "after running #upload_without_waiting_for_result" do
        before(:each) { squelch_stdout { subject.upload_without_waiting_for_result } }

        it "returns nil" do
          expect(squelch_stdout { subject.print_result_when_done }).to be nil
        end

        it "identifies the bag awaiting upload" do
          expect { subject.print_result_when_done }.to output(/Waiting.*#{bag_id} \/ #{ext_id}/).to_stdout
        end
      end
    end
  end

  context "when something goes wrong" do
    let(:rest_error) do
      double(:rest_error,
        response: '{ "exception": "some problem"}',
        message: "599 Having a bad problem")
    end

    before(:each) do
      allow(client).to receive(:post).and_raise(Chipmunk::ClientError.new(rest_error))
    end

    describe "#upload" do
      it "prints the error message" do
        expect { subject.upload }.to output(/some problem/).to_stdout
      end
    end

    describe "#upload_without_waiting_for_result" do
      it "prints the error message" do
        expect { subject.upload_without_waiting_for_result }.to output(/some problem/).to_stdout
      end
    end

    describe "#print_result_when_done" do
      context "before running #upload_without_waiting_for_result" do
        it "returns nil" do
          expect(squelch_stdout { subject.print_result_when_done }).to be nil
        end

        it "identifies the bag awaiting upload" do
          expect { subject.print_result_when_done }.to output(/Waiting.*#{bag_id} \/ #{ext_id}/).to_stdout
        end
      end

      context "after running #upload_without_waiting_for_result" do
        before(:each) { squelch_stdout { subject.upload_without_waiting_for_result } }

        it "returns nil" do
          expect(squelch_stdout { subject.print_result_when_done }).to be nil
        end

        it "identifies the bag awaiting upload" do
          expect { subject.print_result_when_done }.to output(/Waiting.*#{bag_id} \/ #{ext_id}/).to_stdout
        end
      end
    end
  end
end
