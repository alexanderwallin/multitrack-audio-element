/**
 * `crossOrigin` attribute enum
 *
 * @type {Object}
 */
export const CrossOrigin = {
  ANONYMOUS: 'anonymous',
  USE_CREDENTIALS: 'use-credentials',
}

/**
 * `readyState` values
 *
 * @type {Object}
 */
export const MediaReadyState = {

  // No information is available about the media resource.
  HAVE_NOTHING: 0,

  // Enough of the media resource has been retrieved that the metadata attributes are
  // initialized. Seeking will no longer raise an exception.
  HAVE_METADATA: 1,

  // Data is available for the current playback position, but not enough to actually play
  // more than one frame.
  HAVE_CURRENT_DATA: 2,

  // Data for the current playback position as well as for at least a little bit of time
  // into the future is available (in other words, at least two frames of video, for example).
  HAVE_FUTURE_DATA: 3,

  // Enough data is available and the download rate is high enough that the media can be
  // played through to the end without interruption.
  HAVE_ENOUGH_DATA: 4,
}

/**
 * `preload` attribute enum
 *
 * @type {Object}
 */
export const Preload = {
  NONE: 'none',
  METADATA: 'metadata',
  AUTO: 'auto',
  EMPTY: '',
}

/**
 * Media event types
 *
 * @type {Object}
 */
export const MediaEventType = {

  // Sent when playback is aborted; for example, if the media is playing and is restarted from
  // the beginning, this event is sent.
  ABORT: 'abort',

  // Sent when enough data is available that the media can be played, at least for a couple of
  // frames.  This corresponds to the HAVE_ENOUGH_DATA readyState.
  CANPLAY: 'canplay',

  //  Sent when the ready state changes to CAN_PLAY_THROUGH, indicating that the entire media
  //  can be played without interruption, assuming the download rate remains at least at the
  //  current level. It will also be fired when playback is toggled between paused and playing.
  //  Note: Manually setting the currentTime will eventually fire a canplaythrough event in
  //  firefox. Other browsers might not fire this event.
  CANPLAYTHROUGH: 'canplaythrough',

  //  The metadata has loaded or changed, indicating a change in duration of the media.  This
  //  is sent, for example, when the media has loaded enough that the duration is known.
  DURATIONCHANGE: 'durationchange',

  // The media has become empty; for example, this event is sent if the media has already been
  // loaded (or partially loaded), and the load() method is called to reload it.
  EMPTIED: 'emptied',

  // Sent when playback completes.
  ENDED: 'ended',

  // Sent when an error occurs.  The element's error attribute contains more information. See
  // Error handling for details.
  ERROR: 'error',

  //  The first frame of the media has finished loading.
  LOADEDDATA: 'loadeddata',

  //  The media's metadata has finished loading; all attributes now contain as much useful
  //  information as they're going to.
  LOADEDMETADATA: 'loadedmetadata',

  // Sent when loading of the media begins.
  LOADSTART: 'loadstart',

  // Sent when playback is paused.
  PAUSE: 'pause',

  //  Sent when playback of the media starts after having been paused; that is, when playback
  //  is resumed after a prior pause event.
  PLAY: 'play',

  // Sent when the media begins to play (either for the first time, after having been paused,
  // or after ending and then restarting).
  PLAYING: 'playing',

  //  Sent periodically to inform interested parties of progress downloading the media.
  //  Information about the current amount of the media that has been downloaded is available
  //  in the media element's buffered attribute.
  PROGRESS: 'progress',

  //  Sent when the playback speed changes.
  RATECHANGE: 'ratechange',

  //  Sent when a seek operation completes.
  SEEKED: 'seeked',

  // Sent when a seek operation begins.
  SEEKING: 'seeking',

  // Sent when the user agent is trying to fetch media data, but data is unexpectedly not
  // forthcoming.
  STALLED: 'stalled',

  // Sent when loading of the media is suspended; this may happen either because the download
  // has completed or because it has been paused for any other reason.
  SUSPEND: 'suspend',

  //  The time indicated by the element's currentTime attribute has changed.
  TIMEUPDATE: 'timeupdate',

  //  Sent when the audio volume changes (both when the volume is set and when the muted
  //  attribute is changed).
  VOLUMECHANGE: 'volumechange',

  // Sent when the requested operation (such as playback) is delayed pending the completion
  // of another operation (such as a seek).
  WAITING: 'waiting',
}
