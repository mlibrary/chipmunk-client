import { expect, sinon, spy, duck } from '../setup'
import PackageArtifacts from '../../src/interactors/packageArtifacts'
import PackagingListener from '../../src/packagingListener'
import RawArtifact from '../../src/rawArtifact'

// Fake for the makePackager factory method, yields a new packager spy each
// call, pushing them onto an array. You can get the most recently created spy
// by calling .packager on the returned function, or you can pass an array from
// outside to collect them as they are created.
function packagerFactory (packagers = []) {
  function makePackager (artifact) {
    packagerFactory.packager = {
      artifact: artifact,
      package: spy()
    }
    packagers.push(packagerFactory.packager)
    return packagerFactory.packager
  }
  return makePackager
}

describe('Packaging', function () {
  context('with "digital" type, but no artifacts', () => {
    const contentTypeId = 'digital'
    const artifactLocations = []
    const listener = { done: spy() }

    it('notifies that packaging is done', async () => {
      const interactor = new PackageArtifacts({ contentTypeId, artifactLocations, listener })
      await interactor.call()

      expect(listener.done).to.have.been.called()
    })
  })

  context('with "digital" type and one artifact location', () => {
    const contentTypeId = 'digital'
    const artifactLocations = ['/foo/bar']
    const artifact = new RawArtifact({ contentTypeId: 'digital', path: '/foo/bar' })
    let interactor, listener, packagers

    beforeEach(() => {
      packagers = []
      listener = duck(PackagingListener)
      const makePackager = packagerFactory(packagers)
      interactor = new PackageArtifacts({ contentTypeId, artifactLocations, listener, makePackager })
    })

    it('notifies that the artifact is packaging', async () => {
      await interactor.call()
      expect(listener.packaging).to.have.been.calledWith(artifact)
    })

    it('delegates packaging', async () => {
      await interactor.call()
      expect(packagers[0].package).to.have.been.called()
      expect(packagers[0].artifact).to.eql(artifact)
    })

    it('notifies that the artifact is packaged', async () => {
      await interactor.call()
      expect(listener.packaged).to.have.been.calledWith(artifact)
    })

    it('notifies that the batch is done', async () => {
      await interactor.call()
      expect(listener.done).to.have.been.called()
    })

    it('runs everything in order', async () => {
      await interactor.call()
      sinon.assert.callOrder(listener.packaging, packagers[0].package, listener.packaged, listener.done)
    })
  })

  context('with "digital" type and two artifact locations', () => {
    const contentTypeId = 'digital'
    const artifactLocations = ['/foo/bar', '/bar/baz']
    const artifactOne = new RawArtifact({ contentTypeId: 'digital', path: '/foo/bar' })
    const artifactTwo = new RawArtifact({ contentTypeId: 'digital', path: '/bar/baz' })
    let interactor, listener, packagers

    beforeEach(() => {
      packagers = []
      listener = duck(PackagingListener)
      const makePackager = packagerFactory(packagers)
      interactor = new PackageArtifacts({ contentTypeId, artifactLocations, listener, makePackager })
    })

    it('packages both artifacts', async () => {
      await interactor.call()
      expect(packagers[0].package).to.have.been.called()
      expect(packagers[1].package).to.have.been.called()
    })

    it('notifies that artifact one is packaged', async () => {
      await interactor.call()
      expect(listener.packaged).to.have.been.calledWith(artifactOne)
    })

    it('notifies that artifact two is packaged', async () => {
      await interactor.call()
      expect(listener.packaged).to.have.been.calledWith(artifactTwo)
    })

    it('finishes both packages before notifying that the batch is done', async () => {
      await interactor.call()
      sinon.assert.callOrder(listener.packaged, listener.packaged, listener.done)
    })
  })
})
