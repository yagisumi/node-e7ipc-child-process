import { getCounter, eventKey, wrapError } from '@/client_internal'

function throwError() {
  throw new TypeError('error0')
}

describe('client_internal', () => {
  test('getCounter', () => {
    const counter = getCounter()
    const n = counter()
    expect(counter()).toBe(n + 1)
    expect(counter()).toBe(n + 2)
    expect(counter()).toBe(n + 3)
  })

  test('eventKey', () => {
    expect(eventKey('c', 1)).toBe('c/=/1')
  })

  test('wrapError', () => {
    try {
      throwError()
    } catch (err) {
      const edata = {
        name: err.name,
        stack: err.stack,
        message: err.message,
      }
      const e1 = new Error(err.message)
      wrapError(e1, edata)

      expect(e1.name).toBe(edata.name)
      if (e1.stack) {
        expect(e1.stack.split('\n').length).toBe(err.stack.split('\n').length + 2)
      }
    }

    try {
      throwError()
    } catch (err) {
      const edata = {
        name: err.name,
        stack: err.stack,
        message: err.message,
      }
      const e1 = new Error(err.message)
      e1.stack = undefined
      wrapError(e1, edata)

      expect(e1.stack).toBe(err.stack)
    }

    try {
      throwError()
    } catch (err) {
      const edata = {
        name: err.name,
        message: err.message,
      }
      const e1 = new Error(err.message)
      const e1Stack = e1.stack
      wrapError(e1, edata)

      expect(e1.stack).toBe(e1Stack)
    }
  })
})
