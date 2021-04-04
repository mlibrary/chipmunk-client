import { expect } from './setup'
import RawArtifact from '../src/rawArtifact'

describe('A Raw Artifact', () => {
  context('with content type "marshmallow" and source path "/somewhere/123"', () => {
    const contentTypeId = 'marshmallow'
    const path = '/somewhere/123'
    let artifact

    beforeEach(() => {
      artifact = new RawArtifact({ contentTypeId, path })
    })

    it('has content type of "marshmallow"', () => {
      expect(artifact.contentTypeId).to.eq('marshmallow')
    })

    it('has source path of "/somewhere/123"', () => {
      expect(artifact.path).to.eq('/somewhere/123')
    })

    it('has identifier "123"', () => {
      expect(artifact.identifier).to.eq('123')
    })

    it('knows that it is in directory /somewhere', () => {
      expect(artifact.parentPath).to.eq('/somewhere')
    })
  })

  context('with content type "carrots" and source path "/garden/abc"', () => {
    const contentTypeId = 'carrots'
    const path = '/garden/abc'
    let artifact

    beforeEach(() => {
      artifact = new RawArtifact({ contentTypeId, path })
    })

    it('has content type of "carrots"', () => {
      expect(artifact.contentTypeId).to.eq('carrots')
    })

    it('has source path of "/garden/abc"', () => {
      expect(artifact.path).to.eq('/garden/abc')
    })

    it('has identifier "abc"', () => {
      expect(artifact.identifier).to.eq('abc')
    })

    it('knows that it is in directory /garden', () => {
      expect(artifact.parentPath).to.eq('/garden')
    })
  })

  context('with content type "digital"', () => {
    const contentTypeId = 'digital'
    const path = '/anywhere/abc'

    it('should be processed in place', () => {
      const artifact = new RawArtifact({ contentTypeId, path })
      expect(artifact.processInPlace()).to.eq(true)
    })
  })

  context('with content type "video_game"', () => {
    const contentTypeId = 'video_game'
    const path = '/anywhere/abc'

    it('should be processed in place', () => {
      const artifact = new RawArtifact({ contentTypeId, path })
      expect(artifact.processInPlace()).to.eq(true)
    })
  })
})
