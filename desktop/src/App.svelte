<script>
let items = [];
let selectedArtifacts;

function startPackaging() {
  items = [selectedArtifacts];
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

  <button id="start-packaging" on:click={startPackaging} class="button">Start Packaging</button>
</form>

<ul id="package-list">
{#each items as item}
  <li>{item}</li>
{/each}
</ul>
