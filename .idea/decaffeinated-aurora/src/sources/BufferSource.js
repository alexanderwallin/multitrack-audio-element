import EventEmitter from '../core/EventEmitter'
import BufferList from '../core/BufferList'
import AvBuffer from '../core/AvBuffer'

let setImmediate
let clearImmediate
class BufferSource extends EventEmitter {
  static initClass () {
    setImmediate = global.setImmediate || (fn => global.setTimeout(fn, 0))

    clearImmediate = global.clearImmediate || (timer => global.clearTimeout(timer))
  }
  constructor (input) {
    super()
        // Now make an AV.BufferList
    this.loop = this.loop.bind(this)
    if (input instanceof BufferList) {
      this.list = input
    } else {
      this.list = new BufferList()
      this.list.append(new AvBuffer(input))
    }

    this.paused = true
  }

  start () {
    this.paused = false
    this._timer = setImmediate(this.loop)
  }

  loop () {
    this.emit('progress', ((((this.list.numBuffers - this.list.availableBuffers) + 1) / this.list.numBuffers) * 100) | 0)
    this.emit('data', this.list.first)
    if (this.list.advance()) {
      setImmediate(this.loop)
    } else {
      this.emit('end')
    }
  }

  pause () {
    clearImmediate(this._timer)
    this.paused = true
  }

  reset () {
    this.pause()
    this.list.rewind()
  }
}
BufferSource.initClass()

export default BufferSource
