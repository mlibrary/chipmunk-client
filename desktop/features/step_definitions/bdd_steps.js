const { Given, When, Then } = require("@cucumber/cucumber");
const expect = require("chai").expect;

// makebag -s content/123 digital 123 bagged/123 2>&1 | tee -a "$LOGFILE"

class Artifact {
  constructor() {
    this._is_bagged = false;
    this._raw_path = '/path/to/raw';
    this._bagged_path = null;
    this._content_type = ???;
  }
}

class RawArtifact {
}

class BaggedArtifact {
  constructor(rawArtifact) {
    this._rawArtifact = rawArtifact;
  }
}

class Directory {
  constructor() {
    this._isValidSIP = false;
  }

  get isValidSIP() {
    return this._isValidSIP;
  }

  youAreNowASIP() {
    this._isValidSIP = true;
  }
}

class Packager {
  constructor(contentTypeId) {
  }

  select(directories) {
    this._directories = directories;
  }

  run() {
    this._directories.forEach(directory => {
      directory.youAreNowASIP();
    });
  }
}

Given('I have a directory of floppy disc images from a researcher\'s personal collection', function () {
  this.myArtifacts = [new RawArtifact()];
  this.myDirectory = new Directory();
  expect(this.myDirectory.bagFormat).to.equal('none');
});

When('I set the content type to {string}', function (contentTypeId) {
  this.packager = new Packager(contentTypeId);
});

When('I select that directory for packaging', function () {
  this.packager.select([this.myDirectory]);
});

When('I package the directory', function () {
  this.packager.run();
});

Then('I have the Dark Blue SIP for my artifact', function () {
  expect(this.myDirectory.bagFormat).to.equal(this.packager.contentTypeId);
  expect(this.myDirectory.isValidSIP).to.equal(true);
});
