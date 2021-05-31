import React from "react"
import { observer } from "mobx-react"
import { DragDropContext, Draggable, Droppable, DropResult } from "react-beautiful-dnd"
import styles from "../../styles.styl"
import Subtask from "../Subtask"
import { IRootStore, useMst } from "../../../../models/RootStore"
import PlusIcon from "../../../../assets/customIcons/plusCircle.svg"
import { TaskContext } from "../../index"

const Content = observer(({ provided, list, onAddClick }) => (
  <div className={styles.subtasks} ref={provided.innerRef}>
    {list.map((subtask, i) => (
      <Draggable draggableId={subtask.id} index={i} key={subtask.id}>
        {provided => (
          <Subtask subtask={subtask} provided={provided} />
        )}
      </Draggable>
    ))}
    {provided.placeholder}
    <div className={styles.addNew} onClick={onAddClick}>+ Добавить подзадачу</div>
  </div>
))

const SubtasksList = observer(({task}) => {
  const {moveSubtask,addSubtask}: IRootStore = useMst()
  const onDragEnd = ({ destination, draggableId }: DropResult) => {
    if (!destination) return
    moveSubtask(draggableId, destination.index)
  }
  const subtasks = [...task.subtasks]
  subtasks.sort((a,b) => a.index - b.index)
  const emitter = React.useContext(TaskContext)
  return <div>
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={"subtasks_"+task.id} type={"SUBTASKS"}>
        {provided => (
          <Content
            provided={provided}
            list={subtasks}
            onAddClick={() => {
              const id = addSubtask({task})
              setTimeout(() => emitter.emit("focus_subtask", id), 200)
            }}
          />
        )}
      </Droppable>
    </DragDropContext>
  </div>
})

export default SubtasksList