import { gql } from "@urql/core"

export const UPDATE_CARD_COMMENT = gql`
    mutation UpdateCardComment(
        $changes: CardCommentUpdate!
        $dates: CardCommentChangesDate!
        $id: String!
    ) {
        updateCardComment(changedAt: $dates, data: $changes, id: $id) {
            id
        }
    }
`

export const DELETE_CARD_COMMENT = gql`
    mutation DeleteCardComment($id: String!) {
        deleteCardComment(id: $id)
    }
`

export const GET_CARD_COMMENT = gql`
    query GetCardComment($id: String!) {
        cardComment(id: $id) {
            id
            text
            original
            collectionId
            card
            createdAt
            user
        }
    }
`
