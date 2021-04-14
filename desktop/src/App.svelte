<script>
  import { onMount } from 'svelte'

let packages = []
let errors = []
let artifactLocations
let contentType
let status = "Ready"

let eventTable

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
<div class="app-shell">
  <div class="app-header">
    <h1 class="h4 subheader">Dark Blue Uploader</h1>
  </div>
  <aside class="app-workspace">
    <h2 class="h6">Workspace</h2>
    <ul class="accordion" data-accordion>
      <li class="accordion-item is-active" data-accordion-item>
        <!-- Accordion tab title -->
        <a href="#" class="accordion-title">Accordion 1</a>

        <!-- Accordion tab content: it would start in the open state due to using the `is-active` state class. -->
        <div class="accordion-content" data-tab-content>
          <p>Panel 1. Lorem ipsum dolor</p>
          <a href="#">Nowhere to Go</a>
        </div>
      </li>
      <li class="accordion-item" data-accordion-item>
        <!-- Accordion tab title -->
        <a href="#" class="accordion-title">Accordion 1</a>

        <!-- Accordion tab content: it would start in the open state due to using the `is-active` state class. -->
        <div class="accordion-content" data-tab-content>
          <p>Panel 1. Lorem ipsum dolor</p>
          <a href="#">Nowhere to Go</a>
        </div>
      </li>
      <li class="accordion-item" data-accordion-item>
        <!-- Accordion tab title -->
        <a href="#" class="accordion-title">Accordion 1</a>

        <!-- Accordion tab content: it would start in the open state due to using the `is-active` state class. -->
        <div class="accordion-content" data-tab-content>
          <p>Panel 1. Lorem ipsum dolor</p>
          <a href="#">Nowhere to Go</a>
        </div>
      </li>
    </ul>
  </aside>
  <article class="app-inspector">
    <h2 class="h6">Inspector</h2>
    <div class="grid-container artifact-details">
      <div class="artifact-row grid-x grid-padding-x align-middle">
        <div class="metadata-field medium-4 cell">Identifier / Barcode</div>
        <div class="metadata-value cell auto"><h3>39015234</h3></div>
      </div>
      <div class="artifact-row grid-x grid-padding-x align-middle">
        <div class="metadata-field medium-4 cell">Content Type</div>
        <div class="metadata-control medium-4 cell">
          <select class="small">
            <option>Digital Forensics</option>
            <option>Video Game</option>
          </select>
        </div>
      </div>
      <div class="artifact-row grid-x grid-padding-x align-middle">
        <div class="metadata-field medium-4 cell">Packaged Folder</div>
        <div class="metadata-value medium-4 cell">bagged/39015234</div>
        <div class="metadata-control medium-4 cell"><button class="button small expanded">Package</button></div>
      </div>
      <div class="artifact-row grid-x grid-padding-x align-middle">
        <div class="metadata-field medium-4 cell">Dark Blue ID</div>
        <div class="metadata-value medium-4 cell"><em>(Not yet assigned)</em></div>
        <div class="metadata-control medium-4 cell"><button class="button small expanded disabled">Upload to Assign</button></div>
      </div>
    </div>
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
        <tr>
          <td>foo</td>
          <td>foo</td>
          <td>foo</td>
          <td>foo</td>
        </tr>
        <tr>
          <td>foo</td>
          <td>foo</td>
          <td>foo</td>
          <td>foo</td>
        </tr>
        <tr>
          <td>foo</td>
          <td>foo</td>
          <td>foo</td>
          <td>foo</td>
        </tr>
        <tr>
          <td>foo</td>
          <td>foo</td>
          <td>foo</td>
          <td>foo</td>
        </tr>
        <tr>
          <td>foo</td>
          <td>foo</td>
          <td>foo</td>
          <td>foo</td>
        </tr>
        <tr>
          <td>foo</td>
          <td>foo</td>
          <td>foo</td>
          <td>foo</td>
        </tr>
        <tr>
          <td>foo</td>
          <td>foo</td>
          <td>foo</td>
          <td>foo</td>
        </tr>
        <tr>
          <td>foo</td>
          <td>foo</td>
          <td>foo</td>
          <td>foo</td>
        </tr>
        <tr>
          <td>foo</td>
          <td>foo</td>
          <td>foo</td>
          <td>foo</td>
        </tr>
        <tr>
          <td>foo</td>
          <td>foo</td>
          <td>foo</td>
          <td>foo</td>
        </tr>
        <tr>
          <td>foo</td>
          <td>foo</td>
          <td>foo</td>
          <td>foo</td>
        </tr>
        <tr>
          <td>foo</td>
          <td>foo</td>
          <td>foo</td>
          <td>foo</td>
        </tr>
        <tr>
          <td>foo</td>
          <td>foo</td>
          <td>foo</td>
          <td>foo</td>
        </tr>
      </tbody>
    </table>
  </article>
</div>
