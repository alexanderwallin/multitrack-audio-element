import test from 'ava'

import MultitrackAudio from '../src/MultitrackAudio.js'

let audio

test.beforeEach(() => {
  audio = new MultitrackAudio()
})

test('Defaults are correct', t => {
  t.is(audio.autoplay, false)
  // t.is(audio.buffered, null)
  t.is(audio.loop, false)
  t.is(audio.muted, false)
  // t.is(audio.played, null)
  t.is(audio.preload, 'auto')
  t.is(audio.volume, 1)
})

test.todo('Test TimeRange attributes')

test('Rejects non-supported preload values', t => {
  audio.preload = 'shenanigans'
  t.is(audio.preload, 'auto')
})

test('The autoplay attribute has precedence over preload', t => {
  t.fail()
})
