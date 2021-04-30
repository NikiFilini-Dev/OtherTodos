import gqlClient from "../graphql/client"
import jsonStorage from "tools/jsonStorage"

const syncLogger = createLogger("SYNC")

export default abstract class SyncType {
  name: string
  UPDATE_MUTATION: any
  DELETE_MUTATION: any
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

  sendUpdates() {
    const updates = { ...this.updates }
    this.state = "updating"

    const promises = Object.keys(updates).map(
      id =>
        new Promise<void>((resolve, reject) => {
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
        }),
    )

    Promise.allSettled(promises).then(() => {
      this.state = "waiting"
    })

    return promises
  }
}
