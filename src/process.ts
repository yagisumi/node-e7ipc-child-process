import { fork } from 'child_process'

export type ChildProcess = ReturnType<typeof fork>
export type ProcessLike = {
  send(message: any): boolean
  on(event: string | symbol, listener: (...args: any[]) => void): any
}
export type Process = NodeJS.Process | ChildProcess | ProcessLike
