import { gql } from "@urql/core"

export const UPDATE_PROJECT_CATEGORY = gql`
  mutation UpdateProjectCategory(
    $changes: ProjectCategoryUpdate!
    $dates: ProjectCategoryChangesDate!
    $id: String!
  ) {
    updateProjectCategory(changedAt: $dates, data: $changes, id: $id) {
      id
    }
  }
`

export const DELETE_PROJECT_CATEGORY = gql`
  mutation DeleteProjectCategory($id: String!) {
    deleteProjectCategory(id: $id)
  }
`

export const GET_PROJECT_CATEGORIES = gql`
  query GetProjectCategoriess {
    projectCategories {
      id
      name
      index
      folded
    }
  }
`
