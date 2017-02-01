import EventEmitter from '../../core/EventEmitter'
import AvBuffer from '../../core/AvBuffer'

class HttpSource extends EventEmitter {
  constructor (url, opts) {

    super()
    this.url = url
    if (opts == null) { opts = {} }
    this.opts = opts
    this.chunkSize = 1 << 20
    //this.chunkSize = 4096 * 4


    this.inflight = false
    if (this.opts.length) {
      this.length = this.opts.length
    }
    this.reset()
  }

  start () {
    if (this.length) {
      if (!this.inflight) { return this.loop() }
    }

    this.inflight = true
    this.xhr = new XMLHttpRequest()

    this.xhr.onload = event => {
      this.length = parseInt(this.xhr.getResponseHeader('Content-Length'))
      this.inflight = false
      return this.loop()
    }

    this.xhr.onerror = err => {
      this.pause()
      return this.emit('error', err)
    }

    this.xhr.onabort = event => {
      return this.inflight = false
    }

    this.xhr.open('HEAD', this.url, true)
    return this.xhr.send(null)
  }

  loop () {
    if (this.inflight || !this.length) {
      return this.emit('error', 'Something is wrong in HttpSource.loop')
    }

    this.inflight = true
    this.xhr = new XMLHttpRequest()

    this.xhr.onload = event => {
      let buf
      if (this.xhr.response) {
        buf = new Uint8Array(this.xhr.response)
      } else {
        let txt = this.xhr.responseText
        buf = new Uint8Array(txt.length)
        for (let i = 0, end = txt.length, asc = end >= 0; asc ? i < end : i > end; asc ? i++ : i--) {
          buf[i] = txt.charCodeAt(i) & 0xff
        }
      }

      let buffer = new AvBuffer(buf)
      this.offset += buffer.length

      this.emit('data', buffer)
      if (this.offset >= this.length) { this.emit('end') }

      this.inflight = false
      if (this.offset < this.length) { return this.loop() }
    }

    this.xhr.onprogress = event => {
      return this.emit('progress', ((this.offset + event.loaded) / this.length) * 100)
    }

    this.xhr.onerror = err => {
      this.emit('error', err)
      return this.pause()
    }

    this.xhr.onabort = event => {
      return this.inflight = false
    }

    this.xhr.open('GET', this.url, true)
    this.xhr.responseType = 'arraybuffer'

    let endPos = Math.min(this.offset + this.chunkSize, this.length - 1)
    this.xhr.setRequestHeader('If-None-Match', 'webkit-no-cache')
    this.xhr.setRequestHeader('Range', `bytes=${this.offset}-${endPos}`)
    this.xhr.overrideMimeType('text/plain; charset=x-user-defined')
    return this.xhr.send(null)
  }

  pause () {
    this.inflight = false
    return __guard__(this.xhr, x => x.abort())
  }

  reset () {
    this.pause()
    return this.offset = 0
  }
}

export default HttpSource

function __guard__ (value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined
}
