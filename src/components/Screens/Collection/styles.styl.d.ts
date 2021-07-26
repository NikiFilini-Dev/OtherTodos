declare namespace StylesStylNamespace {
  export interface IStylesStyl {
    action: string
    actionTrigger: string
    actionTriggerLong: string
    active: string
    add: string
    addColumn: string
    columns: string
    complete: string
    count: string
    create: string
    delete: string
    edit: string
    filterActiveMark: string
    head: string
    hidden: string
    info: string
    log: string
    logWrapper: string
    logs: string
    logsShown: string
    logsTrigger: string
    menu: string
    menuName: string
    move: string
    name: string
    puller: string
    screen: string
    screenWrapper: string
    size: string
    title: string
    user: string
    usersList: string
  }
}

declare const StylesStylModule: StylesStylNamespace.IStylesStyl & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesStylNamespace.IStylesStyl
}

export = StylesStylModule
