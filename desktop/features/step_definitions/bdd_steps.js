const { Given, When, Then } = require('@cucumber/cucumber')
const expect = require('chai').expect

Given("a directory of floppy disk images that comprise a digital forensics artifact", async function () {
  this.directory = await this.setup.aDigitalArtifactDirectory()
})

Given('a tracked digital forensics artifact', async function () {
})

When('I package the directory as {string}', async function (contentTypeId) {
  await this.ui.packageArtifacts(contentTypeId, [this.artifact])
})

Then('I have the Dark Blue SIP for my artifact', async function () {
  const packages = await this.ui.getPackages()

  expect(packages).to.have.length(1)
  expect(packages[0].contentTypeId).to.equal(this.contentTypeId)
  expect(packages[0].location).to.equal(this.artifact.location)
})

When('I add the directory to the workspace with content type {string}', async function (contentTypeName) {
  await this.ui.trackDirectory(this.directory, contentTypeName)
})

Then('the artifact is tracked in the workspace', async function () {
  const artifacts = await this.ui.getWorkspaceArtifactIds()
  expect(artifacts.length).to.eq(1)
})

Then('the artifact is ready for packaging', async function () {
  const artifact = await this.ui.findInWorkspaceByPath(this.directory)
  expect(artifact.readyForPackaging()).to.eq(true)
})