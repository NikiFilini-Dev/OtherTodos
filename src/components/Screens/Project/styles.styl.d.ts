declare namespace StylesStylNamespace {
  export interface IStylesStyl {
    actions: string
    addCategory: string
    head: string
    info: string
    listOfLists: string
    nameEdit: string
    newTaskActions: string
    screen: string
    title: string
  }
}

declare const StylesStylModule: StylesStylNamespace.IStylesStyl & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesStylNamespace.IStylesStyl
}

export = StylesStylModule
