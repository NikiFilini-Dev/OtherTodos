import React, { CSSProperties } from "react"
import styles from "./styles.styl"
import { observer } from "mobx-react"
import ReactDOM from "react-dom"
import CheckboxIcon from "../../assets/customIcons/checkmark.svg"
import TrashIcon from "../../assets/customIcons/trash.svg"
import TimesIcon from "../../assets/customIcons/times.svg"
import classNames from "classnames"
import { IRootStore, useMst } from "../../models/RootStore"
import Select from "../Select"
import { DateTime } from "luxon"
import DateSelector from "../DateSelector"
import { useClickOutsideRef } from "../../tools/hooks"
import Emitter from "eventemitter3"
import { TaskContext } from "../Task"
import SubtasksList from "../SubtasksList"
import BakaEditor from "../../editor"

const CardForm = observer(
  ({ cardId, onDone }: { cardId: string | null; onDone: () => void }) => {
    const {
      collectionsStore: { cards, collections, addSubtask, deleteSubtask, moveSubtask, selectCard, deleteCard },
    }: IRootStore = useMst()

    const [cardEmitter] = React.useState(new Emitter())

    const card = cards.find(c => c.id === cardId)

    React.useEffect(() => {
      cardEmitter.on("*", console.log)
      cardEmitter.on("add_subtask", (index = 0) => {
        const id = addSubtask({ card, index })
        setTimeout(() => cardEmitter.emit("focus_subtask", id), 200)
      })
    }, [cardEmitter])

    const wrapperRef = React.useRef<HTMLDivElement>(null)
    const [el] = React.useState(document.createElement("div"))
    React.useEffect(() => {
      document.querySelector("#modals")?.appendChild(el)
      return () => {
        document.querySelector("#modals")?.removeChild(el)
      }
    }, [])

    const onWrapperClick = e => {
      if (e.target !== wrapperRef.current) return
      selectCard(null)
    }

    const onSave = () => {
      card.setStatus("DONE")
      // onDone()
    }

    const onDeleteClick = () => {
      deleteCard(card.id)
    }

    const [isDateSelectorShown, setIsDateSelectorShown] = React.useState(false)
    const dateTriggerRef = React.useRef<HTMLDivElement | null>(null)

    useClickOutsideRef(dateTriggerRef, () => setIsDateSelectorShown(false))
    const editorRef = React.useRef<BakaEditor | null>(null)
    React.useEffect(() => {
      if (!editorRef.current || !editorRef.current.setText) return
      editorRef.current.setText(card.text || "")

      editorRef.current.addEventListener(
        "change",
        // @ts-ignore
        (e: Event & { detail: { original: string } }) => {
          console.log(e.detail.original)
          card.setText(e.detail.original)
        },
      )
    }, [editorRef.current])

    if (!card) return <React.Fragment />

    const subtasks = [...card.subtasks]
    subtasks.sort((a, b) => a.index - b.index)

    return ReactDOM.createPortal(
      <div className={styles.wrapper} ref={wrapperRef} onClick={onWrapperClick}>
        <div className={styles.modal}>
          <TaskContext.Provider value={cardEmitter}>
            <div
              className={classNames({
                [styles.modalPart]: true,
                [styles.head]: true,
              })}
            >
              <span className={styles.executor}>Исполнитель не назначен</span>
              <div className={styles.actions}>
                {card.status === "ACTIVE" && <span className={styles.add} onClick={() => card.setStatus("DONE")}>
                  <CheckboxIcon /> Завершить
                </span>}
                {card.status === "DONE" && <span className={classNames({
                  [styles.add]: true,
                  [styles.done]: true,
                })} onClick={() => card.setStatus("ACTIVE")}>
                  <CheckboxIcon /> Завершено
                </span>}
                <div className={styles.separator} />
                <span className={styles.reject}>
                    <TimesIcon />
                  </span>
                {cardId !== null && (
                  <span className={styles.trash} onClick={onDeleteClick}>
                    <TrashIcon />
                  </span>
                )}
              </div>
            </div>
            <div className={classNames({
              [styles.modalPart]: true,
              [styles.mainPart]: true,
            })}>
              <div className={styles.main}>
                <div className={styles.group}>
                  <span className={styles.name}>Основная информация</span>
                  <input value={card.name} onChange={e => card.setName(e.target.value)}
                         placeholder={"Название карточки"} className={styles.cardName} autoFocus />
                  {/*@ts-ignore */}
                  <baka-editor ref={editorRef} style={{ "--editor-padding": 0, "--min-height": "1em" } as CSSProperties}
                               placeholder={"Описание карточки"} />
                </div>
                <div className={styles.group}>
                  <div className={styles.head}>
                    <span className={styles.name}>Список подзадач</span>
                    <div className={styles.action} onClick={() => cardEmitter.emit("add_subtask")}>
                      + Добавить подзадачу
                    </div>
                  </div>
                  <div className={styles.subtasks}>
                    <SubtasksList target={card} moveSubtask={moveSubtask} addNewShown={false}
                                  deleteSubtask={deleteSubtask} listStyle={{ padding: 0 }}
                                  subtaskStyle={{
                                    border: 0,
                                    borderBottom: "1px solid rgba(0,0,0,.05)",
                                    marginBottom: 0,
                                    background: "transparent",
                                    borderRadius: 0,
                                    padding: "8px 0",
                                  }} />
                    {subtasks.length > 0 && <div className={styles.progressWrapper}>
                      {subtasks.filter(st => st.status === "DONE").length}/{subtasks.length}
                      <div className={styles.progress}
                           style={{
                             "--donePercent": `${subtasks.filter(st => st.status === "DONE").length *
                             (100 / subtasks.length)}%`,
                           } as CSSProperties} />
                    </div>}
                  </div>
                </div>
              </div>
              <div className={styles.settings}>
                <div className={styles.group}>
                  <div className={styles.name}>Коллекция</div>
                  <Select variants={collections.filter(c => c.columns.length > 0).map(c => ({
                    code: c.id,
                    name: c.name,
                    icon: "fire",
                  }))}
                          selected={card.collection.id} select={id => card.setCollection(id)} />
                </div>
                <div className={styles.group}>
                  <div className={styles.name}>Колонка</div>
                  <Select variants={card.collection.columns.map(c => ({ code: c.id, name: c.name, icon: "fire" }))}
                          selected={card.column.id} select={id => card.setColumn(id)} stretch />
                </div>
                <div className={styles.group}>
                  <div className={styles.name}>Дата исполнения</div>
                  <div className={styles.dateTrigger} ref={dateTriggerRef} onClick={() => setIsDateSelectorShown(true)}>
                    {card.date === null && "Не указана"}
                    {card.date === DateTime.now().toFormat("M/d/yyyy") && "Сегодня"}
                    {card.date !== null && card.date !== DateTime.now().toFormat("M/d/yyyy") &&
                    DateTime.fromFormat(card.date, "M/d/yyyy").toFormat("dd.MM.yyyy")}
                  </div>
                  {isDateSelectorShown && (
                    <DateSelector
                      right={false}
                      triggerRef={dateTriggerRef}
                      onSelect={day => {
                        card.setDate(DateTime.fromJSDate(day.date).toFormat("M/d/yyyy"))
                      }}
                      value={card.date}
                    />
                  )}
                </div>
              </div>
            </div>
          </TaskContext.Provider>
        </div>
      </div>,
      el,
    )
  },
)

export default CardForm
