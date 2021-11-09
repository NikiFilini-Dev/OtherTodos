import React from "react"
import { observer } from "mobx-react"
import styles from "./styles.styl"
import Avatar from "../Avatar"
import SignOutAltIcon from "assets/line_awesome/sign-out-alt-solid.svg"
import { useMst } from "../../models/RootStore"

const UserPanel = observer(() => {
  const { user, setUser, clear, backup } = useMst()

  const onSignOutClick = async () => {
    setUser(null)
    location.reload()
    // await backup()
    clear()
  }

  return (
    <div className={styles.userInfo}>
      <Avatar user={user} size={"24px"} />
      <div className={styles.info}>
        <span className={styles.username}>{user.firstName}</span>
        <span className={styles.email}>{user.email}</span>
      </div>
      <div className={styles.signOut} onClick={() => onSignOutClick()}>
        <SignOutAltIcon />
      </div>
    </div>
  )
})

export default UserPanel
