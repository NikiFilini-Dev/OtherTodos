declare namespace StylesStylNamespace {
  export interface IStylesStyl {
    actions: string
    addTag: string
    colorIndicator: string
    colorInput: string
    delete: string
    info: string
    list: string
    screen: string
    tag: string
    tagName: string
    title: string
  }
}

declare const StylesStylModule: StylesStylNamespace.IStylesStyl & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesStylNamespace.IStylesStyl
}

export = StylesStylModule
