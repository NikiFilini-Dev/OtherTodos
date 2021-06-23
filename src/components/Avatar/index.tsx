import React, { CSSProperties } from "react"
import { observer } from "mobx-react"
import { IUser } from "../../models/collections/OtherUser"
import styles from "./styles.styl"
import UserIcon from "../../assets/line_awesome/user-circle.svg"

const Avatar = observer(({user, size}: {user: IUser | null, size: string}) => {
  return <div className={styles.avatar} style={{"--size": size} as CSSProperties}>
    {!user && <UserIcon />}
    {user && <span className={styles.ini}>{user.firstName[0].toUpperCase()}</span>}
  </div>
})

export default Avatar