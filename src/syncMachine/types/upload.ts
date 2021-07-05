import SyncType from "../syncType"
import gqlClient from "../../graphql/client"
import {
  GET_UPLOAD,
  GET_UPLOADS,
} from "../../graphql/uploads"
import { SnapshotIn } from "mobx-state-tree"

export default class Upload extends SyncType {
  name = "Upload"

  UPDATE_MUTATION = null
  DELETE_MUTATION = null

  preprocess(item) {
    return item
  }

  async load() {
    return snapshot => snapshot
  }

  async getOne<T>(id: string): Promise<SnapshotIn<T>|false> {
    const result = await gqlClient.query(GET_UPLOAD, {id}).toPromise()
    return result.data.upload
  }
}
