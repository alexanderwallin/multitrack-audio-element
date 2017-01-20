//
// The AudioDevice class is responsible for interfacing with various audio
// APIs in browsers, and for keeping track of the current playback time
// based on the device hardware time and the play/pause/seek state
//

import EventEmitter from './core/EventEmitter'

let devices
class AudioDevice extends EventEmitter {
  static initClass () {
    devices = []
  }
  constructor (sampleRate, channels) {
    super()
    this.updateTime = this.updateTime.bind(this)
    this.sampleRate = sampleRate
    this.channels = channels
    this.playing = false
    this.currentTime = 0
    this._lastTime = 0
  }

  start () {
    if (this.playing) { return }
    this.playing = true

    if (this.device == null) { this.device = AudioDevice.create(this.sampleRate, this.channels) }
    if (!this.device) {
      throw new Error('No supported audio device found.')
    }

    this._lastTime = this.device.getDeviceTime()

    this._timer = setInterval(this.updateTime, 200)
    return this.device.on('refill', this.refill = buffer => {
      return this.emit('refill', buffer)
    }
        )
  }

  stop () {
    if (!this.playing) { return }
    this.playing = false

    this.device.off('refill', this.refill)
    return clearInterval(this._timer)
  }

  destroy () {
    this.stop()
    return __guard__(this.device, x => x.destroy())
  }

  seek (currentTime) {
    this.currentTime = currentTime
    if (this.playing) { this._lastTime = this.device.getDeviceTime() }
    return this.emit('timeUpdate', this.currentTime)
  }

  updateTime () {
    let time = this.device.getDeviceTime()
    this.currentTime += (((time - this._lastTime) / this.device.sampleRate) * 1000) | 0
    this._lastTime = time
    return this.emit('timeUpdate', this.currentTime)
  }
  static register (device) {
    return devices.push(device)
  }

  static create (sampleRate, channels) {
    for (let device of Array.from(devices)) {
      if (device.supported) {
        return new device(sampleRate, channels)
      }
    }

    return null
  }
}
AudioDevice.initClass()

export default AudioDevice

function __guard__ (value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined
}
