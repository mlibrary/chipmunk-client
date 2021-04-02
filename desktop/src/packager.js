import * as path from 'path';

export default class Packager {
  constructor({artifact, fs, bagger}) {
    this.artifact = artifact;
    this.fs = fs;
    this.bagger = bagger;
  }

  package() {
    if (this.sourceReadable() && this.targetWritable()) {
      this.bagger.makeBag(this.artifact.contentTypeId, this.sourcePath, this.targetPath)
    }
  }

  sourceReadable() {
    return this.fs.isReadableDir(this.sourcePath)
  }

  targetWritable() {
    return this.fs.ensureDirectory(this.targetPath)
  }

  get sourcePath() {
    return this.artifact.path
  }

  get targetPath() {
    return path.join(this.artifact.parentPath, 'bagged', this.artifact.identifier)
  }
}
