import React from "react"
import { observer } from "mobx-react"
import { IconName, IconsMap } from "../../palette/icons"

const Icon = observer(
  ({ name, className = "" }: { name: IconName; className?: string }) => {
    const IconElement = IconsMap[name]
    return <IconElement className={className} />
  },
)

export default Icon
