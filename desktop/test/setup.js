import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
chai.use(sinonChai)

const duck = sinon.createStubInstance

const { spy, fake, stub, mock } = sinon
export { default as chai, expect } from 'chai'
export { default as sinon } from 'sinon'
export { spy, fake, stub, mock }
export { wait } from '../src/util'
export { duck }
