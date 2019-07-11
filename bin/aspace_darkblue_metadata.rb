#!/usr/bin/env ruby

require 'faraday'
require 'yaml'
require 'pry'

class ASpaceClient

  def initialize(username:, password:, endpoint:, repository:)
    @repository = repository

    @conn = login!(endpoint,username,password)
  end

  def search(altid, primary_type: )
    response = conn.get(repo_endpoint('search'),
                      q: "title:\"#{altid}\" AND primary_type:\"#{primary_type}\"",
                      page: 1,
                      page_size: 10)

    handle_error(response)

    JSON.parse(response.body)['results']
  end

  def get(id)
    response = conn.get(id)
    handle_error(response)

    JSON.parse(response.body)
  end

  def update(id,data)
    response = conn.post(id) do |req|
      req.body = data.to_json
      req.headers['Content-Type'] = 'application/json'
    end

    handle_error(response)
  end

  def create_digital_object(altid,barcode)
    data = {
      "jsonmodel_type": "digital_object",
      "file_versions": [
        {
          "jsonmodel_type": "file_version",
          "is_representative": false,
          "file_uri": "https://darkblue.lib.umich.edu/artifacts/#{barcode}",
          "publish": false
        }
      ],
      "restrictions": false,
      "publish": false,
      "title": altid,
      "digital_object_id": barcode
		}

    response = conn.post(repo_endpoint('digital_objects')) do |req|
      req.body = data.to_json
      req.headers['Content-Type'] = 'application/json'
    end

    handle_error(response)
    JSON.parse(response.body)['uri']
  end

  private

  def repo_endpoint(path)
    "/repositories/#{repository}/#{path}"
  end

  def login!(endpoint,username,password)
    response = Faraday.post("#{endpoint}/users/#{username}/login", password: password) do |req|
      req.params['password'] = password
    end

    handle_error(response)
    sessionid = JSON.parse(response.body)['session']

    Faraday.new(
      url: endpoint,
      headers: {'X-ArchivesSpace-Session': sessionid}
    )
  end

  attr_reader :username, :password, :conn, :repository

  def handle_error(response)
    raise "HTTP #{response.status} #{response.reason_phrase}: " + JSON.parse(response.body)['error'].pretty_inspect unless response.status == 200
  end

end


class DigitalObjectLinker

  def initialize(client,altid,barcode)
    @client = client
    @altid = altid
    @barcode = barcode
  end

  def link
    digital_objects = client.search(altid,primary_type: 'digital_object')

    if !digital_objects.empty?
      show_digital_objects(digital_objects)
    else
      link_digital_object(client.create_digital_object(altid,barcode))
    end
  end

  def show_digital_objects(digital_objects)
    puts "existing digital object(s)"
    digital_objects.each do |result|
      # TODO: verify the digital object has the correct barcode
      # TODO: verify the digital object has the file version
      puts %w(id title).map { |f| result[f]}.join("\t")
      if result['linked_instance_uris']
        puts "linked archival object(s): " + result['linked_instance_uris'].join(" ")
      else
        print "link to digital object Y/[N]?"
        entry = STDIN.gets.strip
        link_digital_object(result['id']) if entry == 'Y'
      end
    end
  end

  def find_archival_object
    archival_objects = client.search(altid,primary_type: 'archival_object').reject { |r| r['types'].include?('pui_only') }
    if !archival_objects.empty?
      puts "archival object(s):"
      archival_objects.zip(1..archival_objects.length).each do |result,index|
        puts "#{index}) " + %w(id title types).map { |f| result[f]}.join("\t")
      end
    end

    print "Which is the correct one [1]?: "
    entry = STDIN.gets.strip.to_i

    if(!entry || entry > archival_objects.length)
      puts "#{entry} not a number or out of bounds"
      return nil
    else
      obj_index = entry - 1 || 0
      return archival_objects[obj_index]['id']
    end
  end

  def link_digital_object(digital_object_id)
    if(archival_object_id = find_archival_object)
      create_instance(archival_object_id, digital_object_id)
    else
      puts "Can't find archival object for #{altid}"
    end
  end

  def create_instance(archival_object_id,digital_object_id)
    puts "Will update #{archival_object_id}"

    archival_object = client.get(archival_object_id)

    archival_object["instances"].append(
      {
        "instance_type" => "digital_object",
        "digital_object" => { "ref" => digital_object_id }
      }
    )

    client.update(archival_object_id, archival_object)
  end

  private

  attr_reader :client, :altid, :barcode
end

# read config from yaml
config = ENV['ASPACE_CLIENT_CONFIG'] || 'config/aspace_client.yaml'
client = ASpaceClient.new(**YAML.load(File.read(config)))

altid_barcode_mapping = ARGV[0] || raise("Usage: #{$0} altid_barcode_mapping.txt")
puts altid_barcode_mapping

File.open(altid_barcode_mapping).each_line do |line|
  (altid,barcode) = line.strip.split("\t")
  if altid && barcode && altid =~ /^[A-Z]+-\d+$/ && barcode =~ /^39015\d{9}$/
    puts "linking #{altid} #{barcode}"
    DigitalObjectLinker.new(client,altid,barcode).link
  else
    print "bad line #{line}"
  end
end
