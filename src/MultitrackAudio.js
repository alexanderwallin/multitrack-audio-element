import EventEmitter from 'eventemitter3'

import './CustomEvent.shim.js'

import { CrossOrigin, MediaReadyState, Preload, MediaEventType } from './enums.js'

/**
 * MultitrackAudio class
 *
 * This essentially acts as Audio|HTMLAudioElement, with the addition of synchronized
 * multitrack support.
 */
export default class MultitrackAudio {

  /*
   * Properties
   */

  /**
   * A Boolean attribute; if specified (even if the value is "false"!), the audio will
   * automatically begin playback as soon as it can do so, without waiting for the entire
   * audio file to finish downloading.
   *
   * @type {Boolean}
   */
  _autoplay = false

  get autoplay() {
    return this._autoplay
  }

  set autoplay(autoplay) {
    this._autoplay = Boolean(autoplay)
  }

  /**
   * A string indicating the CORS setting for this audio element.
   *
   * @type {String}
   */
  _crossOrigin = CrossOrigin.ANONYMOUS

  get crossOrigin() {
    return this._crossOrigin
  }

  set crossOrigin(crossOrigin) {
    if (crossOrigin === CrossOrigin.USE_CREDENTIALS) {
      this._crossOrigin = crossOrigin
    }
    else {
      this._crossOrigin = CrossOrigin.ANONYMOUS
    }
  }

  /**
   * A double indicating the current playback time in seconds. Setting this value seeks
   * the audio to the new time.
   *
   * @type {Number}
   */
  _currentTime = 0

  get currentTime() {
    return this._currentTime
  }

  set currentTime(currentTime) {
    const parsedTime = Number(currentTime)

    if (Number.isFinite(parsedTime) && this._currentTime !== parsedTime) {
      this._currentTime = parsedTime
      this.__eventEmitter.emit(MediaEventType.SEEKING, new CustomEvent(MediaEventType.SEEKING))
    }
    else {
      throw new TypeError(
        `Failed to set the 'currentTime' property on 'MultitrackAudio': `
        + `The provided double value (${currentTime}) is non-finite.`
      )
    }
  }

  /**
   * A double indicating the length of the media in seconds, or 0 if no media data is
   * available.
   *
   * @type {Number}
   */
  _duration = NaN

  get duration() {
    return this._duration
  }

  set duration(duration) {}

  /**
   * A Boolean that indicates whether the audio element has finished playing.
   *
   * @type {Boolean}
   */
  _ended = false

  get ended() {
    return this._ended
  }

  set ended(ended) {}

  /**
   * A MediaError object for the most recent error, or null if there has not been an error.
   *
   * @type {MediaError}
   */
  _error = null

  get error() {
    return this._error
  }

  set error(error) {}

  /**
   * A Boolean attribute; if specified, will automatically seek back to the start upon
   * reaching the end of the audio.
   *
   * @type {Boolean}
   */
  _loop = false

  get loop() {
    return this._loop
  }

  set loop(loop) {
    this._loop = Boolean(loop)
  }

  /**
   * A Boolean attribute which indicates whether the audio will be initially silenced.
   * Its default value is false.
   *
   * @type {Boolean}
   */
  _muted = false

  get muted() {
    return this._muted
  }

  set muted(muted) {
    this._muted = Boolean(muted)
  }

  /**
   * A Boolean that indicates whether the audio element is paused.
   *
   * @type {Boolean}
   */
  _paused = true

  get paused() {
    return this._paused
  }

  set paused(paused) {}

  /**
   * This enumerated attribute is intended to provide a hint to the browser about what
   * the author thinks will lead to the best user experience. It may have one of the
   * following values:
   *
   *   - none: indicates that the audio should not be preloaded;
   *   - metadata: indicates that only audio metadata (e.g. length) is fetched;
   *   - auto: indicates that the whole audio file could be downloaded, even if the user
   *     is not expected to use it;
   *   - the empty string: synonym of the auto value.
   *
   * @type {String}
   */
  _preload = Preload.AUTO

  get preload() {
    return this._preload
  }

  set preload(preload) {
    switch (preload) {
      case Preload.NONE:
      case Preload.METADATA:
      case Preload.AUTO:
        this._preload = preload
        break

      case Preload.EMPTY:
      default:
        this._preload = Preload.AUTO
    }
  }

  /**
   * An (enum) string indicating the readiness state of the audio.
   *
   * @type {Number}
   */
  _readyState = MediaReadyState.HAVE_NOTHING

  get readyState() {
    return this._readyState
  }

  set readyState(readyState) {}

  /**
   * A Boolean that indicates whether the audio is in the process of seeking to a new
   * position.
   *
   * @type {Boolean}
   */
  _seeking = false

  get seeking() {
    return this._seeking
  }

  set seeking(seeking) {}

  /**
   * The URL of a single audio media source file to embed.
   *
   * @type {String}
   */
  _src = ''

  get src() {
    return this._src
  }

  set src(src) {
    this._src = typeof src === 'string'
      ? src
      : ''
  }

  /**
   * The playback volume, in the range 0.0 (silent) to 1.0 (loudest).
   *
   * @type {Number}
   * @throws {RangeError}
   */
  _volume = 1

  get volume() {
    return this._volume
  }

  set volume(volume) {
    if (volume < 0 || volume > 1) {
      throw new RangeError(
        `Failed to set the 'volume' property on 'MultitrackAudio': `
        + `The volume provided (${volume}) is outside the range [0, 1]`
      )
    }
    else if (this._volume !== volume) {
      this._volume = volume
      this.__eventEmitter.emit(MediaEventType.VOLUMECHANGE, new CustomEvent(MediaEventType.VOLUMECHANGE))
    }
  }

  /**
   * Constructor
   *
   * @constructor
   */
  constructor() {

    // Internal event emitter
    this.__eventEmitter = new EventEmitter()

    // Whether or not the audio has been paused
    this._hasPaused = false
  }

  /*
   * Methods
   */

  /**
   *
   *
   * @param {String}   eventName [description]
   * @param {Function} handler   [description]
   */
  addEventListener(eventName, handler) {
    this.__eventEmitter.addListener(eventName, handler)
  }

  /**
   *
   *
   * @param  {String}   eventName [description]
   * @param  {Function} handler   [description]
   */
  removeEventListener(eventName, handler) {
    this.__eventEmitter.removeListener(eventName, handler)
  }

  /**
   * Resets the audio element and restarts the audio resource. Any pending events are
   * discarded. How much audio data is fetched is still affected by the preload attribute.
   * This method can be useful for releasing resources after any src attribute and source
   * element descendants have been removed. Otherwise, it is usually unnecessary to use
   * this method, unless required to rescan source element children after dynamic changes.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement
   */
  load() {
    this.__eventEmitter.emit(MediaEventType.EMPTIED, new CustomEvent(MediaEventType.EMPTIED))
  }

  /**
   * Pauses the audio playback.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/pause
   */
  pause() {
    if (this._paused === false) {
      this._paused = true
      this._hasPaused = true
      this.__eventEmitter.emit(MediaEventType.PAUSE, new CustomEvent(MediaEventType.PAUSE))
    }
  }

  /**
   * Begins playback of the audio.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play
   *
   * @return {Promise} Resolves if playback successfully begun, rejects with an error
   *                   if beginning playback failed.
   */
  play() {
    if (this._paused === true) {
      // TODO: Actually play audio
      this._paused = false
      this.__eventEmitter.emit(MediaEventType.PLAYING, new CustomEvent(MediaEventType.PLAYING))

      if (this._hasPaused === true) {
        this.__eventEmitter.emit(MediaEventType.PLAY, new CustomEvent(MediaEventType.PLAY))
      }
    }
  }
}
