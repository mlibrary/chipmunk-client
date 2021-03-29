<script>
export let pkg;
$: location = pkg.artifact.location;
$: contentType = pkg.contentTypeId;
</script>

<span class="location">{location}</span>
(<span class="content-type">{contentType}</span>)
