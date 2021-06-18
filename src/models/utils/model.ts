import {getPropertyMembers, IStateTreeNode} from "mobx-state-tree"

function capitalizeFirstLetter(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
const getDefaultActions = (self: IStateTreeNode) => {
  const info = getPropertyMembers(self)

  const actions: {[Property in keyof typeof info.properties]: (val: typeof info.properties[Property]) => void} = {}
  const actionsMap: Record<keyof typeof info.properties, string[]> = {}

  Object.keys(info.properties).forEach(name => {
    const actionName = `set${capitalizeFirstLetter(name)}`
    const type = info.properties[name]

    actions[actionName] = (val: typeof type) => (self as unknown as typeof info.properties)[name] = val
    actionsMap[actionName] = [name]
  })

  return {actions, actionsMap}
}

export default getDefaultActions

export type Actions = Record<string, any>
export type ActionsMap = Record<string, string[]>