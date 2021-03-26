'use strict';

const path = require('path');
const Application = require("spectron").Application
const electronPath = require("electron")
const appPath = path.join(__dirname, '../../')
const { Before, After, setDefaultTimeout } = require('@cucumber/cucumber')
const { Setup, UI } = require("../support/drivers");

// uncomment to debug without steps timing out
// setDefaultTimeout(-1);

Before({tags: "@ui"}, function() {
  this.app = new Application({
    path: electronPath,
    args: [appPath],
    webdriverOptions: { sync: true }
  })
  return this.app.start().then(() => { this.ui = new UI(this.app.client) })
})

Before(function() {
  this.setup = new Setup()
})

After({tags: "@ui"}, function() {
  return this.app.stop()
})
