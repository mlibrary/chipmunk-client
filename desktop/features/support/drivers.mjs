import * as os from 'os'
import * as path from 'path'
import * as url from 'url'
import fse from 'fs-extra'

const fixturesBase = url.fileURLToPath(new URL('../../../spec/support/fixtures', import.meta.url))

class Setup {
  constructor (filesystem) {
    this._filesystem = filesystem
  }

  async aDigitalArtifactDirectory () {
    return await this.setupFixture('digital')
  }

  async aRawDigitalArtifact () {
    return { location: await this.setupFixture('digital') }
  }

  // Private methods:

  async setupFixture (name) {
    return await this._filesystem.setupFullWorkspace(this.fixturePath(name))
  }

  fixturePath (name) {
    if (name === 'digital') { return path.join(fixturesBase, 'digital/pre-chipmunk') } else { throw new Error(`Unavailable fixture: ${name}`) }
  }
}

class Filesystem {
  constructor (teardownSteps) {
    this._teardown_steps = teardownSteps
  }

  addTeardownStep (callback) {
    this._teardown_steps.push(callback)
  }

  async setupFullWorkspace (src) {
    const tmp = await this.setupEmptyWorkspace()
    await this.copyContents(src, tmp)
    return tmp
  }

  async setupEmptyWorkspace () {
    const tmpDir = await fse.mkdtemp(path.join(os.tmpdir(), 'chpmnk-'))
    this.addTeardownStep(async () => {
      await fse.remove(tmpDir, { recursive: true })
    })
    return tmpDir
  }

  // This copies the contents of the source directory into an
  async copyContents (sourceDirectory, destinationDirectory) {
    await fse.copy(sourceDirectory, destinationDirectory)
  }
}

class BrowserError extends Error {
  constructor (message) {
    super(message)
    this.name = 'BrowserError'
  }
}

class UI {
  constructor (browser) {
    this._browser = browser
  }

  async checkErrors () {
    const errors = await this._browser.getLogs('browser')
    const severe = errors.filter(log => log.level === 'SEVERE')
    if (severe.length !== 0) {
      const messages = 'SEVERE errors:\n' + severe.map(log => `${log.message}`).join('\n------\n')
      throw new BrowserError(messages)
    }
  }

  async trackDirectory (path, contentTypeName) {
    await this.addArtifact()
    await this.selectPath(path)
    await this.selectContentTypeName(contentTypeName)
    await this.addToWorkspace()
  }

  async getWorkspaceArtifactIds () {
    const els = await this_.browser.$$('#workspace-artifacts li')
    let ids = []
    for (el of els) {
      ids.push(await first.getAttribute('data-identifier'))
    }
    return ids
  }

  async packageArtifacts (contentTypeId, artifacts) {
    await this.selectArtifacts(artifacts)
    await this.selectContentType(contentTypeId)
    await this.startPackaging()
    await this.readyForPackaging()
  }

  async addArtifact () {
    const el = await this._browser.$('#add-artifact')
    await el.click()
    await (await this._browser.$('#new-artifact')).waitForExist()
  }

  async selectPath (path) {
    const el = await this._browser.$('#new-artifact-path')
    await el.setValue(path)
  }

  async selectContentTypeName (contentTypeName) {
    const select = await this._browser.$('#new-artifact-type')
    await select.selectByVisibleText(contentTypeName)
  }

  async addToWorkspace () {
    const btn = await this._browser.$('#new-artifact-track')
    await btn.click()
  }

  async selectArtifacts (artifacts) {
    const el = await this._browser.$('#artifact-list')
    await el.setValue(artifacts.map(artifact => artifact.location).join('\n'))
  }

  async selectContentType (contentTypeId) {
    const el = await this._browser.$('#content-type')
    await el.setValue(contentTypeId)
  }

  async startPackaging () {
    const el = await this._browser.$('#start-packaging')
    await el.click()
  }

  async readyForPackaging () {
    const el = await this._browser.$('#status-ready')
    await el.waitForExist()
  }

  async getPackages () {
    const list = await this._browser.$('#package-list')

    const items = await list.$$(function () {
      return this.querySelectorAll('li')
    })

    const promises = items.map(async el => {
      const locationSpan = await el.$('span.location')
      const location = await locationSpan.getText()

      const contentTypeSpan = await el.$('span.content-type')
      const contentType = await contentTypeSpan.getText()

      return {
        contentTypeId: contentType,
        location: location
      }
    })

    return await Promise.all(promises)
  }
}

export { Setup, Filesystem, UI }
