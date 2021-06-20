import SyncType from "../syncType"
import gqlClient from "../../graphql/client"
import { SnapshotIn } from "mobx-state-tree"
import { DELETE_CARD_COMMENT, GET_CARD_COMMENT, UPDATE_CARD_COMMENT } from "../../graphql/card_comments"

export default class CardComment extends SyncType {
  name = "CardComment"

  UPDATE_MUTATION = UPDATE_CARD_COMMENT
  DELETE_MUTATION = DELETE_CARD_COMMENT

  preprocess(item) {
    return item
  }

  async load() {
    return snapshot => snapshot
  }

  async getOne<T>(id: string): Promise<SnapshotIn<T>|false> {
    const result = await gqlClient.query(GET_CARD_COMMENT, {id}).toPromise()
    console.log("DATA", result.data.cardComment)
    return result.data.cardComment
  }
}
