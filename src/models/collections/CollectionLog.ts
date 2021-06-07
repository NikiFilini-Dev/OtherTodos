import { Instance, types } from "mobx-state-tree"
import Collection from "./Collection"
import CollectionColumn from "./CollectionColumn"
import CollectionCard from "./CollectionCard"

const CollectionLog = types
  .model("CollectionLog", {
    id: types.identifier,
    collection: types.maybeNull(types.reference(Collection)),
    collectionColumn: types.maybeNull(types.reference(CollectionColumn)),
    collectionCard: types.maybeNull(types.reference(CollectionCard)),
    type: types.enumeration("CollectionLogType", ["COLLECTION", "COLUMN", "CARD"]),
    date: types.string,
    time: types.string
  })
  .views(() => ({
    get syncable() {
      return false
    },
    get syncName() {
      return "CollectionLog"
    },
  }))
  .actions(self => {
    const actions: Record<string, any> = {}
    const actionsMap: Record<string, string[]> = {}

    actions.setType = (val: "COLLECTION" | "COLUMN" | "CARD") => self.type = val
    actionsMap.setType = ["type"]

    actions.setCollection = (val) => self.collection = val
    actionsMap.setCollection = ["collection"]

    actions.setCollectionColumn = (val) => self.collectionColumn = val
    actionsMap.setCollectionColumn = ["collectionColumn"]

    actions.setCollectionCard = (val) => self.collectionCard = val
    actionsMap.setCollectionCard = ["collectionCard"]

    actions.setDate = (val: string) => self.date = val
    actionsMap.setDate = ["date"]

    actions.setTime = (val: string) => self.time = val
    actionsMap.setTime = ["time"]

    actions.getActionsMap = () => actionsMap
    return actions
  })

export function factory(data) {
  return data
}

export default CollectionLog
export type ICollectionLog = Instance<typeof CollectionLog>
