import { invoke as PackageArtifacts } from './interactors/packageArtifacts'
import { invoke as TrackArtifact } from './interactors/trackArtifact'

// import RawArtifact from './rawArtifact'
// const TrackArtifact = ({ contentTypeId, path, store = window.globalStore }) => {
//   const artifact = new RawArtifact({ contentTypeId, path })
//   return { path, contentTypeId, identifier: artifact.identifier }
// }

export {
  PackageArtifacts,
  TrackArtifact
}
