import React from "react"
import styles from "./styles.styl"
import { observer } from "mobx-react"
import { IRootStore, useMst } from "../../../../../models/RootStore"
import ReactDOM from "react-dom"

const UploadView = observer(() => {
  const {collectionsStore: {uploadView, setUploadView}}: IRootStore = useMst()
  const [el] = React.useState(document.createElement("div"))
  React.useEffect(() => {
    document.querySelector("#modals")?.appendChild(el)
    return () => {
      document.querySelector("#modals")?.removeChild(el)
    }
  }, [])

  if (!uploadView) return <React.Fragment />
  return ReactDOM.createPortal(<div className={styles.wrapper} onClick={() => setUploadView(null)}>
    <img src={uploadView.url} />
  </div>, el)
})

export default UploadView