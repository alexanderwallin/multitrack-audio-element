//
// The CachingAudioBuffer listens to the data being
// decoded by an asset, and caches it in a Web Audio
// AudioBuffer object. It maintains a property
// 'secondsOfAudio' which can be inspected to see
// how many seconds of audio it contains

import EventEmitter from './core/EventEmitter'

class CachingAudioBuffer extends EventEmitter {
  constructor (asset, audioContext) {
    super()
    this.write = this.write.bind(this)
    this.asset = asset
    this.finished = false
    this.ended = false
    this.format = this.asset.format
    this.sharedAudioContext = audioContext

    this.asset.on('data', this.write)
    this.asset.on('end', () => {
      return this.ended = true
    })

    this.totalBufferLength = 0

    this.asset.on('duration', duration => {
      this.duration = duration
    })

    this.asset.decodePacket()
  }

  _initialiseAudioBuffer () {
    if (this.audioBuffer) { return }
    const context = this.context = this.sharedAudioContext || new AudioContext()
    const channelCount = this.format.channelsPerFrame
    // TODO : for mp3 the duration is not always set beforehand, so
    // we need to figure out how to deal with this
    const duration = this.duration || 60
    this.audioBuffer = context.createBuffer(
      channelCount,
      Math.round(this.format.sampleRate * duration / 1000),
      this.format.sampleRate
    )

    this.channels = new Array(channelCount)
    for (let i = 0; i < channelCount; i++) {
      this.channels[i] = this.audioBuffer.getChannelData(i)
    }

    this.audioBufferWritePosition = 0
  }

  write (buffer) {
    this._initialiseAudioBuffer()
    let channelCount = this.format.channelsPerFrame
    const start = this.audioBufferWritePosition
    const delta = Math.round(buffer.length / channelCount)

    const channelAndPosition = (p) => {
      return [p % channelCount, Math.floor(p / channelCount)]
    }

    for (let i = 0; i < buffer.length; i++) {
      let [channel, position] = channelAndPosition(this.audioBufferWritePosition)
      this.channels[channel][position] = buffer[i]
      this.audioBufferWritePosition++
    }

    this.asset.decodePacket()
  }

  reset () {
    this.asset.decodePacket()
  }
}

export default CachingAudioBuffer
