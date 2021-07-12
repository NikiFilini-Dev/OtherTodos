import { gql } from "@urql/core"

export const UPDATE_HABIT = gql`
  mutation UpdateHabit(
    $changes: HabitUpdate!
    $dates: HabitChangesDate!
    $id: String!
  ) {
    updateHabit(changedAt: $dates, data: $changes, id: $id) {
      id
    }
  }
`

export const DELETE_HABIT = gql`
  mutation DeleteHabit($id: String!) {
    deleteHabit(id: $id)
  }
`

export const GET_HABITS = gql`
  query GetHabits {
    habits {
      id
      name
      recordsPerDay
      color
      icon
      type
      weeklyDays
      monthlyDays
    }
  }
`

export const GET_UPDATED_HABITS = gql`
  query GetHabits($since: Time!) {
    updatedHabits(since: $since) {
      id
      name
      recordsPerDay
      color
      icon
      type
      weeklyDays
      monthlyDays

      deletedAt
    }
  }
`
