declare namespace StylesStylNamespace {
  export interface IStylesStyl {
    app: string
    main: string
    resizeHandle: string
    sideBar: string
    timeline: string
  }
}

declare const StylesStylModule: StylesStylNamespace.IStylesStyl & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesStylNamespace.IStylesStyl
}

export = StylesStylModule
