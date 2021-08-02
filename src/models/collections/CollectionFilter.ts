import { types } from "mobx-state-tree"
import { userReference } from "./storages/users.storage"
import CollectionTag from "./CollectionTag"

const CollectionFilter = types
  .model("CollectionFilter", {
    onlyWithWatcher: types.maybeNull(userReference),
    onlyWithTags: types.array(types.reference(CollectionTag)),
    onlyInStatus: types.optional(
      types.enumeration("", ["DONE", "NOT_DONE", "ANY"]),
      "ANY",
    ),
    onlyOnDate: types.maybeNull(types.string),
  })
  .views(() => ({
    get syncable() {
      return false
    },
  }))
  .actions(self => ({
    addTag(tagId: string) {
      if (self.onlyWithTags.find(t => t.id === tagId)) return
      self.onlyWithTags.push(tagId)
    },
    removeTag(tagId) {
      const index = self.onlyWithTags.findIndex(t => t.id === tagId)
      if (index < 0) return
      self.onlyWithTags.splice(index, 1)
    },
    setOnlyWithWatcher(watcher) {
      self.onlyWithWatcher = watcher
    },
    setOnlyInStatus(status: "ANY" | "DONE" | "NOT_DONE") {
      self.onlyInStatus = status
    },
    setOnlyOnDate(date) {
      self.onlyOnDate = date
    },
  }))
export default CollectionFilter
