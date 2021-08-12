import React from "react"
import { observer } from "mobx-react"
import { IUpload } from "../../../../models/collections/Upload"
import { humanFileSize } from "../../../../tools/file"
import styles from "./styles.styl"
import classNames from "classnames"
import TrashIcon from "../../../../assets/line_awesome/ellipsis-v-solid.svg"
import FloatMenu from "../../../FloatMenu"
import { useClickOutsideRefs } from "../../../../tools/hooks"
import { IRootStore, useMst } from "../../../../models/RootStore"

type Props = {
  file: IUpload
  removeFile: () => void
  setPreview: (any) => void
  currentPreview: IUpload | null
}

const File = observer(
  ({ file, removeFile, setPreview, currentPreview }: Props) => {
    const {
      collectionsStore: { setUploadView },
    }: IRootStore = useMst()
    const extensionsMap = {
      doc: "word",
      docx: "word",
      xls: "excel",
      xlsx: "excel",
      ppt: "powerpoint",
      pptx: "powerpoint",
      png: "image",
      jpg: "image",
      jpeg: "image",
    }

    const onDeleteClick = e => {
      e.preventDefault()
      removeFile()
    }

    const [menuOpen, setMenuOpen] = React.useState(false)
    const triggerRef = React.useRef(null)
    const menuRef = React.useRef(null)

    useClickOutsideRefs([triggerRef, menuRef], () => setMenuOpen(false))

    const onClick = e => {
      if (extensionsMap[file.extension] !== "image") return
      e.preventDefault()
      setUploadView(file)
    }

    function download(url, name) {
      fetch(url, {
        headers: {
          Origin: location.origin,
        },
      }).then(response => {
        return response.blob().then(b => {
          const a = document.createElement("a")
          a.setAttribute("download", name)
          a.href = URL.createObjectURL(b)
          a.click()
        })
      })
    }

    return (
      <a
        href={file.url}
        target={"_blank"}
        rel="noreferrer"
        title={file.name}
        className={classNames({
          [styles.file]: true,
          [styles[extensionsMap[file.extension]]]: true,
        })}
        onClick={onClick}
      >
        {extensionsMap[file.extension] === "image" && (
          <img src={file.previewUrl || file.url} />
        )}
        <div className={styles.info}>
          <span className={styles.name}>{file.name}</span>
          <span className={styles.size}>{humanFileSize(file.size)}</span>

          <div
            className={styles.ellipsis}
            title={"Меню"}
            ref={triggerRef}
            onClick={e => {
              e.preventDefault()
              e.stopPropagation()
              setMenuOpen(!menuOpen)
            }}
          >
            <TrashIcon />
          </div>

          {menuOpen && (
            <FloatMenu
              target={triggerRef}
              menuRef={menuRef}
              position={"horizontal_auto"}
            >
              <div
                className={styles.menu}
                onClick={e => {
                  e.stopPropagation()
                  e.preventDefault()
                }}
              >
                {extensionsMap[file.extension] === "image" &&
                  currentPreview !== file && (
                    <div
                      onClick={() => setPreview(file)}
                      className={styles.item}
                    >
                      Установить на превью
                    </div>
                  )}
                {extensionsMap[file.extension] === "image" &&
                  currentPreview === file && (
                    <div
                      onClick={() => setPreview(null)}
                      className={styles.item}
                    >
                      Убрать с превью
                    </div>
                  )}
                {extensionsMap[file.extension] === "image" && (
                  <a
                    href={file.url}
                    target={"_blank"}
                    rel="noreferrer"
                    className={styles.item}
                    onClick={e => e.stopPropagation()}
                  >
                    Открыть в браузере
                  </a>
                )}
                {extensionsMap[file.extension] === "image" && (
                  <div
                    className={styles.item}
                    onClick={e => {
                      e.stopPropagation()
                      download(file.url, file.name)
                    }}
                  >
                    Скачать
                  </div>
                )}
                <div
                  className={classNames(styles.item, styles.delete)}
                  onClick={onDeleteClick}
                >
                  Удалить
                </div>
              </div>
            </FloatMenu>
          )}
        </div>
      </a>
    )
  },
)

export default File
