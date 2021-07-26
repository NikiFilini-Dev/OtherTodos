import { getRoot, Instance, SnapshotIn, types } from "mobx-state-tree"
import { IRootStore } from "../RootStore"
import { IconName, IconNames } from "../../palette/icons"
import { userReference } from "./storages/users.storage"

const Collection = types
  .model("Collection", {
    id: types.identifier,
    name: types.string,
    icon: types.optional(types.enumeration("Icons", IconNames), "bookmark"),
    index: types.number,
    users: types.array(userReference),
    userId: userReference,
    _temp: types.optional(types.boolean, false),
  })
  .views(self => ({
    get syncable() {
      return !self._temp
    },
    get syncName() {
      return "Collection"
    },
    get columns() {
      const root = getRoot<IRootStore>(self)
      return root.collectionsStore.columns.filter(c => c.collection === self)
    },

    get cards() {
      const root = getRoot<IRootStore>(self)
      return root.collectionsStore.cards.filter(c => c.collection === self)
    },

    get tags() {
      const root = getRoot<IRootStore>(self)
      return root.collectionsStore.tags.filter(t => t.collection === self)
    },
    get syncIgnore() {
      return ["users", "userId", "_temp"]
    },
    get logs() {
      const root = getRoot<IRootStore>(self)
      const logs = root.collectionsStore.logs.filter(
        t => t.collectionId === self.id,
      )
      logs.sort(
        (b, a) =>
          new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
      )
      return logs
    },
  }))
  .actions(self => {
    const actions: Record<string, any> = {}
    const actionsMap: Record<string, string[]> = {}

    actions.setName = (val: string) => (self.name = val)
    actionsMap.setName = ["name"]

    actions.setIcon = (val: IconName) => (self.icon = val)
    actionsMap.setIcon = ["icon"]

    actions.setIndex = (val: number) => (self.index = val)
    actionsMap.setIndex = ["index"]

    actions.getActionsMap = () => actionsMap
    return actions
  })

export function factory(data) {
  return data
}

export default Collection
export type ICollection = Instance<typeof Collection>
export type ICollectionSnapshot = SnapshotIn<typeof Collection>
