export type RequestMessage<Req> = {
  channel: string
  id: number
  request: Req
}

export type ErrorData = {
  name: string
  stack?: string
  message: string
}

export type ResponseMessage<Res> =
  | {
      channel: string
      id: number
      type: 'ok'
      response: Res
    }
  | {
      channel: string
      id: number
      type: 'error'
      error: ErrorData
    }

export const MESSAGE = 'message'
