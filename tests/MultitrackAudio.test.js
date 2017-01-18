/* eslint no-return-assign: 0 */

import test from 'ava'
import sinon from 'sinon'

import MultitrackAudio from '../src/MultitrackAudio.js'
import { CrossOrigin, MediaReadyState, Preload } from '../src/enums.js'
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
  t.true(Number.isNaN(audio.duration))
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

/**
 * autoplay
 */

test('autoplay accepts any truthy or falsy values', t => {
  parsesAnyValueAsBool(t, audio, 'autoplay')
})

test.todo('autoplay starts playback when canplaythrough is triggered')

/**
 * crossOrigin
 */

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

/**
 * currentTime
 */

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

test('currentTime change triggers `seeking` event', t => {
  const onSeeking = sinon.spy()
  audio.addEventListener('seeking', onSeeking)
  audio.currentTime = 1.23
  t.is(onSeeking.callCount, 1)
})

/**
 * duration
 */

test('duration cannot be set manually', t => {
  audio.duration = 123
  t.true(Number.isNaN(audio.duration))
})

/**
 * error
 */

test('error cannot be set manually', t => {
  audio.error = new Error('this aint right')
  t.is(audio.error, null)
})

/**
 * loop
 */

test('loop accepts any truthy or falsy values', t => {
  parsesAnyValueAsBool(t, audio, 'loop')
})

/**
 * muted
 */

test('muted accepts any truthy or falsy values', t => {
  parsesAnyValueAsBool(t, audio, 'muted')
})

/**
 * paused
 */

test('paused cannot be set manually', t => {
  audio.paused = false
  t.is(audio.paused, true)
})

/**
 * preload
 */

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

test.todo('preload = "none" prevents all preloading')
test.todo('preload = "metadata" only preloads metadata')
test.todo('preload = "auto" preloads as much data as needed to start playback')

/**
 * readyState
 */

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

test.cb('readyState changes triggers corresponding media events', t => {
  t.plan(4)

  const onLoadedMetadata = sinon.spy()
  const onLoadedData = sinon.spy()
  const onCanPlay = sinon.spy()
  const onCanPlayThrough = sinon.spy()

  audio.addEventListener('loadedmetadata', onLoadedMetadata)
  audio.addEventListener('loadeddata', onLoadedData)
  audio.addEventListener('canplay', onCanPlay)
  audio.addEventListener('canplaythrough', onCanPlayThrough)

  audio.addEventListener('readystatechange', () => {
    if (audio.readyState === MediaReadyState.HAVE_METADATA) {
      t.true(onLoadedMetadata.calledOnce)
    }
    else if (audio.readyState === MediaReadyState.HAVE_CURRENT_DATA) {
      t.true(onLoadedData.calledOnce)
    }
    else if (audio.readyState === MediaReadyState.HAVE_FUTURE_DATA) {
      t.true(onCanPlay.calledOnce)
    }
    else if (audio.readyState === MediaReadyState.HAVE_ENOUGH_DATA) {
      t.true(onCanPlayThrough.calledOnce)
      t.end()
    }
  })

  // TODO: Load audio somehow
  audio.load()

  // TODO: This timeout should me more sensible. For now we just kill it.
  setTimeout(() => {
    t.fail('Did not trigger any readystatechange events in time')
    t.end()
  })
})

/**
 * seeking
 */

test('seeking cannot be set manually', t => {
  audio.seeking = true
  t.is(audio.seeking, false)
})

/**
 * volume
 */

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

test('volume changes triggers the `volumechange` event', t => {
  const onVolumeChange = sinon.spy()
  audio.addEventListener('volumechange', onVolumeChange)
  audio.volume = 0.5
  audio.volume = 0.5
  t.is(onVolumeChange.callCount, 1)
  audio.volume = 0.25
  t.is(onVolumeChange.callCount, 2)
})

test.todo('Test TimeRange attributes')
test.todo('The autoplay attribute has precedence over preload')

/*
 * Events
 */

test.todo('Implement and test the event abort')
test.todo('Implement and test the event canplay')
test.todo('Implement and test the event canplaythrough')
test.todo('Implement and test the event durationchange')
test.todo('Implement and test the event ended')
test.todo('Implement and test the event error')
test.todo('Implement and test the event loadeddata')
test.todo('Implement and test the event loadedmetadata')
test.todo('Implement and test the event loadstart')
test.todo('Implement and test the event progress')
test.todo('Implement and test the event ratechange')
test.todo('Implement and test the event seeked')
test.todo('Implement and test the event stalled')
test.todo('Implement and test the event suspend')
test.todo('Implement and test the event timeupdate')
test.todo('Implement and test the event waiting')

/**
 * canPlayType()
 */

test.todo('canPlayType(mimeType) returns the same value as HTMLAudioElement')

/**
 * load()
 */

test.cb('load() resets the audio state to be empty and from start', t => {
  t.plan(4)

  // TODO: Load audio
  audio.play()

  setTimeout(() => {
    audio.load()
    t.is(audio.currentTime, 0)
    t.true(Number.isNaN(audio.duration))
    // t.is(audio.ended, false) ??
    t.is(audio.paused, true)
    t.is(audio.readyState, MediaReadyState.HAVE_NOTHING)
    t.end()
  }, 100)
})

test.todo('load() triggers `loadedmetadata` event')

test('load() triggers `emptied` event', t => {
  const onEmptied = sinon.spy()
  audio.addEventListener('emptied', onEmptied)
  audio.load()
  t.is(onEmptied.callCount, 1)
})

test.todo('load() - How much media data is fetched is still affected by the preload attribute.')

/**
 * pause()
 */

test('pause() triggers `pause` event', t => {
  const onPause = sinon.spy()
  audio.addEventListener('pause', onPause)
  audio.play()
  audio.pause()
  t.is(onPause.callCount, 1)
})

test('pause() stops audio playback', t => {
  // TODO: Load audio from source
  audio.play()
  audio.pause()
  t.is(audio.paused, true)

  t.fail('Check that audio playback in the browser is actually paused')
})

/**
 * play()
 */

test('play() triggers the `play` and/or `playing` events', t => {
  const onPlay = sinon.spy()
  const onPlaying = sinon.spy()

  audio.addEventListener('play', onPlay)
  audio.addEventListener('playing', onPlaying)

  audio.play()
  t.is(onPlaying.callCount, 1)

  audio.pause()
  audio.play()
  t.is(onPlay.callCount, 1)
  t.is(onPlaying.callCount, 2)
})

test.todo('play() does not resolve its promise when no source has been added')
test.todo('play() rejects with a NotSupportedError when trying to play an unsupported audio file')
test.todo('play() resolves when playback starts')

test.todo('Figure out when to throw NotAllowedError')
