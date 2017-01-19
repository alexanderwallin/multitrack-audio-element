function resolveStream (sink) {
  if (sink.stream && typeof(sink.stream) == 'function'){
    sink = sink.stream()
  }
  return sink
}

/*
This class provides a thin wrapper around streams, so that we can
pipe our own objects together at the same time as giving them
new methods and properties (ReadableStream and others are not extendable)
*/
export default class StreamWrapper {
  constructor () {}

  pipeTo(sink){
    let stream = this.stream()
    stream = stream.readable || stream
    return stream.pipeTo(resolveStream(sink))
  }

  pipeThrough(sink){
    this.stream().pipeThrough(resolveStream(sink))
    return sink
  }
}