import { Process } from './process'
import { ResponseDispacher, ProcessClient } from './client_internal'

const responseDispachers = new WeakMap<Process, ResponseDispacher>()

export function createClient<Req, Res>(channel: string, process: Process) {
  if (typeof process.send !== 'function' || typeof process.on !== 'function') {
    throw new Error('Wrong argument type')
  }

  let dispacher = responseDispachers.get(process)
  if (dispacher === undefined) {
    dispacher = new ResponseDispacher(process)
    responseDispachers.set(process, dispacher)
  }

  return new ProcessClient<Req, Res>(process, channel, dispacher.event, dispacher.counter)
}
