const storage = localStorage

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
    return promisify(storage.getItem, [key], cb)
  },
  setItem(key, value, cb) {
    return promisify(storage.setItem, [key, value], cb)
  },
  removeItem(key, cb) {
    return promisify(storage.removeItem, [key], cb)
  },
  clear(cb) {
    return promisify(storage.clear, [], cb)
  },
  length() {
    return 0
  },
  keys() {
    return []
  },
  getDefaultDataPath() {
    return ""
  },
}

window.jsonStorage = jsonStorage

export default jsonStorage
