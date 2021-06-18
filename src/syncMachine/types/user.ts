import SyncType from "../syncType"
import gqlClient from "../../graphql/client"
import { SnapshotIn } from "mobx-state-tree"
import { GET_USER } from "../../graphql/users"

export default class User extends SyncType {
  name = "User"

  UPDATE_MUTATION = null
  DELETE_MUTATION = null

  preprocess(item) {
    return item
  }

  async load() {
    return snapshot => snapshot
  }

  async getOne<T>(id: string): Promise<SnapshotIn<T>|false> {
    const result = await gqlClient.query(GET_USER, {id}).toPromise()
    return result.data.user
  }
}
