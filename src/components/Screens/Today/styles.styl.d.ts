declare namespace StylesStylNamespace {
  export interface IStylesStyl {
    actions: string
    active: string
    additional: string
    calendar: string
    info: string
    listOfLists: string
    newTaskActions: string
    screen: string
    selected: string
    tag: string
    tags: string
    title: string
    viewSwitch: string
  }
}

declare const StylesStylModule: StylesStylNamespace.IStylesStyl & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesStylNamespace.IStylesStyl
}

export = StylesStylModule
