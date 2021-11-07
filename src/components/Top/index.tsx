import React from "react"
import { observer } from "mobx-react"
import styles from "./styles.styl"
import { useMst } from "../../models/RootStore"
import ChecklistIcon from "assets/customIcons/check_list.svg"
import GridIcon from "assets/customIcons/grid.svg"
import classNames from "classnames"
import { action } from "mobx"

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
    screen,
    setScreen,
    collectionsStore: { collections, selectedCollection, selectCollection },
  } = useMst()

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
  )
})

export default Top
