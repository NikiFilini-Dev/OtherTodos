const {noop} = require("lodash-es")

module.exports = {
  get: noop,
  set: noop,
  remove: noop,
  clear: noop,
  keys: () => [],
  getDefaultDataPath: undefined,
  getDataPath: () => ""
}
