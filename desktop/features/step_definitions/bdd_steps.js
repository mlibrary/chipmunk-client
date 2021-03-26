const { Before, Given, When, Then } = require("@cucumber/cucumber");
const expect = require("chai").expect;

Given('I have a directory of floppy disc images from a researcher\'s personal collection', function () {
  this.artifact = this.setup.aRawDigitalArtifact();
  this.contentTypeId = 'digital';
});

When('I package the directory as {string}', async function (contentTypeId) {
  await this.ui.packageArtifacts(contentTypeId, [this.artifact]);
});

Then('I have the Dark Blue SIP for my artifact', async function () {
  let packages = await this.ui.getPackages();

  expect(packages).to.have.length(1);
  expect(packages[0].contentTypeId).to.equal(this.contentTypeId);
  expect(packages[0].artifact).to.equal(this.artifact);
});
