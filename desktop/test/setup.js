import chai from 'chai'
import dirtyChai from 'dirty-chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
chai.use(dirtyChai)
chai.use(sinonChai)

const duck = sinon.createStubInstance

const containsSequence = (array, sequence) => {
  if (!Array.isArray(array) || !Array.isArray(sequence) || sequence.length === 0) {
    return false
  }

  const first = sequence[0]
  const run = sequence.length
  let start = -1

  while ((start = array.indexOf(first, start + 1)) !== -1) {
    const candidate = array.slice(start, start + run)
    if (candidate.length === run && candidate.every((val, index) => val === sequence[index])) {
      return true
    }
  }

  return false
}

chai.Assertion.addMethod('containSequence', function (array) {
  const actual = this._obj
  const expected = array

  function format (obj) {
    if (Array.isArray(obj)) {
      return `[${obj.map(el => `'${el}'`)}]`
    } else {
      return `${obj}`
    }
  }

  this.assert(
    containsSequence(actual, expected),
    `expected ${format(actual)} to contain the sequence ${format(expected)}`,
    `expected ${format(actual)} not to contain sequence ${format(expected)}`
  )
})

const { spy, fake, stub, mock } = sinon
export { default as chai, expect } from 'chai'
export { default as sinon } from 'sinon'
export { spy, fake, stub, mock }
export { wait } from '../src/util'
export { duck }
