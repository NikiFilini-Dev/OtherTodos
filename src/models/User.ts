import { getRoot, types } from "mobx-state-tree"
import { IRootStore } from "./RootStore"
import { DateTime } from "luxon"
import gqlClient from "../graphql/client"
import { ME_QUERY, SET_LAST_SEEN_NOTIFICATIONS_AT } from "../graphql/users"
import { action, runInAction } from "mobx"

const User = types
  .model("User", {
    token: types.string,
    id: types.identifier,
    firstName: types.string,
    lastName: types.string,
    email: types.string,
    lastSeenNotificationsAt: types.optional(
      types.string,
      DateTime.now().toISO(),
    ),
  })
  .views(self => ({
    get fullName() {
      return self.firstName + self.lastName
    },
    get notifications() {
      const root = getRoot<IRootStore>(self)
      const user = root.user
      const rawLogs = root.collectionsStore.logs
      const cards = root.collectionsStore.cards

      const lastSeenAt = DateTime.fromISO(self.lastSeenNotificationsAt)

      const logs = rawLogs.filter(log => {
        const card = cards.find(c => c.id === log.cardId)
        if (!card || log.user.id === user.id) return false
        if (
          card.assigned?.id !== user.id &&
          !card.watchers.find(u => u.id === self.id)
        )
          return false
        return true
      })
      logs.sort(
        (b, a) =>
          new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
      )

      const newLogs = logs.filter(
        log => DateTime.fromISO(log.datetime) > lastSeenAt,
      )

      return { all: logs, new: newLogs }
    },
  }))
  .actions(self => ({
    refresh() {
      gqlClient
        .query(ME_QUERY)
        .toPromise()
        .then(resp => {
          const me = resp.data.me
          console.log(resp, me)
          runInAction(() => {
            this.setId(me.id)
            this.setEmail(me.email)
            this.setName(me.firstName)
            this.setLastName(me.lastName)
            this.setLastSeenNotificationsAt(
              me.lastSeenNotificationsAt || DateTime.now().toISO(),
              false,
            )
            console.log("ME:", me)
          })
        })
    },
    setId(id) {
      self.id = id
    },
    setEmail(email) {
      self.email = email
    },
    setName(name) {
      self.firstName = name
    },
    setLastName(val) {
      self.lastName = val
    },
    setToken(val) {
      self.token = val
    },
    setLastSeenNotificationsAt(time: string, update = true) {
      self.lastSeenNotificationsAt = time
      if (update) {
        gqlClient
          .mutation(SET_LAST_SEEN_NOTIFICATIONS_AT, { time })
          .toPromise()
          .then(console.log)
      }
    },
  }))

export default User
