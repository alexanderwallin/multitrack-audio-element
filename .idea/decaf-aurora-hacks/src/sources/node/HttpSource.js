import EventEmitter from '../../core/EventEmitter'
import AvBuffer from '../../core/AvBuffer'
import http from 'http'

debugger

class HttpSource extends EventEmitter {
  constructor (url) {
    super()
    this.errorHandler = this.errorHandler.bind(this)
    this.url = url
    this.request = null
    this.response = null

    this.loaded = 0
    this.size = 0

    console.log('this is node http source')
    debugger

  }

  start () {
    if (this.response != null) {
      return this.response.resume()
    }

    this.request = http.get(this.url)
    this.request.on('response', response => {
      this.response = response
      if (this.response.statusCode !== 200) {
        return this.errorHandler(`Error loading file. HTTP status code ${this.response.statusCode}`)
      }

      this.size = parseInt(this.response.headers['content-length'])
      this.loaded = 0

      this.response.on('data', chunk => {
        this.loaded += chunk.length
        this.emit('progress', (this.loaded / this.size) * 100)
        return this.emit('data', new AvBuffer(new Uint8Array(chunk)))
      })

      this.response.on('end', () => {
        return this.emit('end')
      })

      return this.response.on('error', this.errorHandler)
    })

    return this.request.on('error', this.errorHandler)
  }

  pause () {
    return __guard__(this.response, x => x.pause())
  }

  reset () {
    this.pause()
    this.request.abort()
    this.request = null
    return this.response = null
  }

  errorHandler (err) {
    this.reset()
    return this.emit('error', err)
  }
}

export default HttpSource

function __guard__ (value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined
}
