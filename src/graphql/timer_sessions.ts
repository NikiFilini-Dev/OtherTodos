import { gql } from "@urql/core"

export const UPDATE_TIMER_SESSION = gql`
  mutation UpdateTimerSession(
    $changes: TimerSessionUpdate!
    $dates: TimerSessionChangesDate!
    $id: String!
  ) {
    updateTimerSession(changedAt: $dates, data: $changes, id: $id) {
      id
    }
  }
`

export const DELETE_TIMER_SESSION = gql`
  mutation DeleteTimerSession($id: String!) {
    deleteTimerSession(id: $id)
  }
`

export const GET_TIMER_SESSIONS = gql`
  query GetTimerSessions {
    timerSessions {
      id
      task
      date
      start
      duration
    }
  }
`

export const GET_UPDATED_TIMER_SESSIONS = gql`
  query GetTimerSessions($since: Time!) {
    updatedTimerSessions(since: $since) {
      id
      task
      date
      start
      duration

      deletedAt
    }
  }
`
