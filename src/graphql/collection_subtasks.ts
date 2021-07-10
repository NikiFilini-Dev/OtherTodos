import { gql } from "@urql/core"

export const UPDATE_COLLECTION_SUBTASK = gql`
  mutation UpdateCollectionSubtask(
    $changes: CollectionSubtaskUpdate!
    $dates: CollectionSubtaskChangesDate!
    $id: String!
  ) {
    updateCollectionSubtask(changedAt: $dates, data: $changes, id: $id) {
      id
    }
  }
`

export const DELETE_COLLECTION_SUBTASK = gql`
  mutation DeleteCollectionSubtask($id: String!) {
    deleteCollectionSubtask(id: $id)
  }
`

export const GET_COLLECTION_SUBTASKS = gql`
  query GetCollectionSubtasks {
    collectionSubtasks {
      id
      text
      status
      cardId
      index
    }
  }
`

export const GET_UPDATED_COLLECTION_SUBTASKS = gql`
  query GetCollectionSubtasks($since: Time!) {
    updatedCollectionSubtasks(since: $since) {
      id
      text
      status
      cardId
      index

      deletedAt
    }
  }
`
