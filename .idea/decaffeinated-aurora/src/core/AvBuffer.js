let BlobBuilder
let URL
class AvBuffer {
  static initClass () {
        // prefix-free
    BlobBuilder = global.BlobBuilder || global.MozBlobBuilder || global.WebKitBlobBuilder
    URL = global.URL || global.webkitURL || global.mozURL
  }
  constructor (input) {
    if (input instanceof Uint8Array) {                  // Uint8Array
      this.data = input
    } else if (input instanceof ArrayBuffer ||         // ArrayBuffer
          Array.isArray(input) ||                       // normal JS Array
          (typeof input === 'number') ||                   // number (i.e. length)
          __guard__(global.Buffer, x => x.isBuffer(input))) {                // Node Buffer
      this.data = new Uint8Array(input)
    } else if (input.buffer instanceof ArrayBuffer) {     // typed arrays other than Uint8Array
      this.data = new Uint8Array(input.buffer, input.byteOffset, input.length * input.BYTES_PER_ELEMENT)
    } else if (input instanceof AvBuffer) {               // AvBuffer, make a shallow copy
      this.data = input.data
    } else {
      throw new Error('Constructing buffer with unknown type.')
    }

    this.length = this.data.length

        // used when the buffer is part of a bufferlist
    this.next = null
    this.prev = null
  }

  static allocate (size) {
    return new AvBuffer(size)
  }

  copy () {
    return new AvBuffer(new Uint8Array(this.data))
  }

  slice (position, length) {
    if (length == null) { ({ length } = this) }
    if ((position === 0) && (length >= this.length)) {
      return new AvBuffer(this.data)
    } else {
      return new AvBuffer(this.data.subarray(position, position + length))
    }
  }

  static makeBlob (data, type) {
        // try the Blob constructor
    if (type == null) { type = 'application/octet-stream' }
    try {
      return new Blob([data], {type})
    } catch (error) {}

        // use the old BlobBuilder
    if (BlobBuilder != null) {
      let bb = new BlobBuilder()
      bb.append(data)
      return bb.getBlob(type)
    }

        // oops, no blobs supported :(
    return null
  }

  static makeBlobURL (data, type) {
    return __guard__(URL, x => x.createObjectURL(this.makeBlob(data, type)))
  }

  static revokeBlobURL (url) {
    return __guard__(URL, x => x.revokeObjectURL(url))
  }

  toBlob () {
    return AvBuffer.makeBlob(this.data.buffer)
  }

  toBlobURL () {
    return AvBuffer.makeBlobURL(this.data.buffer)
  }
}
AvBuffer.initClass()

export default AvBuffer

function __guard__ (value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined
}
