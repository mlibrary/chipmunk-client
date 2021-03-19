'use strict';

const path = require('path');
const Application = require("spectron").Application
const electronPath = require("electron")
const appPath = path.join(__dirname, '../../')
const {Before, After, setDefaultTimeout} = require('@cucumber/cucumber')

// uncomment to debug without steps timing out
// setDefaultTimeout(-1);

Before({tags: "@ui"}, function() {
  this.app = new Application({
    path: electronPath,
    args: [appPath],
    webdriverOptions: { sync: true }
  })
  return this.app.start().then(() => { this.client = this.app.client })
})

After({tags: "@ui"}, function() {
  return this.app.stop()
})
