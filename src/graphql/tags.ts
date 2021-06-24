import { gql } from "@urql/core"

export const UPDATE_TAG = gql`
  mutation UpdateTag(
    $changes: TagUpdate!
    $dates: TagChangesDate!
    $id: String!
  ) {
    updateTag(changedAt: $dates, data: $changes, id: $id) {
      id
    }
  }
`

export const DELETE_TAG = gql`
  mutation DeleteTag($id: String!) {
    deleteTag(id: $id)
  }
`

export const GET_TAGS = gql`
  query GetTags {
    tags {
      id
      name
      index
      color
      type
    }
  }
`
