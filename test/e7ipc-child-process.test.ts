import { createClient, createServer } from '@/e7ipc-child-process'
import { createEntangledEmitters } from './entangled-emitter'
import { Request, Response, handler } from './messages'

describe('e7ipc-child-process', () => {
  test('normal request', async () => {
    const [e1, e2] = createEntangledEmitters()
    const client = createClient<Request, Response>('test', e1)
    const server = createServer<Request, Response>('test', e2)

    server.handle(handler)

    const r1 = await client.invoke({ type: 'hello' })
    expect(r1).toEqual({ type: 'ok' })

    const r2 = await client.invoke({ type: 'bye' }).catch((err) => {
      expect(err).toBeInstanceOf(Error)
      return null
    })
    expect(r2).toBeNull()
  })

  test('handle, removeHandler, handleOnce', async () => {
    const [e1, e2] = createEntangledEmitters()
    const client = createClient<Request, Response>('test', e1)
    const server = createServer<Request, Response>('test', e2)

    const r1 = await client.invoke({ type: 'hello' }).catch((err) => {
      expect(err).toBeInstanceOf(Error)
      return null
    })
    expect(r1).toBeNull()

    server.handleOnce(handler)
    expect(() => {
      server.handle(handler)
    }).toThrowError()

    const r2 = await client.invoke({ type: 'hello' })
    expect(r2).toEqual({ type: 'ok' })

    const r3 = await client.invoke({ type: 'hello' }).catch((err) => {
      expect(err).toBeInstanceOf(Error)
      return null
    })
    expect(r3).toBeNull()
  })

  // for coverage
  test('send unrelated message', (done) => {
    const [e1, e2] = createEntangledEmitters()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const client = createClient<Request, Response>('test', e1)
    const server = createServer<Request, Response>('test', e2)

    server.handle(handler)

    e1.send('test')
    e2.send('test')

    e1.send({})
    e2.send({})

    e1.send({ channel: 'test' })
    e2.send({ channel: 'test' })

    setImmediate(() => {
      done()
    })
  })

  test('throw error', async () => {
    const [e1, e2] = createEntangledEmitters()
    const client = createClient<Request, Response>('test', e1)
    const server = createServer<Request, Response>('test', e2)

    server.handle(handler)

    const r1 = await client.invoke({ type: 'throwString' }).catch((err) => err)
    expect(r1).toBeInstanceOf(Error)

    const r2 = await client.invoke({ type: 'throwObject' }).catch((err: Error) => err)
    expect(r2).toBeInstanceOf(Error)
    if (r2 instanceof Error) {
      expect(r2.message).toBe('')
    }
  })

  test('register the same channel twice', () => {
    expect(() => {
      const e2 = createEntangledEmitters()[1]
      createServer<Request, Response>('test', e2)
      createServer<Request, Response>('test', e2)
    }).toThrowError()
  })

  test('createClient', () => {
    expect(() => {
      createClient<Request, Response>('test', {} as any)
    }).toThrowError()

    const [e1] = createEntangledEmitters()
    const client1 = createClient<Request, Response>('test', e1)
    const client2 = createClient<Request, Response>('test', e1)

    const n = client1['counter']()
    expect(client2['counter']()).toBe(n + 1)
  })

  test('createClient', () => {
    expect(() => {
      createServer<Request, Response>('test', {} as any)
    }).toThrowError()
  })
})
