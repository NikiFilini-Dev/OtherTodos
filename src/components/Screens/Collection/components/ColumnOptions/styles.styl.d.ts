declare namespace StylesStylNamespace {
  export interface IStylesStyl {
    actions: string
    active: string
    block: string
    color: string
    delete: string
    group: string
    list: string
    name: string
    wrapper: string
  }
}

declare const StylesStylModule: StylesStylNamespace.IStylesStyl & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesStylNamespace.IStylesStyl
}

export = StylesStylModule
