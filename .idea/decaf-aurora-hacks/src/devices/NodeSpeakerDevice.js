import EventEmitter from '../core/EventEmitter'
import AudioDevice from '../AudioDevice'

let Readable, Speaker

class NodeSpeakerDevice extends EventEmitter {
  static initClass () {
    AudioDevice.register(NodeSpeakerDevice)

    try {
      Speaker = require('speaker')
      Readable = require('stream').Readable
    } catch (error) {}

    this.supported = (Speaker != null)
  }

  constructor (sampleRate, channels) {
    super()
    this.refill = this.refill.bind(this)
    this.sampleRate = sampleRate
    this.channels = channels
    this.speaker = new Speaker({
      channels: this.channels,
      sampleRate: this.sampleRate,
      bitDepth: 32,
      float: true,
      signed: true
    })

    this.buffer = null
    this.currentFrame = 0
    this.ended = false

        // setup a node readable stream and pipe to speaker output
    this.input = new Readable()
    this.input._read = this.refill
    this.input.pipe(this.speaker)
  }

  refill (n) {
    let {buffer} = this

    let len = n / 4
    let arr = new Float32Array(len)

    this.emit('refill', arr)
    if (this.ended) { return }

    if (__guard__(buffer, x => x.length) !== n) {
      this.buffer = buffer = new Buffer(n)
    }

        // copy the data from the Float32Array into the node buffer
    let offset = 0
    for (let frame of Array.from(arr)) {
      buffer.writeFloatLE(frame, offset)
      offset += 4
    }

    this.input.push(buffer)
    this.currentFrame += len / this.channels
    return this.currentFrame
  }

  destroy () {
    this.ended = true
    return this.input.push(null)
  }

  getDeviceTime () {
    return this.currentFrame
  }
}
NodeSpeakerDevice.initClass() // TODO: make this more accurate

function __guard__ (value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined
}
