var EventEmitter = require("events")

var ee = new EventEmitter()

module.exports = {
  getElectronPath() {
    return ""
  },
  remote: {},
  app: {
    getPath() {
      return ""
    },
  },
  ipcRenderer: ee,
}
