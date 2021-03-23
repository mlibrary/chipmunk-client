<script>
	export let name;
  let title = 'key';

  function replace() {
      title = name;
      name = '';
  }
</script>

<!-- view 1 -->
<div class="viewport-container">
  <div id="test-text">This is NOT a test.</div>
  <!-- be clear with the h1 the purpose of the page -->
  <h1>Enter your {title} to continue</h1>
  <label>
    <!-- we can hide the label since it's so clear in the h1, but keep it for assistive tech and HTML semantics -->
    <input type="text" bind:value="{name}" />
    <button on:click={replace} class="button button--loud" style="margin-top: var(--space-medium);">Continue</button>
  </label>
 
  <!-- leave no dead ends -->
  <p><strong>Don't have a key?</strong> Contact Library IT <a href="https://www.lib.umich.edu/about-us/our-divisions-and-departments/library-information-technology/architecture-and-engineering">Architecture & Engineering</a> to request a key.</p>
</div>


  <p>Chrome Version: <span id="chrome-version">(Unknown)</span></p>
  <p>Node Version: <span id="node-version">(Unknown)</span></p>
  <p>Electron Version: <span id="electron-version">(Unknown)</span></p>
  <pre id="foo">(No file listing)</pre>

<svelte:head>
<script type="module" src="https://unpkg.com/@umich-lib/components@v1/dist/umich-lib/umich-lib.esm.js"></script>
<script nomodule src="https://unpkg.com/@umich-lib/components@v1/dist/umich-lib/umich-lib.js"></script>
</svelte:head>

