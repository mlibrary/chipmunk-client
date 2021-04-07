import RawArtifact from '../rawArtifact'
import Packager from '../packager'
import PackagingListener from '../packagingListener'

export default class PackageArtifacts {
  constructor ({
    contentTypeId,
    artifactLocations,
    listener = new PackagingListener(),
    makePackager = (artifact, listener) => new Packager({ artifact, listener })
  }) {
    this.listener = listener
    this.makePackager = makePackager
    this.artifacts = this.buildArtifacts(contentTypeId, artifactLocations)
  }

  static invoke (...args) {
    return new PackageArtifacts(...args).call()
  }

  async call () {
    for (const artifact of this.artifacts) {
      await this.process(artifact)
    }
    this.listener.done()
  }

  async process (artifact) {
    await this.makePackager(artifact, this.listener).package()
  }

  buildArtifacts (contentTypeId, artifactLocations) {
    return artifactLocations.map(path => new RawArtifact({ contentTypeId, path }))
  }
}

export const { invoke } = PackageArtifacts
