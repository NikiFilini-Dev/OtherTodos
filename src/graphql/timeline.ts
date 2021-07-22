import { gql } from "@urql/core"

export const UPDATE_TIMELINE_EVENT = gql`
  mutation GenerateToken(
    $changes: TimelineEventUpdate!
    $dates: TimelineEventChangesDate!
    $id: String!
  ) {
    updateTimelineEvent(changedAt: $dates, data: $changes, id: $id) {
      id
    }
  }
`

export const DELETE_TIMELINE_EVENT = gql`
  mutation DeleteTimelineEvent($id: String!) {
    deleteTimelineEvent(id: $id)
  }
`

export const GET_TIMELINE_EVENTS = gql`
  query GetTimelineEvents {
    timelineEvents {
      id
      name
      start
      duration
      allDay
      date
      color
      task
      tag
    }
  }
`

export const GET_UPDATED_TIMELINE_EVENTS = gql`
  query GetTimelineEvents($since: Time!) {
    updatedTimelineEvents(since: $since) {
      id
      name
      start
      duration
      allDay
      date
      color
      task
      tag

      deletedAt
    }
  }
`
