import SyncMachine from "./syncMachine"
import React from "react"

declare const IS_WEB: boolean

declare global {
  interface Window {
    getToken: () => string
    syncMachine: SyncMachine
    IS_WEB: boolean
  }
}

declare module "*.svg" {
  export const ReactComponent: React.SFC<React.SVGProps<SVGSVGElement>>
  const src: string
  export default ReactComponent
}
