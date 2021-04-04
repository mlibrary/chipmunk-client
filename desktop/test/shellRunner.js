import { expect } from './setup'
import ShellRunner from '../src/shellRunner'

function capture () {
  function cap (data) {
    cap.data = cap.data || ''
    cap.data += data
  }
  return cap
}

describe('A Shell Runner', () => {
  let runner

  beforeEach(() => {
    runner = new ShellRunner()
  })

  context('given a successful command', () => {
    it('returns the zero exit code', async () => {
      const code = await runner.exec({ command: 'true' })
      expect(code).to.eql(0)
    })
  })

  context('given a failing command', () => {
    it('returns a nonzero exit code', async () => {
      const code = await runner.exec({ command: 'false' })
      expect(code).to.not.eql(0)
    })
  })

  it('sends stdout to callback', async () => {
    const out = capture()
    await runner.exec({ command: 'echo', args: ['-n', 'foo'], out })
    expect(out.data).to.eq('foo')
  })

  it('sends stderr to callback', async () => {
    const err = capture()
    await runner.exec({ command: 'ls', args: ['----'], err })
    expect(err.data).to.match(/^ls/)
  })

  // This weird construct should be replaced by chai-as-promised .eventually.throw
  it('catches spawn errors', async () => {
    try {
      await runner.exec('0xbad bad bad')
      expect(true, 'should not have succeeded').to.eq(false)
    } catch (err) {
      expect(err).to.be.an('Error')
    }
  })
})
