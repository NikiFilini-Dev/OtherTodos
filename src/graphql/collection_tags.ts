import { gql } from "@urql/core"

export const UPDATE_COLLECTION_TAG = gql`
  mutation UpdateCollectionTag(
    $changes: CollectionTagUpdate!
    $dates: CollectionTagChangesDate!
    $id: String!
  ) {
    updateCollectionTag(changedAt: $dates, data: $changes, id: $id) {
      id
    }
  }
`

export const DELETE_COLLECTION_TAG = gql`
  mutation DeleteCollectionTag($id: String!) {
    deleteCollectionTag(id: $id)
  }
`

export const GET_COLLECTION_TAGS = gql`
  query GetCollectionTags {
    collectionTags {
      id
      name
      color
      collection
      index
    }
  }
`
