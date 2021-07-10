import gqlClient from "../graphql/client"
import jsonStorage from "tools/jsonStorage"
import { SnapshotIn } from "mobx-state-tree"
import { GET_UPDATED_COLLECTIONS } from "../graphql/collection"

const syncLogger = createLogger("SYNC")

function setValue(obj, path, value) {
  const a = path.split(".")
  let o = obj
  while (a.length - 1) {
    const n = a.shift()
    if (!(n in o)) o[n] = {}
    o = o[n]
  }
  o[a[0]] = value
}

function getValue(obj, path) {
  path = path.replace(/\[(\w+)\]/g, ".$1")
  path = path.replace(/^\./, "")
  const a = path.split(".")
  let o = obj
  while (a.length) {
    const n = a.shift()
    if (!(n in o)) return
    o = o[n]
  }
  return o
}

export default abstract class SyncType {
  name: string
  UPDATE_MUTATION: any
  DELETE_MUTATION: any
  GET_UPDATED?: any
  PATH?: string
  DATA_NAME?: string

  dumpTimer: NodeJS.Timeout | null

  lastLoadAt = new Date(0)
  state = "waiting"
  updates: {
    [key: string]: {
      state: "alive" | "dead"
      fields: {
        [key: string]: {
          date: Date
          value: any
        }
      }
    }
  } = {}

  abstract load()

  abstract preprocess(item: Record<string, any>): Record<string, any>

  async loadNew() {
    if (!this.DATA_NAME || !this.PATH || !this.GET_UPDATED)
      return snapshot => snapshot

    const now = new Date()
    const result = await gqlClient
      .query(this.GET_UPDATED, { since: this.lastLoadAt })
      .toPromise()

    return snapshot => {
      this.lastLoadAt = now
      const updated = result.data[this.DATA_NAME ?? ""].map(this.preprocess)
      const list = getValue(snapshot, this.PATH)
      updated.forEach(updatedItem => {
        const index = list.findIndex(i => i.id === updatedItem.id)

        if (updatedItem.deletedAt !== "0001-01-01T00:00:00.000Z") {
          if (index < 0) return

          list.splice(index, 1)
          return
        }

        if (index >= 0) {
          list[index] = updatedItem
        } else {
          list.push(updatedItem)
        }
      })
      setValue(snapshot, this.PATH, list)
      return snapshot
    }
  }

  async getOne<T>(id: string): Promise<SnapshotIn<T> | false> {
    throw new Error("getOne not implemented")
  }

  loadUpdates() {
    return new Promise<void>(resolve => {
      jsonStorage.getItem(`syncMachine_updates_${this.name}`, data => {
        syncLogger.debug("Type %s loaded updates: %s", this.name, data)
        this.updates = data
        resolve()
      })
    })
  }

  planDump() {
    if (this.dumpTimer) clearTimeout(this.dumpTimer)
    this.dumpTimer = setTimeout(() => this.dumpUpdates(), 300)
  }

  dumpUpdates() {
    if (!window.IS_WEB) {
      syncLogger.debug("Dumping updates: %s", JSON.stringify(this.updates))
      jsonStorage.setItem(`syncMachine_updates_${this.name}`, this.updates)
    }
  }

  registerChange(fields, id, dump = true) {
    // console.log("Registered change:", fields)
    this.updates[id] = {
      state: "alive",
      fields: {
        ...this.updates[id]?.fields,
        ...fields,
      },
    }
    if (dump) this.planDump()
  }

  registerDelete(id) {
    this.updates[id] = {
      state: "dead",
      fields: {
        ...this.updates[id]?.fields,
      },
    }
    this.dumpUpdates()
  }

  sendUpdate(id) {
    const updates = { ...this.updates }
    return new Promise<void>((resolve, reject) => {
      const item = updates[id]

      const onError = error => {
        syncLogger.error(error)
        console.error(error)
        reject()
      }

      if (item.state === "alive") {
        const onSuccess = () => {
          Object.keys(this.updates[id].fields).forEach(fieldName => {
            const field = this.updates[id].fields[fieldName]
            if (field.date === item.fields[fieldName].date) {
              delete this.updates[id].fields[fieldName]
            }
          })
          if (Object.keys(this.updates[id].fields).length === 0)
            delete this.updates[id]
          this.dumpUpdates()
          resolve()
        }

        const changes = {}
        const dates = {}

        Object.keys(item.fields).forEach(name => {
          if (name === "id") return
          changes[name] = item.fields[name].value
          if (changes[name] === null) changes[name] = ""
          if (changes[name]?.id) changes[name] = changes[name].id
          dates[name] = item.fields[name].date
        })

        gqlClient
          .query(this.UPDATE_MUTATION, { id, changes, dates })
          .toPromise()
          .then(result => {
            if (result.error) {
              onError(result.error)
            } else {
              onSuccess()
            }
          })
      } else {
        const onSuccess = () => {
          delete this.updates[id]
          this.dumpUpdates()
          resolve()
        }

        gqlClient
          .query(this.DELETE_MUTATION, { id })
          .toPromise()
          .then(result => {
            if (result.error) {
              onError(result.error)
            } else {
              onSuccess()
            }
          })
      }
    })
  }

  sendUpdates() {
    const updates = { ...this.updates }
    this.state = "updating"

    const ids = Object.keys(updates)
    let i = 0

    const update = resolve => {
      if (i < ids.length) {
        this.sendUpdate(ids[i]).then(() => {
          i++
          update(resolve)
        })
      } else {
        resolve()
      }
    }

    return new Promise<void>(resolve =>
      update(() => {
        resolve()
        this.state = "waiting"
      }),
    )
  }
}
