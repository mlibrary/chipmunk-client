import { expect, spy, duck } from './setup'
import Packager from '../src/packager'
import RawArtifact from '../src/rawArtifact'

class Filesystem {
  isReadableDir() { }
  ensureDirectory() {}
}

class Bagger {
  makeBag() {}
}

describe('Artifact Packager', function () {
  let fs, bagger

  beforeEach(() => {
    fs = duck(Filesystem)
    bagger = duck(Bagger)
  })

  context('with a valid raw artifact and writable destination', () => {
    const artifact = new RawArtifact({contentTypeId: 'digital', path: '/foo/bar'})
    let packager

    beforeEach(() => {
      fs.isReadableDir.withArgs('/foo/bar').returns(true)
      fs.ensureDirectory.withArgs('/foo/bagged/bar').returns(true)
      packager = new Packager({artifact, fs, bagger})
    })

    it('bags the artifact', () => {
      packager.package()
      expect(bagger.makeBag).to.have.been.calledOnceWith('digital', '/foo/bar', '/foo/bagged/bar')
    })
  })

  context('with a different raw artifact', () => {
    const artifact = new RawArtifact({contentTypeId: 'food', path: '/garden/carrots'})
    let packager

    beforeEach(() => {
      fs.isReadableDir.withArgs('/garden/carrots').returns(true)
      fs.ensureDirectory.withArgs('/garden/bagged/carrots').returns(true)
      packager = new Packager({artifact, fs, bagger})
    })

    it('bags the artifact', () => {
      packager.package()
      expect(bagger.makeBag).to.have.been.calledOnceWith('food', '/garden/carrots', '/garden/bagged/carrots')
    })
  })

  context('with an unreadable source directory', () => {
    const artifact = new RawArtifact({contentTypeId: 'junk', path: '/bad/123'})

    beforeEach(() => {
      fs.isReadableDir.returns(false)
      let packager = new Packager({artifact, fs, bagger})
      packager.package()
    })

    it('does not attempt to create a destination directory', () => {
      expect(fs.ensureDirectory).not.to.have.been.called
    })

    it('does not attempt to bag the artifact', () => {
      expect(bagger.makeBag).not.to.have.been.called
    })
  })

  context('when the destination path is unwritable', () => {
    const artifact = new RawArtifact({contentTypeId: 'junk', path: '/bad/123'})

    beforeEach(() => {
      fs.isReadableDir.returns(true)
      fs.ensureDirectory.returns(false)
      let packager = new Packager({artifact, fs, bagger})
      packager.package()
    })

    it('attempts to create the destination directory', () => {
      expect(fs.ensureDirectory).to.have.been.called
    })

    it('does not attempt to bag the artifact', () => {
      expect(bagger.makeBag).not.to.have.been.called
    })
  })
})
