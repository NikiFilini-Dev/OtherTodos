import React, { CSSProperties } from "react"
import { observer } from "mobx-react"
import { IRootStore, useMst } from "models/RootStore"
import styles from "./styles.styl"
import Column from "./components/Column"
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd"
import Select from "../../Select"
import Button from "../../Button"
import PlusIcon from "../../../assets/line_awesome/plus-solid.svg"
import CollectionForm from "../../CollectionForm"
import Icon from "../../Icon"
import gqlClient from "graphql/client"
import ResizeIcon from "assets/customIcons/resize.svg"
import FloatMenu from "../../FloatMenu"
import CheckIcon from "assets/line_awesome/check-solid.svg"
import classNames from "classnames"
import { useClickOutsideRefs } from "../../../tools/hooks"
import UsersModal from "./components/UsersModal"
import Avatar from "../../Avatar"
import DoorOpenIcon from "assets/line_awesome/door-open-solid.svg"
import {
  GET_COLLECTION,
  REMOVE_USER_FROM_COLLECTION,
} from "../../../graphql/collection"
import { ICollectionLog } from "../../../models/collections/CollectionLog"
import { GET_COLLECTION_CARD } from "../../../graphql/collection_cards"
import { GET_COLLECTION_COLUMN } from "../../../graphql/collection_columns"
import CollectionColumn from "../../../syncMachine/types/collection_column"
import { SnapshotOut } from "mobx-state-tree"
import CollectionCard from "../../../models/collections/CollectionCard"
import { LogAction } from "./actions"
import {
  CardChanged,
  CardComplete,
  CardCreated,
  CardDeleted,
  CardMoved,
} from "./cardLogs"
import { ColumnChanged, ColumnCreated, ColumnDeleted } from "./columnLogs"
import {
  CommentChanged,
  CommentCreated,
  CommentDeleted,
  CommentMentioned,
} from "./commentLogs"
import LeftIcon from "assets/customIcons/left.svg"
import { CollectionChanged, CollectionCreated } from "./collectiontLogs"
import { DateTime, DateTimeFormatOptions, LocaleOptions } from "luxon"
import SizeMenu from "./components/SizeMenu"
import { noop } from "lodash-es"
import { ColorsMap } from "../../../palette/colors"
import DateSelector from "../../DateSelector"

type Size = "small" | "medium" | "big"

export type Card = SnapshotOut<typeof CollectionCard>
export const getCard = id => {
  return gqlClient.query(GET_COLLECTION_CARD, { id }).toPromise()
}

export type Column = SnapshotOut<typeof CollectionColumn>
export const getColumn = id => {
  return gqlClient.query(GET_COLLECTION_COLUMN, { id }).toPromise()
}

export type Collection = SnapshotOut<typeof Collection>
export const getCollection = id => {
  return gqlClient.query(GET_COLLECTION, { id }).toPromise()
}

export const LogEntry = observer(({ log }: { log: ICollectionLog }) => {
  const { user } = useMst()

  if (log.action === "MOVE" && log.targetType === "CARD") {
    return <CardMoved log={log} />
  }
  if (log.action === "CREATE" && log.targetType === "CARD") {
    return <CardCreated log={log} />
  }
  if (log.action === "EDIT" && log.targetType === "CARD") {
    return <CardChanged log={log} />
  }
  if (log.action === "DELETE" && log.targetType === "CARD") {
    return <CardDeleted log={log} />
  }
  if (log.action === "COMPLETE" && log.targetType === "CARD") {
    return <CardComplete log={log} />
  }

  if (log.action === "CREATE" && log.targetType === "COLUMN") {
    return <ColumnCreated log={log} />
  }
  if (log.action === "EDIT" && log.targetType === "COLUMN") {
    return <ColumnChanged log={log} />
  }
  if (log.action === "DELETE" && log.targetType === "COLUMN") {
    return <ColumnDeleted log={log} />
  }

  if (
    log.action === "CREATE" &&
    log.targetType === "COMMENT" &&
    log.mentionsUser(user.id)
  ) {
    return <CommentMentioned log={log} />
  }
  if (
    log.action === "CREATE" &&
    log.targetType === "COMMENT" &&
    !log.mentionsUser(user.id)
  ) {
    return <CommentCreated log={log} />
  }
  if (log.action === "EDIT" && log.targetType === "COMMENT") {
    return <CommentChanged log={log} />
  }
  if (log.action === "DELETE" && log.targetType === "COMMENT") {
    return <CommentDeleted log={log} />
  }

  if (log.action === "CREATE" && log.targetType === "COLLECTION") {
    return <CollectionCreated log={log} />
  }
  if (log.action === "EDIT" && log.targetType === "COLLECTION") {
    return <CollectionChanged log={log} />
  }
  return <div>{log.action}</div>
})

const Collection = observer(() => {
  const {
    setScreen,
    user: currentUser,
    collectionsStore: {
      removeCollection,
      collections,
      selectCollection,
      selectedCollection,
      moveColumn,
      moveCard,
      createColumn,
      selectEditingCollection,
      editingCollection,
      userFilter,
      userFilterEnabled,
      setUserFilter,
      enableUserFilter,
      filter,
    },
  }: IRootStore = useMst()

  const [logsShown, setLogsShown] = React.useState(false)

  const sizeKey = "collectionCardSize#" + selectedCollection?.id
  const getSize = (): Size => {
    let size: Size = "medium"
    const saved = localStorage.getItem(sizeKey)
    if (saved && ["small", "medium", "big"].includes(saved))
      size = saved as Size
    return size
  }
  const [size, _setSize] = React.useState<Size>(getSize())
  const setSize = s => {
    _setSize(s)
    localStorage.setItem(sizeKey, s)
  }

  const sizeTriggerRef = React.useRef(null)
  const sizeMenuRef = React.useRef(null)
  const [sizeMenuOpen, setSizeMenuOpen] = React.useState(false)
  useClickOutsideRefs([sizeMenuRef, sizeTriggerRef], () => {
    if (sizeMenuOpen) setSizeMenuOpen(false)
  })

  const [inviteModalOpen, setInviteModalOpen] = React.useState(false)

  if (!selectedCollection) {
    if (collections.lengtht) selectCollection([...collections][0].id)
    return <div />
  }

  const columns = [...selectedCollection.columns]
  columns.sort((a, b) => a.index - b.index)

  const onPlusClick = () => {
    createColumn({ name: "Новая колонка", collection: selectedCollection.id })
  }

  const onAddUserClick = () => {
    setInviteModalOpen(true)
  }

  const variants = collections.map(c => ({
    code: c.id,
    name: c.name,
    icon: c.icon,
  }))
  variants.sort((a, b) => {
    const collA = collections.find(c => c.id === a.code)
    const collB = collections.find(c => c.id === b.code)
    return collA.index - collB.index
  })

  const onUserClick = user => {
    if (userFilterEnabled && userFilter === user) {
      setUserFilter(null)
      enableUserFilter(false)
      return
    }
    enableUserFilter(true)
    setUserFilter(user)
  }

  const User = observer(({ user }) => {
    return (
      <div className={styles.user} onClick={() => onUserClick(user)}>
        {userFilterEnabled && userFilter === user && (
          <div className={styles.filterActiveMark} />
        )}
        <Avatar user={user} size={"32px"} />
        <span className={styles.name}>
          {user ? user.firstName : "Неназначено"}
        </span>
        <span className={styles.count}>
          {selectedCollection.cards.filter(c => c.assigned === user).length}
        </span>
      </div>
    )
  })

  const onExitClick = () => {
    const id = selectedCollection.id
    gqlClient
      .mutation(REMOVE_USER_FROM_COLLECTION, {
        collectionId: id,
        userId: currentUser.id,
      })
      .toPromise()
      .then(() => {
        window.syncMachine.loadAll()
        setScreen("TODAY")
        removeCollection(id)
      })
  }

  const format: LocaleOptions & DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }

  const [logsByDates, setLogsByDates] = React.useState<Record<string, any[]>>(
    {},
  )
  React.useEffect(() => {
    const tmp = {}
    selectedCollection.logs.forEach(log => {
      const key = DateTime.fromISO(log.datetime).toFormat("M/d/yyyy")
      if (key in tmp) tmp[key].push(log)
      else tmp[key] = [log]
    })
    setLogsByDates(tmp)
  }, [selectedCollection.logs.length])

  const onTagClick = tag => {
    if (filter.onlyWithTags.includes(tag)) {
      filter.removeTag(tag.id)
    } else {
      filter.addTag(tag.id)
    }
  }

  const dateFilterRef = React.useRef(null)
  const [dateFilterShown, setDateFilterShown] = React.useState(false)

  const [shownTab, setShownTab] = React.useState<"LOG" | "FILTER">("LOG")

  return (
    <div className={styles.screenWrapper}>
      <div className={styles.screen}>
        <div className={styles.head}>
          <div className={styles.info}>
            <Select
              variants={variants}
              selected={selectedCollection.id}
              select={id => selectCollection(id)}
            />
            <div className={styles.puller} />
            {currentUser.id !== selectedCollection.userId.id && (
              <div className={styles.actionTriggerLong} onClick={onExitClick}>
                Покинуть <DoorOpenIcon />
              </div>
            )}
            <div
              className={styles.actionTrigger}
              onClick={() => selectEditingCollection(selectedCollection)}
            >
              <Icon name={"settings"} />
            </div>
            <div
              className={styles.actionTrigger}
              onClick={() => setSizeMenuOpen(true)}
              ref={sizeTriggerRef}
            >
              <ResizeIcon />
            </div>
            <Button
              icon={PlusIcon}
              square
              onClick={onPlusClick}
              size={"44px"}
            />
          </div>
        </div>
        {sizeMenuOpen && (
          <SizeMenu
            triggerRef={sizeTriggerRef}
            menuRef={sizeMenuRef}
            currentSize={size}
            setSize={setSize}
          />
        )}

        {editingCollection !== null && <CollectionForm />}
        <DragDropContext
          onDragEnd={({ draggableId, destination, type }) => {
            if (!destination) return
            if (type === "COLUMN") {
              moveColumn(draggableId, destination.index)
            } else {
              moveCard(draggableId, destination.droppableId, destination.index)
            }
          }}
        >
          <Droppable
            droppableId={selectedCollection.id}
            direction={"horizontal"}
            type={"COLUMN"}
          >
            {provided => (
              <div
                className={styles.columns}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {columns.map(col => (
                  <Draggable
                    draggableId={col.id}
                    index={col.index}
                    key={col.id}
                  >
                    {provided => (
                      <div ref={provided.innerRef} {...provided.draggableProps}>
                        <Column
                          column={col}
                          handleProps={provided.dragHandleProps}
                          size={size}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                <div className={styles.addColumn} onClick={onPlusClick}>
                  +
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {inviteModalOpen && (
          <UsersModal
            collection={selectedCollection}
            onClose={() => setInviteModalOpen(false)}
          />
        )}
      </div>
      <div
        className={classNames({
          [styles.logs]: true,
          [styles.hidden]: !logsShown,
          [styles.filter]: shownTab === "FILTER",
        })}
      >
        <div className={styles.tabs}>
          <div
            className={classNames({
              [styles.tab]: true,
              [styles.active]: shownTab === "LOG",
            })}
            onClick={() => setShownTab("LOG")}
          >
            Активность
          </div>
          <div
            className={classNames({
              [styles.tab]: true,
              [styles.active]: shownTab === "FILTER",
            })}
            onClick={() => setShownTab("FILTER")}
          >
            Фильтры
          </div>
        </div>
        {shownTab === "FILTER" && (
          <React.Fragment>
            <div className={styles.group}>
              <div className={styles.groupName}>Тэги:</div>
              <div className={styles.filterTags}>
                {selectedCollection.tags.map(tag => (
                  <div
                    key={tag.id}
                    onClick={() => onTagClick(tag)}
                    className={classNames({
                      [styles.tag]: true,
                      [styles.selected]: filter.onlyWithTags.includes(tag),
                    })}
                    style={
                      { "--tagColor": ColorsMap[tag.color] } as CSSProperties
                    }
                  >
                    {tag.name}
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.group}>
              <div className={styles.groupName}>Наблюдатели</div>
              <Select
                variants={[
                  selectedCollection.userId,
                  ...selectedCollection.users,
                ].map(u => ({
                  code: u.id,
                  name: u.firstName,
                }))}
                select={variant => {
                  if (filter.onlyWithWatcher?.id === variant) {
                    filter.setOnlyWithWatcher(null)
                  } else {
                    filter.setOnlyWithWatcher(variant)
                  }
                }}
                selected={
                  filter.onlyWithWatcher
                    ? {
                        code: filter.onlyWithWatcher.id,
                        name: filter.onlyWithWatcher.firstName,
                      }
                    : undefined
                }
              />
            </div>
            <div className={styles.group}>
              <div className={styles.groupName}>Статус</div>
              <Select
                variants={[
                  { code: "DONE", name: "Выполнено" },
                  { code: "NOT_DONE", name: "Не выполнено" },
                  { code: "ANY", name: "Любой" },
                ]}
                select={filter.setOnlyInStatus}
                selected={filter.onlyInStatus}
              />
            </div>
            <div className={styles.group}>
              <div className={styles.groupName}>Срок исполнения</div>
              <div
                ref={dateFilterRef}
                onClick={() => setDateFilterShown(!dateFilterShown)}
                className={styles.selectedDate}
              >
                {filter.onlyOnDate
                  ? DateTime.fromFormat(filter.onlyOnDate, "M/d/yyyy").toFormat(
                      "dd.MM.yyyy",
                    )
                  : "Срок исполнения"}
              </div>
              {dateFilterShown && (
                <DateSelector
                  value={filter.onlyOnDate}
                  onSelect={day => {
                    setDateFilterShown(false)
                    filter.setOnlyOnDate(
                      day.date
                        ? DateTime.fromJSDate(day.date).toFormat("M/d/yyyy")
                        : null,
                    )
                  }}
                  triggerRef={dateFilterRef}
                  right={false}
                />
              )}
            </div>
          </React.Fragment>
        )}
        {shownTab === "LOG" && (
          <React.Fragment>
            {Object.keys(logsByDates).map(date => {
              const logs = logsByDates[date]
              return (
                <React.Fragment key={date}>
                  <h1>
                    {DateTime.fromFormat(date, "M/d/yyyy").toLocaleString({
                      month: "short",
                      day: "numeric",
                    })}
                  </h1>
                  {logs.map(log => (
                    <div className={styles.logWrapper} key={log.id}>
                      <LogAction log={log} />
                      <div className={styles.log}>
                        <LogEntry log={log} />
                        <div className={styles.date}>
                          {DateTime.fromISO(log.datetime).toLocaleString(
                            format,
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </React.Fragment>
              )
            })}
          </React.Fragment>
        )}
      </div>
      <div
        className={classNames({
          [styles.usersList]: true,
          [styles.logsShown]: logsShown,
        })}
      >
        <div
          onClick={e => {
            e.preventDefault()
            setLogsShown(!logsShown)
          }}
          className={classNames({
            [styles.logsTrigger]: true,
            [styles.active]: logsShown,
          })}
        >
          {logsShown && <PlusIcon />}
          {!logsShown && <LeftIcon />}
        </div>
        <User user={null} />
        <User user={selectedCollection.userId} />
        {selectedCollection.users.map(u => (
          <User key={u.id} user={u} />
        ))}

        {selectedCollection.userId.id === currentUser.id && (
          <div className={styles.add} onClick={onAddUserClick}>
            <PlusIcon />
          </div>
        )}
      </div>
    </div>
  )
})

export default Collection
