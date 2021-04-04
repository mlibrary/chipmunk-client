import { access, mkdir } from 'fs/promises'
import { constants } from 'fs'

export default class Filesystem {
  async isReadableDir (path) {
    try {
      await access(path, constants.R_OK)
      return true
    } catch {
      return false
    }
  }

  async ensureDirectory (path) {
    try {
      await mkdir(path, { recursive: true })
      return true
    } catch {
      return false
    }
  }
}

export { Filesystem }
