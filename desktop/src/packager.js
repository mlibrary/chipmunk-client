import * as path from 'path'
import Bagger from './bagger'
import Filesystem from './filesystem'
import PackagingListener from './packagingListener'

class PackagingError extends Error {
  constructor (message) {
    super(message)
    this.name = 'PackagingError'
  }
}

export default class Packager {
  constructor ({
    artifact,
    fs = new Filesystem(),
    bagger = new Bagger({}),
    listener = new PackagingListener()
  }) {
    this.artifact = artifact
    this.fs = fs
    this.bagger = bagger
    this.listener = listener
  }

  async package () {
    try {
      await this.validateType()
      await this.validateSource()
      await this.validateTarget()
      await this.notifyPackaging()
      await this.packageArtifact()
      await this.notifyPackaged()
    } catch (err) {
      await this.notifyFailed(err)
    }
  }

  validateType () {
    if (this.sourceType === 'garbage') {
      throw new PackagingError(`Unsupported content type: ${this.sourceType}`)
    }
  }

  validateSource () {
    if (!this.sourceReadable()) {
      throw new PackagingError(`Source directory unreadable: ${this.sourcePath}`)
    }
  }

  validateTarget () {
    if (!this.targetWritable()) {
      throw new PackagingError(`Target directory unwritable: ${this.targetPath}`)
    }
  }

  notifyPackaging () {
    this.listener.packaging(this.artifact)
  }

  notifyPackaged () {
    this.listener.packaged(this.artifact)
  }

  notifyFailed (err) {
    this.listener.failed(this.artifact, err)
  }

  async packageArtifact () {
    await this.bagger.makeBag({ rawArtifact: this.artifact, targetPath: this.targetPath })
  }

  sourceReadable () {
    return this.fs.isReadableDir(this.sourcePath)
  }

  targetWritable () {
    return this.fs.ensureDirectory(this.targetPath)
  }

  get sourceType () {
    return this.artifact.contentTypeId
  }

  get sourcePath () {
    return this.artifact.path
  }

  get targetPath () {
    if (this.artifact.processInPlace()) {
      return this.artifact.path
    } else {
      return path.join(this.artifact.parentPath, 'bagged', this.artifact.identifier)
    }
  }
}
