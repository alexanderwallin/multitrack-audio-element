import { MultitrackAudio } from 'multitrack-audio-element'
import { downsample } from './downsample.js'

const ctx = new AudioContext()
const mimeCodec = 'audio/mp4; codecs="mp4a.40.2"'
const waveformData = []

if (!MultitrackAudio.canPlayType(mimeCodec)) {
  throw new Error(`Unsupported media type: ${mimeCodec}`)
}

// Create and configure a multitrack audio object
const song = new MultitrackAudio()
song.autoplay = false
song.loop = true
song.volume = 0.7

// Listen for errors
song.addEventListener('error', (evt) => console.error(evt.details.error)) // ?

// Add sources
song.addSource('track1.mp4', mimeCodec)
song.addSource('track2.mp4', mimeCodec)
song.addSource('track3.mp4', mimeCodec)
song.addSource('track4.mp4', mimeCodec)

// Listen for meta
song.addEventListener('loadedmetadata', () => {
  console.log('got metadata, song duration is:', song.duration)
})

// Listen for audio being loaded and make a waveform from it
//
// This is obviously extremely simplified.
//
// Should there be a `decodeddata` event or something similar? In this
// case you would have to decode the data again, which is already solved
// inside MultitrackAudio.
song.addEventListener('loadeddata', (evt) => {
  waveformData.push(downsample(evt.details.data))
})

// Play as soon as we have enough data
song.addEventListener('canplaythrough', () => {
  song.play()
})

// Load sources
song.load()

// Perform seeking
song.addEventListener('seeking', () => console.log(`seeking to: ${song.currentTime}`))
song.addEventListener('seeked', () => console.log(`seeked to: ${song.currentTime}`))
song.currentTime = 20.384

// Pause when clicking pause button
document.querySelector('.pause-button').addEventListener('click', () => {
  song.pause()
  console.log(song.paused) // => true
})

/**
 * Web Audio API
 */

// Connect the first three tracks to the main output
song.connect(1, ctx.destination)
song.connect(2, ctx.destination)
song.connect(3, ctx.destination)

// Pipe track 4 through a high-pass filter
const track1Node = song.getSourceNode(4)

const hpf = ctx.createBiquadFilter()
hpf.type = 'highpass'
hpf.frequency = 1000

track1Node.connect(hpf)
hpf.connect(ctx.destination)
