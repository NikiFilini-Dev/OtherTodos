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

export const GET_UPDATED_PROJECT_CATEGORIES = gql`
  query GetProjectCategories($since: Time!) {
    updatedProjectCategories(since: $since) {
      id
      name
      icon
      index
      folded

      deletedAt
    }
  }
`

export const GET_PROJECT_CATEGORIES = gql`
  query GetProjectCategories {
    projectCategories {
      id
      name
      icon
      index
      folded
    }
  }
`
