declare namespace StylesMStylNamespace {
  export interface IStylesMStyl {
    addHabit: string
    background: string
    done: string
    edit: string
    habit: string
    info: string
    invisible: string
    list: string
    records: string
    waiting: string
  }
}

declare const StylesMStylModule: StylesMStylNamespace.IStylesMStyl & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesMStylNamespace.IStylesMStyl
}

export = StylesMStylModule
