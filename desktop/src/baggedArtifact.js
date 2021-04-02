import * as path from 'path'

/**
 * A BaggedArtifact is an on-disk packaging of a digital artifact to be preserved.
 *
 * The directory name is expected to match the artifact's identifier and the
 * contents are expected to be packaged in BagIt format, ready for deposit.
 */
export default class BaggedArtifact {
  constructor ({ path }) {
    this.path = path
  }

  get identifier () {
    return path.basename(this.path)
  }

  get parentDirectory () {
    return path.dirname(this.path)
  }
}
