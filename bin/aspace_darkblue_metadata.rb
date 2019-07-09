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

altid = 'ROSSICA-2'
barcode = '39015087083518'

# read config from yaml
config = ENV['ASPACE_CLIENT_CONFIG'] || 'config/aspace_client.yaml'
client = ASpaceClient.new(**YAML.load(File.read(config)))

digital_objects = client.search(altid,primary_type: 'digital_object')

if !digital_objects.empty?
  puts "existing digital object(s)"
  digital_objects.each do |result|
    puts %w(id title).map { |f| result[f]}.join("\t")
    if result['linked_instance_urls']
      puts "linked archival object(s): " + result['linked_instance_uris'].join(" ")
    end
  end

  # TODO: verify the digital object has the correct barcode
  # TODO: verify the digital object has the file version
else
  client.create_digital_object(altid,barcode)
end

archival_objects = client.search(altid,primary_type: 'archival_object').reject { |r| r['types'].include?('pui_only') }
if !archival_objects.empty?
  puts "archival object(s):"
  archival_objects.each do |result|
    puts %w(id title types).map { |f| result[f]}.join("\t")
  end
end

# TODO: after finding the archival object, see if it's already linked to the digital object above
# if the digital object is linked to some other archival object, error

require 'pry'
binding.pry

1
