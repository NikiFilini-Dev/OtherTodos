declare namespace StylesStylNamespace {
  export interface IStylesStyl {
    datetime: string
    info: string
    log: string
    markSeen: string
    new: string
    title: string
    wrapper: string
  }
}

declare const StylesStylModule: StylesStylNamespace.IStylesStyl & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesStylNamespace.IStylesStyl
}

export = StylesStylModule
