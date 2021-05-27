declare namespace StylesMStylNamespace {
  export interface IStylesMStyl {
    actions: string
    active: string
    add: string
    block: string
    color: string
    colors: string
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
    title: string
    trash: string
    week: string
    wrapper: string
  }
}

declare const StylesMStylModule: StylesMStylNamespace.IStylesMStyl & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesMStylNamespace.IStylesMStyl
}

export = StylesMStylModule
