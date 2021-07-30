import React from "react"
import { observer } from "mobx-react"
import styles from "./styles.styl"
import Avatar from "../Avatar"
import SignOutAltIcon from "assets/line_awesome/sign-out-alt-solid.svg"
import { useMst } from "../../models/RootStore"
import Icon from "../Icon"
import ChecklistIcon from "assets/customIcons/check_list.svg"
import GridIcon from "assets/customIcons/grid.svg"
import classNames from "classnames"
import { action } from "mobx"
import BellIcon from "assets/customIcons/bell.svg"
import Notifications from "../Notifications"

const Element = observer(({ icon, active, name, trigger }) => {
  const Icon = icon
  return (
    <div
      onClick={trigger}
      className={classNames({
        [styles.item]: true,
        [styles.active]: active,
      })}
    >
      <Icon />
      {!!active && <span className={styles.name}>{name}</span>}
    </div>
  )
})

const Top = observer(() => {
  const {
    user,
    setUser,
    clear,
    backup,
    screen,
    setScreen,
    collectionsStore: { collections, selectedCollection, selectCollection },
  } = useMst()

  const [notificationsShown, setNotificationsShown] = React.useState(false)

  const onSignOutClick = async () => {
    setUser(null)
    location.reload()
    await backup()
    clear()
  }

  const TasksMode = ["INBOX", "TODAY", "PROJECT", "LOG", "TAGS"].includes(
    screen,
  )
  const CollectionsMode = ["COLLECTION", "COLLECTION_PERSONAL"].includes(screen)
  const triggerTasks = () => {
    if (TasksMode) return
    setScreen("TODAY")
  }

  const triggerCollections = action(() => {
    if (CollectionsMode) return
    if (!selectedCollection && collections.length) {
      const c = [...collections]
      c.sort((a, b) => a.index - b.index)
      selectCollection(c[0].id)
    }
    setScreen("COLLECTION_PERSONAL")
  })

  return (
    <React.Fragment>
      {!!user && (
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
      )}
      <div className={styles.menu}>
        <Element
          icon={ChecklistIcon}
          active={TasksMode}
          name={"Задачи"}
          trigger={triggerTasks}
        />
        <Element
          icon={GridIcon}
          active={CollectionsMode}
          name={"Коллекции"}
          trigger={triggerCollections}
        />
      </div>
      <div className={styles.rightPart}>
        <div
          className={styles.block}
          onClick={() => setNotificationsShown(!notificationsShown)}
        >
          <BellIcon />
          {!!user?.notifications.new.length && (
            <div className={styles.hasNew}>
              {user.notifications.new.length > 9
                ? 9
                : user.notifications.new.length}
            </div>
          )}
        </div>
        {notificationsShown && <Notifications />}
      </div>
    </React.Fragment>
  )
})

export default Top
