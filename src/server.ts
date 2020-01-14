import { Process } from './process'
import { RequestDispacher, ProcessServer } from './server_impl'

const requestDispachers = new WeakMap<Process, RequestDispacher>()

export function createServer<Req, Res>(channel: string, process: Process) {
  if (typeof process.send !== 'function' || typeof process.on !== 'function') {
    throw new Error('Wrong argument type')
  }

  let dispacher = requestDispachers.get(process)
  if (dispacher === undefined) {
    dispacher = new RequestDispacher(process)
    requestDispachers.set(process, dispacher)
  }
  const server = new ProcessServer<Req, Res>(channel)
  dispacher.register(channel, server)

  return server
}
