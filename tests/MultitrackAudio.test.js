import test from 'ava'

import MultitrackAudio from '../src/MultitrackAudio.js'

let audio

test.beforeEach(() => {
  audio = new MultitrackAudio()
})

const parsesAnyValueAsBool = (t, target, attributeName) => {
  target[attributeName] = false
  target[attributeName] = 'cats in space'
  t.is(target[attributeName], true)

  target[attributeName] = false
  target[attributeName] = 1
  t.is(target[attributeName], true)

  target[attributeName] = false
  target[attributeName] = () => {}
  t.is(target[attributeName], true)

  target[attributeName] = true
  target[attributeName] = ''
  t.is(target[attributeName], false)

  target[attributeName] = true
  target[attributeName] = 0
  t.is(target[attributeName], false)

  target[attributeName] = true
  target[attributeName] = null
  t.is(target[attributeName], false)
}

test('Defaults are correct', t => {
  t.is(audio.autoplay, false)
  // t.is(audio.buffered, null)
  // t.is(audio.controls, false)
  t.is(audio.loop, false)
  t.is(audio.muted, false)
  // t.is(audio.played, null)
  t.is(audio.preload, 'auto')
  t.is(audio.src, '')
  t.is(audio.volume, 1)
})

test('Throws a RangeError when volumes is outside the range [0, 1]', t => {
  const originalVolume = audio.volume

  const subzeroError = t.throws(() => {
    audio.volume = -1
  }, RangeError)
  t.truthy(subzeroError)
  t.is(audio.volume, originalVolume)

  const gtOneError = t.throws(() => {
    audio.volume = 1.01
  }, RangeError)
  t.truthy(gtOneError)
  t.is(audio.volume, originalVolume)
})

test('autoplay accepts any truthy or falsy values', t => {
  parsesAnyValueAsBool(t, audio, 'autoplay')
})

test('loop accepts any truthy or falsy values', t => {
  parsesAnyValueAsBool(t, audio, 'loop')
})

test('muted accepts any truthy or falsy values', t => {
  parsesAnyValueAsBool(t, audio, 'muted')
})

test('preload defaults to "auto" when given a non-supported value', t => {
  audio.preload = 'shenanigans'
  t.is(audio.preload, 'auto')
  audio.preload = false
  t.is(audio.preload, 'auto')
  audio.preload = 1
  t.is(audio.preload, 'auto')
  audio.preload = () => {}
  t.is(audio.preload, 'auto')
})

test.todo('Test TimeRange attributes')

test.todo('The autoplay attribute has precedence over preload')
