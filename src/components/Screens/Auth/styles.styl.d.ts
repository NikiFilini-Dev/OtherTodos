declare namespace StylesStylNamespace {
  export interface IStylesStyl {
    button: string
    content: string
    error: string
    errors: string
    info: string
    input: string
    part: string
    screen: string
    title: string
  }
}

declare const StylesStylModule: StylesStylNamespace.IStylesStyl & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesStylNamespace.IStylesStyl
}

export = StylesStylModule
