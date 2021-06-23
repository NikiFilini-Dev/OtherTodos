import { gql } from "@urql/core"

export const UPDATE_COLLECTION_CARD = gql`
  mutation UpdateCollectionCard(
    $changes: CollectionCardUpdate!
    $dates: CollectionCardChangesDate!
    $id: String!
  ) {
    updateCollectionCard(changedAt: $dates, data: $changes, id: $id) {
      id
    }
  }
`

export const DELETE_COLLECTION_CARD = gql`
  mutation DeleteCollectionCard($id: String!) {
    deleteCollectionCard(id: $id)
  }
`

export const GET_COLLECTION_CARDS = gql`
  query GetCollectionCards {
    collectionCards {
      id
      name
      text
      date
      tags
      files
      preview
      collectionId
      columnId
      status
      index
      comments
      task
      assigned
    }
  }
`
