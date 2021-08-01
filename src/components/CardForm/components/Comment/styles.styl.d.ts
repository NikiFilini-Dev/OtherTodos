declare namespace StylesStylNamespace {
  export interface IStylesStyl {
    action: string
    actions: string
    active: string
    awesome: string
    comment: string
    date: string
    editor: string
    info: string
    mentions: string
    name: string
    text: string
    title: string
    top: string
    user: string
  }
}

declare const StylesStylModule: StylesStylNamespace.IStylesStyl & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesStylNamespace.IStylesStyl
}

export = StylesStylModule
