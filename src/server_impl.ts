import { Server, Handler } from '@yagisumi/e7ipc-types'
import { MESSAGE, ResponseMessage, RequestMessage } from './messages'
import { Process } from './process'

export class RequestDispacher {
  private readonly process: Process
  private servers: Map<string, ProcessServer<any, any>> = new Map()
  constructor(process: Process) {
    this.process = process
    process.on(MESSAGE, (msg: RequestMessage<any>) => {
      setImmediate(() => {
        this.handle(msg)
      })
    })
  }

  handle(msg: RequestMessage<any>) {
    if (typeof msg === 'object' && 'channel' in msg && 'id' in msg) {
      const server = this.servers.get(msg.channel)
      if (server && server.handler) {
        server
          .handler({}, msg.request)
          .then((response) => {
            this.send({
              channel: msg.channel,
              id: msg.id,
              type: 'ok',
              response,
            })
          })
          .catch((err) => {
            const e: Error = {
              name: 'Error',
              stack: undefined,
              message: '',
            }

            if (typeof err === 'string') {
              e.message = err
            } else if (err instanceof Error) {
              e.name = err.name
              e.stack = err.stack
              e.message = err.message
            }

            this.send({
              channel: msg.channel,
              id: msg.id,
              type: 'error',
              error: e,
            })
          })
      } else {
        this.send({
          channel: msg.channel,
          id: msg.id,
          type: 'error',
          error: {
            name: 'NoHandlerError',
            message: `No handler for '${msg.channel}'`,
          },
        })
      }
    }
  }

  register(channel: string, server: ProcessServer<any, any>) {
    if (this.servers.has(channel)) {
      throw new Error(`already registered channel '${channel}'`)
    }

    this.servers.set(channel, server)
  }

  private send(msg: ResponseMessage<any>) {
    this.process.send!(msg)
  }
}

export class ProcessServer<Req, Res> implements Server<Req, Res> {
  readonly channel: string
  handler?: Handler<Req, Res>

  constructor(channel: string) {
    this.channel = channel
  }

  handle(listener: Handler<Req, Res>) {
    if (this.handler !== undefined) {
      throw new Error(`already exist handler for '${this.channel}'`)
    }
    this.handler = listener
  }

  handleOnce(listener: Handler<Req, Res>) {
    this.handle((ev, req) => {
      this.removeHandler()
      return listener(ev, req)
    })
  }

  removeHandler() {
    this.handler = undefined
  }
}
