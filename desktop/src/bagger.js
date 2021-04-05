import dedent from 'dedent'
import BaggedArtifact from './baggedArtifact'
import ShellRunner from './shellRunner'

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
  constructor ({ runner = new ShellRunner() }) {
    this.runner = runner
  }

  async makeBag ({ rawArtifact, targetPath }) {
    const cmd = new MakeBagCommand(rawArtifact, targetPath)
    let exitCode = -1
    let error = null
    let stdout = ''
    let stderr = ''
    const out = (data) => { stdout += data }
    const err = (data) => { stderr += data }
    try {
      exitCode = await this.runner.exec({ command: cmd.command, args: cmd.args, out, err })
    } catch (execError) {
      error = execError
    }
    if (error || exitCode !== 0) {
      throw new Error(dedent`
        Could not bag artifact (${rawArtifact.contentTypeId}) at: ${rawArtifact.path}
        ${error && `error message: ${error.message}`}
        ${error && `stack: ${error.stack}`}
        stdout: ${stdout}
        stderr:${stderr}`)
    } else {
      return new BaggedArtifact({ path: targetPath })
    }
  }
}

export { Bagger }
