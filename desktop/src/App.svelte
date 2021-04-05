<script>
let packages = []
let errors = []
let artifactLocations
let contentType
let status = "Ready"

function packaging(artifact) {
  console.log(`Packaging: ${artifact.path} (${artifact.contentTypeId})`)
}

function packaged(artifact) {
  console.log(`Packaged: ${artifact.path} (${artifact.contentTypeId})`)
  packages = [...packages, artifact]
}

function failed(artifact, err) {
  console.error(err)
  errors = [...errors, artifact]
}

function done() {
  status = "Ready"
}

function getArtifactLocations() {
    return artifactLocations.split("\n").map(line => line.trim()).filter(line => line.length !== 0);
}

function startPackaging() {
  let locations = getArtifactLocations()
  if (locations.length === 0) {
    return
  }

  packages = [];
  errors = [];
  status = "Working"


  let listener = { packaging, packaged, failed, done }
  interactors.PackageArtifacts({contentTypeId: contentType, artifactLocations: locations, listener})
}
</script>

<h1><span class="subtle-heading">Step 1 of 3 to upload</span><br/>Select Artifacts</h1>

<form>
  <label>
    <span>Artifacts</span>
    <textarea id="artifact-list" name="artifact-list" rows="10" cols="80" bind:value={artifactLocations}></textarea>
  </label>

  <label>
    <span>Content type</span>
    <input id="content-type" type="text" name="content-type" bind:value={contentType}>
  </label>

  <button id="start-packaging" on:click|preventDefault={startPackaging} class="button">Start Packaging</button>
</form>

<h2 id="packaging-status">
  {#if status === "Ready"}
    <span id="status-ready">Ready</span>
  {:else}
    <span id="status-working">Packaging...</span>
  {/if}
</h2>

<h3>Packages</h3>
<ul id="package-list">
{#each packages as pkg}
  <li>
    <span class="location">{pkg.path}</span> (<span class="content-type">{pkg.contentTypeId}</span>)
  </li>
{/each}
</ul>

<h3>Errors</h3>
<ul id="error-list">
{#each errors as pkg}
  <li>
    <span class="location">{pkg.path}</span> (<span class="content-type">{pkg.contentTypeId}</span>)
  </li>
{/each}
</ul>

<svelte:head>
<script type="module" src="../node_modules/@umich-lib/components/dist/umich-lib/umich-lib.esm.js"></script>
</svelte:head>
