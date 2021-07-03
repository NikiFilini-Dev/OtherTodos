declare namespace StylesStylNamespace {
  export interface IStylesStyl {
    actionTrigger: string
    actionTriggerLong: string
    active: string
    add: string
    addColumn: string
    columns: string
    count: string
    filterActiveMark: string
    head: string
    info: string
    menu: string
    menuName: string
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
