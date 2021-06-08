import React from "react"
import { observer } from "mobx-react"
import { useMst } from "models/RootStore"
import styles from "./styles.styl"
import PlusIcon from "assets/line_awesome/plus-solid.svg"
import TagIcon from "assets/line_awesome/tag-solid.svg"
import TrashIcon from "assets/line_awesome/trash-alt.svg"
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd"
import Button from "../../Button"

const { dialog } = require("electron").remote

const Tag = observer(({ tag, provided, onTagDelete }) => {
  return (
    <div
      className={styles.tag}
      key={tag.id}
      ref={provided.innerRef}
      id={tag.id}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
    >
      <TagIcon
        className={styles.colorIndicator}
        style={{ "--tag-color": tag.color }}
      />
      <input
        value={tag.name}
        onChange={e => tag.setName(e.target.value)}
        className={styles.tagName}
      />
      <div className={styles.delete} onClick={() => onTagDelete(tag)}>
        <TrashIcon />
      </div>
      <input
        type={"color"}
        className={styles.colorInput}
        onChange={e => tag.setColor(e.target.value)}
        defaultValue={tag.color}
      />
    </div>
  )
})

const Content = observer(({ provided, onTagDelete, list }) => (
  <div className={styles.list} ref={provided.innerRef}>
    {list.map((tag, i) => (
      <Draggable draggableId={tag.id} type={"TAG"} index={i} key={tag.id}>
        {provided => (
          <Tag tag={tag} provided={provided} onTagDelete={onTagDelete} />
        )}
      </Draggable>
    ))}
    {provided.placeholder}
  </div>
))

const TaskTags = observer(() => {
  const { tags, createTag, selectedTagType, deleteTag } = useMst()

  const type = selectedTagType

  let list = [...tags.filter(t => t.type === type)]
  list.sort((a, b) => a.index - b.index)

  let onDragEnd = ({ destination, source, draggableId }) => {
    if (!destination) return
    console.log(destination, source, draggableId)

    const id = draggableId

    const arr = [...list]

    arr.forEach(tag => {
      if (tag.id === id) return tag.setIndex(destination.index)

      if (
        source.index < destination.index &&
        tag.index > source.index &&
        tag.index <= destination.index
      ) {
        tag.setIndex(tag.index - 1)
      }

      if (
        source.index > destination.index &&
        tag.index >= destination.index &&
        tag.index < source.index
      ) {
        tag.setIndex(tag.index + 1)
      }
    })
  }

  const onTagDelete = tag => {
    const dialogOpts = {
      type: "info",
      buttons: ["Удалить", "отмена"],
      title: "Удаление тэга",
      detail: 'Удалить тэг "' + tag.name + '"?',
    }

    if (!IS_WEB) {
      dialog.showMessageBox(dialogOpts).then(returnValue => {
        if (returnValue.response === 0) {
          deleteTag(tag)
        }
      })
    } else {
      const result = confirm("Удалить тэг?")
      if (result) {
        deleteTag(tag)
      }
    }
  }

  return (
    <div className={styles.screen}>
      <div className={styles.head}>
        <div className={styles.info}>
          <span className={styles.title}>
            {type === "TASK" ? "Метки задач" : "Метки событий"}
          </span>
          <div className={styles.actions}>
            <Button
              square
              icon={PlusIcon}
              onClick={() => createTag("Новый тэг", type)}
            />
          </div>
        </div>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={"tagsList"} type={"TAG"}>
          {provided => (
            <Content
              provided={provided}
              list={list}
              onTagDelete={onTagDelete}
            />
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
})

export default TaskTags
