import { observer } from "mobx-react"
import { ISubtask } from "../../models/Subtask"
import React from "react"
import styles from "../Task/styles.styl"
import Checkbox from "../Checkbox"
import TextareaAutosize from "react-textarea-autosize"
import { TaskContext } from "../Task"
import TrashIcon from "../../assets/customIcons/times.svg"
import GridIcon from "../../assets/customIcons/grid.svg"
import classNames from "classnames"
import { ICollectionSubtask } from "../../models/collections/CollectionSubtask"

type Props = { subtask: ISubtask | ICollectionSubtask, provided: any, deleteSubtask: (id: string) => any, subtaskStyle?: any }

const Subtask = observer(({ subtask, provided, deleteSubtask, subtaskStyle={} }: Props) => {
  const [lastText, setLastText] = React.useState("")
  const inputRef = React.useRef<HTMLTextAreaElement | null>(null)
  const emitter = React.useContext(TaskContext)
  const [isDead, setIsDead] = React.useState(false)

  React.useEffect(() => {
    emitter.on("focus_subtask", (subtaskId: string) => {
      if (subtaskId !== subtask.id || !inputRef.current) return
      inputRef.current.focus()
    })
  }, [emitter])

  const onKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Backspace" && lastText.length === 0) {
      e.preventDefault()
      let prev
      if ("task" in subtask) {
        prev = subtask.task.subtasks.find(
          st => st.index === subtask.index - 1,
        )
      } else if ("card" in subtask) {
        prev = subtask.card.subtasks.find(
          st => st.index === subtask.index - 1,
        )
      }
      if (prev) emitter.emit("focus_subtask", prev.id)
      deleteSubtask(subtask.id)
    }
    setLastText((e.target as HTMLTextAreaElement).value)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter") return
    e.preventDefault()
    emitter.emit("add_subtask", subtask.index + 1)
  }

  return (
    <div className={classNames({[styles.subtask]: true, [styles.dead]: isDead})} ref={provided.innerRef}
         id={subtask.id}
         {...provided.draggableProps}
         {...provided.dragHandleProps}
         style={{...subtaskStyle, ...provided.draggableProps.style}}
    >
      <Checkbox
        checked={subtask.status === "DONE"}
        circle
        onChange={val => subtask.setStatus(val ? "DONE" : "ACTIVE")}
      />
      <TextareaAutosize
        placeholder={"Новая подзадача"}
        value={subtask.text}
        onChange={e => {
          subtask.setText(e.target.value)
        }}
        onKeyUp={onKeyUp}
        onKeyDown={onKeyDown}
        ref={inputRef}
      />
      <div className={styles.moveHandle}>
        <GridIcon />
      </div>
      <div className={styles.trash} onClick={(e) => {
        e.preventDefault()
        setIsDead(true)
        setTimeout(() => deleteSubtask(subtask.id), 400)
      }}>
        <TrashIcon />
      </div>
    </div>
  )

})

export default Subtask