import { gql } from "@urql/core"

export const UPDATE_SUBTASK = gql`
  mutation UpdateSubtask(
    $changes: SubtaskUpdate!
    $dates: SubtaskChangesDate!
    $id: String!
  ) {
    updateSubtask(changedAt: $dates, data: $changes, id: $id) {
      id
    }
  }
`

export const DELETE_SUBTASK = gql`
  mutation DeleteSubtask($id: String!) {
    deleteSubtask(id: $id)
  }
`

export const GET_SUBTASKS = gql`
  query GetSubtasks {
    subtasks {
      id
      text
      status
      closedAt
      task
      index
    }
  }
`
