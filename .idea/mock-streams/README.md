mock streams
============

This idea takes inspiration from the plans described 
[here](https://github.com/audiocogs/aurora.js/issues/170).

Specifically, we copy the various parts of the aurora framework, broadly
Source, Demuxer, Track, Decoder and Player and creates them as streams which
can be piped together.

This idea creates simple mocks of these components, and streams integers rather
than real encoded audio, as a way of learning about streams and setting up a
framework for testing.

So, for example, an encoded file is just a list of odd numbers. A decoded
audio buffer is just a list of even numbers. The Decoder just adds one to each
number to 'decode' it.

Using this framework of mock objects we can set up test situations where
various sources are loading encoded audio at different rates and decoding it,
and then the Player is co-ordinating all the pipe chains, and applying
back pressure when relevant to try and optimise playing all audio tracks in
sync.