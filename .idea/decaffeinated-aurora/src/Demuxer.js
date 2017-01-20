import EventEmitter from './core/EventEmitter'
import BufferList from './core/BufferList'
import Stream from './core/Stream'

let formats
class Demuxer extends EventEmitter {
  static initClass () {
    formats = []
  }
  static probe (buffer) {
    return false
  }

  constructor (source, chunk) {
    super()
    let list = new BufferList()
    list.append(chunk)
    this.stream = new Stream(list)

    let received = false
    source.on('data', chunk => {
      received = true
      list.append(chunk)
      try {
        return this.readChunk(chunk)
      } catch (e) {
        return this.emit('error', e)
      }
    }
        )

    source.on('error', err => {
      return this.emit('error', err)
    }
        )

    source.on('end', () => {
            // if there was only one chunk received, read it
      if (!received) { this.readChunk(chunk) }
      return this.emit('end')
    }
        )

    this.seekPoints = []
    this.init()
  }

  init () {

  }

  readChunk (chunk) {

  }

  addSeekPoint (offset, timestamp) {
    let index = this.searchTimestamp(timestamp)
    return this.seekPoints.splice(index, 0, {
      offset,
      timestamp
    }
        )
  }

  searchTimestamp (timestamp, backward) {
    let low = 0
    let high = this.seekPoints.length

        // optimize appending entries
    if ((high > 0) && (this.seekPoints[high - 1].timestamp < timestamp)) {
      return high
    }

    while (low < high) {
      let mid = (low + high) >> 1
      let time = this.seekPoints[mid].timestamp

      if (time < timestamp) {
        low = mid + 1
      } else if (time >= timestamp) {
        high = mid
      }
    }

    if (high > this.seekPoints.length) {
      high = this.seekPoints.length
    }

    return high
  }

  seek (timestamp) {
    if (this.format && (this.format.framesPerPacket > 0) && (this.format.bytesPerPacket > 0)) {
      let seekPoint = {
        timestamp,
        offset: (this.format.bytesPerPacket * timestamp) / this.format.framesPerPacket
      }

      return seekPoint
    } else {
      let index = this.searchTimestamp(timestamp)
      return this.seekPoints[index]
    }
  }
  static register (demuxer) {
    return formats.push(demuxer)
  }

  static find (buffer) {
    let stream = Stream.fromBuffer(buffer)
    for (let format of Array.from(formats)) {
      let { offset } = stream
      try {
        if (format.probe(stream)) { return format }
      } catch (e) {}
                // an underflow or other error occurred

      stream.seek(offset)
    }

    return null
  }
}
Demuxer.initClass()

export default Demuxer
