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

const UploadView = observer(() => {
  const { collectionsStore: { uploadView, setUploadView, cards } }: IRootStore = useMst()
  const [el] = React.useState(document.createElement("div"))
  React.useEffect(() => {
    document.querySelector("#modals")?.appendChild(el)
    return () => {
      document.querySelector("#modals")?.removeChild(el)
    }
  }, [])

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

  useKeyListener("ArrowLeft", () => {
    if (!hasPrev) return
    setUploadView(list[currentIndex - 1])
  })
  useKeyListener("ArrowRight", () => {
    if (!hasNext) return
    setUploadView(list[currentIndex + 1])
  })

  if (!uploadView) return <React.Fragment />
  return ReactDOM.createPortal(<div className={styles.wrapper} onClick={() => setUploadView(null)}>
    {hasPrev && <div onClick={e => {
      e.stopPropagation()
      setUploadView(list[currentIndex - 1])
    }} className={styles.left}>
      <AngleLeftIcon />
    </div>}

    <img src={uploadView.url} />

    {hasNext && <div onClick={e => {
      e.stopPropagation()
      setUploadView(list[currentIndex + 1])
    }} className={styles.right}>
      <AngleRightIcon />
    </div>}
  </div>, el)
})

export default UploadView