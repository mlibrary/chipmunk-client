const { RawArtifact, Package } = require("../../src/domain");

class Setup {
  aRawDigitalArtifact() {
    return new RawArtifact();
  }
}

class UI {
  constructor(browser) {
    this._browser = browser;
    this._packages = [];
  }

  async packageArtifacts(contentTypeId, artifacts) {
    await this.selectArtifacts(artifacts);
    await this.selectContentType(contentTypeId);
    await this.startPackaging();

    artifacts.forEach(artifact => {
      this._packages.push(new Package(contentTypeId, artifact));
    });
  }

  get packages() {
    return this._packages;
  }

  async selectArtifacts(artifacts) {
    let el = await this._browser.$('#artifact-list');
    await el.setValue(artifacts.join("\n"));
  }

  async selectContentType(contentTypeId) {
    let el = await this._browser.$('#content-type');
    await el.setValue(contentTypeId);
  }

  async startPackaging() {
    let el = await this._browser.$('#start-packaging');
    await el.click();
  }
}

exports.Setup = Setup;
exports.UI = UI;
