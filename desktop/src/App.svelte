<script>
let items = [];
let selectedArtifacts;

function startPackaging() {
  items = [selectedArtifacts];
}
</script>

<textarea id="artifact-list" name="artifact-list" bind:value={selectedArtifacts}/>
<input id="content-type" type="text" name="content-type">
<button id="start-packaging" on:click={startPackaging}>Start Packaging</button>

<ul id="package-list">
{#each items as item}
<li>{item}</li>
{/each}
</ul>

<svelte:head>
<script type="module" src="https://unpkg.com/@umich-lib/components@v1/dist/umich-lib/umich-lib.esm.js"></script>
<script nomodule src="https://unpkg.com/@umich-lib/components@v1/dist/umich-lib/umich-lib.js"></script>
</svelte:head>
