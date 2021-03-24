const { Before, Given, When, Then } = require("@cucumber/cucumber");
const expect = require("chai").expect;

class RawArtifact {
}

class Package {
  constructor(contentTypeId, rawArtifact) {
    this._content_type_id = contentTypeId;
    this._artifact = rawArtifact;
  }

  get contentTypeId() {
    return this._content_type_id;
  }

  get artifact() {
    return this._artifact;
  }
}

class Setup {
  aRawDigitalArtifact() {
    return new RawArtifact();
  }
}

class UI {
  constructor() {
    this._packages = [];
  }

  packageArtifacts(contentTypeId, artifacts) {
    artifacts.forEach(artifact => {
      this._packages.push(new Package(contentTypeId, artifact));
    });
  }

  get packages() {
    return this._packages;
  }
}

Before(function() {
  this.setup = new Setup();
  this.ui = new UI();
});

Given('I have a directory of floppy disc images from a researcher\'s personal collection', function () {
  this.artifact = this.setup.aRawDigitalArtifact();
  this.contentTypeId = 'digital';
});

When('I package the directory as {string}', function (contentTypeId) {
  this.ui.packageArtifacts(contentTypeId, [this.artifact]);
});

Then('I have the Dark Blue SIP for my artifact', function () {
  expect(this.ui.packages).to.have.length(1);
  expect(this.ui.packages[0].contentTypeId).to.equal(this.contentTypeId);
  expect(this.ui.packages[0].artifact).to.equal(this.artifact);
});
