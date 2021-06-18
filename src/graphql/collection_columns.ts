import { gql } from "@urql/core"

export const UPDATE_COLLECTION_COLUMN = gql`
  mutation UpdateCollectionColumn(
    $changes: CollectionColumnUpdate!
    $dates: CollectionColumnChangesDate!
    $id: String!
  ) {
    updateCollectionColumn(changedAt: $dates, data: $changes, id: $id) {
      id
    }
  }
`

export const DELETE_COLLECTION_COLUMN = gql`
  mutation DeleteCollectionColumn($id: String!) {
    deleteCollectionColumn(id: $id)
  }
`

export const GET_COLLECTION_COLUMNS = gql`
  query GetCollectionColumns {
    collectionColumns {
      id
      name
      color
      icon
      collectionId
      index
    }
  }
`
