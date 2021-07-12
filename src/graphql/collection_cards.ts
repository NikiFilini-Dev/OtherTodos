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
      nameOriginal
      text
      textOriginal
      date
      tags
      files
      preview
      collectionId
      columnId
      status
      index
      comments
      assigned
    }
  }
`

export const GET_UPDATED_COLLECTION_CARDS = gql`
  query GetCollectionCards($since: Time!) {
    updatedCollectionCards(since: $since) {
      id
      name
      nameOriginal
      text
      textOriginal
      date
      tags
      files
      preview
      collectionId
      columnId
      status
      index
      comments
      assigned
      deletedAt
    }
  }
`
