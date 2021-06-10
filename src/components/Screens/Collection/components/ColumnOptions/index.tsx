import React, { CSSProperties } from "react"
import { observer } from "mobx-react"
import FloatMenu from "../../../../FloatMenu"
import { ColorNames, ColorsMap } from "../../../../../palette/colors"
import styles from "./styles.styl"
import classNames from "classnames"
import { ICollectionColumn } from "../../../../../models/collections/CollectionColumn"
import { IconNames } from "../../../../../palette/icons"
import Icon from "../../../../Icon"
import { IRootStore, useMst } from "../../../../../models/RootStore"

type Props = {
  column: ICollectionColumn,
  triggerRef: any,
  menuRef: any,
}

const ColumnOptions = observer(({ column, triggerRef, menuRef }: Props) => {
  const {collectionsStore: {deleteColumn}}: IRootStore = useMst()
  return <FloatMenu position={"horizontal_auto"} target={triggerRef} menuRef={menuRef}>
    <div className={styles.wrapper}>
      <div className={styles.group}>
        <div className={styles.name}>Цвет:</div>
        <div className={styles.list}>
          {ColorNames.map(name => {
            return <div key={`color_${name}`} className={classNames({
              [styles.color]: true,
              [styles.active]: column.color === name
            })} onClick={() => column.setColor(name)} style={{"--color": ColorsMap[name]} as CSSProperties} />
          })}
        </div>
      </div>
      <div className={styles.group}>
        <div className={styles.name}>Иконка:</div>
        <div className={styles.list}>
          {IconNames.map(name => {
            return <div key={`icon_${name}`} className={classNames({
              [styles.block]: true,
              [styles.active]: column.icon === name
            })} onClick={() => column.setIcon(name)}><Icon name={name} /></div>
          })}
        </div>
      </div>
      <div className={styles.group}>
        <div className={styles.name}>Действия:</div>
        <div className={styles.actions}>
          <span className={styles.delete} onClick={() => deleteColumn(column.id)}>Удалить</span>
        </div>
      </div>
    </div>
  </FloatMenu>
})

export default ColumnOptions