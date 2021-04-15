<script>
    import { artifactList } from './stores'
    export let artifact = {
        identifier: "39015234",
        packagedPath: '',
        packaging: false,
        packaged: false,
        uploading: false,
        uploaded: false
    }

    export let eventTable

    let previousContentTypeId = artifact.contentTypeId
    $: contentTypeChanged = artifact.contentTypeId !== previousContentTypeId

    $: isUploading = !!artifact.uploading
    $: isUploaded = !!artifact.uploaded
    $: isPackaged = !!artifact.packaged
    $: isPackaging = !!artifact.packaging

    $: canChangeType = contentTypeChanged && canPackage
    $: canPackage = !isUploaded && !isPackaged && !isPackaging
    $: canUpload = !isUploaded && isPackaged

    function packaging(anArtifact) {
        console.log(`Packaging: ${artifact.path} (${artifact.contentTypeId})`)
        artifact.packaging = true
        artifact = artifact
        const { identifier, contentTypeId } = anArtifact
        eventTable.row.add([ identifier, contentTypeId, 'Packaging', '...']).draw(false)
    }

    function packaged(anArtifact) {
        console.log(`Packaged: ${anArtifact.path} (${anArtifact.contentTypeId})`)
        artifact.packaging = false
        artifact.packaged = true
        artifact.packagedPath = anArtifact.path
        artifact = artifact
        const { identifier, contentTypeId } = anArtifact
        // events.push({ identifier, contentTypeId, event: 'Packaged', details: '...' })
        // eventTable.row.add({ identifier, contentTypeId, event: 'Packaged', details: '...' })
        eventTable.row.add([ identifier, contentTypeId, 'Packaged', '...']).draw(false)
    }

    function failed(anArtifact, err) {
        console.error(err)
        artifact.packaging = false
        artifact.uploading = false
        const { identifier, contentTypeId } = anArtifact
        eventTable.row.add([ identifier, contentTypeId, 'Error', '...']).draw(false)
    }

    function done() {
    }

    const listener = { packaging, packaged, failed, done }

    function updateContentType () {
        artifact = artifact
        previousContentTypeId = artifact.contentTypeId
        artifactList.update(artifact)
    }

    function startPackaging () {
        artifact.contentTypeId = previousContentTypeId
        artifact = artifact
        interactors.PackageArtifacts({contentTypeId: artifact.contentTypeId, artifactLocations: [artifact.path], listener})
    }
</script>

<div class="grid-container artifact-detail">
    <div class="artifact-row grid-x grid-padding-x align-middle">
        <div class="metadata-field medium-4 cell">Identifier / Barcode</div>
        <div class="metadata-value cell auto"><h3>{artifact.identifier}</h3></div>
    </div>
    <div class="artifact-row grid-x grid-padding-x align-middle">
        <div class="metadata-field medium-4 cell">Content Type</div>
        <div class="metadata-control medium-4 cell">
            <select disabled={!canPackage} bind:value={artifact.contentTypeId} class="small">
                <option value="video">AMI / Video</option>
                <option value="digital">Digital Forensics</option>
                <option value="video_game">Video Game</option>
            </select>
        </div>
        <div class="metadata-control medium-4 cell">
            <button class="button small expanded" disabled={!canChangeType} on:click|preventDefault={updateContentType}>Apply Change</button>
        </div>
    </div>
    <div class="artifact-row grid-x grid-padding-x align-middle">
        <div class="metadata-field medium-4 cell">Packaged Folder</div>
        <div class="metadata-value medium-4 cell">
            {#if isPackaged}
                {artifact.packagedPath}
            {:else if isPackaging}
                <em>(Now packaging...)</em>
            {:else}
                <em>(Not yet packaged)</em>
            {/if}
        </div>
        <div class="metadata-control medium-4 cell">
            <button disabled={!canPackage} on:click|preventDefault={startPackaging} class="button small expanded">Package</button>
        </div>
    </div>
    <div class="artifact-row grid-x grid-padding-x align-middle">
        <div class="metadata-field medium-4 cell">Dark Blue ID</div>
        <div class="metadata-value medium-4 cell">
            {#if isUploaded}
                <a href="#">(Link to item in Dark Blue web UI)</a>
            {:else if isUploading}
                <em>(Now uploading...)</em>
            {:else}
                <em>(Not yet assigned)</em>
            {/if}
        </div>
        <div class="metadata-control medium-4 cell"><button disabled={!canUpload} class="button small expanded disabled">Upload</button></div>
    </div>
</div>
