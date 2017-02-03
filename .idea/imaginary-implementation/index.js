import { MultitrackAudio, Preload } from 'multitrack-audio-element'
import { downsample } from './downsample.js'
import { Mixer } from './mixer.js'

const ctx = new AudioContext()
const waveformData = []

// Create and configure a multitrack audio object
const song = new MultitrackAudio()
song.autoplay = false
song.loop = true
song.volume = 0.7

// Listen for errors
song.addEventListener('error', (evt) => console.error(evt.details.error)) // ?

// Add sources
//
// NOTE: Distinguish between single multitrack files and multiple track files
// NOTE: Mime and codec is unnecessary and already taken care of by Demuxer
song.addSource('track1.mp4')
song.addSource('track2.mp4')
song.addSource('track3.mp4')
song.addSource('track4.mp4')

// Listen for meta
song.addEventListener('loadedmetadata', () => {
  console.log('got metadata, song duration is:', song.duration)
})

// Listen for audio being loaded and make a waveform from it
song.addEventListener('decodedaudio', (evt) => {
  const { trackIndex, startSample, endSample, data } = evt.detail
  // Do something...
  // waveformData[trackIndex].writeWaveFormDataAt(startSample, downsample(data))
})

// Play as soon as we have enough data
song.addEventListener('canplaythrough', () => {
  song.play()
})

/**
 * Preloading
 */

// Load sources manually
song.preload = Preload.NONE
song.load()

// Preload automatically
song.preload = Preload.AUTO

// Preload metadata only
song.preload = Preload.METADATA
song.load() // Load tracks

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

// Create a (ficticious) mixer
const mixer = new Mixer(ctx)
mixer.setNumberOfChannels(4)

// Connect the first three tracks to the main output
song.connect(0, mixer.getChannelStrip(0))
song.connect(1, mixer.getChannelStrip(1))
song.connect(2, mixer.getChannelStrip(2))

mixer.setVolume(0, 0.5)

// Pipe track 4 through a high-pass filter
const track1Node = song.getSourceNode(3)

const hpf = ctx.createBiquadFilter()
hpf.type = 'highpass'
hpf.frequency = 1000

track1Node.connect(hpf)
hpf.connect(mixer.getChannelStrip(3))
