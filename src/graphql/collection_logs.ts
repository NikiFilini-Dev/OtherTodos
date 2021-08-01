import { gql } from "@urql/core"

export const GET_COLLECTION_LOGS = gql`
  query GetCollectionLogs {
    collectionLogs {
      action
      cardId
      collectionId
      columnId
      commentId
      datetime
      id
      moveTargetCollection
      moveTargetColumn
      targetType
      userId
      mentionedUsers
    }
  }
`

export const GET_NEW_COLLECTION_LOGS = gql`
  query GetNewCollectionLogs($since: Time!) {
    newCollectionLogs(since: $since) {
      action
      cardId
      collectionId
      columnId
      commentId
      datetime
      id
      moveTargetCollection
      moveTargetColumn
      targetType
      userId
      mentionedUsers
    }
  }
`
