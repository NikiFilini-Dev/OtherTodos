import React from "react"
import { observer } from "mobx-react"
import { useMst } from "models/RootStore"
import styles from "./styles.styl"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"

const Project = observer(({ project, index }) => {
  return (
    <Draggable
      draggableId={`project_${project.id}`}
      type={"PROJECT"}
      index={index}
    >
      {provided => (
        <div>
          <div
            id={`project_${project.id}`}
            style={provided.draggableStyle}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            className={styles.project}
          >
            {project.name}
          </div>
          {provided.placeholder}
        </div>
      )}
    </Draggable>
  )
})

const Projects = observer(() => {
  const { projects } = useMst()

  let onDragEnd = ({ destination, source, draggableId }) => {
    if (!destination) return
    console.log(destination, source, draggableId)

    const id = parseInt(draggableId.match(/.+?_(\d+)/)[1])

    const arr = [...projects]

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

  console.log("PROJECTS:", projects)
  const Content = observer(({ provided }) => {
    let sortedProjects = [...projects]
    sortedProjects.sort((a, b) => a.index - b.index)
    console.log(sortedProjects.map(i => i.index))
    return (
      <div ref={provided.innerRef}>
        {sortedProjects.map((project, ind) => (
          <Project
            project={project}
            index={ind}
            key={`project_${project.id}`}
          />
        ))}
        {provided.placeholder}
      </div>
    )
  })

  return (
    <div className={styles.screen}>
      <div className={styles.info}>
        <span className={styles.title}>Проекты:</span>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className={styles.list}>
          <Droppable droppableId={"projectsList"} type={"PROJECT"}>
            {(provided, snapshot) => (
              <Content provided={provided} snapshot={snapshot} />
            )}
          </Droppable>
        </div>
      </DragDropContext>
    </div>
  )
})

export default Projects
