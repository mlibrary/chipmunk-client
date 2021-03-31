import { expect, spy } from '../setup'
import PackageArtifacts from '../../src/interactors/packageArtifacts'

class PackagingEvents {
  packaging() {}
  packaged() {}
  failed() {}
  done() {}
}

describe('Packaging', function () {
  context('with "digital" type, but no artifacts', () => {
    const contentTypeId = 'digital'
    const artifactLocations = []
    const listener = { done() {} };
    const done = spy(listener, "done")

    it('notifies that packaging is done', () => {
      let interactor = new PackageArtifacts({contentTypeId, artifactLocations, listener});
      interactor.call()

      expect(done).to.have.been.called
    })
  })

  context('with "digital" type and one artifact location', () => {
    const contentTypeId = 'digital'
    const artifactLocations = ['/foo/bar']
    let interactor
    let listener
    let packager

    beforeEach(() => {
      listener = spy(new PackagingEvents());
      interactor = new PackageArtifacts({contentTypeId, artifactLocations, listener});
    })

    it('notifies that the artifact is packaging', () => {
      interactor.call()
      expect(listener.packaging).to.have.been.calledOnce
    })

    it('notifies that the artifact is packaged', () => {
      interactor.call()
      expect(listener.packaged).to.have.been.calledOnce
    })
  })
})
