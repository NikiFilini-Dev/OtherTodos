import React from "react"
import styles from "./styles.styl"
import { observer } from "mobx-react"
import { ICollectionColumn } from "../../../../../models/collections/CollectionColumn"
import { IRootStore, useMst } from "../../../../../models/RootStore"
import classNames from "classnames"

type Props = {
  onClick: () => void
  className: string
}

const FloatPlus = observer(({className, onClick}: Props) => {
  return <div className={classNames({
    [className]: true,
    [styles.floater]: true
  })} onClick={e => {
    e.stopPropagation()
    onClick()
  }}>+</div>
})

export default FloatPlus