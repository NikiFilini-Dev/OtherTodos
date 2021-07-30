import { gql } from "@urql/core"

export const CREATE_USER_MUTATION = gql`
  mutation CreateUser(
    $email: String!
    $password: String!
    $name: String!
    $lastName: String!
  ) {
    createUser(
      user: {
        email: $email
        password: $password
        firstName: $name
        lastName: $lastName
      }
    ) {
      id
      firstName
      lastName
      email
    }
  }
`

export const GENERATE_TOKEN_MUTATION = gql`
  mutation GenerateToken($email: String!, $password: String!) {
    generateToken(email: $email, password: $password) {
      token
      user {
        id
        email
        firstName
        lastName
      }
    }
  }
`

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      firstName
      lastName
      lastSeenNotificationsAt
    }
  }
`

export const GET_USER = gql`
  query User($id: String!) {
    user(id: $id) {
      id
      email
      firstName
      lastName
    }
  }
`

export const SET_LAST_SEEN_NOTIFICATIONS_AT = gql`
  mutation SetLastSeenNotificationsAt($time: Time) {
    setLastSeenNotificationsAt(time: $time)
  }
`
