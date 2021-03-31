import { expect, spy } from './setup'
import PackageArtifacts from '../src/interactors/packageArtifacts'

describe('Packaging', function () {
  context('with "digital" type, but no artifacts', () => {
    it('notifies that it is done', () => {
      const contentTypeId = 'digital'
      const artifactLocations = []
      const listener = {};
      const cb = spy(listener, "done")

      let interactor = new PackageArtifacts(contentTypeId, artifactLocations, listener);
      interactor.call(cb)
      expect(cb).to.have.been.called
    })
  })

  context('with "digital" type and one artifact location', () => {
    it('informs the caller that one artifact was packaged', () => {
      const contentTypeId = 'digital'
      const artifactLocations = ['foo/bar']
      const listener = { queued() {} };
      const queued = spy(listener, "queued")

      let interactor = new PackageArtifacts(contentTypeId, artifactLocations, listener);
      interactor.call()

      expect(queued).to.have.been.calledOnce
    })
  })
})
