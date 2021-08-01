import React from "react"
import { observer } from "mobx-react"
import styles from "./styles.styl"
import { ICardComment } from "../../../../models/collections/CardComment"
import UserIcon from "../../../../assets/line_awesome/user-circle.svg"
import { DateTime, DateTimeFormatOptions, LocaleOptions } from "luxon"
import TrashIcon from "assets/customIcons/trash.svg"
import EditIcon from "assets/line_awesome/edit.svg"
import CheckIcon from "assets/line_awesome/check-solid.svg"
import BakaEditor from "../../../../editor"
import { ICollectionCard } from "../../../../models/collections/CollectionCard"
import Avatar from "../../../Avatar"
import classNames from "classnames"

type Props = {
  comment: ICardComment
  card: ICollectionCard
}

const Comment = observer(({ comment, card }: Props) => {
  const format: LocaleOptions & DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }

  const [editing, setEditing] = React.useState(false)
  const [mentioning, setMentioning] = React.useState(false)

  const [commentText, setCommentText] = React.useState(comment.text)
  const [commentOriginal, setCommentOriginal] = React.useState(comment.original)
  if (commentOriginal === "" && comment.original !== "") {
    setCommentOriginal(comment.original)
  }
  React.useEffect(() => {
    setCommentText(comment.text)
  }, [comment.text])

  const commentRef = React.useRef<HTMLDivElement | null>(null)

  const startEditing = () => {
    if (!commentRef.current) return
    setEditing(true)
    setTimeout(() => {
      const editor = commentRef.current?.querySelector<BakaEditor>(
        "baka-editor",
      )
      if (!editor) return
      editor.setText(commentOriginal)
      editor.addEventListener(
        "change",
        // @ts-ignore
        (e: Event & { detail: { original: string; html: string } }) => {
          setCommentText(e.detail.html)
          setCommentOriginal(e.detail.original)
        },
      )
    }, 100)
  }

  const stopEditing = () => {
    const editor = commentRef.current?.querySelector<BakaEditor>("baka-editor")
    if (!editor) return
    setEditing(false)
    comment.setText(commentText)
    comment.setOriginal(commentOriginal)
  }

  const mention = user => {
    const editor = commentRef.current?.querySelector<BakaEditor>("baka-editor")
    if (!editor) return

    editor.addText(`@(${user.firstName})[${user.email}], `)
    setMentioning(false)
    editor.focus()
  }

  return (
    <div key={comment.id} className={styles.comment} ref={commentRef}>
      <div className={styles.top}>
        <Avatar user={comment.user} size={"32px"} />
        <div className={styles.info}>
          <span className={styles.name}>
            {comment.user.firstName} {comment.user.lastName}
          </span>
          <span className={styles.date}>
            {DateTime.fromISO(comment.createdAt).toLocaleString(format)}
          </span>
        </div>
        <div className={styles.actions}>
          <div
            className={styles.action}
            onClick={() => card.deleteComment(comment.id)}
          >
            <TrashIcon />
          </div>
          {!editing && (
            <div className={styles.action} onClick={startEditing}>
              <EditIcon className={styles.awesome} />
            </div>
          )}
          {editing && (
            <div className={styles.action} onClick={stopEditing}>
              <CheckIcon className={styles.awesome} />
            </div>
          )}
          {editing && (
            <div
              className={classNames({
                [styles.action]: true,
                [styles.active]: mentioning,
              })}
              onClick={() => setMentioning(!mentioning)}
            >
              @
            </div>
          )}
        </div>
      </div>
      {!editing && (
        <div
          className={styles.text}
          dangerouslySetInnerHTML={{ __html: comment.text }}
        />
      )}
      {mentioning && (
        <div className={styles.mentions}>
          <div className={styles.title}>Упомянуть:</div>
          {[card.collection.userId, ...card.collection.users].map(u => (
            <div key={u.id} onClick={() => mention(u)} className={styles.user}>
              <Avatar user={u} size={"24px"} />
              <span>
                {u.firstName} {u.lastName}
              </span>
            </div>
          ))}
        </div>
      )}
      {/*@ts-ignore*/}
      {editing && <baka-editor class={styles.editor} />}
    </div>
  )
})

export default Comment
