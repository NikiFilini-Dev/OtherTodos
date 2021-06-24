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
import { useClickOutsideRef, useClickOutsideRefs } from "../../tools/hooks"
import Emitter from "eventemitter3"
import { TaskContext } from "../Task"
import SubtasksList from "../SubtasksList"
import BakaEditor from "../../editor"
import { ColorsMap } from "../../palette/colors"
import FloatMenu from "../FloatMenu"
import File from "./components/File"
import Icon from "../Icon"
import CardComment from "../../models/collections/CardComment"
import { v4 } from "uuid"
import AngleIcon from "assets/line_awesome/angle-up-solid.svg"
import AngleDownIcon from "assets/line_awesome/angle-down-solid.svg"
import Comment from "./components/Comment"
import GridIcon from "assets/customIcons/grid2.svg"
import FilePlus from "assets/line_awesome/file-medical-solid.svg"
import SearchIcon from "assets/search.svg"
import Avatar from "../Avatar"

const CardForm = observer(
  ({ cardId }: { cardId: string | null }) => {
    const {
      user,
      tasks: { deleteTask },
      collectionsStore: {
        cards,
        collections,
        addSubtask,
        deleteSubtask,
        moveSubtask,
        selectCard,
        deleteCard,
        uploads: {
          add: pushUpload,
        },
        comments: {
          add: addComment,
        },
        uploadView,
      },
    }: IRootStore = useMst()

    const [cardEmitter] = React.useState(new Emitter())

    const card = cards.find(c => c.id === cardId)

    React.useEffect(() => {
      cardEmitter.on("*", console.log)
      cardEmitter.on("add_subtask", (index = -1) => {
        const data = { card, index }
        if (index === -1) delete data.index
        const id = addSubtask(data)
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

    const onDeleteClick = () => {
      deleteCard(card.id)
    }

    const [isDateSelectorShown, setIsDateSelectorShown] = React.useState(false)
    const dateTriggerRef = React.useRef<HTMLDivElement | null>(null)

    useClickOutsideRef(dateTriggerRef, () => setIsDateSelectorShown(false))
    const noteEditorRef = React.useRef<BakaEditor | null>(null)
    React.useEffect(() => {
      if (!noteEditorRef.current || !noteEditorRef.current.setText) return
      noteEditorRef.current.setText(card.text || "")

      noteEditorRef.current.addEventListener(
        "change",
        // @ts-ignore
        (e: Event & { detail: { original: string } }) => {
          console.log(e.detail.original)
          card.setText(e.detail.original)
        },
      )
    }, [noteEditorRef.current])

    const nameEditorRef = React.useRef<BakaEditor | null>(null)
    React.useEffect(() => {
      if (!nameEditorRef.current || !nameEditorRef.current.setText) return
      nameEditorRef.current.setText(card.name || "")

      nameEditorRef.current.addEventListener(
        "change",
        // @ts-ignore
        (e: Event & { detail: { original: string } }) => {
          console.log(e.detail.original)
          card.setName(e.detail.original)
        },
      )
    }, [nameEditorRef.current])

    const [commentText, setCommentText] = React.useState("")
    const commentEditorRef = React.useRef<BakaEditor | null>(null)
    React.useEffect(() => {
      if (!commentEditorRef.current || !commentEditorRef.current.setText) return
      commentEditorRef.current.setText(commentText)

      commentEditorRef.current.addEventListener(
        "change",
        // @ts-ignore
        (e: Event & { detail: { original: string } }) => {
          console.log(e.detail.original)
          setCommentText(e.detail.original)
        },
      )
    }, [commentEditorRef.current])

    const triggerRef = React.useRef(null)
    const menuRef = React.useRef(null)
    const [tagMenuOpen, setTagMenuOpen] = React.useState(false)

    useClickOutsideRefs([triggerRef, menuRef], () => setTagMenuOpen(false))

    const fileRef = React.useRef<null | HTMLInputElement>(null)
    const triggerFileUpload = () => {
      console.log("Trigger")
      if (!fileRef.current) return
      console.log("Has current")
      fileRef.current.click()
    }

    const uploadFile = e => {
      const file = e.target.files[0]
      const formData = new FormData()
      formData.append("file", file)
      fetch(process.env.UPLOAD_URL || "http://localhost/upload", {
        method: "POST",
        headers: {
          "Authorization": user.token,
        },
        body: formData,
      }).then(r => r.json()).then(upload => {
        pushUpload(upload)
        card.addFile(upload.id)
      })
    }

    if (!card) return <React.Fragment />

    const subtasks = [...card.subtasks]
    subtasks.sort((a, b) => a.index - b.index)

    const tags = [...card.tags]
    tags.sort((a, b) => a.index - b.index)

    const collectionTags = [...card.collection.tags.filter(t => !card.tags.includes(t))]
    collectionTags.sort((a, b) => a.index - b.index)


    const onAddCommentClick = () => {
      if (!commentText) return
      setCommentText("")
      // @ts-ignore
      commentEditorRef.current.setText("")
      const comment = {
        text: commentText,
        card: card.id,
        id: v4(),
        createdAt: DateTime.now().toISO(),
        user: user.id,
        collectionId: card.collection.id,
      }
      addComment(CardComment.create(comment))
      card.pushNewComment(comment.id)
    }

    const comments = [...card.comments]
    comments.sort((b, a) => DateTime.fromISO(a.createdAt).toSeconds() - DateTime.fromISO(b.createdAt).toSeconds())

    const [commentsFolded, setCommentsFolded] = React.useState(false)

    const onAddTaskClick = () => {
      if (card.task) {
        deleteTask(card.task)
      } else {
        card.addTask()
      }
    }

    const [tagsMenuFilter, setTagsMenuFilter] = React.useState("")


    const usersTriggerRef = React.useRef(null)
    const usersMenuRef = React.useRef(null)
    const [usersMenuOpen, setUsersMenuOpen] = React.useState(false)
    useClickOutsideRef(usersTriggerRef, () => {
      if (usersMenuOpen) setUsersMenuOpen(false)
    })

    return ReactDOM.createPortal(
      <div className={styles.wrapper} ref={wrapperRef}
           onClick={onWrapperClick} style={{ display: uploadView !== null ? "none" : "" }}>
        <div className={styles.modal}>
          <TaskContext.Provider value={cardEmitter}>
            <div
              className={classNames({
                [styles.modalPart]: true,
                [styles.head]: true,
              })}
            >
              <div className={styles.executorWrapper}>
                <div className={styles.executorAvatar}>
                  <Avatar user={card.assigned} size={"48px"} />
                </div>
                <div className={styles.executorInfo}>
                  <span>Исполнитель:</span>
                  <span className={styles.executorTrigger} ref={usersTriggerRef} onClick={() => setUsersMenuOpen(true)}>
                    {card.assigned ? `${card.assigned.firstName} ${card.assigned.lastName}` : "Не назначен"}
                    <AngleDownIcon />
                  </span>
                </div>
              </div>
              {usersMenuOpen && (
                <FloatMenu target={usersTriggerRef} menuRef={usersMenuRef} position={"vertical_middle"}>
                  <div className={styles.usersMenu}>
                    <div className={styles.user} onClick={() => card.assignUser(null)}>
                      <div className={styles.avatar}>
                        <Avatar user={null} size={"28px"} />
                      </div>
                      Не назначен
                    </div>
                    <div className={styles.user} onClick={() => card.assignUser(card.collection.userId)}>
                      <div className={styles.avatar}>
                        <Avatar user={card.collection.userId} size={"28px"} />
                      </div>
                      {card.collection.userId.firstName} {card.collection.userId.lastName}
                    </div>
                    {card.collection.users.map(user => (
                      <div key={user.id} className={styles.user} onClick={() => card.assignUser(user)}>
                        <div className={styles.avatar}>
                          <Avatar user={user} size={"28px"} />
                        </div>
                        {user.firstName} {user.lastName}
                      </div>
                    ))}
                  </div>
                </FloatMenu>
              )}
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
                <span className={classNames({
                  [styles.addTask]: true,
                  [styles.active]: !!card.task,
                })} onClick={onAddTaskClick}>
                    <GridIcon />
                  </span>
                {cardId !== null && (
                  <span className={styles.trash} onClick={onDeleteClick}>
                    <TrashIcon />
                  </span>
                )}
                <span className={styles.reject}>
                    <TimesIcon />
                  </span>
              </div>
            </div>
            <div className={classNames({
              [styles.modalPart]: true,
              [styles.mainPart]: true,
            })}>
              <div className={styles.main}>
                <div className={styles.group}>
                  {/*@ts-ignore */}
                  <baka-editor ref={nameEditorRef} class={styles.cardName}
                               style={{ "--editor-padding": 0, "--min-height": "1em" } as CSSProperties}
                               placeholder={"Описание карточки"} />
                  {/*@ts-ignore */}
                  <baka-editor ref={noteEditorRef}
                               style={{ "--editor-padding": 0, "--min-height": "1em" } as CSSProperties}
                               placeholder={"Описание карточки"} />
                </div>
                <div className={styles.group}>
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
                    <div className={styles.addSubtask} onClick={() => cardEmitter.emit("add_subtask")}>
                      + Добавить подзадачу
                    </div>
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
                <div className={styles.group}>
                  <div className={styles.head}>
                    <span className={styles.name}>Вложения</span>
                  </div>
                  <div className={styles.files}>
                    {card.files.map(file => (
                      <File removeFile={() => card.removeFile(file)} key={file.id} file={file}
                            currentPreview={card.preview} setPreview={card.setPreview} />
                    ))}
                    <div onClick={triggerFileUpload} className={styles.newFile}>
                      <FilePlus />
                      <input type={"file"} style={{ display: "none" }} onChange={uploadFile} ref={fileRef} />
                    </div>
                  </div>
                </div>
                <div className={styles.group}>
                  <div className={styles.head}>
                    <span className={styles.name}>
                      Комментарии <AngleIcon className={classNames({ [styles.rotated]: commentsFolded })}
                                             onClick={() => setCommentsFolded(!commentsFolded)} />
                    </span>
                    <div className={styles.action} onClick={onAddCommentClick}>
                      <Icon name={"send"} /> Отправить
                    </div>
                  </div>
                  {/*@ts-ignore*/}
                  {!commentsFolded && <baka-editor class={styles.newComment} ref={commentEditorRef} />}
                  {!commentsFolded && <div>
                    {comments.map(comment => <Comment comment={comment} key={comment.id} card={card} />)}
                  </div>}
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
                <div className={styles.group}>
                  <div className={styles.head}>
                    <div className={styles.name}>Тэги</div>
                  </div>
                  <div className={styles.tagsMenuTrigger} ref={triggerRef} onClick={() => setTagMenuOpen(true)}>
                    <Icon name={"label"} />
                    Тэги
                    <AngleDownIcon className={styles.angle} />
                  </div>
                  {tagMenuOpen && <FloatMenu target={triggerRef} position={"vertical_middle"} menuRef={menuRef}>
                    <div className={styles.tagsMenu}>
                      <div className={styles.search}>
                        <SearchIcon />
                        <input autoFocus placeholder={"Поиск"} value={tagsMenuFilter}
                               onChange={e => setTagsMenuFilter(e.target.value)} />
                      </div>
                      <span className={styles.name}>Выбранные тэги:</span>
                      <div className={styles.tags}>
                        {tags.map(tag => (
                          <div className={styles.tag} style={{ "--color": ColorsMap[tag.color] } as CSSProperties}
                               key={"remove_tag_" + tag.id} onClick={() => card.removeTag(tag)}>
                            {tag.name}
                          </div>
                        ))}
                      </div>
                      <span className={styles.name}>Остальные тэги:</span>
                      <div className={styles.tags}>
                        {collectionTags
                          .filter(tag => {
                            return !tags.includes(tag) &&
                              tag.name.toLowerCase().startsWith(tagsMenuFilter.toLowerCase())
                          }).map(tag => (
                          <div key={tag.id} onClick={() => card.addTag(tag)}
                               style={{ "--color": ColorsMap[tag.color] } as CSSProperties} className={styles.tag}>
                            {tag.name}
                          </div>
                        ))}
                      </div>

                    </div>
                  </FloatMenu>}
                  <div className={styles.tags}>
                    {tags.map(tag => (
                      <div className={styles.tag} style={{ "--color": ColorsMap[tag.color] } as CSSProperties}
                           key={"remove_tag_" + tag.id} onClick={() => card.removeTag(tag)}>
                        {tag.name}
                      </div>
                    ))}
                  </div>
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
