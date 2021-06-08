import { gql } from "@urql/core"

export const UPDATE_COLLECTION = gql`
  mutation UpdateCollection(
    $changes: CollectionUpdate!
    $dates: CollectionChangesDate!
    $id: String!
  ) {
    updateCollection(changedAt: $dates, data: $changes, id: $id) {
      id
    }
  }
`

export const DELETE_COLLECTION = gql`
  mutation DeleteCollection($id: String!) {
    deleteCollection(id: $id)
  }
`

export const GET_COLLECTIONS = gql`
  query GetCollections {
    collections {
      id
      name
      icon
      index
    }
  }
`
