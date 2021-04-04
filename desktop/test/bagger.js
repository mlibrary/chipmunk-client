import { expect, duck } from './setup'
import Bagger from '../src/bagger'
import RawArtifact from '../src/rawArtifact'
import ShellRunner from '../src/shellRunner'

describe('An Artifact Bagger', () => {
  let runner

  beforeEach(() => {
    runner = duck(ShellRunner)
  })

  context('given a Raw Artifact of type "food" in "/garden/carrots", destined for "/garden/bagged/carrots"', () => {
    const contentTypeId = 'food'
    const sourcePath = '/garden/carrots'
    const targetPath = '/garden/bagged/carrots'
    const rawArtifact = new RawArtifact({ contentTypeId, path: sourcePath })
    let bagger

    beforeEach(() => {
      bagger = new Bagger({ runner })
    })

    // These are awkward matches because of the [command, [args...]] structure.
    // We have to grab the args to the first call to exec and then inspect those.
    it('launches and cleans up a docker container', async () => {
      await bagger.makeBag({ rawArtifact, targetPath })
      const [cmd, args] = runner.exec.args[0]

      expect(cmd).to.eq('docker')
      expect(args[0]).to.eq('run')
      expect(args[1]).to.eq('--rm')
    })

    it('mounts the raw artifact at /source', async () => {
      await bagger.makeBag({ rawArtifact, targetPath })
      const args = runner.exec.args[0][1]

      expect(args).to.containSequence(['--mount', 'type=bind,"src=/garden/carrots",dst=/source'])
    })

    it('mounts the bagged artifact directory at /target', async () => {
      await bagger.makeBag({ rawArtifact, targetPath })
      const args = runner.exec.args[0][1]

      expect(args).to.containSequence(['--mount', 'type=bind,"src=/garden/bagged/carrots",dst=/target'])
    })

    it('runs the makebag command in the mlibrary/chipmunk-client:latest image', async () => {
      await bagger.makeBag({ rawArtifact, targetPath })
      const args = runner.exec.args[0][1]

      expect(args).to.containSequence(['mlibrary/chipmunk-client:latest', 'bin/makebag'])
    })

    it('runs the makebag command with source, type, id, and target', async () => {
      await bagger.makeBag({ rawArtifact, targetPath })
      const args = runner.exec.args[0][1]

      expect(args).to.containSequence(['bin/makebag', '-s', '/source', 'food', 'carrots'])
    })

    it('yields a Bagged Artifact', async () => {
      const bagged = await bagger.makeBag({ rawArtifact, targetPath })
      expect(bagged).to.eql({ path: '/garden/bagged/carrots' })
    })
  })

  context('given a Raw Artifact in /pantry/rice', () => {
    const contentTypeId = 'staple'
    const sourcePath = '/pantry/rice'
    const targetPath = '/pantry/bagged/rice'
    const rawArtifact = new RawArtifact({ contentTypeId, path: sourcePath })
    let bagger

    beforeEach(() => {
      bagger = new Bagger({ runner })
    })

    it('mounts the raw artifact at /source', async () => {
      await bagger.makeBag({ rawArtifact, targetPath })
      const args = runner.exec.args[0][1]

      expect(args).to.containSequence(['--mount', 'type=bind,"src=/pantry/rice",dst=/source'])
    })

    it('mounts the bagged artifact directory at /target', async () => {
      await bagger.makeBag({ rawArtifact, targetPath })
      const args = runner.exec.args[0][1]

      expect(args).to.containSequence(['--mount', 'type=bind,"src=/pantry/bagged/rice",dst=/target'])
    })

    it('runs the makebag command with source, type, id, and target', async () => {
      await bagger.makeBag({ rawArtifact, targetPath })
      const args = runner.exec.args[0][1]

      expect(args).to.containSequence(['bin/makebag', '-s', '/source', 'staple', 'rice', '/target'])
    })
  })

  context('given a Raw Artifact in /pantry/rice', () => {
    const contentTypeId = 'staple'
    const sourcePath = '/pantry/rice'
    const targetPath = '/pantry/bagged/rice'
    const rawArtifact = new RawArtifact({ contentTypeId, path: sourcePath })
    let bagger

    beforeEach(() => {
      bagger = new Bagger({ runner })
    })

    it('mounts the raw artifact at /source', async () => {
      await bagger.makeBag({ rawArtifact, targetPath })
      const args = runner.exec.args[0][1]

      expect(args).to.containSequence(['--mount', 'type=bind,"src=/pantry/rice",dst=/source'])
    })

    it('mounts the destination at /target', async () => {
      await bagger.makeBag({ rawArtifact, targetPath })
      const args = runner.exec.args[0][1]

      expect(args).to.containSequence(['--mount', 'type=bind,"src=/pantry/bagged/rice",dst=/target'])
    })
  })
})
