<script>
import PackageItem from './PackageItem.svelte';

export let packages = [];
</script>

<ul id="package-list">
{#each packages as pkg}
  <li><PackageItem pkg={pkg}/></li>
{/each}
</ul>
