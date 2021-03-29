'use strict';

const path = require('path');
const Application = require("spectron").Application
const electronPath = require("electron")
const appPath = path.join(__dirname, '../../')
const { Before, After, setDefaultTimeout } = require('@cucumber/cucumber')
const { Setup, Filesystem, UI } = require("../support/drivers");

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

After({tags: "@ui"}, function() {
  return this.app.stop()
})

Before(function() {
  this.teardownSteps = [];
  this.filesystem = new Filesystem(this.teardownSteps);
  this.setup = new Setup(this.filesystem);
})

After(async function() {
  await Promise.all(this.teardownSteps.map(cb => cb()));
})
