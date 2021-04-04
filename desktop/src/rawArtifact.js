import * as path from 'path'

// These content types are already bagged up and should be modified in place.
// Ultimately, none of this should mutate in place, but copy the contents,
// possibly doing so virtually. These are optimization and rsync details leaking
// upward for the time being.
const IN_PLACE_TYPES = ['digital', 'video_game']

/**
 * A RawArtifact is an on-disk representation of a digital artifact, processed
 * and annotated with metadata, but not yet packaged for deposit.
 *
 * The directory name is expected to match the artifact's identifier and the
 * content type must be specified because it has not yet been tagged as such.
 */
export default class RawArtifact {
  constructor ({ contentTypeId, path }) {
    this.contentTypeId = contentTypeId
    this.path = path
  }

  get identifier () {
    return path.basename(this.path)
  }

  get parentPath () {
    return path.dirname(this.path)
  }

  processInPlace () {
    return IN_PLACE_TYPES.indexOf(this.contentTypeId) !== -1
  }
}
