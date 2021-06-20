import { Instance, SnapshotIn, types } from "mobx-state-tree"
import { userReference } from "./storages/users.storage"

const CardComment = types
  .model("CardComment", {
    id: types.identifier,
    createdAt: types.string,
    text: types.string,
    user: userReference,
    card: types.string,
    collectionId: types.string,
    _temp: types.optional(types.boolean, false)
  })
  .views(self => ({
    get syncable() {
      return !self._temp
    },
    get syncName() {
      return "CardComment"
    },
    get syncIgnore() {
      return ["_temp", "user"]
    }
  }))
  .actions(self => {
    const actions: Record<string, any> = {}
    const actionsMap: Record<string, string[]> = {}

    actions.setText = (s: string) => self.text = s
    actionsMap.setText = ["text"]

    actions.getActionsMap = () => actionsMap
    return actions
  })

export function factory(data) {
  return data
}

export default CardComment
export type ICardComment = Instance<typeof CardComment>
export type ICardCommentSnapshot = SnapshotIn<typeof CardComment>