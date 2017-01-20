import Decoder from '../Decoder'

class LpcmDecoder extends Decoder {
  constructor (...args) {
    super(...args)
    this.readChunk = this.readChunk.bind(this)
  }

  static initClass () {
    Decoder.register('lpcm', LpcmDecoder)
  }

  readChunk () {
    let i, output
    let { stream } = this
    let { littleEndian } = this.format
    let chunkSize = Math.min(4096, stream.remainingBytes())
    let samples = (chunkSize / (this.format.bitsPerChannel / 8)) | 0

    if (chunkSize < (this.format.bitsPerChannel / 8)) {
      return null
    }

    if (this.format.floatingPoint) {
      switch (this.format.bitsPerChannel) {
        case 32:
          output = new Float32Array(samples)
          for (i = 0, end = samples; i < end; i++) {
            var end
            output[i] = stream.readFloat32(littleEndian)
          }
          break

        case 64:
          output = new Float64Array(samples)
          for (i = 0, end1 = samples; i < end1; i++) {
            var end1
            output[i] = stream.readFloat64(littleEndian)
          }
          break

        default:
          throw new Error('Unsupported bit depth.')
      }
    } else {
      switch (this.format.bitsPerChannel) {
        case 8:
          output = new Int8Array(samples)
          for (i = 0, end2 = samples; i < end2; i++) {
            var end2
            output[i] = stream.readInt8()
          }
          break

        case 16:
          output = new Int16Array(samples)
          for (i = 0, end3 = samples; i < end3; i++) {
            var end3
            output[i] = stream.readInt16(littleEndian)
          }
          break

        case 24:
          output = new Int32Array(samples)
          for (i = 0, end4 = samples; i < end4; i++) {
            var end4
            output[i] = stream.readInt24(littleEndian)
          }
          break

        case 32:
          output = new Int32Array(samples)
          for (i = 0, end5 = samples; i < end5; i++) {
            var end5
            output[i] = stream.readInt32(littleEndian)
          }
          break

        default:
          throw new Error('Unsupported bit depth.')
      }
    }

    return output
  }
}
LpcmDecoder.initClass()
