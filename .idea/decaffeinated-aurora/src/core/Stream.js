import BufferList from './BufferList'
import AvBuffer from './AvBuffer'
import UnderflowError from './UnderflowError'

let buf
let uint8
let int8
let uint16
let int16
let uint32
let int32
let float32
let nativeEndian
let float64Fallback
let float80
let decodeString
class Stream {
  static initClass () {
    buf = new ArrayBuffer(16)
    uint8 = new Uint8Array(buf)
    int8 = new Int8Array(buf)
    uint16 = new Uint16Array(buf)
    int16 = new Int16Array(buf)
    uint32 = new Uint32Array(buf)
    int32 = new Int32Array(buf)
    float32 = new Float32Array(buf)
    if (typeof Float64Array !== 'undefined' && Float64Array !== null) { let float64 = new Float64Array(buf) }

        // detect the native endianness of the machine
        // 0x3412 is little endian, 0x1234 is big endian
    nativeEndian = new Uint16Array(new Uint8Array([0x12, 0x34]).buffer)[0] === 0x3412

    float64Fallback = function () {
      let [low, high] = Array.from(uint32)
      if (!high || (high === 0x80000000)) { return 0.0 }

      let sign = 1 - ((high >>> 31) * 2) // +1 or -1
      let exp = (high >>> 20) & 0x7ff
      let frac = high & 0xfffff

            // NaN or Infinity
      if (exp === 0x7ff) {
        if (frac) { return NaN }
        return sign * Infinity
      }

      exp -= 1023
      let out = (frac | 0x100000) * Math.pow(2, exp - 20)
      out += low * Math.pow(2, exp - 52)

      return sign * out
    }

    float80 = function () {
      let [high, low] = Array.from(uint32)
      let a0 = uint8[9]
      let a1 = uint8[8]

      let sign = 1 - ((a0 >>> 7) * 2) // -1 or +1
      let exp = ((a0 & 0x7F) << 8) | a1

      if ((exp === 0) && (low === 0) && (high === 0)) {
        return 0
      }

      if (exp === 0x7fff) {
        if ((low === 0) && (high === 0)) {
          return sign * Infinity
        }

        return NaN
      }

      exp -= 16383
      let out = low * Math.pow(2, exp - 31)
      out += high * Math.pow(2, exp - 63)

      return sign * out
    }

    decodeString = function (offset, length, encoding, advance) {
      let c
      let b1
      let littleEndian, w1
      let bom
      encoding = encoding.toLowerCase()
      let nullEnd = length === null ? 0 : -1

      if (length == null) { length = Infinity }
      let end = offset + length
      let result = ''

      switch (encoding) {
        case 'ascii': case 'latin1':
          while ((offset < end) && ((c = this.peekUInt8(offset++)) !== nullEnd)) {
            result += String.fromCharCode(c)
          }
          break

        case 'utf8': case 'utf-8':
          while ((offset < end) && ((b1 = this.peekUInt8(offset++)) !== nullEnd)) {
            var b2, b3
            if ((b1 & 0x80) === 0) {
              result += String.fromCharCode(b1)

                        // one continuation (128 to 2047)
            } else if ((b1 & 0xe0) === 0xc0) {
              b2 = this.peekUInt8(offset++) & 0x3f
              result += String.fromCharCode(((b1 & 0x1f) << 6) | b2)

                        // two continuation (2048 to 55295 and 57344 to 65535)
            } else if ((b1 & 0xf0) === 0xe0) {
              b2 = this.peekUInt8(offset++) & 0x3f
              b3 = this.peekUInt8(offset++) & 0x3f
              result += String.fromCharCode(((b1 & 0x0f) << 12) | (b2 << 6) | b3)

                        // three continuation (65536 to 1114111)
            } else if ((b1 & 0xf8) === 0xf0) {
              b2 = this.peekUInt8(offset++) & 0x3f
              b3 = this.peekUInt8(offset++) & 0x3f
              let b4 = this.peekUInt8(offset++) & 0x3f

                            // split into a surrogate pair
              let pt = (((b1 & 0x0f) << 18) | (b2 << 12) | (b3 << 6) | b4) - 0x10000
              result += String.fromCharCode(0xd800 + (pt >> 10), 0xdc00 + (pt & 0x3ff))
            }
          }
          break

        case 'utf16-be': case 'utf16be': case 'utf16le': case 'utf16-le': case 'utf16bom': case 'utf16-bom':
                    // find endianness
          switch (encoding) {
            case 'utf16be': case 'utf16-be':
              littleEndian = false
              break

            case 'utf16le': case 'utf16-le':
              littleEndian = true
              break

            case 'utf16bom': case 'utf16-bom':
              if ((length < 2) || ((bom = this.peekUInt16(offset)) === nullEnd)) {
                if (advance) { this.advance(offset += 2) }
                return result
              }

              littleEndian = (bom === 0xfffe)
              offset += 2
              break
          }

          while ((offset < end) && ((w1 = this.peekUInt16(offset, littleEndian)) !== nullEnd)) {
            offset += 2

            if ((w1 < 0xd800) || (w1 > 0xdfff)) {
              result += String.fromCharCode(w1)
            } else {
              if (w1 > 0xdbff) {
                throw new Error('Invalid utf16 sequence.')
              }

              let w2 = this.peekUInt16(offset, littleEndian)
              if ((w2 < 0xdc00) || (w2 > 0xdfff)) {
                throw new Error('Invalid utf16 sequence.')
              }

              result += String.fromCharCode(w1, w2)
              offset += 2
            }
          }

          if (w1 === nullEnd) {
            offset += 2
          }
          break

        default:
          throw new Error(`Unknown encoding: ${encoding}`)
      }

      if (advance) { this.advance(offset) }
      return result
    }
  }

  constructor (list) {
    this.list = list
    this.localOffset = 0
    this.offset = 0
  }

  static fromBuffer (buffer) {
    let list = new BufferList()
    list.append(buffer)
    return new Stream(list)
  }

  copy () {
    let result = new Stream(this.list.copy())
    result.localOffset = this.localOffset
    result.offset = this.offset
    return result
  }

  available (bytes) {
    return bytes <= (this.list.availableBytes - this.localOffset)
  }

  remainingBytes () {
    return this.list.availableBytes - this.localOffset
  }

  advance (bytes) {
    if (!this.available(bytes)) {
      throw new UnderflowError()
    }

    this.localOffset += bytes
    this.offset += bytes

    while (this.list.first && (this.localOffset >= this.list.first.length)) {
      this.localOffset -= this.list.first.length
      this.list.advance()
    }

    return this
  }

  rewind (bytes) {
    if (bytes > this.offset) {
      throw new UnderflowError()
    }

        // if we're at the end of the bufferlist, seek from the end
    if (!this.list.first) {
      this.list.rewind()
      this.localOffset = this.list.first.length
    }

    this.localOffset -= bytes
    this.offset -= bytes

    while (this.list.first.prev && (this.localOffset < 0)) {
      this.list.rewind()
      this.localOffset += this.list.first.length
    }

    return this
  }

  seek (position) {
    if (position > this.offset) {
      return this.advance(position - this.offset)
    } else if (position < this.offset) {
      return this.rewind(this.offset - position)
    }
  }

  readUInt8 () {
    if (!this.available(1)) {
      throw new UnderflowError()
    }

    let a = this.list.first.data[this.localOffset]
    this.localOffset += 1
    this.offset += 1

    if (this.localOffset === this.list.first.length) {
      this.localOffset = 0
      this.list.advance()
    }

    return a
  }

  peekUInt8 (offset) {
    if (offset == null) { offset = 0 }
    if (!this.available(offset + 1)) {
      throw new UnderflowError()
    }

    offset = this.localOffset + offset
    let buffer = this.list.first

    while (buffer) {
      if (buffer.length > offset) {
        return buffer.data[offset]
      }

      offset -= buffer.length
      buffer = buffer.next
    }

    return 0
  }

  read (bytes, littleEndian) {
    let i
    if (littleEndian == null) { littleEndian = false }
    if (littleEndian === nativeEndian) {
      for (i = 0, end = bytes; i < end; i++) {
        var end
        uint8[i] = this.readUInt8()
      }
    } else {
      for (i = bytes - 1; i >= 0; i--) {
        uint8[i] = this.readUInt8()
      }
    }
  }

  peek (bytes, offset, littleEndian) {
    let i
    if (littleEndian == null) { littleEndian = false }
    if (littleEndian === nativeEndian) {
      for (i = 0, end = bytes; i < end; i++) {
        var end
        uint8[i] = this.peekUInt8(offset + i)
      }
    } else {
      for (i = 0, end1 = bytes; i < end1; i++) {
        var end1
        uint8[bytes - i - 1] = this.peekUInt8(offset + i)
      }
    }
  }

  readInt8 () {
    this.read(1)
    return int8[0]
  }

  peekInt8 (offset) {
    if (offset == null) { offset = 0 }
    this.peek(1, offset)
    return int8[0]
  }

  readUInt16 (littleEndian) {
    this.read(2, littleEndian)
    return uint16[0]
  }

  peekUInt16 (offset, littleEndian) {
    if (offset == null) { offset = 0 }
    this.peek(2, offset, littleEndian)
    return uint16[0]
  }

  readInt16 (littleEndian) {
    this.read(2, littleEndian)
    return int16[0]
  }

  peekInt16 (offset, littleEndian) {
    if (offset == null) { offset = 0 }
    this.peek(2, offset, littleEndian)
    return int16[0]
  }

  readUInt24 (littleEndian) {
    if (littleEndian) {
      return this.readUInt16(true) + (this.readUInt8() << 16)
    } else {
      return (this.readUInt16() << 8) + this.readUInt8()
    }
  }

  peekUInt24 (offset, littleEndian) {
    if (offset == null) { offset = 0 }
    if (littleEndian) {
      return this.peekUInt16(offset, true) + (this.peekUInt8(offset + 2) << 16)
    } else {
      return (this.peekUInt16(offset) << 8) + this.peekUInt8(offset + 2)
    }
  }

  readInt24 (littleEndian) {
    if (littleEndian) {
      return this.readUInt16(true) + (this.readInt8() << 16)
    } else {
      return (this.readInt16() << 8) + this.readUInt8()
    }
  }

  peekInt24 (offset, littleEndian) {
    if (offset == null) { offset = 0 }
    if (littleEndian) {
      return this.peekUInt16(offset, true) + (this.peekInt8(offset + 2) << 16)
    } else {
      return (this.peekInt16(offset) << 8) + this.peekUInt8(offset + 2)
    }
  }

  readUInt32 (littleEndian) {
    this.read(4, littleEndian)
    return uint32[0]
  }

  peekUInt32 (offset, littleEndian) {
    if (offset == null) { offset = 0 }
    this.peek(4, offset, littleEndian)
    return uint32[0]
  }

  readInt32 (littleEndian) {
    this.read(4, littleEndian)
    return int32[0]
  }

  peekInt32 (offset, littleEndian) {
    if (offset == null) { offset = 0 }
    this.peek(4, offset, littleEndian)
    return int32[0]
  }

  readFloat32 (littleEndian) {
    this.read(4, littleEndian)
    return float32[0]
  }

  peekFloat32 (offset, littleEndian) {
    if (offset == null) { offset = 0 }
    this.peek(4, offset, littleEndian)
    return float32[0]
  }

  readFloat64 (littleEndian) {
    this.read(8, littleEndian)

        // use Float64Array if available
    if (float64) {
      return float64[0]
    } else {
      return float64Fallback()
    }
  }

  peekFloat64 (offset, littleEndian) {
    if (offset == null) { offset = 0 }
    this.peek(8, offset, littleEndian)

        // use Float64Array if available
    if (float64) {
      return float64[0]
    } else {
      return float64Fallback()
    }
  }

    // IEEE 80 bit extended float
  readFloat80 (littleEndian) {
    this.read(10, littleEndian)
    return float80()
  }

  peekFloat80 (offset, littleEndian) {
    if (offset == null) { offset = 0 }
    this.peek(10, offset, littleEndian)
    return float80()
  }

  readBuffer (length) {
    let result = AvBuffer.allocate(length)
    let to = result.data

    for (let i = 0, end = length; i < end; i++) {
      to[i] = this.readUInt8()
    }

    return result
  }

  peekBuffer (offset, length) {
    if (offset == null) { offset = 0 }
    let result = AvBuffer.allocate(length)
    let to = result.data

    for (let i = 0, end = length; i < end; i++) {
      to[i] = this.peekUInt8(offset + i)
    }

    return result
  }

  readSingleBuffer (length) {
    let result = this.list.first.slice(this.localOffset, length)
    this.advance(result.length)
    return result
  }

  peekSingleBuffer (offset, length) {
    let result = this.list.first.slice(this.localOffset + offset, length)
    return result
  }

  readString (length, encoding) {
    if (encoding == null) { encoding = 'ascii' }
    return decodeString.call(this, 0, length, encoding, true)
  }

  peekString (offset, length, encoding) {
    if (offset == null) { offset = 0 }
    if (encoding == null) { encoding = 'ascii' }
    return decodeString.call(this, offset, length, encoding, false)
  }
}
Stream.initClass()

export default Stream
