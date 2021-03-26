<script>
import { RawArtifact, Package } from './domain';

let items = [];
let selectedArtifacts;

function startPackaging() {
  items = selectedArtifacts.split("\n").map(location => {
    return new RawArtifact(location);
  });
}
</script>

<h1><span class="subtle-heading">Step 1 of 3 to upload</span><br/>Select Artifacts</h1>

<form>
  <label>
    <span>Artifacts</span>
    <textarea id="artifact-list" name="artifact-list" bind:value={selectedArtifacts}/>
  </label>

  <label>
    <span>Content type</span>
    <input id="content-type" type="text" name="content-type">
  </label>

  <button id="start-packaging" on:click|preventDefault={startPackaging} class="button">Start Packaging</button>
</form>

<pre>items: {items}</pre>

<ul id="package-list">
{#each items as item}
  <li>{item.location}</li>
{/each}
</ul>
