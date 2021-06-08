declare namespace StylesStylNamespace {
  export interface IStylesStyl {
    bottom: string
    card: string
    date: string
    description: string
    done: string
    expired: string
    progress: string
    progressWrapper: string
    separator: string
    tag: string
    tags: string
    title: string
    today: string
  }
}

declare const StylesStylModule: StylesStylNamespace.IStylesStyl & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesStylNamespace.IStylesStyl
}

export = StylesStylModule
