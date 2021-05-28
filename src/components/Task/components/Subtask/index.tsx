import { observer } from "mobx-react"
import { ISubtask } from "../../../../models/Subtask"
import { IRootStore, useMst } from "../../../../models/RootStore"
import React from "react"
import styles from "../../styles.styl"
import Checkbox from "../../../Checkbox"
import TextareaAutosize from "react-textarea-autosize"
import { TaskContext } from "../../index"

const Subtask = observer(({ subtask }: { subtask: ISubtask }) => {
  const { deleteSubtask }: IRootStore = useMst()
  const [lastText, setLastText] = React.useState("")
  const inputRef = React.useRef<HTMLTextAreaElement | null>(null)
  const emitter = React.useContext(TaskContext)

  React.useEffect(() => {
    emitter.on("focus_subtask", (subtaskId: string) => {
      if (subtaskId !== subtask.id || !inputRef.current) return
      inputRef.current.focus()
    })
  }, [emitter])

  const onKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Backspace" && lastText.length === 0) {
      e.preventDefault()
      const prev = subtask.task.subtasks.find(
        st => st.index === subtask.index - 1,
      )
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
    <div key={subtask.id} className={styles.subtask}>
      <Checkbox
        checked={subtask.status === "DONE"}
        circle
        onChange={val => subtask.setStatus(val ? "DONE" : "ACTIVE")}
      />
      <TextareaAutosize
        placeholder={"Новая подзадача"}
        value={subtask.text}
        onChange={e => subtask.setText(e.target.value)}
        onKeyUp={onKeyUp}
        onKeyDown={onKeyDown}
        ref={inputRef}
      />
    </div>
  )
})

export default Subtask