import { gql } from "@urql/core"

export const UPDATE_HABIT_RECORD = gql`
  mutation UpdateHabitRecord(
    $changes: HabitRecordUpdate!
    $dates: HabitRecordChangesDate!
    $id: String!
  ) {
    updateHabitRecord(changedAt: $dates, data: $changes, id: $id) {
      id
    }
  }
`

export const DELETE_HABIT_RECORD = gql`
  mutation DeleteHabitRecord($id: String!) {
    deleteHabitRecord(id: $id)
  }
`

export const GET_HABIT_RECORDS = gql`
  query GetHabitRecords {
    habitRecords {
      id
      habit
      date
    }
  }
`

export const GET_UPDATED_HABIT_RECORDS = gql`
  query GetHabitRecords($since: Time!) {
    updatedHabitRecords(since: $since) {
      id
      habit
      date

      deletedAt
    }
  }
`
