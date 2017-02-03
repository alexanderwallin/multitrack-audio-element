import test from 'ava'
import { spy } from 'sinon'

import MultitrackAudio from '../src/MultitrackAudio.js'

let player
const urls = ['track1.wav', 'track2.wav', 'track3.wav', 'track4.wav']

test.beforeEach(() => {
  player = new MultitrackAudio(urls)
})

test('emits canplaythrough after receiving enough audio', t => {
  const onCanPlayThrough = spy()
  player.addEventListener('canplaythrough', onCanPlayThrough)

  // Feed audio into player in such a rate we know that it should
  // be able to play the file through-and-through

  t.is(onCanPlayThrough.callCount, 1)
})

test('does not emit canplaythrough if one track does not get any audio data', t => {
  const onCanPlayThrough = spy()
  player.addEventListener('canplaythrough', onCanPlayThrough)

  // Feed audio into player in such a rate we know that it should
  // be able to play the file through-and-through, except for one
  // track which is left empty

  t.is(onCanPlayThrough.callCount, 0)
})

test('populates track audio buffers when given decoded auduio chunks', t => {
  const onCanPlayThrough = spy()
  player.addEventListener('canplaythrough', onCanPlayThrough)

  // Feed audio into player

  for (const i in urls) {
    // Assert the track's audio buffer is at leats 4 seconds long
    // (or whatever we want to test)
    t.true(Array.from(player.getSource(i).buffer).filter(x => x !== 0).length > 44100 * 4)
  }
})

test('continues to play seemlessly when seeking to loaded section', t => {
  const onPause = spy()
  player.addEventListener('pause', onPause)

  // Feed lots of audio into the player

  player.play()
  player.currentTime = 10
  t.is(player.paused, false)
  t.is(onPause.callCount, 0)
})

test('pauses when seeking to an empty section', t => {
  const onPause = spy()
  player.addEventListener('pause', onPause)

  // Feed just one second of audio into the player

  player.play()
  player.currentTime = 10
  t.is(player.paused, true)
  t.is(onPause.callCount, 1)
})
