class RawArtifact {
  constructor(location) {
    this._location = location;
  }

  get location() {
    return this._location;
  }
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

exports.RawArtifact = RawArtifact;
exports.Package = Package;
