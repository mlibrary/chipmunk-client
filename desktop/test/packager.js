import { expect, sinon, spy, duck } from './setup'
import Packager from '../src/packager'
import PackagingListener from '../src/packagingListener'
import RawArtifact from '../src/rawArtifact'

class Filesystem {
  isReadableDir() { }
  ensureDirectory() {}
}

class Bagger {
  makeBag() {}
}

describe('Artifact Packager', function () {
  let fs, bagger, listener

  beforeEach(() => {
    fs = duck(Filesystem)
    bagger = duck(Bagger)
    listener = duck(PackagingListener)
  })

  context('with a valid raw artifact and writable destination', () => {
    const artifact = new RawArtifact({contentTypeId: 'digital', path: '/foo/bar'})
    let packager

    beforeEach(() => {
      fs.isReadableDir.withArgs('/foo/bar').returns(true)
      fs.ensureDirectory.withArgs('/foo/bagged/bar').returns(true)
      packager = new Packager({artifact, fs, bagger, listener})
    })

    it('operates in order', async () => {
      await packager.package()
      sinon.assert.callOrder(listener.packaging, bagger.makeBag, listener.packaged)
    })

    it('notifies that packaging has started', async () => {
      await packager.package()
      expect(listener.packaging).to.have.been.calledWith(artifact)
    })

    it('bags the artifact', async () => {
      await packager.package()
      expect(bagger.makeBag).to.have.been.calledOnceWith('digital', '/foo/bar', '/foo/bagged/bar')
    })

    it('notifies that packaging has completed', async () => {
      await packager.package()
      expect(listener.packaged).to.have.been.calledWith(artifact)
    })
  })

  // This context was to drive parameter use; we now know it isn't just using literals,
  // so it might go away, or more likely, become a "two artifact" context (two packagers).
  context('with a different raw artifact', () => {
    const artifact = new RawArtifact({contentTypeId: 'food', path: '/garden/carrots'})
    let packager

    beforeEach(() => {
      fs.isReadableDir.withArgs('/garden/carrots').returns(true)
      fs.ensureDirectory.withArgs('/garden/bagged/carrots').returns(true)
      packager = new Packager({artifact, fs, bagger, listener})
    })

    it('bags the artifact', async () => {
      await packager.package()
      expect(bagger.makeBag).to.have.been.calledOnceWith('food', '/garden/carrots', '/garden/bagged/carrots')
    })
  })

  context('with a garbage artifact', () => {
    const artifact = new RawArtifact({contentTypeId: 'garbage', path: '/bin/waste'})
    let packager

    beforeEach(() => {
      packager = new Packager({artifact, fs, bagger, listener})
    })

    it ('does not attempt to bag the garbage', async () => {
      await packager.package()
      expect(bagger.makeBag).not.to.have.been.called
    })

    it ('notifies that packaging failed', async () => {
      await packager.package()
      expect(listener.failed).to.have.been.calledWith(artifact)
    })
  })

  context('with an unreadable source directory', () => {
    const artifact = new RawArtifact({contentTypeId: 'junk', path: '/bad/123'})
    let packager

    beforeEach(() => {
      fs.isReadableDir.returns(false)
      packager = new Packager({artifact, fs, bagger, listener})
    })

    it('does not attempt to create a destination directory', async () => {
      await packager.package()
      expect(fs.ensureDirectory).not.to.have.been.called
    })

    it('does not attempt to bag the artifact', async () => {
      await packager.package()
      expect(bagger.makeBag).not.to.have.been.called
    })

    it('notifies that packaging the artifact failed', async () => {
      await packager.package()
      expect(listener.failed).to.have.been.calledWith(artifact)
    })
  })

  context('when the destination path it computes is unwritable', () => {
    const artifact = new RawArtifact({contentTypeId: 'junk', path: '/bad/123'})
    let packager

    beforeEach(() => {
      fs.isReadableDir.returns(true)
      fs.ensureDirectory.returns(false)
      packager = new Packager({artifact, fs, bagger, listener})
    })

    it('attempts to create the destination directory', async () => {
      await packager.package()
      expect(fs.ensureDirectory).to.have.been.called
    })

    it('does not attempt to bag the artifact', async () => {
      await packager.package()
      expect(bagger.makeBag).not.to.have.been.called
    })

    it('notifies that packaging failed', async () => {
      await packager.package()
      expect(listener.failed).to.have.been.called
    })
  })
})
