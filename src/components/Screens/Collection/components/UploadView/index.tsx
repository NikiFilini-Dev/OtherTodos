import React from "react"
import styles from "./styles.styl"
import { observer } from "mobx-react"
import { IRootStore, useMst } from "../../../../../models/RootStore"
import ReactDOM from "react-dom"
import { IUpload } from "../../../../../models/collections/Upload"
import { ICollectionCard } from "../../../../../models/collections/CollectionCard"
import AngleLeftIcon from "assets/line_awesome/angle-left-solid.svg"
import AngleRightIcon from "assets/line_awesome/angle-right-solid.svg"
import { useKeyListener } from "../../../../../tools/hooks"
import Swipe from "../../../../../tools/swipe"

const UploadView = observer(() => {
  const { collectionsStore: { uploadView, setUploadView: _setUploadView, cards } }: IRootStore = useMst()
  const [el] = React.useState(document.createElement("div"))

  const setUploadView = (u) => {
    console.log("SET UPLOAD VIEW", u)
    _setUploadView(u)
  }

  const list: IUpload[] = []
  cards.forEach((c: ICollectionCard) => {
    if (!c.files.includes(uploadView)) return
    c.files.forEach((f: IUpload) => {
      if (["png", "jpg", "jpeg", "gif", "bmp", "webp"].includes(f.extension)) list.push(f)
    })
  })

  const currentIndex = list.indexOf(uploadView)
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < list.length - 1

  const onLeft = () => {
    console.log("ON LEFT")
    if (!hasPrev) setUploadView(list[list.length - 1])
    else setUploadView(list[currentIndex - 1])
  }

  const onRight = () => {
    console.log("ON RIGHT", list)
    if (!hasNext) setUploadView(list[0])
    else setUploadView(list[currentIndex + 1])
  }

  useKeyListener("ArrowLeft", onLeft)
  useKeyListener("ArrowRight", onRight)

  React.useEffect(() => {
    document.querySelector("#modals")?.appendChild(el)

    return () => {
      document.querySelector("#modals")?.removeChild(el)
    }
  }, [el])

  const wrapper = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    if (!wrapper.current) return
    console.log(wrapper.current)
    Swipe(wrapper.current)

    wrapper.current.addEventListener("swipeend", swipeListener, false)

    function swipeListener (event) {
      console.log(event)
      event.stopPropagation()
      if (event.direction === "left") onRight()
      if (event.direction === "right") onLeft()
    }

    return () => {
      wrapper.current?.removeEventListener("swipeend", swipeListener, false)
    }
  }, [wrapper.current, onRight, onLeft, list])

  if (!uploadView) return <React.Fragment />
  return ReactDOM.createPortal(<div className={styles.wrapper} ref={wrapper} onClick={e => {
    console.log("Mouseup", e)
    setUploadView(null)
  }}>
    {list.length > 1 && <div onClick={e => {
      e.stopPropagation()
      onLeft()
    }} className={styles.left}>
      <AngleLeftIcon />
    </div>}

    <img src={uploadView.url} />

    {list.length > 1 && <div onClick={e => {
      e.stopPropagation()
      onRight()
    }} className={styles.right}>
      <AngleRightIcon />
    </div>}
  </div>, el)
})

export default UploadView