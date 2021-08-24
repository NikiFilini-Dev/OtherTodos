import SyncType from "../syncType"
import gqlClient from "../../graphql/client"
import {
  DELETE_ASSIGNED_COLUMN,
  GET_ASSIGNED_COLUMNS,
  GET_UPDATED_ASSIGNED_COLUMNS,
  UPDATE_ASSIGNED_COLUMN,
} from "../../graphql/assigned_columns"

export default class AssignedColumn extends SyncType {
  name = "AssignedColumn"

  UPDATE_MUTATION = UPDATE_ASSIGNED_COLUMN
  DELETE_MUTATION = DELETE_ASSIGNED_COLUMN

  GET_UPDATED = GET_UPDATED_ASSIGNED_COLUMNS

  PATH = "collectionsStore.assignedColumns"
  DATA_NAME = "updatedAssignedColumns"

  preprocess(item) {
    item = { ...item }
    if (item.icon === "") delete item.icon
    return item
  }

  async load() {
    const now = new Date()
    const result = await gqlClient.query(GET_ASSIGNED_COLUMNS).toPromise()

    return snapshot => {
      this.lastLoadAt = now
      snapshot.collectionsStore.assignedColumns = result.data.assignedColumns.map(
        this.preprocess,
      )
      return snapshot
    }
  }
}
