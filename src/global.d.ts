import SyncMachine from "./syncMachine"
import React from "react"
import winston from "winston"
import { IRootStore } from "./models/RootStore"

declare global {
  const IS_WEB: boolean
  const API_URL: string
  const logger: winston.Logger
  const createLogger: (label?: string) => winston.Logger

  interface Window {
    getToken: () => string
    syncMachine: SyncMachine
    IS_WEB: boolean
    Store: IRootStore
  }
}

declare module "*.svg" {
  export const ReactComponent: React.SFC<React.SVGProps<SVGSVGElement>>
  const src: string
  export default ReactComponent
}
