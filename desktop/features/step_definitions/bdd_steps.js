const { Given, When, Then } = require("@cucumber/cucumber");
const expect = require("chai").expect;

When('I run the tests', function () {
});

Then('the application title is {string}', async function(expected) {
  const title = await this.app.client.getTitle()
  expect(title).to.equal(expected);
});

Then('the {string} div says {string}', async function(id, expectedText) {
  el = await this.client.$(id)
  actualText = await el.getText()
  expect(actualText).to.equal(expectedText);
});

