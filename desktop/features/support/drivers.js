const { RawArtifact, Package } = require("../../src/domain");

class Setup {
  aRawDigitalArtifact() {
    return new RawArtifact();
  }
}

class UI {
  constructor() {
    this._packages = [];
  }

  packageArtifacts(contentTypeId, artifacts) {
    artifacts.forEach(artifact => {
      this._packages.push(new Package(contentTypeId, artifact));
    });
  }

  get packages() {
    return this._packages;
  }
}

exports.Setup = Setup;
exports.UI = UI;
