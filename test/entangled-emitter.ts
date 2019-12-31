import { EventEmitter } from 'events'
import { MESSAGE } from '@/messages'

class EntangledEmitter extends EventEmitter {
  private pair!: EntangledEmitter

  send(message: any) {
    return this.pair.emit(MESSAGE, message)
  }
}

export function createEntangledEmitters(): [EntangledEmitter, EntangledEmitter] {
  const e1 = new EntangledEmitter()
  const e2 = new EntangledEmitter()
  e1['pair'] = e2
  e2['pair'] = e1

  return [e1, e2]
}
