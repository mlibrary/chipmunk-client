# Dark Blue ("Project Chipmunk") Client

A Preservation-Focused Dark Repository for the University of Michigan

## Uploader Setup

You have two main options for configuring your API key and the URL to the Chipmunk server:

1. Set `CHIPMUNK_API_URL` and `CHIPMUNK_API_KEY` in the environment, or
2. Add a `config/settings.local.yml` to set literal values for `url` and `api_key`
   (leaving settings.yml alone):

```yaml
api_key: YOUR_CHIPMUNK_API_KEY
# should be the full URL to the Chipmunk server; defaults to http://localhost:3000
url: http://localhost:3000
```

You may also specify a separate configuration file with the `-c` option for the uploader.

## Uploader Usage

```
bin/upload [-c path/to/config.yml] /path/to/bag1 /path/to/bag2
```

If no config file is specified, it will use `config/client.yml`, if present, by default.

The client will display progress on uploading and validating each bag in sequence.

## Bagging Audio Content

`makebag audio` will create a [BagIt bag](https://tools.ietf.org/id/draft-kunze-bagit-14.txt) and move the files from `source` into `output_bag/data`. It expects there to be a METS file which contains an `mdRef` element that links to a record in [Mirlyn](https://mirlyn.lib.umich.edu); it will download MARC-XML for that record and included it in the bag.

```
bin/makebag audio <barcode> -s <source> <output bag directory>
```

## Bagging "Bentley Audio" Content

`makebag bentleyaudio` will use a specialized profile for audio materials from
the Bentley Historical Library. For this content type, there will usually be
EAD metadata, rather than the METS file in the general audio profile. Using
the "local metadata" means that the EAD sits outside of the content directory.
For example:

```
bin/makebag bentleyaudio <barcode> -s /path/to/content --metadata-type EAD --metadata-path /path/to/barcode-ead.xml --metadata-url https://example.org/hosted-ead /path/to/bags/barcode
```


## Bagging Digital Forensics Content

`makebag digital` will add chipmunk bagging information to an existing bag. The bag should follow the [UMICH disk imaging profile](https://www.umich.edu/~aelkiss/UMICH-Disk-Imaging-profile.json)

```
bin/makebag digital barcode path_to_bag


## Bagging Video Game Content

`makebag video_game` will add chipmunk bagging information to an existing bag. The bag should follow the [UMICH video game  profile](https://github.com/mlibrary/chipmunk/tree/master/features/support)

```
bin/makebag video_game barcode path_to_bag
```
