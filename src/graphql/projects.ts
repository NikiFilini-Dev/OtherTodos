import { gql } from "@urql/core"

export const UPDATE_PROJECT = gql`
  mutation UpdateProject(
    $changes: ProjectUpdate!
    $dates: ProjectChangesDate!
    $id: String!
  ) {
    updateProject(changedAt: $dates, data: $changes, id: $id) {
      id
    }
  }
`

export const DELETE_PROJECT = gql`
  mutation DeleteProject($id: String!) {
    deleteProject(id: $id)
  }
`

export const GET_PROJECTS = gql`
  query GetProjects {
    projects {
      id
      name
      icon
      index
      categories
    }
  }
`
