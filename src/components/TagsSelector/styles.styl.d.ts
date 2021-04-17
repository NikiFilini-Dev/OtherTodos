declare namespace StylesStylNamespace {
  export interface IStylesStyl {
    add: string
    addIcon: string
    list: string
    listTitle: string
    placeholder: string
    search: string
    searchWrapper: string
    tag: string
    tagMenu: string
    wrapper: string
  }
}

declare const StylesStylModule: StylesStylNamespace.IStylesStyl & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesStylNamespace.IStylesStyl
}

export = StylesStylModule
