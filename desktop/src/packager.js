export default class Packager {
  constructor({fs, bagger}) {
    this.fs = fs;
    this.bagger = bagger;
  }

  package() {
    this.fs.isReadableDir('source_path')
    this.fs.ensureDirectory('target_path')
    this.bagger.makeBag('content_type', 'source_path', 'target_path')
  }
}

