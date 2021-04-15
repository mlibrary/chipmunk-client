<script>
import { onMount } from 'svelte'
import ArtifactDetail from './ArtifactDetail.svelte'
import { artifactList } from './stores'

let packages = []
let errors = []
let artifactLocations
let contentType
let status = "Ready"

const Modes = Object.freeze({ Detail: 'detail', AddArtifact: 'add-artifact' })
let mode = Modes.AddArtifact

let eventTable

let contentTypeId
let artifactPath
let selectedArtifact

let tracked = []

onMount(() => {
  jQuery(document).foundation()
  eventTable = jQuery('#event-log').DataTable({
    "scrollY": "200px",
    "ordering": false,
    "paging": false,
    "searching": false,
  })
})

function packaging(artifact) {
  console.log(`Packaging: ${artifact.path} (${artifact.contentTypeId})`)
}

function packaged(artifact) {
  console.log(`Packaged: ${artifact.path} (${artifact.contentTypeId})`)
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

function showAdd () {
  mode = Modes.AddArtifact
}

async function trackArtifact () {
  const artifact = await interactors.TrackArtifact({ path: artifactPath, contentTypeId })
  artifactList.push(artifact)
  viewDetail(artifact)
}

async function viewDetail (artifact) {
  selectedArtifact = artifact
  mode = Modes.Detail
}
</script>

<div class="app-shell">
  <div class="app-header">
    <h1 class="h4 subheader">Dark Blue Uploader</h1>
  </div>

  <aside class="app-workspace">
    <h2 class="h6">Workspace</h2>
    <div><button id="add-artifact" on:click|preventDefault={showAdd} class="button secondary small">Add Artifact</button></div>
    <ul id="workspace-artifacts" class="vertical menu">
      {#each $artifactList.list as artifact}
        <li data-identifier={artifact.identifier} data-path={artifact.path}>
          <button on:click|preventDefault={() => { viewDetail(artifact) }}>{artifact.identifier}</button>
        </li>
      {/each}
    </ul>
  </aside>

  <article class="app-inspector">
    <h2 class="h6">Inspector</h2>
    {#if mode === Modes.Detail}
      <ArtifactDetail artifact={selectedArtifact} eventTable={eventTable}></ArtifactDetail>
    {:else}
    <form id="new-artifact">
      <div class="grid-container">
        <div class="grid-x grid-padding-x">
          <div class="cell auto">
            <label>Artifact Path
              <input id="new-artifact-path" type="text" bind:value={artifactPath} placeholder="/full/path/to/artifact/directory">
            </label>
          </div>
        </div>
        <div class="grid-x grid-padding-x">
          <div class="cell auto">
            <label>Content Type
              <select id="new-artifact-type" bind:value={contentTypeId}>
                  <option value="video">AMI / Video</option>
                  <option value="digital">Digital Forensics</option>
                  <option value="video_game">Video Game</option>
              </select>
            </label>
          </div>
        </div>
        <div class="grid-x grid-padding-x">
          <div class="cell medium-4 medium-offset-4">
            <button id="new-artifact-track" on:click|preventDefault={trackArtifact} class="button expanded">Track Artifact</button>
          </div>
        </div>
      </div>
    </form>
    {/if}
  </article>
  <article class="app-events">
    <h2 class="h6">Events</h2>
    <table id="event-log" class="hover">
      <thead>
        <tr>
          <th>Identifier</th>
          <th>Content Type</th>
          <th>Event</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody>
      </tbody>
    </table>
  </article>
</div>
