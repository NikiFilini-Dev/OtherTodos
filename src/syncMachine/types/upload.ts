import SyncType from "../syncType"
import gqlClient from "../../graphql/client"
import {
  GET_UPLOADS
} from "../../graphql/uploads"

export default class Upload extends SyncType {
  name = "Upload"

  UPDATE_MUTATION = null
  DELETE_MUTATION = null

  preprocess(item) {
    return item
  }

  async load() {
    const now = new Date()
    const result = await gqlClient.query(GET_UPLOADS).toPromise()

    return snapshot => {
      this.lastLoadAt = now
      snapshot.collectionsStore.uploads = result.data.uploads.map(this.preprocess)
      return snapshot
    }
  }
}
