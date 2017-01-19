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
mediaSource.addEventListener('sourceopen', onSourceOpen)

mediaSource.addEventListener('sourceended', console.log('sourceended: mediaSource readyState: ' + this.readyState))
mediaSource.addEventListener('sourceclose', console.log('sourceclosed: mediaSource readyState: ' + this.readyState))

let numChunksProcessed = 0

/**
 * Creates a source buffer with the mime/codec defined above and starts
 * downloading and processing chunks of audio.
 */
function onSourceOpen() {
  const sourceBuffer = mediaSource.addSourceBuffer(audioCodec)
  processNextChunk(sourceBuffer, audioUrls, onChunkProcess)
}

/**
 * Callback that is called whenever a new chunk of audio has been
 * downloaded and appended to the media source.
 */
function onChunkProcess() {
  numChunksProcessed++

  // Play when init segment and first audio segment has been added.
  // This should of course have a smarter behaviour.
  if (numChunksProcessed === 2) {
    audio.play()
  }

  // Tell the MediaSource we have appended all buffers we wanted.
  if (numChunksProcessed === audioUrls.length) {
    mediaSource.endOfStream()
  }
}

/**
 * Recursively fetches and appends audio buffers to a given source
 * buffer.
 */
function processNextChunk(srcBuf, chunkUrls, onUpdate) {
  const url = chunkUrls[0]

  fetchArrayBuffer(url).then(buffer => {
    function desideNextStep() {
      srcBuf.removeEventListener('updateend', desideNextStep)
      onUpdate()

      if (chunkUrls.length >= 2) {
        processNextChunk(srcBuf, chunkUrls.slice(1), onUpdate)
      }
    }

    srcBuf.addEventListener('updateend', desideNextStep)
    srcBuf.appendBuffer(buffer)
  })
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
