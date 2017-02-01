const Rx = window.Rx

const audio = document.querySelector('audio')
const audioUrls = [
  '/assets/cmajseginit.mp4',
  '/assets/cmajseg1.m4s',
  '/assets/cmajseg2.m4s',
  '/assets/cmajseg3.m4s',
]
const audioCodec = 'audio/mp4; codecs="mp4a.40.2"'

const mediaSource = new MediaSource()
audio.src = URL.createObjectURL(mediaSource)
// mediaSource.addEventListener('sourceopen', onSourceOpen)
// mediaSource.addEventListener('sourceended', console.log('sourceended: mediaSource readyState: ' + this.readyState))
// mediaSource.addEventListener('sourceclose', console.log('sourceclosed: mediaSource readyState: ' + this.readyState))

/**
 * An audio source observable that fetches and emits audio buffers
 */
function Source(urls) {
  return Rx.Observable.create(observer => {

    /**
     * Recursively fetches and appends audio buffers to a given source
     * buffer.
     */
    function fetchNextChunk(chunkUrls) {
      fetchArrayBuffer(chunkUrls[0]).then(buffer => {

        // Emit the buffer
        observer.onNext(buffer)

        if (chunkUrls.length >= 2) {
          fetchNextChunk(chunkUrls.slice(1))
        }
        else {

          // Emit the end event
          observer.onCompleted()
        }
      })
    }

    fetchNextChunk(urls)
  })
}

function createDownsampler(takeEvery = 1000) {
  return function downsample(buffer) {
    const samples = new Uint8Array(buffer)

    const numSamples = Math.ceil(samples.length / takeEvery)
    const downsampledBuffer = new Uint8Array(numSamples)

    for (let i = 0; i < numSamples; i++) {
      downsampledBuffer[i] = samples[i * takeEvery]
    }

    return downsampledBuffer
  }
}

/**
 * Returns an array buffer with whatever is at the given URL.
 */
function fetchArrayBuffer(url) {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest()
    xhr.open('get', url)
    xhr.responseType = 'arraybuffer'
    xhr.addEventListener('readystatechange', () => {
      if (xhr.readyState === 4) {
        resolve(xhr.response)
      }
    })
    xhr.send()
  })
}

function run() {

  // Create a stream that emits buffer data
  //
  // Note: The $ suffix means it is a stream
  const source$ = new Source(audioUrls)
  // source$.subscribe(buf => console.log('got buffer', buf))

  const startClicked$ = Rx.Observable.fromEvent(document.querySelector('button'), 'click')

  // Create a new stream that downsamples the source audio buffers
  const downsampledSource$ = source$
    .skip(1) // Skip init segment
    .map(createDownsampler())

  // downsampledSource$.subscribe(samples => console.log('downsampled', samples))

  // Create another stream that appends buffers to a media source
  const mediaSourceClose$ = Rx.Observable.fromEvent(mediaSource, 'sourceclose')
  const mediaSourceOpen$ = Rx.Observable.fromEvent(mediaSource, 'sourceopen')

  const sourceBuffer$ = mediaSourceOpen$
    .flatMap(() => startClicked$)
    .flatMap(() => source$)
    // .merge(Rx.Observable.just(evt.target.addSourceBuffer(audioCodec)))

  sourceBuffer$.subscribe((...args) => console.log('got stuff', ...args), console.error)

}

run()
