import SyncMachine from "./syncMachine"
import winston from "winston"
import { IRootStore } from "./models/RootStore"
import React from "react"

declare global {
  const IS_WEB: boolean
  const API_URL: string
  const logger: winston.Logger
  const createLogger: (label?: string) => winston.Logger
  let __webpack_public_path__: string

  interface Window {
    getToken: () => string
    syncMachine: SyncMachine
    IS_WEB: boolean
    Store: IRootStore
    onDragEndFunc?: any
  }

  namespace JSX {
    interface IntrinsicElements {
      "baka-editor": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & { class: string }
    }
  }
}
// eslint-disable-next-line max-len
declare type PrependNextNum<
  A extends Array<unknown>
> = A["length"] extends infer T
  ? ((t: T, ...a: A) => void) extends (...x: infer X) => void
    ? X
    : never
  : never

// eslint-disable-next-line max-len
declare type EnumerateInternal<A extends Array<unknown>, N extends number> = {
  0: A
  1: EnumerateInternal<PrependNextNum<A>, N>
}[N extends A["length"] ? 0 : 1]

declare type Enumerate<N extends number> = EnumerateInternal<
  [],
  N
> extends (infer E)[]
  ? E
  : never

declare type CustomRange<FROM extends number, TO extends number> = Exclude<
  Enumerate<TO>,
  Enumerate<FROM>
>
