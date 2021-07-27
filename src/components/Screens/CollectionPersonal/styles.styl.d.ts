declare namespace StylesStylNamespace {
  export interface IStylesStyl {
    column: string
    columnHead: string
    columns: string
    head: string
    screen: string
    screenWrapper: string
  }
}

declare const StylesStylModule: StylesStylNamespace.IStylesStyl & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesStylNamespace.IStylesStyl
}

export = StylesStylModule
