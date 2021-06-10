import { gql } from "@urql/core"

export const GET_UPLOADS = gql`
  query GetUploads {
    uploads {
      id
      name
      size
      extension
    }
  }
`
