import { gql } from "@urql/core"

export const UPDATE_ASSIGNED_COLUMN = gql`
  mutation UpdateAssignedColumn(
    $changes: AssignedColumnUpdate!
    $dates: AssignedColumnChangesDate!
    $id: String!
  ) {
    updateAssignedColumn(changedAt: $dates, data: $changes, id: $id) {
      id
    }
  }
`

export const DELETE_ASSIGNED_COLUMN = gql`
  mutation DeleteAssignedColumn($id: String!) {
    deleteAssignedColumn(id: $id)
  }
`

export const GET_ASSIGNED_COLUMNS = gql`
  query GetAssignedColumns {
    assignedColumns {
      id
      name
      color
      icon
      index
      cards
    }
  }
`

export const GET_ASSIGNED_COLUMN = gql`
  query GetAssignedColumn($id: String!) {
    assignedColumn(id: $id) {
      id
      name
      color
      icon
      index
      cards
    }
  }
`

export const GET_UPDATED_ASSIGNED_COLUMNS = gql`
  query GetAssignedColumns($since: Time!) {
    updatedAssignedColumns(since: $since) {
      id
      name
      color
      icon
      index
      cards

      deletedAt
    }
  }
`
