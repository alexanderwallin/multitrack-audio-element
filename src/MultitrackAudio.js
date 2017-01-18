import values from 'lodash.values'

/**
 * `preload` attribute enum
 */
const Preload = {
  NONE: 'none',
  METADATA: 'metadata',
  AUTO: 'auto',
  EMPTY: '',
}

/**
 * MultitrackAudio class
 *
 * This essentially acts as Audio|HTMLAudioElement, with the addition of synchronized
 * multitrack support.
 */
export default class MultitrackAudio {

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
   * @throws RangeError
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
    else {
      this._volume = volume
    }
  }
}
