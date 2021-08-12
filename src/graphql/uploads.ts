import { gql } from "@urql/core"

export const GET_UPLOADS = gql`
  query GetUploads {
    uploads {
      id
      name
      size
      extension
      userId
      preview
    }
  }
`

export const GET_UPLOAD = gql`
  query GetUpload($id: String) {
    upload(id: $id) {
      id
      name
      size
      extension
      userId
      preview
    }
  }
`
