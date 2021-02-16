import React from "react"
import Emitter from "events"

const ScrollContext = React.createContext(new Emitter())
export default ScrollContext
