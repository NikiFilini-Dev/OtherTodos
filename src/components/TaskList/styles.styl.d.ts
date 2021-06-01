declare namespace StylesStylNamespace {
  export interface IStylesStyl {
    actions: string
    active: string
    count: string
    delete: string
    fold: string
    folded: string
    icon: string
    info: string
    listWrapper: string
    name: string
    nameInput: string
    tasks: string
    tasksCount: string
    wrapper: string
  }
}

declare const StylesStylModule: StylesStylNamespace.IStylesStyl & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesStylNamespace.IStylesStyl
}

export = StylesStylModule
