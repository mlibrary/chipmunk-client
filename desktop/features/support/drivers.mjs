import * as os from "os";
import * as path from "path";
import * as url from "url";
import fse from "fs-extra";

const fixturesBase = url.fileURLToPath(new URL('../../../spec/support/fixtures', import.meta.url));

class Setup {
  constructor(filesystem) {
    this._filesystem = filesystem;
  }

  async aRawDigitalArtifact() {
    return { location: await this.setupFixture('digital') };
  }

  // Private methods:

  async setupFixture(name) {
    return await this._filesystem.setupFullWorkspace(this.fixturePath(name));
  }

  fixturePath(name) {
    if (name === 'digital')
      return path.join(fixturesBase, 'digital/pre-chipmunk');
    else
      throw new Error(`Unavailable fixture: ${name}`);
  }
}

class Filesystem {
  constructor(teardownSteps) {
    this._teardown_steps = teardownSteps;
  }

  addTeardownStep(callback) {
    this._teardown_steps.push(callback);
  }

  async setupFullWorkspace(src) {
    let tmp = await this.setupEmptyWorkspace();
    await this.copyContents(src, tmp);
    return tmp;
  }

  async setupEmptyWorkspace() {
    let tmpDir = await fse.mkdtemp(path.join(os.tmpdir(), 'chpmnk-'));
    this.addTeardownStep(async () => {
      await fse.remove(tmpDir, { recursive: true });
    });
    return tmpDir;
  }

  // This copies the contents of the source directory into an
  // already-existing destination directory.
  async copyContents(sourceDirectory, destinationDirectory) {
    await fse.copy(sourceDirectory, destinationDirectory);
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

      return {
        contentTypeId: contentType,
        location: location
      };
    });

    return await Promise.all(promises);
  }
}

export { Setup, Filesystem, UI };
