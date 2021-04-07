import { spawn } from 'child_process'

export default class ShellRunner {
  exec ({ command, args = [], out = () => {}, err = () => {} }) {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args)

      process.stdout.on('data', (data) => { out(data) })
      process.stderr.on('data', (data) => { err(data) })
      process.on('close', (code) => { resolve(code) })
      process.on('error', (err) => { reject(err) })
    })
  }
}
