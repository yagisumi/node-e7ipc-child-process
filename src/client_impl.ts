import { Client } from '@yagisumi/e7ipc-types'
import { MESSAGE, ErrorData, ResponseMessage, RequestMessage } from './messages'
import { EventEmitter } from 'events'
import { Process } from './process'

export function getCounter() {
  let i = 0
  return function () {
    i = (i + 1) & 0xffffff
    return i
  }
}

export function eventKey(channel: string, id: number) {
  return `${channel}/=/${id}`
}

export class ResponseDispacher {
  private readonly process: Process
  readonly event: EventEmitter
  readonly counter = getCounter()

  constructor(process: Process) {
    this.process = process
    this.event = new EventEmitter()

    process.on(MESSAGE, (msg: ResponseMessage<any>) => {
      setImmediate(() => {
        if (typeof msg === 'object' && 'channel' in msg && 'id' in msg) {
          this.event.emit(eventKey(msg.channel, msg.id), msg)
        }
      })
    })
  }
}

export function wrapError(newError: Error, baseError: ErrorData) {
  if (baseError.stack) {
    let newEntries: string[] = []
    if (newError.stack) {
      newEntries = newError.stack.split('\n')
    }
    const baseEntries = baseError.stack.split('\n')
    const entries = []
    if (newEntries.length > 0) {
      entries.push(newEntries.shift())
    }

    for (const entry of newEntries) {
      if (baseEntries.includes(entry)) {
        break
      }
      entries.push(entry)
    }
    entries.push(...baseEntries)
    newError.stack = entries.join('\n')
  }

  Object.defineProperty(newError, 'name', {
    configurable: true,
    enumerable: false,
    value: baseError.name,
    writable: true,
  })

  return newError
}

export class ProcessClient<Req, Res> implements Client<Req, Res> {
  private readonly process: Process
  readonly channel: string
  private readonly event: EventEmitter
  private readonly counter: () => number

  constructor(process: Process, channel: string, event: EventEmitter, counter: () => number) {
    this.process = process
    this.channel = channel
    this.event = event
    this.counter = counter
  }

  invoke(request: Req) {
    const id = this.counter()
    return new Promise<Res>((resolve, reject) => {
      this.event.once(eventKey(this.channel, id), (msg: ResponseMessage<Res>) => {
        setImmediate(() => {
          if (msg.type === 'error') {
            const err = new Error(msg.error.message)
            wrapError(err, msg.error)
            reject(err)
          } else {
            resolve(msg.response)
          }
        })
      })
      this.send({ channel: this.channel, id, request })
    })
  }

  private send(msg: RequestMessage<Req>) {
    this.process.send!(msg)
  }
}
