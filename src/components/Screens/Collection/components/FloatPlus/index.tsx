import React from "react"
import styles from "./styles.styl"
import { observer } from "mobx-react"
import { ICollectionColumn } from "../../../../../models/collections/CollectionColumn"
import { IRootStore, useMst } from "../../../../../models/RootStore"
import classNames from "classnames"

type Props = {
  index: number
  column: ICollectionColumn
  className: string
}

const FloatPlus = observer(({index, column, className}: Props) => {
  const {collectionsStore: {createCard}}:IRootStore = useMst()
  const onClick = () => {
    createCard({column: column.id, collection: column.collection.id, index})
  }
  return <div className={classNames({
    [className]: true,
    [styles.floater]: true
  })} onClick={onClick}>+</div>
})

export default FloatPlus