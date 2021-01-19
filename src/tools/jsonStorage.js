import storage from "electron-json-storage"
console.log(storage.getDataPath())
const promisify = (func, args = [], cb = null) => {
  return new Promise((resolve, reject) => {
    func(...args, (error, data) => {
      if (error) return reject(error)
      resolve(data)
      if (cb) cb(data)
    })
  })
}

const jsonStorage = {
  getItem(key, cb) {
    return promisify(storage.get, [key], cb)
  },
  setItem(key, value, cb) {
    return promisify(storage.set, [key, value], cb)
  },
  removeItem(key, cb) {
    return promisify(storage.remove, [key], cb)
  },
  clear(cb) {
    return promisify(storage.clear, [], cb)
  },
  length(cb) {
    return promisify(cb => storage.keys(cb).length, cb)
  },
  keys(cb) {
    return promisify(storage.keys, [], cb)
  },
  getDefaultDataPath() {
    return storage.getDefaultDataPath()
  },
}

window.jsonStorage = jsonStorage

export default jsonStorage
