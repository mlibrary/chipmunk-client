const Application = require('spectron').Application
const expect = require('chai').expect
const electronPath = require('electron') // Require Electron from the binaries included in node_modules.
const path = require('path')

describe('Application launch', function () {
  this.timeout(10000)

  beforeEach(function () {
    this.app = new Application({
      path: electronPath,
      args: [path.join(__dirname, '..')]
    })
    return this.app.start()
  })

  afterEach(function () {
    if (this.app && this.app.isRunning()) {
      return this.app.stop()
    }
  })

  it('shows an initial window', function() {
    return this.app.client.getWindowCount().then(function (count) {
      expect(count).to.equal(1)
      // Please note that getWindowCount() will return 2 if `dev tools` are opened.
      // assert.equal(count, 2)
    })
  })

  // Get sync working....
  it('has a test-text div', async function() {
    await this.app.client.$('#test-text').then(async el => {
      await el.getText().then(async x => {
        expect(x).to.equal("stuff")
      })
    })
  })

})



