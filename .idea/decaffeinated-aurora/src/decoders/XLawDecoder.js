import Decoder from '../Decoder'

let SIGN_BIT
let QUANT_MASK
let SEG_SHIFT
let SEG_MASK
let BIAS
class XLawDecoder extends Decoder {
  constructor (...args) {
    super(...args)
    this.readChunk = this.readChunk.bind(this)
  }

  static initClass () {
    Decoder.register('ulaw', XLawDecoder)
    Decoder.register('alaw', XLawDecoder)

    SIGN_BIT = 0x80
    QUANT_MASK = 0xf
    SEG_SHIFT = 4
    SEG_MASK = 0x70
    BIAS = 0x84
  }

  init () {
    let i, t, table, val
    this.format.bitsPerChannel = 16
    this.table = table = new Int16Array(256)

    if (this.format.formatID === 'ulaw') {
      for (i = 0; i < 256; i++) {
                // Complement to obtain normal u-law value.
        val = ~i

                // Extract and bias the quantization bits. Then
                // shift up by the segment number and subtract out the bias.
        t = ((val & QUANT_MASK) << 3) + BIAS
        t <<= (val & SEG_MASK) >>> SEG_SHIFT

        table[i] = val & SIGN_BIT ? BIAS - t : t - BIAS
      }
    } else {
      for (i = 0; i < 256; i++) {
        val = i ^ 0x55
        t = val & QUANT_MASK
        let seg = (val & SEG_MASK) >>> SEG_SHIFT

        if (seg) {
          t = (t + t + 1 + 32) << (seg + 2)
        } else {
          t = (t + t + 1) << 3
        }

        table[i] = val & SIGN_BIT ? t : -t
      }
    }
  }

  readChunk () {
    let {stream, table} = this

    let samples = Math.min(4096, this.stream.remainingBytes())
    if (samples === 0) { return }

    let output = new Int16Array(samples)
    for (let i = 0, end = samples; i < end; i++) {
      output[i] = table[stream.readUInt8()]
    }

    return output
  }
}
XLawDecoder.initClass()
