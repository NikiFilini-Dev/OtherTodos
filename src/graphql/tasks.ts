import { gql } from "@urql/core"

export const UPDATE_TASK = gql`
  mutation GenerateToken(
    $changes: TaskUpdate!
    $dates: TaskChangesDate!
    $id: String!
  ) {
    updateTask(changedAt: $dates, data: $changes, id: $id) {
      id
    }
  }
`

export const DELETE_TASK = gql`
  mutation DeleteTask($id: String!) {
    deleteTask(id: $id)
  }
`

export const GET_TASKS = gql`
  query GetTasks {
    tasks {
      id
      text
      note
      status
      project
      priority
      date
      tags
      closeDate
      creationDate
      repeatEvery
      repeating
      category
      event
      colorTag
      card
    }
  }
`

export const GET_TASKS_SINCE = gql`
  query GetTasksUpdated($since: Time!) {
    updatedTasks(since: $since) {
      id
      text
      note
      status
      project
      priority
      date
      tags
      closeDate
      creationDate
      repeatEvery
      repeating
      category
      event
      colorTag
      card
    }
  }
`
