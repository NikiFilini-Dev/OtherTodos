import { getRoot, Instance, SnapshotIn, types } from "mobx-state-tree"
import { ColorName, ColorNames } from "../../palette/colors"
import Collection, { ICollection } from "./Collection"
import { IRootStore } from "../RootStore"

const CollectionColumn = types
  .model("CollectionColumn", {
    id: types.identifier,
    name: types.string,
    color: types.optional(types.enumeration("Color", ColorNames), "blue"),
    index: types.number,
    collection: types.reference(Collection)
  })
  .views(self => ({
    get syncable() {
      return false
    },
    get syncName() {
      return "CollectionColumn"
    },
    get cards() {
      const root = getRoot<IRootStore>(self)
      return root.collectionsStore.cards.filter(card => card.column === self)
    }
  }))
  .actions(self => {
    const actions: Record<string, any> = {}
    const actionsMap: Record<string, string[]> = {}

    actions.setName = (val: string) => self.name = val
    actionsMap.setName = ["name"]

    actions.setColor = (val: ColorName) => self.color = val
    actionsMap.setName = ["color"]

    actions.setIndex = (val: number) => self.index = val
    actionsMap.setName = ["index"]

    // @ts-ignore
    actions.setCollection = (val: string | ICollection) => self.collection = val
    actionsMap.setName = ["collection"]

    actions.getActionsMap = () => actionsMap
    return actions
  })

export function factory(data) {
  return data
}

export default CollectionColumn
export type ICollectionColumn = Instance<typeof CollectionColumn>
export type ICollectionColumnSnapshot = SnapshotIn<typeof CollectionColumn>
