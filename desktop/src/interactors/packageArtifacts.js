import RawArtifact from '../rawArtifact'
import Packager from '../Packager'
import PackagingListener from '../packagingListener'

export default class PackageArtifacts {
  constructor ({
    contentTypeId,
    artifactLocations,
    listener = new PackagingListener(),
    makePackager = artifact => new Packager(artifact)
  }) {
    this.listener = listener
    this.makePackager = makePackager
    this.artifacts = this.buildArtifacts(contentTypeId, artifactLocations)
  }

  async call () {
    await this.artifacts.forEach(artifact => this.process(artifact))
    this.listener.done()
  }

  async process (artifact) {
    this.listener.packaging(artifact)
    await this.makePackager(artifact).package()
    this.listener.packaged(artifact)
  }

  buildArtifacts (contentTypeId, artifactLocations) {
    return artifactLocations.map(path => new RawArtifact({ contentTypeId, path }))
  }
}
