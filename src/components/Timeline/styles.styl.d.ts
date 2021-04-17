declare namespace StylesStylNamespace {
  export interface IStylesStyl {
    action: string
    allDayList: string
    allDayName: string
    currentDate: string
    dash: string
    dayDetail: string
    dayName: string
    eventContainer: string
    eventStretch: string
    hour: string
    line: string
    now: string
    timeline: string
    wrapper: string
  }
}

declare const StylesStylModule: StylesStylNamespace.IStylesStyl & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesStylNamespace.IStylesStyl
}

export = StylesStylModule
