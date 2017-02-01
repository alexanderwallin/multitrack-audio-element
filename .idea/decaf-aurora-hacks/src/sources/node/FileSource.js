import EventEmitter from '../../core/EventEmitter'
import AvBuffer from '../../core/AvBuffer'
import fs from 'fs'

class FileSource extends EventEmitter {
  constructor (filename) {
    super()
    this.filename = filename
    this.stream = null
    this.loaded = 0
    this.size = null
  }

  getSize () {
    return fs.stat(this.filename, (err, stat) => {
      if (err) { return this.emit('error', err) }

      this.size = stat.size
      return this.start()
    })
  }

  start () {
    if (this.size == null) {
      return this.getSize()
    }

    if (this.stream) {
      return this.stream.resume()
    }

    this.stream = fs.createReadStream(this.filename)

    let b = new Buffer(1 << 20)
    let blen = 0
    this.stream.on('data', buf => {
      this.loaded += buf.length
      buf.copy(b, blen)
      blen = blen + buf.length

      this.emit('progress', (this.loaded / this.size) * 100)

      if ((blen >= b.length) || (this.loaded >= this.size)) {
        if (blen < b.length) {
          b = b.slice(0, blen)
        }

        this.emit('data', new AvBuffer(new Uint8Array(b)))
        blen -= b.length
        return buf.copy(b, 0, blen)
      }
    })

    this.stream.on('end', () => {
      return this.emit('end')
    })

    return this.stream.on('error', err => {
      this.pause()
      return this.emit('error', err)
    })
  }

  pause () {
    return this.stream.pause()
  }
}

export default FileSource
