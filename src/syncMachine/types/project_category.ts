import SyncType from "../syncType"
import gqlClient from "../../graphql/client"
import {
  DELETE_PROJECT_CATEGORY,
  GET_PROJECT_CATEGORIES,
  GET_UPDATED_PROJECT_CATEGORIES,
  UPDATE_PROJECT_CATEGORY,
} from "../../graphql/project_categories"

export default class ProjectCategory extends SyncType {
  name = "ProjectCategory"

  UPDATE_MUTATION = UPDATE_PROJECT_CATEGORY
  DELETE_MUTATION = DELETE_PROJECT_CATEGORY
  GET_UPDATED = GET_UPDATED_PROJECT_CATEGORIES

  PATH = "categories"
  DATA_NAME = "updatedProjectCategories"

  preprocess(item) {
    if (item.icon === "") item.icon = "check_list"
    return item
  }

  async load() {
    const now = new Date()
    const result = await gqlClient.query(GET_PROJECT_CATEGORIES).toPromise()

    return snapshot => {
      this.lastLoadAt = now
      snapshot.categories = result.data.projectCategories.map(this.preprocess)
      return snapshot
    }
  }
}
