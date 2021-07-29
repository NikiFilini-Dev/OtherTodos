import { Instance, types } from "mobx-state-tree"
import Collection from "./Collection"
import CollectionColumn from "./CollectionColumn"
import CollectionCard from "./CollectionCard"
import CardComment from "./CardComment"
import OtherUser from "./OtherUser"
import { userReference } from "./storages/users.storage"

const CollectionLog = types
  .model("CollectionLog", {
    id: types.identifier,
    collectionId: types.string,
    columnId: types.maybeNull(types.string),
    cardId: types.maybeNull(types.string),
    commentId: types.maybeNull(types.string),
    targetType: types.enumeration("CollectionLogTargetType", [
      "COLLECTION",
      "COLUMN",
      "CARD",
      "COMMENT",
      "SUBTASK",
    ]),
    action: types.enumeration("CollectionLogType", [
      "CREATE",
      "EDIT",
      "MOVE",
      "DELETE",
      "COMPLETE",
    ]),
    user: userReference,
    datetime: types.string,
    moveTargetCollection: types.maybeNull(types.reference(Collection)),
    moveTargetColumn: types.maybeNull(types.reference(CollectionColumn)),
  })
  .views(() => ({
    get syncable() {
      return false
    },
    get syncName() {
      return "CollectionLog"
    },
  }))

export function factory(data) {
  return data
}

export default CollectionLog
export type ICollectionLog = Instance<typeof CollectionLog>
