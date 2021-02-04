import React from "react"
import { observer } from "mobx-react"
import { useMst } from "models/RootStore"
import styles from "./styles.styl"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"

const Tag = observer(({ tag, index }) => {
  return (
    <Draggable draggableId={`tag_${tag.id}`} type={"TAG"} index={index}>
      {provided => (
        <div>
          <div
            id={`tag_${tag.id}`}
            style={provided.draggableStyle}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            className={styles.tag}
          >
            {tag.name}
          </div>
          {provided.placeholder}
        </div>
      )}
    </Draggable>
  )
})

const Tags = observer(() => {
  const { tags } = useMst()

  let onDragEnd = ({ destination, source, draggableId }) => {
    if (!destination) return
    console.log(destination, source, draggableId)

    const id = parseInt(draggableId.match(/.+?_(\d+)/)[1])

    const arr = [...tags]

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

  console.log("TAGS:", tags)
  const Content = observer(({ provided }) => {
    let sortedTags = [...tags]
    sortedTags.sort((a, b) => a.index - b.index)
    console.log(sortedTags.map(i => i.index))
    return (
      <div ref={provided.innerRef}>
        {sortedTags.map((tag, ind) => (
          <Tag tag={tag} index={ind} key={`tag_${tag.id}`} />
        ))}
        {provided.placeholder}
      </div>
    )
  })

  return (
    <div className={styles.screen}>
      <div className={styles.info}>
        <span className={styles.title}>Тэги:</span>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className={styles.list}>
          <Droppable droppableId={"tagsList"} type={"TAG"}>
            {(provided, snapshot) => (
              <Content provided={provided} snapshot={snapshot} />
            )}
          </Droppable>
        </div>
      </DragDropContext>
    </div>
  )
})

export default Tags
