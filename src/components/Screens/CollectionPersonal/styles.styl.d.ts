declare namespace StylesStylNamespace {
  export interface IStylesStyl {
    actionTrigger: string
    actions: string
    big: string
    column: string
    columnHead: string
    columns: string
    head: string
    medium: string
    screen: string
    screenWrapper: string
    small: string
  }
}

declare const StylesStylModule: StylesStylNamespace.IStylesStyl & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesStylNamespace.IStylesStyl
}

export = StylesStylModule
