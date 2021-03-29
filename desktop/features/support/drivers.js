const { RawArtifact, Package } = require("../../src/domain");

class Setup {
  aRawDigitalArtifact() {
    return new RawArtifact('garbage');
  }
}

class UI {
  constructor(browser) {
    this._browser = browser;
  }

  async packageArtifacts(contentTypeId, artifacts) {
    await this.selectArtifacts(artifacts);
    await this.selectContentType(contentTypeId);
    await this.startPackaging();
  }

  async selectArtifacts(artifacts) {
    let el = await this._browser.$('#artifact-list');
    await el.setValue(artifacts.map(artifact => artifact.location).join("\n"));
  }

  async selectContentType(contentTypeId) {
    let el = await this._browser.$('#content-type');
    await el.setValue(contentTypeId);
  }

  async startPackaging() {
    let el = await this._browser.$('#start-packaging');
    await el.click();
  }

  async getPackages() {
    let list = await this._browser.$('#package-list');

    let items = await list.$$(function() {
      return this.querySelectorAll('li');
    });

    let promises = items.map(async el => {
      let locationSpan = await el.$('span.location');
      let location = await locationSpan.getText();

      let contentTypeSpan = await el.$('span.content-type');
      let contentType = await contentTypeSpan.getText();

      return new Package(contentType, new RawArtifact(location));
    });

    return await Promise.all(promises);
  }
}

exports.Setup = Setup;
exports.UI = UI;
