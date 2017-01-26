//
// The Track class is an adapted version of the Player, intended for use
// in a multitrack scenario. Tracks use a CachingAudioBuffer instead of
// a Queue to cache the audio which is being decoded, making it much easier
// to synchronise multiple tracks

import EventEmitter from './core/EventEmitter'
import Asset from './Asset'
import CachingAudioBuffer from './CachingAudioBuffer'
import AudioDevice from './AudioDevice'

class Player extends EventEmitter {
  constructor (asset, audioContext) {
    super()
    //this.startPlaying = this.startPlaying.bind(this)
    this.asset = asset
    this.loading = false
    this.buffered = 0
    this.currentTime = 0
    this.duration = 0
    this.volume = 100
    this.pan = 0 // -50 for left, 50 for right, 0 for center
    this.metadata = {}
    this.audioContext = audioContext

    this.asset.on('buffer', buffered => {
      this.buffered = buffered
      this.emit('buffer', this.buffered)
    })

    this.asset.on('decodeStart', () => {
      this.cab = new CachingAudioBuffer(this.asset, this.audioContext)
      this.cab.once('ready', this.startPlaying)
    })

    this.asset.on('format', format => {
      this.format = format
      this.emit('format', this.format)
    })

    this.asset.on('metadata', metadata => {
      this.metadata = metadata
      this.emit('metadata', this.metadata)
    })

    this.asset.on('duration', duration => {
      this.duration = duration
      this.emit('duration', this.duration)
    })

    this.asset.on('error', error => {
      this.emit('error', error)
    })
  }

  static fromURL (url, opts, audioContext) {
    return new Player(Asset.fromURL(url, opts), audioContext)
  }

  preload () {
    if (!this.asset) { return }

    this.startedPreloading = true
    this.asset.start(false)
  }

  load () {
    if (this.loading) { return }

    if (!this.startedPreloading) {
      this.preload()
    }
  }

  play () {
    const source = this.audioContext.createBufferSource()
    source.buffer = this.cab.audioBuffer
    source.connect(this.audioContext.destination)
    source.start(0)
  }

  togglePlayback () {
    if (this.loading) {
      this.pause()
    } else {
      this.play()
    }
  }

  pauseSource () {
    this.asset.source.pause()
  }

  stop () {
    this.asset.stop()
    __guard__(this.device, x => x.destroy())
  }

  destroy () {
    this.stop()
    __guard__(this.asset, x1 => x1.destroy())
    this.off()
  }
}

export default Player

function __guard__ (value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined
}
