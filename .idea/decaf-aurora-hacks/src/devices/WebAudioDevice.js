import EventEmitter from '../core/EventEmitter'
import AudioDevice from '../AudioDevice'
import Resampler from './Resampler'

let AudioContext
let sharedContext
class WebAudioDevice extends EventEmitter {
  static initClass () {
    AudioDevice.register(WebAudioDevice)

        // determine whether this device is supported by the browser
    AudioContext = global.AudioContext || global.webkitAudioContext

    this.supported = AudioContext && AudioContext.prototype.createScriptProcessor

        // Chrome limits the number of AudioContexts that one can create,
        // so use a lazily created shared context for all playback
    sharedContext = null
  }

  constructor (sampleRate, channels) {
    super()
    this.refill = this.refill.bind(this)
    this.sampleRate = sampleRate
    this.channels = channels
    this.context = sharedContext != null ? sharedContext : (sharedContext = new AudioContext())
    this.deviceSampleRate = this.context.sampleRate

        // calculate the buffer size to read
    this.bufferSize = Math.ceil((4096 / (this.deviceSampleRate / this.sampleRate)) * this.channels)
    this.bufferSize += this.bufferSize % this.channels

        // if the sample rate doesn't match the hardware sample rate, create a resampler
    if (this.deviceSampleRate !== this.sampleRate) {
      this.resampler = new Resampler(this.sampleRate, this.deviceSampleRate, this.channels, this.bufferSize)
    }

    this.node = this.context.createScriptProcessor(4096, this.channels, this.channels)
    this.node.onaudioprocess = this.refill
    this.node.connect(this.context.destination)
  }

  refill (event) {
    let i
    let { outputBuffer } = event
    let channelCount = outputBuffer.numberOfChannels
    let channels = new Array(channelCount)

    // get output channels
    for (i = 0, end = channelCount; i < end; i++) {
      var end
      channels[i] = outputBuffer.getChannelData(i)
    }

    // get audio data
    let data = new Float32Array(this.bufferSize)
    this.emit('refill', data)

    // resample if necessary
    if (this.resampler) {
      data = this.resampler.resampler(data)
    }

    // write data to output
    for (i = 0, end1 = outputBuffer.length; i < end1; i++) {
      var end1
      for (let n = 0, end2 = channelCount; n < end2; n++) {
        channels[n][i] = data[(i * channelCount) + n]
      }
    }
  }

  destroy () {
    return this.node.disconnect(0)
  }

  getDeviceTime () {
    return this.context.currentTime * this.sampleRate
  }
}
WebAudioDevice.initClass()
