import { expect } from './setup'
import * as os from 'os'
import * as path from 'path'
import fse from 'fs-extra'
import Filesystem from '../src/filesystem'

describe('A Filesystem facade', () => {
  context('given a fresh temporary directory', () => {
    let fs, tmpDir

    beforeEach(async () => {
      fs = new Filesystem()
      tmpDir = await fse.mkdtemp(path.join(os.tmpdir(), 'chpmnk-'))
    })

    afterEach(async () => {
      await fse.remove(tmpDir, { recursive: true })
    })

    it('can read it', async () => {
      const readable = await fs.isReadableDir(tmpDir)
      expect(readable).to.eq(true)
    })

    it('can ensure that it is writable', async () => {
      const writable = await fs.ensureDirectory(path.join(tmpDir))
      expect(writable).to.eq(true)
    })

    it('can create a nested subdirectory', async () => {
      await fs.ensureDirectory(path.join(tmpDir, 'nested', 'dir'))
      const readable = await fs.isReadableDir(path.join(tmpDir, 'nested', 'dir'))
      expect(readable).to.eq(true)
    })
  })

  context('given an unreadable directory', () => {
    let fs, tmpDir

    beforeEach(async () => {
      fs = new Filesystem()
      tmpDir = await fse.mkdtemp(path.join(os.tmpdir(), 'chpmnk-'))
      await fse.chmod(tmpDir, '000')
    })

    afterEach(async () => {
      await fse.chmod(tmpDir, '750')
      await fse.remove(tmpDir, { recursive: true })
    })

    it('cannot read it', async () => {
      const readable = await fs.isReadableDir(tmpDir)
      expect(readable).to.eq(false)
    })

    it('cannot create a nested subdirectory', async () => {
      const exists = await fs.ensureDirectory(path.join(tmpDir, 'nested', 'dir'))
      expect(exists).to.eq(false)
    })
  })
})
