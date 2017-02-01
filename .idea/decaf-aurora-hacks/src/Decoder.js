import EventEmitter from './core/EventEmitter'
import BufferList from './core/BufferList'
import Stream from './core/Stream'
import Bitstream from './core/Bitstream'
import UnderflowError from './core/UnderflowError'

window.UnderflowError = UnderflowError

let codecs
class Decoder extends EventEmitter {
  static initClass () {
    codecs = {}
  }
  constructor (demuxer, format) {
    super()
    this.demuxer = demuxer
    this.format = format
    let list = new BufferList()
    this.stream = new Stream(list)
    this.bitstream = new Bitstream(this.stream)

    this.receivedFinalBuffer = false
    this.waiting = false

    this.demuxer.on('cookie', cookie => {
      try {
        return this.setCookie(cookie)
      } catch (error) {
        return this.emit('error', error)
      }
    })

    this.demuxer.on('data', chunk => {
      list.append(chunk)
      if (this.waiting) { return this.decode() }
    })

    this.demuxer.on('end', () => {
      this.receivedFinalBuffer = true
      if (this.waiting) { return this.decode() }
    })

    this.init()
  }

  init () {

  }

  setCookie (cookie) {

  }

  readChunk () {

  }

  decode () {
    let packet
    this.waiting = !this.receivedFinalBuffer
    let offset = this.bitstream.offset()

    try {
      packet = this.readChunk()
    } catch (error) {
      if (!(error.name === 'UnderflowError')) {
        this.emit('error', error)
        return false
      }
    }


    // if a packet was successfully read, emit it
    if (packet) {
      this.emit('data', packet)
      if (this.receivedFinalBuffer) {
        this.emit('end')
      }
      return true

    // if we haven't reached the end, jump back and try again when we have more data
    } else if (!this.receivedFinalBuffer) {
      this.bitstream.seek(offset)
      this.waiting = true

    // otherwise we've reached the end
    } else {
      this.emit('end')
    }

    return false
  }

  seek (timestamp) {
        // use the demuxer to get a seek point
    let seekPoint = this.demuxer.seek(timestamp)
    this.stream.seek(seekPoint.offset)
    return seekPoint.timestamp
  }
  static register (id, decoder) {
    return codecs[id] = decoder
  }

  static find (id) {
    return codecs[id] || null
  }
}
Decoder.initClass()

export default Decoder
