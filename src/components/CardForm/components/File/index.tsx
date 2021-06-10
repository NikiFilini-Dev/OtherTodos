import React from "react"
import { observer } from "mobx-react"
import { IUpload } from "../../../../models/collections/Upload"
import { humanFileSize } from "../../../../tools/file"
import { IRootStore, useMst } from "../../../../models/RootStore"
import styles from "./styles.styl"
import classNames from "classnames"
import TrashIcon from "../../../../assets/customIcons/trash.svg"

const File = observer(({ file, removeFile }: {file: IUpload, removeFile: () => void}) => {
  const {user}: IRootStore = useMst()
  const base_url = "http://d8m2rzrk8wge.cloudfront.net"
  const url = `${base_url}/${user.id}/${file.id}.${file.extension}`
  const extensionsMap = {
    doc: "word",
    docx: "word",
    xls: "excel",
    xlsx: "excel",
    ppt: "powerpoint",
    pptx: "powerpoint",
    png: "image",
    jpg: "image",
    jpeg: "image"
  }

  const onDeleteClick = e => {
    e.preventDefault()
    removeFile()
  }

  return <a href={url} target={"_blank"} rel="noreferrer" title={file.name} className={classNames({
    [styles.file]: true,
    [styles[extensionsMap[file.extension]]]: true
  })}>
    {extensionsMap[file.extension] === "image" && <img src={url} />}
    <div className={styles.info}>
      <span className={styles.name}>{file.name}</span>
      <span className={styles.size}>{humanFileSize(file.size)}</span>

      <div onClick={onDeleteClick} className={styles.trash} title={"Удалить файл"}>
        <TrashIcon />
      </div>
    </div>
  </a>
})

export default File