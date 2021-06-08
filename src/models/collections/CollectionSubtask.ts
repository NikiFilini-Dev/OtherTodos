import { Instance, SnapshotIn, types } from "mobx-state-tree"
import { ColorName, ColorNames } from "../../palette/colors"
import Collection from "./Collection"
import CollectionCard from "./CollectionCard"

const CollectionSubtask = types
  .model("CollectionSubtask", {
    id: types.identifier,
    text: types.string,
    index: types.optional(types.number, 0),
    status: types.enumeration("SubtaskStatus", ["ACTIVE", "DONE"]),
    card: types.reference(CollectionCard)
  })
  .views(() => ({
    get syncable() {
      return true
    },
    get syncName() {
      return "CollectionSubtask"
    },
  }))
  .actions(self => {
    const actions: Record<string, any> = {}
    const actionsMap: Record<string, string[]> = {}

    actions.setText = (val: string) => self.text = val
    actionsMap.setText = ["text"]

    actions.setIndex = (val: number) => self.index = val
    actionsMap.setIndex = ["index"]

    actions.setStatus = (val: "ACTIVE" | "DONE") => self.status = val
    actionsMap.setStatus = ["status"]

    actions.setCard = (val) => self.card = val
    actionsMap.setCard = ["card"]

    actions.getActionsMap = () => actionsMap
    return actions
  })

export function factory(data) {
  return data
}

export default CollectionSubtask
export type ICollectionSubtask = Instance<typeof CollectionSubtask>
export type ICollectionSubtaskSnapshot = SnapshotIn<typeof CollectionSubtask>