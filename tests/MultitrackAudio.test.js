/* eslint no-return-assign: 0 */

import test from 'ava'

import MultitrackAudio, { CrossOrigin, MediaReadyState, Preload } from '../src/MultitrackAudio.js'
import { parsesAnyValueAsBool } from './_test-utils.js'

let audio

test.beforeEach(() => {
  audio = new MultitrackAudio()
})

/*
 * Attributes
 */

test('Defaults are correct', t => {
  t.is(audio.autoplay, false)
  t.is(audio.crossOrigin, CrossOrigin.ANONYMOUS)
  t.is(audio.currentTime, 0)
  t.is(audio.duration, NaN)
  t.is(audio.ended, false)
  t.is(audio.error, null)
  t.is(audio.loop, false)
  t.is(audio.muted, false)
  t.is(audio.paused, true)
  t.is(audio.preload, Preload.AUTO)
  t.is(audio.readyState, MediaReadyState.HAVE_NOTHING)
  t.is(audio.src, '')
  t.is(audio.seeking, false)
  t.is(audio.volume, 1)
})

test.todo('Implement and test property audioTracks')
test.todo('Implement and test property buffered')
test.todo('Implement and test property controller')
test.todo('Implement and test property controls')
test.todo('Implement and test property currentSrc')
test.todo('Implement and test property defaultMuted')
test.todo('Implement and test property defaultPlaybackRate')
test.todo('Implement and test property defaultRemotePlayback')
test.todo('Implement and test property networkState')
test.todo('Implement and test property playbackRate')
test.todo('Implement and test property played')
test.todo('Implement and test property seekable')
test.todo('Implement and test property srcObject')

test('autoplay accepts any truthy or falsy values', t => {
  parsesAnyValueAsBool(t, audio, 'autoplay')
})

test('crossOrigin is either use-credentials or the default anonymous', t => {
  audio.crossOrigin = 'let me in'
  t.is(audio.crossOrigin, CrossOrigin.ANONYMOUS)
  audio.crossOrigin = null
  t.is(audio.crossOrigin, CrossOrigin.ANONYMOUS)
  audio.crossOrigin = 123
  t.is(audio.crossOrigin, CrossOrigin.ANONYMOUS)
  audio.crossOrigin = () => {}
  t.is(audio.crossOrigin, CrossOrigin.ANONYMOUS)

  audio.crossOrigin = CrossOrigin.USE_CREDENTIALS
  t.is(audio.crossOrigin, CrossOrigin.USE_CREDENTIALS)
})

test('currentTime converts all non-finite values to a number', t => {
  audio.currentTime = 123
  t.is(audio.currentTime, 123)
  audio.currentTime = 1.23
  t.is(audio.currentTime, 1.23)
  audio.currentTime = -234
  t.is(audio.currentTime, -234)
  audio.currentTime = null
  t.is(audio.currentTime, 0)
  audio.currentTime = '321'
  t.is(audio.currentTime, 321)
  audio.currentTime = []
  t.is(audio.currentTime, 0)
  audio.currentTime = true
  t.is(audio.currentTime, 1)
  audio.currentTime = false
  t.is(audio.currentTime, 0)
})

test('currentTime throws a TypeError when set to a non-finite value', t => {
  let err1 = t.throws(() => audio.currentTime = Infinity, TypeError)
  t.truthy(err1)

  let err2 = t.throws(() => audio.currentTime = () => {}, TypeError)
  t.truthy(err2)

  let err3 = t.throws(() => audio.currentTime = {}, TypeError)
  t.truthy(err3)

  let err4 = t.throws(() => audio.currentTime = 'not a number mate', TypeError)
  t.truthy(err4)

  let err5 = t.throws(() => audio.currentTime = NaN, TypeError)
  t.truthy(err5)
})

test('duration cannot be set manually', t => {
  audio.duration = 123
  t.is(audio.duration, NaN)
})

test('error cannot be set manually', t => {
  audio.error = new Error('this aint right')
  t.is(audio.error, NaN)
})

test('loop accepts any truthy or falsy values', t => {
  parsesAnyValueAsBool(t, audio, 'loop')
})

test('muted accepts any truthy or falsy values', t => {
  parsesAnyValueAsBool(t, audio, 'muted')
})

test('paused cannot be set manually', t => {
  audio.paused = false
  t.is(audio.paused, true)
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

test('readyState cannot be set manually', t => {
  audio.readyState = MediaReadyState.HAVE_METADATA
  t.is(audio.readyState, MediaReadyState.HAVE_NOTHING)
  audio.readyState = MediaReadyState.HAVE_CURRENT_DATA
  t.is(audio.readyState, MediaReadyState.HAVE_NOTHING)
  audio.readyState = MediaReadyState.HAVE_FUTURE_DATA
  t.is(audio.readyState, MediaReadyState.HAVE_NOTHING)
  audio.readyState = MediaReadyState.HAVE_ENOUGH_DATA
  t.is(audio.readyState, MediaReadyState.HAVE_NOTHING)
})

test('seeking cannot be set manually', t => {
  audio.seeking = true
  t.is(audio.seeking, false)
})

test('volume throws a RangeError when given value is outside the range [0, 1]', t => {
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

test.todo('Test TimeRange attributes')
test.todo('The autoplay attribute has precedence over preload')
