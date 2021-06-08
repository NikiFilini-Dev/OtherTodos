declare namespace StylesStylNamespace {
  export interface IStylesStyl {
    action: string
    actions: string
    active: string
    add: string
    block: string
    color: string
    description: string
    group: string
    head: string
    icons: string
    info: string
    modal: string
    modalPart: string
    name: string
    period: string
    periods: string
    reject: string
    repeatCount: string
    repeatDetails: string
    separator: string
    tag: string
    tags: string
    title: string
    trash: string
    week: string
    wrapper: string
  }
}

declare const StylesStylModule: StylesStylNamespace.IStylesStyl & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesStylNamespace.IStylesStyl
}

export = StylesStylModule
