import Demuxer from '../Demuxer'
import M4aDemuxer from './M4aDemuxer'

class CafDemuxer extends Demuxer {
  static initClass () {
    Demuxer.register(CafDemuxer)
  }

  static probe (buffer) {
    return buffer.peekString(0, 4) === 'caff'
  }

  readChunk () {
    if (!this.format && this.stream.available(64)) { // Number out of my behind
      if (this.stream.readString(4) !== 'caff') {
        return this.emit('error', "Invalid CAF, does not begin with 'caff'")
      }

            // skip version and flags
      this.stream.advance(4)

      if (this.stream.readString(4) !== 'desc') {
        return this.emit('error', "Invalid CAF, 'caff' is not followed by 'desc'")
      }

      if ((this.stream.readUInt32() !== 0) || (this.stream.readUInt32() !== 32)) {
        return this.emit('error', "Invalid 'desc' size, should be 32")
      }

      this.format = {}
      this.format.sampleRate = this.stream.readFloat64()
      this.format.formatID = this.stream.readString(4)

      let flags = this.stream.readUInt32()
      if (this.format.formatID === 'lpcm') {
        this.format.floatingPoint = Boolean(flags & 1)
        this.format.littleEndian = Boolean(flags & 2)
      }

      this.format.bytesPerPacket = this.stream.readUInt32()
      this.format.framesPerPacket = this.stream.readUInt32()
      this.format.channelsPerFrame = this.stream.readUInt32()
      this.format.bitsPerChannel = this.stream.readUInt32()

      this.emit('format', this.format)
    }

    while (this.stream.available(1)) {
      var buffer, i
      if (!this.headerCache) {
        this.headerCache = {
          type: this.stream.readString(4),
          oversize: this.stream.readUInt32() !== 0,
          size: this.stream.readUInt32()
        }

        if (this.headerCache.oversize) {
          return this.emit('error', 'Holy Shit, an oversized file, not supported in JS')
        }
      }

      switch (this.headerCache.type) {
        case 'kuki':
          if (this.stream.available(this.headerCache.size)) {
            if (this.format.formatID === 'aac ') { // variations needed?
              var cookie
              let offset = this.stream.offset + this.headerCache.size
              if (cookie = M4ADemuxer.readEsds(this.stream)) {
                this.emit('cookie', cookie)
              }

              this.stream.seek(offset) // skip extra garbage
            } else {
              buffer = this.stream.readBuffer(this.headerCache.size)
              this.emit('cookie', buffer)
            }

            this.headerCache = null
          }
          break

        case 'pakt':
          if (this.stream.available(this.headerCache.size)) {
            if (this.stream.readUInt32() !== 0) {
              return this.emit('error', 'Sizes greater than 32 bits are not supported.')
            }

            this.numPackets = this.stream.readUInt32()

            if (this.stream.readUInt32() !== 0) {
              return this.emit('error', 'Sizes greater than 32 bits are not supported.')
            }

            this.numFrames = this.stream.readUInt32()
            this.primingFrames = this.stream.readUInt32()
            this.remainderFrames = this.stream.readUInt32()

            this.emit('duration', ((this.numFrames / this.format.sampleRate) * 1000) | 0)
            this.sentDuration = true

            let byteOffset = 0
            let sampleOffset = 0
            for (i = 0, end = this.numPackets; i < end; i++) {
              var end
              this.addSeekPoint(byteOffset, sampleOffset)
              byteOffset += this.format.bytesPerPacket || M4ADemuxer.readDescrLen(this.stream)
              sampleOffset += this.format.framesPerPacket || M4ADemuxer.readDescrLen(this.stream)
            }

            this.headerCache = null
          }
          break

        case 'info':
          let entries = this.stream.readUInt32()
          let metadata = {}

          for (i = 0, end1 = entries, asc = end1 >= 0; asc ? i < end1 : i > end1; asc ? i++ : i--) {
                        // null terminated strings
            var asc, end1
            let key = this.stream.readString(null)
            let value = this.stream.readString(null)
            metadata[key] = value
          }

          this.emit('metadata', metadata)
          this.headerCache = null
          break

        case 'data':
          if (!this.sentFirstDataChunk) {
                        // skip edit count
            this.stream.advance(4)
            this.headerCache.size -= 4

                        // calculate the duration based on bytes per packet if no packet table
            if ((this.format.bytesPerPacket !== 0) && !this.sentDuration) {
              this.numFrames = this.headerCache.size / this.format.bytesPerPacket
              this.emit('duration', ((this.numFrames / this.format.sampleRate) * 1000) | 0)
            }

            this.sentFirstDataChunk = true
          }

          buffer = this.stream.readSingleBuffer(this.headerCache.size)
          this.headerCache.size -= buffer.length
          this.emit('data', buffer)

          if (this.headerCache.size <= 0) {
            this.headerCache = null
          }
          break

        default:
          if (this.stream.available(this.headerCache.size)) {
            this.stream.advance(this.headerCache.size)
            this.headerCache = null
          }
      }
    }
  }
}
CafDemuxer.initClass()
