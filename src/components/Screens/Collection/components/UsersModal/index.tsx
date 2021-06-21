import React, { CSSProperties } from "react"
import styles from "./styles.styl"
import { observer } from "mobx-react"
import ReactDOM from "react-dom"
import TimesIcon from "assets/customIcons/times.svg"
import UserIcon from "assets/line_awesome/user-circle.svg"
import classNames from "classnames"
import { ICollection } from "../../../../../models/collections/Collection"
import TextareaAutosize from "react-autosize-textarea"
import gqlClient from "../../../../../graphql/client"
import { INVITE_USER, REMOVE_USER_FROM_COLLECTION } from "../../../../../graphql/collection"

const UsersModal = observer(
  ({ collection, onClose }: { collection: ICollection, onClose: () => void }) => {
    const wrapperRef = React.useRef<HTMLDivElement>(null)
    const [el] = React.useState(document.createElement("div"))
    React.useEffect(() => {
      document.querySelector("#modals")?.appendChild(el)
      return () => {
        document.querySelector("#modals")?.removeChild(el)
      }
    }, [])

    const onWrapperClick = e => {
      if (e.target !== wrapperRef.current) return
      onClose()
    }

    const [emails, setEmails] = React.useState("")

    const inviteUser = (email: string) => {
      return gqlClient.mutation(INVITE_USER, { collectionId: collection.id, email }).toPromise()
    }

    const onRemoveUserClick = (id: string) => {
      gqlClient.mutation(REMOVE_USER_FROM_COLLECTION, {
        collectionId: collection.id,
        userId: id,
      }).toPromise().then(() => {
        window.syncMachine.loadAll(null)
      })
    }

    const onInviteClick = async () => {
      const emailsArr = emails.split(" ")
      if (!emailsArr.length) return

      setEmails("")

      for (const email of emailsArr) {
        await inviteUser(email)
      }

      window.syncMachine.loadAll(null)
    }

    const onKeydown = e => {
      if (e.key !== "Enter") return
      e.preventDefault()
      onInviteClick()
    }

    return ReactDOM.createPortal(
      <div className={styles.wrapper} ref={wrapperRef} onClick={onWrapperClick}>
        <div className={styles.modal}>
          <div
            className={classNames({
              [styles.modalPart]: true,
              [styles.head]: true,
            })}
          >
            <span className={styles.title}>Пригласить пользователей</span>
            <div className={styles.actions}>
                <span className={classNames({
                  [styles.add]: true,
                  [styles.active]: emails.length > 0
                })} onClick={onInviteClick}>
                  Пригласить
                </span>
              <div className={styles.separator} />
              <span className={styles.reject} onClick={onClose}>
                  <TimesIcon />
                </span>
            </div>
          </div>
          <div className={classNames({
            [styles.modalPart]: true,
            [styles.mainPart]: true,
          })}>
            <div className={styles.main}>
              <div className={styles.group}>
                <TextareaAutosize className={styles.emailsInput} value={emails}
                                  placeholder={"Введите email пользователей через пробел"}
                                  onChange={(e) =>
                                    setEmails((e.target as HTMLInputElement).value)}
                                  onKeyDown={onKeydown}
                />
              </div>
              <div className={styles.group}>
                <span className={styles.name}>Участники проекта:</span>
                <div className={styles.users}>
                  <div key={collection.userId.id} className={styles.user}>
                    <div className={styles.avatar}><UserIcon /></div>
                    {collection.userId.firstName} {collection.userId.lastName}
                    <span className={styles.email}>({collection.userId.email})</span>
                  </div>

                  {collection.users.map(user => (
                    <div key={user.id} className={styles.user}>
                      <div className={styles.avatar}><UserIcon /></div>
                      {user.firstName} {user.lastName}
                      <span className={styles.email}>({user.email})</span>
                      <div className={styles.remove} onClick={() => onRemoveUserClick(user.id)}><TimesIcon /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      ,
      el,
    )
  },
)

export default UsersModal
