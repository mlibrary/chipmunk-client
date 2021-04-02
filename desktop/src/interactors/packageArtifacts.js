import RawArtifact from '../rawArtifact'
import { wait } from '../util'

function defaultPackager() {
  return (artifact) => ({ async package() { return await wait(100) } })
}

export default class PackageArtifacts {
  constructor({contentTypeId, artifactLocations, listener, makePackager = defaultPackager()}) {
    this.listener = listener;
    this.makePackager = makePackager;
    this.artifacts = this.buildArtifacts(contentTypeId, artifactLocations);
  }

  async call() {
    await this.artifacts.forEach(artifact => this.process(artifact))
    this.listener.done();
  }

  async process(artifact) {
    this.listener.packaging(artifact);
    await this.makePackager(artifact).package();
    this.listener.packaged(artifact);
  }

  buildArtifacts(contentTypeId, artifactLocations) {
    return artifactLocations.map(path => new RawArtifact({ contentTypeId, path }))
  }
}
