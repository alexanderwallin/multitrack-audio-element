//
// The Asset class is responsible for managing all aspects of the
// decoding pipeline from source to decoder.  You can use the Asset
// class to inspect information about an audio file, such as its
// format, metadata, and duration, as well as actually decode the
// file to linear PCM raw audio data.
//

import EventEmitter from './core/EventEmitter'
import HttpSource from './sources/node/HttpSource'
import FileSource from './sources/node/FileSource'
import BufferSource from './sources/BufferSource'
import Demuxer from './Demuxer'
import Decoder from './Decoder'

class Asset extends EventEmitter {
  constructor (source) {
    super()
    this.probe = this.probe.bind(this)
    this.findDecoder = this.findDecoder.bind(this)
    this._decode = this._decode.bind(this)
    this.source = source
    super()
    this.buffered = 0
    this.duration = null
    this.format = null
    this.metadata = null
    this.active = false
    this.demuxer = null
    this.decoder = null

    this.source.once('data', this.probe)
    this.source.on('error', err => {
      this.emit('error', err)
      return this.stop()
    }
        )

    this.source.on('progress', buffered => {
      this.buffered = buffered
      return this.emit('buffer', this.buffered)
    }
        )
  }

  static fromURL (url, opts) {
    return new Asset(new HttpSource(url, opts))
  }

  static fromFile (file) {
    return new Asset(new FileSource(file))
  }

  static fromBuffer (buffer) {
    return new Asset(new BufferSource(buffer))
  }

  start (decode) {
    if (this.active) { return }

    if (decode != null) { this.shouldDecode = decode }
    if (this.shouldDecode == null) { this.shouldDecode = true }

    this.active = true
    this.source.start()

    if (this.decoder && this.shouldDecode) {
      return this._decode()
    }
  }

  stop () {
    if (!this.active) { return }

    this.active = false
    return this.source.pause()
  }

  get (event, callback) {
    if (!['format', 'duration', 'metadata'].includes(event)) { return }

    if (this[event] != null) {
      return callback(this[event])
    } else {
      this.once(event, value => {
        this.stop()
        return callback(value)
      }
            )

      return this.start()
    }
  }

  decodePacket () {
    return this.decoder.decode()
  }

  decodeToBuffer (callback) {
    let dataHandler
    let length = 0
    let chunks = []
    this.on('data', dataHandler = function (chunk) {
      length += chunk.length
      return chunks.push(chunk)
    }
        )

    this.once('end', function () {
      let buf = new Float32Array(length)
      let offset = 0

      for (let chunk of Array.from(chunks)) {
        buf.set(chunk, offset)
        offset += chunk.length
      }

      this.off('data', dataHandler)
      return callback(buf)
    })

    return this.start()
  }

  probe (chunk) {
    if (!this.active) { return }

    let demuxer = Demuxer.find(chunk)
    if (!demuxer) {
      return this.emit('error', 'A demuxer for this container was not found.')
    }

    this.demuxer = new demuxer(this.source, chunk)
    this.demuxer.on('format', this.findDecoder)

    this.demuxer.on('duration', duration => {
      this.duration = duration
      return this.emit('duration', this.duration)
    }
        )

    this.demuxer.on('metadata', metadata => {
      this.metadata = metadata
      return this.emit('metadata', this.metadata)
    }
        )

    return this.demuxer.on('error', err => {
      this.emit('error', err)
      return this.stop()
    }
        )
  }

  findDecoder (format) {
    this.format = format
    if (!this.active) { return }

    this.emit('format', this.format)

    let decoder = Decoder.find(this.format.formatID)
    if (!decoder) {
      return this.emit('error', `A decoder for ${this.format.formatID} was not found.`)
    }

    this.decoder = new decoder(this.demuxer, this.format)

    if (this.format.floatingPoint) {
      this.decoder.on('data', buffer => {
        return this.emit('data', buffer)
      }
            )
    } else {
      let div = Math.pow(2, this.format.bitsPerChannel - 1)
      this.decoder.on('data', buffer => {
        let buf = new Float32Array(buffer.length)
        for (let i = 0; i < buffer.length; i++) {
          let sample = buffer[i]
          buf[i] = sample / div
        }

        return this.emit('data', buf)
      }
            )
    }

    this.decoder.on('error', err => {
      this.emit('error', err)
      return this.stop()
    }
        )

    this.decoder.on('end', () => {
      return this.emit('end')
    }
        )

    this.emit('decodeStart')
    if (this.shouldDecode) { return this._decode() }
  }

  _decode () {
    while (this.decoder.decode() && this.active) { continue }
    if (this.active) { return this.decoder.once('data', this._decode) }
  }

  destroy () {
    this.stop()
    __guard__(this.demuxer, x => x.off())
    __guard__(this.decoder, x1 => x1.off())
    __guard__(this.source, x2 => x2.off())
    return this.off()
  }
}

export default Asset

function __guard__ (value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined
}
