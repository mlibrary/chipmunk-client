import RawArtifact from '../rawArtifact'

export default class TrackArtifact {
  constructor ({ path, contentTypeId }) {
    this.path = path;
    this.contentTypeId = contentTypeId;
  }

  static invoke (...args) {
    return new TrackArtifact(...args).call()
  }

  async call () {
    const { contentTypeId, path } = this
    return new RawArtifact({ contentTypeId, path })
    // const raw = new RawArtifact({ contentTypeId, path })
    // const artifact = { contentTypeId, path, identifier: raw.identifier }
    // return artifact
    // const tracked = [...this.store.get('artifacts'), base]
    // tracked.sort((a, b) => (a < b ? -1 : 1))
    // this.store.set('artifacts', tracked)
  }
}

export const { invoke } = TrackArtifact
