import { getRoot, Instance, SnapshotIn, types } from "mobx-state-tree"
import { IRootStore } from "../RootStore"

const Collection = types
  .model("Collection", {
    id: types.identifier,
    name: types.string
  })
  .views(self => ({
    get syncable() {
      return false
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
    }
  }))
  .actions(self => {
    const actions: Record<string, any> = {}
    const actionsMap: Record<string, string[]> = {}

    actions.setName = (val: string) => {
      self.name = val
    }
    actionsMap.setName = ["name"]

    actions.getActionsMap = () => actionsMap
    return actions
  })

export function factory(data) {
  return data
}

export default Collection
export type ICollection = Instance<typeof Collection>
export type ICollectionSnapshot = SnapshotIn<typeof Collection>