import { IRootStore } from "../models/RootStore"
import gqlClient from "../graphql/client"

export default abstract class SyncType {
  name: string
  UPDATE_MUTATION: any
  DELETE_MUTATION: any

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

  abstract preprocess(item: object): object

  registerChange(fields, id) {
    this.updates[id] = {
      state: "alive",
      fields: {
        ...this.updates[id]?.fields,
        ...fields,
      },
    }
  }

  registerDelete(id) {
    this.updates[id] = {
      state: "dead",
      fields: {
        ...this.updates[id]?.fields,
      },
    }
  }

  sendUpdates() {
    const updates = JSON.parse(JSON.stringify(this.updates))
    this.state = "updating"

    const promises = Object.keys(updates).map(
      id =>
        new Promise<void>((resolve, reject) => {
          const item = updates[id]

          const onError = error => {
            console.error(error)
            reject()
          }

          if (item.state === "alive") {
            const onSuccess = data => {
              console.log(data, this.updates, updates)
              Object.keys(this.updates[id].fields).forEach(fieldName => {
                const field = this.updates[id].fields[fieldName]
                if (field.date === item.fields[fieldName].date) {
                  delete this.updates[id].fields[fieldName]
                }
              })
              resolve()
            }

            const changes = {}
            const dates = {}

            Object.keys(item.fields).forEach(name => {
              changes[name] = item.fields[name].value
              dates[name] = item.fields[name].date
            })

            gqlClient
              .query(this.UPDATE_MUTATION, { id, changes, dates })
              .toPromise()
              .then(result => {
                if (result.error) {
                  onError(result.error)
                } else {
                  onSuccess(result.data)
                }
              })
          } else {
            const onSuccess = data => {
              console.log(data)
              delete this.updates[item.id]
            }

            gqlClient
              .query(this.DELETE_MUTATION, { id })
              .toPromise()
              .then(result => {
                if (result.error) {
                  onError(result.error)
                } else {
                  onSuccess(result.data)
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
