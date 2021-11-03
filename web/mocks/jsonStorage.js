// const storage = localStorage

// function promisify(func, args = [], cb = null) {
//   console.log(func, args, cb)
//   return new Promise((resolve, reject) => {
//     args.push((error, data) => {
//       if (error) return reject(error)
//       resolve(data)
//       if (cb) cb(data)
//     })
//     func(...args)
//   })
// }

const jsonStorage = {
  getItem(key, cb) {
    return new Promise(resolve => {
      const result = localStorage.getItem(key)
      if (cb) cb(result)
      resolve(result)
    })
  },
  setItem(key, value, cb) {
    console.trace(key, value)
    return new Promise(resolve => {
      const result = localStorage.setItem(key, value)
      if (cb) cb(result)
      resolve(result)
    })
  },
  removeItem(key, cb) {
    return new Promise(resolve => {
      const result = localStorage.removeItem(key)
      if (cb) cb(result)
      resolve(result)
    })
  },
  clear(cb) {
    return new Promise(resolve => {
      const result = localStorage.clear()
      if (cb) cb(result)
      resolve(result)
    })
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
