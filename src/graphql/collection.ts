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
      users
      userId
    }
  }
`

export const GET_COLLECTION = gql`
  query GetCollection($id: String!) {
    collection(id: $id) {
      id
      name
      icon
      index
      users
      userId
    }
  }
`

export const GET_UPDATED_COLLECTIONS = gql`
  query GetUpdatedCollections($since: Time!) {
    updatedCollections(since: $since) {
      id
      name
      icon
      index
      users
      userId

      deletedAt
    }
  }
`

export const INVITE_USER = gql`
  mutation InviteUser($collectionId: String!, $email: String!) {
    inviteUser(collectionId: $collectionId, email: $email)
  }
`

export const REMOVE_USER_FROM_COLLECTION = gql`
  mutation RemoveUserFromCollection($collectionId: String!, $userId: String!) {
    removeUserFromCollection(collectionId: $collectionId, userId: $userId)
  }
`
