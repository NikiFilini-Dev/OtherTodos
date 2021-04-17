declare namespace StylesStylNamespace {
  export interface IStylesStyl {
    notFound: string
    project: string
    projectIcon: string
    projects: string
    search: string
    searchIcon: string
    searchWrapper: string
    selected: string
    wrapper: string
  }
}

declare const StylesStylModule: StylesStylNamespace.IStylesStyl & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesStylNamespace.IStylesStyl
}

export = StylesStylModule
