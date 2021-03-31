import { expect, mock, spy } from './setup'
import Packager from '../src/packager'

describe('Artifact Packager', function () {
  const fsFacade = { isReadableDir() {}, ensureDirectory() {} }
  const fs = spy(fsFacade)
  const baggerFacade = { makeBag() {} }
  const bagger = spy(baggerFacade)

  context('with a valid source path', () => {
    it('is good', () => {
      const packager = new Packager({fs, bagger});

      // TODO: start using artifacts
      packager.package({})

      expect(fs.isReadableDir).to.have.been.calledWith('source_path')
      expect(fs.ensureDirectory).to.have.been.calledWith('target_path')
      expect(bagger.makeBag).to.have.been.calledWith('content_type', 'source_path', 'target_path')
    })
  })
})
