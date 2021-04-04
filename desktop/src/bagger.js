import BaggedArtifact from './baggedArtifact'

class MakeBagCommand {
  constructor (rawArtifact, targetPath) {
    this.source = rawArtifact.path
    this.type = rawArtifact.contentTypeId
    this.id = rawArtifact.identifier
    this.target = targetPath
  }

  toString () {
    return `${this.command} ${this.args.map(arg => `"${arg}"`).join(' ')}`
  }

  get fullCommand () {
    return ['docker', this.args]
  }

  get command () {
    return 'docker'
  }

  get args () {
    return ['run', '--rm', ...this.mounts, this.image, ...this.containerCommand]
  }

  get image () {
    return 'mlibrary/chipmunk-client:latest'
  }

  // Some types should operate in place for now. We could ask
  // artifact.processInPlace() but it already gives the same source and target
  // to normalize as much as possible. We can operate here just based on
  // whether the paths match. The CLI is pretty quirky and this should be
  // pushed back further.
  get sourceArgs () {
    if (this.source === this.target) {
      return []
    } else {
      return ['-s', '/source']
    }
  }

  get mounts () {
    if (this.source === this.target) {
      return this.targetMount
    } else {
      return [...this.sourceMount, ...this.targetMount]
    }
  }

  get sourceMount () {
    return ['--mount', `type=bind,"src=${this.source}",dst=/source`]
  }

  get targetMount () {
    return ['--mount', `type=bind,"src=${this.target}",dst=/target`]
  }

  get containerCommand () {
    return ['bin/makebag', ...this.sourceArgs, this.type, this.id, '/target']
  }
}

export default class Bagger {
  constructor ({ runner }) {
    this.runner = runner
  }

  makeBag ({ rawArtifact, targetPath }) {
    const cmd = new MakeBagCommand(rawArtifact, targetPath)
    this.runner.exec(cmd.command, cmd.args)

    const baggedArtifact = new BaggedArtifact({ path: targetPath })
    return Promise.resolve(baggedArtifact)
  }
}

export { Bagger }
