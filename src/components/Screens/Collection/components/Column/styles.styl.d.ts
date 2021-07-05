declare namespace StylesStylNamespace {
  export interface IStylesStyl {
    add: string
    big: string
    cards: string
    colorTrigger: string
    column: string
    count: string
    floater: string
    floaterVertical: string
    icon: string
    medium: string
    name: string
    newCard: string
    scrollable: string
    small: string
    title: string
  }
}

declare const StylesStylModule: StylesStylNamespace.IStylesStyl & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesStylNamespace.IStylesStyl
}

export = StylesStylModule
