<script>
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

let packages = [];
let artifactLocations;
let contentType;
let status = "Ready";

function startPackaging() {
  // We think this is a pretty good shape... The above sets the protocol/interface. We want to
  // start building the real interactor now. We will probably implement the event handlers
  // as top level functions on the component and then use a literal to bind and pass them.
  // For example, listener: { queued, packaging, packaged, failed, done } would sugar out to an
  // object with just the event functions, rather than the whole component.

  // new PackageArtifacts({contentType, artifactLocations: getArtifactLocations(), listener}).call();

  // Completely fake implementation to drive out the interface/events for the interactor
  packages = [];
  status = "Working"

  let listener = {
      queued() {},
      packaging() {},
      packaged(x) { packages = [...packages, x] },
      failed() {},
      done() { status = "Ready" }
  }

  getArtifactLocations().forEach((location) => {
    listener.packaged({ contentTypeId: contentType, location: location })
  })

  wait(500).then(() => { listener.done() })
}

function getArtifactLocations() {
  return artifactLocations.split("\n");
}
</script>

<h1><span class="subtle-heading">Step 1 of 3 to upload</span><br/>Select Artifacts</h1>

<form>
  <label>
    <span>Artifacts</span>
    <textarea id="artifact-list" name="artifact-list" bind:value={artifactLocations}/>
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

<ul id="package-list">
{#each packages as pkg}
  <li>
    <span class="location">{pkg.location}</span> (<span class="content-type">{pkg.contentTypeId}</span>)
  </li>
{/each}
</ul>

<svelte:head>
<script type="module" src="../node_modules/@umich-lib/components/dist/umich-lib/umich-lib.esm.js"></script>
</svelte:head>
