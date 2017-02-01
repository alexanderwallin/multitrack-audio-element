import Base from './Base'

class EventEmitter extends Base {
  on (event, fn) {
    if (this.events == null) { this.events = {} }
    if (this.events[event] == null) { this.events[event] = [] }
    return this.events[event].push(fn)
  }

  off (event, fn) {
    if (this.events == null) { return }
    if (__guard__(this.events, x => x[event])) {
      if (fn != null) {
        let index = this.events[event].indexOf(fn)
        if (~index) { return this.events[event].splice(index, 1) }
      } else {
        return this.events[event]
      }
    } else if (event == null) {
      let events
      return events = {}
    }
  }

  once (event, fn) {
    let cb
    return this.on(event, cb = function () {
      this.off(event, cb)
      return fn.apply(this, arguments)
    })
  }

  emit (event, ...args) {
    if (!__guard__(this.events, x => x[event])) { return }

        // shallow clone with .slice() so that removing a handler
        // while event is firing (as in once) doesn't cause errors
    for (let fn of Array.from(this.events[event].slice())) {
      fn.apply(this, args)
    }
  }
}

export default EventEmitter

function __guard__ (value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined
}
