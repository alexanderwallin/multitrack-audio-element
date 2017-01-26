// The MultitrackPlayer manages the loading and playback of
// multiple synchronised tracks

import Track from './Track'

class MultitrackPlayer {
  constructor (urls, audioContext) {
    this.audioContext = audioContext || new AudioContext()
    this.tracks = urls.map((url) => Track.fromURL(url, null, this.audioContext))
    for (let track of this.tracks) {
      track.load()
    }
  }

  play () {
    this.sources = this.tracks.map((track) => {
      const source = this.audioContext.createBufferSource()
      source.buffer = track.cab.audioBuffer
      source.connect(this.audioContext.destination)
      return source
    })

    for (let source of this.sources){
      source.start(0)
    }
  }

  stop () {
    if (!this.sources) { return }
    for (let source of this.sources) {
      source.stop()
    }
    delete this.sources
  }
}

export default MultitrackPlayer
