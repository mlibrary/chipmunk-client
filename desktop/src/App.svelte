<script>
import { packageArtifactLocations } from './domain';

let items = [];
let artifactLocations;
let contentType;

function startPackaging() {
  packageArtifactLocations(contentType, getArtifactLocations(), packages => {
    items = packages;
  });
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

<ul id="package-list">
{#each items as item}
  <li>
    <span class="location">{item.artifact.location}</span>
    (<span class="content-type">{item.contentTypeId}</span>)
  </li>
{/each}
</ul>
