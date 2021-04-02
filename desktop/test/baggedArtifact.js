import { expect } from './setup'
import BaggedArtifact from '../src/baggedArtifact'

describe('A Bagged Artifact', () => {
  context('with a bag on disk at /garage/578', () => {
    const path = '/garage/578'
    let artifact

    beforeEach(() => {
      artifact = new BaggedArtifact({ path })
    })

    it('has path of /garage/578', () => {
      expect(artifact.path).to.eq('/garage/578')
    })

    it('has identifier 578', () => {
      expect(artifact.identifier).to.eq('578')
    })

    it('knows that it is in /garage', () => {
      expect(artifact.parentDirectory).to.eq('/garage')
    })
  })

  context('with a bag on disk at /basement/cba', () => {
    const path = '/basement/cba'
    let artifact

    beforeEach(() => {
      artifact = new BaggedArtifact({ path })
    })

    it('has path of /basement/cba', () => {
      expect(artifact.path).to.eq('/basement/cba')
    })

    it('has identifier cba', () => {
      expect(artifact.identifier).to.eq('cba')
    })

    it('knows that it is in /basement', () => {
      expect(artifact.parentDirectory).to.eq('/basement')
    })
  })
})
