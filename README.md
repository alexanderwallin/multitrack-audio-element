# multitrack-audio-element
A JavaScript (and HTML5) audio object that supports synchronized multitrack playback and streaming.

Feel free to edit this README freely!


## Research

#### `MediaController` and `mediaGroup`

Several older articles and Q&A threads, as well as MDN, mention a `MediaController` object found at [`HTMLMediaElement.prototype.controller`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement) that could be used to control different media sources with the same `mediaGroup` attribute.

Firefox hasn't implement [any of them](https://bugzilla.mozilla.org/show_bug.cgi?id=847377), and Chromium has [unshipped it](https://groups.google.com/a/chromium.org/forum/#!topic/blink-dev/MVcoNSPs1UQ).

#### `AudioTrackList` and `AudioTrack`

https://html.spec.whatwg.org/multipage/embedded-content.html#audiotracklist-and-videotracklist-objects

> An AudioTrackList object represents a dynamic list of zero or more audio tracks, of which zero or more can be enabled at a time. Each audio track is represented by an AudioTrack object.

Only implemented by Safari and IE (!). It allows for zero or more simultaneously activated tracks. The list of track `kind`s does not include a `"partial"`, `"instrument"` or anything similar:

* `"alternative"`
* `"captions"`
* `"descriptions"`
* `"main"`
* `"main-desc"`
* `"sign"`
* `"subtitles"`
* `"translation"`
* `"commentary"`
* `""`

#### `AudioStreamTrack`

https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack

Part of the MediaStream API.


## Ideas and notes

* Could you accomplish the core functionality by just sharing an event system?
* Shimming `MediaController` and `mediaGroup` is one alternative
