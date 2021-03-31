export default class PackageArtifacts {
  constructor({contentTypeId, artifactLocations, listener}) {
    this.listener = listener;
    this.artifactLocations = artifactLocations;
  }

  call() {
    if (this.artifactLocations.length !== 0) {
      this.listener.packaging();
      this.listener.packaged();
    }
    this.listener.done();
  }
}
