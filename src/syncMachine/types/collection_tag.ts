import SyncType from "../syncType"
import gqlClient from "../../graphql/client"
import {
  DELETE_COLLECTION_TAG,
  GET_COLLECTION_TAGS,
  UPDATE_COLLECTION_TAG,
} from "../../graphql/collection_tags"

export default class CollectionTag extends SyncType {
  name = "CollectionTag"

  UPDATE_MUTATION = UPDATE_COLLECTION_TAG
  DELETE_MUTATION = DELETE_COLLECTION_TAG

  preprocess(item) {
    item = {...item}
    item.collection = item.collectionId
    // delete item.collectionId
    return item
  }

  async load() {
    const now = new Date()
    const result = await gqlClient.query(GET_COLLECTION_TAGS).toPromise()

    return snapshot => {
      this.lastLoadAt = now
      snapshot.collectionsStore.tags = result.data.collectionTags.map(this.preprocess)
      return snapshot
    }
  }
}
