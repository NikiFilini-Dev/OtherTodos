import { makeAutoObservable } from "mobx"
import React from "react"

export default class TaskState {
  constructor() {
    makeAutoObservable(this, {
      refs: false,
    })
  }

  _active = false
  get active(): boolean {
    return this._active
  }

  set active(val) {
    this._active = val
  }

  _done = false
  get done(): boolean {
    return this._done
  }

  set done(val) {
    this._done = val
  }

  menus = {
    datePicker: false,
    datePicker_start: false,
    datePicker_end: false,
    project: false,
    tags: false,
  }

  refs = {
    container: React.createRef<HTMLDivElement>(),
    input: React.createRef<HTMLTextAreaElement>(),
    checkbox: React.createRef<HTMLInputElement>(),

    menus: {
      datePicker: {
        trigger: React.createRef<HTMLSpanElement>(),
        menu: React.createRef(),
      },
      datePicker_start: {
        trigger: React.createRef<HTMLSpanElement>(),
        menu: React.createRef(),
      },
      datePicker_end: {
        trigger: React.createRef<HTMLSpanElement>(),
        menu: React.createRef(),
      },
      project: {
        trigger: React.createRef<HTMLSpanElement>(),
        menu: React.createRef(),
      },
      tags: {
        trigger: React.createRef<HTMLDivElement>(),
        menu: React.createRef(),
      },
      priority: {
        trigger: React.createRef<HTMLDivElement>(),
        menu: React.createRef(),
      },
    },
  }

  openMenu(name: string) {
    if (!(name in this.menus) || this.menus[name]) return
    this.menus[name] = true
  }

  _closeMenu(name: string) {
    if (!(name in this.menus) || !this.menus[name]) return
    this.menus[name] = false
  }

  closeMenu(name: string) {
    setTimeout(() => this._closeMenu(name), 100)
    // this.menus[name] = false
  }

  inRef(el, ref) {
    return ref.current && (el === ref.current || ref.current.contains(el))
  }

  elementInMenu(el, name: string) {
    if (!(name in this.refs.menus)) return
    const ref = this.refs.menus[name].menu
    return ref.current && (el === ref.current || ref.current.contains(el))
  }

  elementInAnyMenu(el) {
    for (const name of Object.keys(this.refs.menus)) {
      if (this.inRef(el, this.refs.menus[name].menu)) return true
    }
    return false
  }

  elementInMenuOrTrigger(el, name: string) {
    if (!(name in this.refs.menus)) return
    return (
      this.inRef(el, this.refs.menus[name].menu) ||
      this.inRef(el, this.refs.menus[name].trigger)
    )
  }

  elementInAnyMenuOrTrigger(el) {
    console.log(this.refs.menus)
    for (const name of Object.keys(this.menus)) {
      if (
        this.inRef(el, this.refs.menus[name].menu) ||
        this.inRef(el, this.refs.menus[name].trigger)
      ){
        console.log("IN MENU", name)
        return true
      }


    }
    return false
  }

  get allMenusClosed(): boolean {
    for (const name of Object.keys(this.refs.menus)) {
      if (this.menus[name]) return false
    }
    return true
  }
}
