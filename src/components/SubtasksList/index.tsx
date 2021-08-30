import React, { CSSProperties } from "react"
import { observer } from "mobx-react"
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd"
import styles from "../Task/styles.styl"
import Subtask from "../Subtask"
import { TaskContext } from "../Task"

const Content = observer(
  ({
    provided,
    list,
    onAddClick,
    addNewShown,
    deleteSubtask,
    listStyle = {},
    subtaskStyle = {},
  }) => (
    <div
      className={styles.subtasks}
      ref={provided.innerRef}
      style={listStyle as CSSProperties}
    >
      {list.map((subtask, i) => (
        <Draggable draggableId={subtask.id} index={i} key={subtask.id}>
          {provided => (
            <Subtask
              subtask={subtask}
              provided={provided}
              subtaskStyle={subtaskStyle}
              deleteSubtask={deleteSubtask}
            />
          )}
        </Draggable>
      ))}
      {provided.placeholder}
      {addNewShown && (
        <div className={styles.addNew} onClick={onAddClick}>
          + Добавить подзадачу
        </div>
      )}
    </div>
  ),
)

const SubtasksList = observer(
  ({
    target,
    moveSubtask,
    deleteSubtask,
    addNewShown,
    subtaskStyle = {},
    listStyle = {},
  }) => {
    const onDragEnd = ({ destination, draggableId }: DropResult) => {
      if (!destination) return
      moveSubtask(draggableId, destination.index)
    }
    const subtasks = [...target.subtasks]
    subtasks.sort((a, b) => a.index - b.index)
    const emitter = React.useContext(TaskContext)
    return (
      <div>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId={"subtasks_" + target.id} type={"SUBTASKS"}>
            {provided => (
              <Content
                provided={provided}
                list={subtasks}
                addNewShown={addNewShown}
                subtaskStyle={subtaskStyle}
                listStyle={listStyle}
                deleteSubtask={deleteSubtask}
                onAddClick={() => {
                  emitter.emit("add_subtask")
                }}
              />
            )}
          </Droppable>
        </DragDropContext>
      </div>
    )
  },
)

export default SubtasksList
