import { Instance, SnapshotIn, types } from "mobx-state-tree"
import { ColorName, ColorNames } from "../../palette/colors"
import Collection from "./Collection"

const CollectionTag = types
  .model("CollectionTag", {
    id: types.identifier,
    name: types.string,
    color: types.enumeration("Colors", ColorNames),
    collection: types.reference(Collection),
    index: types.number,
  })
  .views(() => ({
    get syncable() {
      return true
    },
    get syncName() {
      return "CollectionTag"
    },
    get syncRename() {
      return {collection: "collectionId"}
    },
  }))
  .actions(self => {
    const actions: Record<string, any> = {}
    const actionsMap: Record<string, string[]> = {}

    actions.setName = (val: string) => self.name = val
    actionsMap.setName = ["name"]

    actions.setColor = (val: ColorName) => self.color = val
    actionsMap.setColor = ["color"]

    actions.setIndex = (val: number) => self.index = val
    actionsMap.setIndex = ["index"]

    actions.getActionsMap = () => actionsMap
    return actions
  })

export function factory(data) {
  return data
}

export default CollectionTag
export type ICollectionTag = Instance<typeof CollectionTag>
export type ICollectionTagSnapshot = SnapshotIn<typeof CollectionTag>
