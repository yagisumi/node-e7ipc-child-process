import { Handler } from '@/e7ipc-child-process'

type MapType<T, U = keyof T> = U extends keyof T ? T[U] : never

export interface Requests {
  hello: {
    type: 'hello'
  }
  bye: {
    type: 'bye'
  }
  throwString: {
    type: 'throwString'
  }
  throwObject: {
    type: 'throwObject'
  }
}

export type Request = MapType<Requests>

export interface Responses {
  ok: {
    type: 'ok'
  }
}

export type Response = MapType<Responses>

export const handler: Handler<Request, Response> = async (_, req) => {
  if (req.type === 'hello') {
    return { type: 'ok' }
  } else if (req.type === 'bye') {
    throw new Error(`Don't say good bye`)
  } else if (req.type === 'throwString') {
    throw `Don't say good bye`
  } else if (req.type === 'throwObject') {
    throw {}
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const unreachable: never = req
    throw new Error('unreachable')
  }
}
