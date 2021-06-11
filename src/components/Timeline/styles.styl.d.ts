declare namespace StylesStylNamespace {
  export interface IStylesStyl {
    action: string
    actions: string
    active: string
    allDayList: string
    allDayName: string
    block: string
    calendarTrigger: string
    currentDate: string
    dash: string
    dayDetail: string
    dayName: string
    eventContainer: string
    eventStretch: string
    hour: string
    line: string
    now: string
    tab: string
    tabs: string
    timeline: string
    timelineWrapper: string
    wrapper: string
  }
}

declare const StylesStylModule: StylesStylNamespace.IStylesStyl & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesStylNamespace.IStylesStyl
}

export = StylesStylModule
