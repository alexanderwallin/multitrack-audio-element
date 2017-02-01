class Bitstream {
  constructor (stream) {
    this.stream = stream
    this.bitPosition = 0

    // these lines below make methods become an enumerable property
    // of this class, which is needed by the MP3Stream class, since
    // it enumerates and copies method over from here
    this.seek = this.seek
    this.align = this.align
    this.available = this.available
    this.advance = this.advance
    this.read = this.read
    this.copy = this.copy
  }

  copy () {
    let result = new Bitstream(this.stream.copy())
    result.bitPosition = this.bitPosition
    return result
  }

  offset () { // Should be a property
    return (8 * this.stream.offset) + this.bitPosition
  }

  available (bits) {
    return this.stream.available(((bits + 8) - this.bitPosition) / 8)
  }

  advance (bits) {
    let pos = this.bitPosition + bits
    this.stream.advance(pos >> 3)
    return this.bitPosition = pos & 7
  }

  rewind (bits) {
    let pos = this.bitPosition - bits
    this.stream.rewind(Math.abs(pos >> 3))
    return this.bitPosition = pos & 7
  }

  seek (offset) {
    let curOffset = this.offset()

    if (offset > curOffset) {
      return this.advance(offset - curOffset)
    } else if (offset < curOffset) {
      return this.rewind(curOffset - offset)
    }
  }

  align () {
    if (this.bitPosition !== 0) {
      this.bitPosition = 0
      return this.stream.advance(1)
    }
  }

  read (bits, signed) {
    let a
    if (bits === 0) { return 0 }

    let mBits = bits + this.bitPosition
    if (mBits <= 8) {
      a = ((this.stream.peekUInt8() << this.bitPosition) & 0xff) >>> (8 - bits)
    } else if (mBits <= 16) {
      a = ((this.stream.peekUInt16() << this.bitPosition) & 0xffff) >>> (16 - bits)
    } else if (mBits <= 24) {
      a = ((this.stream.peekUInt24() << this.bitPosition) & 0xffffff) >>> (24 - bits)
    } else if (mBits <= 32) {
      a = (this.stream.peekUInt32() << this.bitPosition) >>> (32 - bits)
    } else if (mBits <= 40) {
      let a0 = this.stream.peekUInt8(0) * 0x0100000000 // same as a << 32
      let a1 = (this.stream.peekUInt8(1) << 24) >>> 0
      let a2 = this.stream.peekUInt8(2) << 16
      let a3 = this.stream.peekUInt8(3) << 8
      let a4 = this.stream.peekUInt8(4)

      a = a0 + a1 + a2 + a3 + a4
      a %= Math.pow(2, 40 - this.bitPosition)                        // (a << bitPosition) & 0xffffffffff
      a = Math.floor(a / Math.pow(2, 40 - this.bitPosition - bits))  // a >>> (40 - bits)
    } else {
      throw new Error('Too many bits!')
    }

    if (signed) {
            // if the sign bit is turned on, flip the bits and
            // add one to convert to a negative value
      if (mBits < 32) {
        if (a >>> (bits - 1)) {
          a = (((1 << bits) >>> 0) - a) * -1
        }
      } else {
        if ((a / Math.pow(2, bits - 1)) | 0) {
          a = (Math.pow(2, bits) - a) * -1
        }
      }
    }

    this.advance(bits)
    return a
  }

  peek (bits, signed) {
    let a
    if (bits === 0) { return 0 }

    let mBits = bits + this.bitPosition
    if (mBits <= 8) {
      a = ((this.stream.peekUInt8() << this.bitPosition) & 0xff) >>> (8 - bits)
    } else if (mBits <= 16) {
      a = ((this.stream.peekUInt16() << this.bitPosition) & 0xffff) >>> (16 - bits)
    } else if (mBits <= 24) {
      a = ((this.stream.peekUInt24() << this.bitPosition) & 0xffffff) >>> (24 - bits)
    } else if (mBits <= 32) {
      a = (this.stream.peekUInt32() << this.bitPosition) >>> (32 - bits)
    } else if (mBits <= 40) {
      let a0 = this.stream.peekUInt8(0) * 0x0100000000 // same as a << 32
      let a1 = (this.stream.peekUInt8(1) << 24) >>> 0
      let a2 = this.stream.peekUInt8(2) << 16
      let a3 = this.stream.peekUInt8(3) << 8
      let a4 = this.stream.peekUInt8(4)

      a = a0 + a1 + a2 + a3 + a4
      a %= Math.pow(2, 40 - this.bitPosition)                        // (a << bitPosition) & 0xffffffffff
      a = Math.floor(a / Math.pow(2, 40 - this.bitPosition - bits))  // a >>> (40 - bits)
    } else {
      throw new Error('Too many bits!')
    }

    if (signed) {
            // if the sign bit is turned on, flip the bits and
            // add one to convert to a negative value
      if (mBits < 32) {
        if (a >>> (bits - 1)) {
          a = (((1 << bits) >>> 0) - a) * -1
        }
      } else {
        if ((a / Math.pow(2, bits - 1)) | 0) {
          a = (Math.pow(2, bits) - a) * -1
        }
      }
    }

    return a
  }

  readLSB (bits, signed) {
    if (bits === 0) { return 0 }
    if (bits > 40) {
      throw new Error('Too many bits!')
    }

    let mBits = bits + this.bitPosition
    let a = (this.stream.peekUInt8(0)) >>> this.bitPosition
    if (mBits > 8) { a |= (this.stream.peekUInt8(1)) << (8 - this.bitPosition) }
    if (mBits > 16) { a |= (this.stream.peekUInt8(2)) << (16 - this.bitPosition) }
    if (mBits > 24) { a += ((this.stream.peekUInt8(3)) << (24 - this.bitPosition)) >>> 0 }
    if (mBits > 32) { a += (this.stream.peekUInt8(4)) * Math.pow(2, 32 - this.bitPosition) }

    if (mBits >= 32) {
      a %= Math.pow(2, bits)
    } else {
      a &= (1 << bits) - 1
    }

    if (signed) {
            // if the sign bit is turned on, flip the bits and
            // add one to convert to a negative value
      if (mBits < 32) {
        if (a >>> (bits - 1)) {
          a = (((1 << bits) >>> 0) - a) * -1
        }
      } else {
        if ((a / Math.pow(2, bits - 1)) | 0) {
          a = (Math.pow(2, bits) - a) * -1
        }
      }
    }

    this.advance(bits)
    return a
  }

  peekLSB (bits, signed) {
    if (bits === 0) { return 0 }
    if (bits > 40) {
      throw new Error('Too many bits!')
    }

    let mBits = bits + this.bitPosition
    let a = (this.stream.peekUInt8(0)) >>> this.bitPosition
    if (mBits > 8) { a |= (this.stream.peekUInt8(1)) << (8 - this.bitPosition) }
    if (mBits > 16) { a |= (this.stream.peekUInt8(2)) << (16 - this.bitPosition) }
    if (mBits > 24) { a += ((this.stream.peekUInt8(3)) << (24 - this.bitPosition)) >>> 0 }
    if (mBits > 32) { a += (this.stream.peekUInt8(4)) * Math.pow(2, 32 - this.bitPosition) }

    if (mBits >= 32) {
      a %= Math.pow(2, bits)
    } else {
      a &= (1 << bits) - 1
    }

    if (signed) {
            // if the sign bit is turned on, flip the bits and
            // add one to convert to a negative value
      if (mBits < 32) {
        if (a >>> (bits - 1)) {
          a = (((1 << bits) >>> 0) - a) * -1
        }
      } else {
        if ((a / Math.pow(2, bits - 1)) | 0) {
          a = (Math.pow(2, bits) - a) * -1
        }
      }
    }

    return a
  }
}

export default Bitstream
