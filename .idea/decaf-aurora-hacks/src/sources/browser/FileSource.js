import EventEmitter from '../../core/EventEmitter'
import AvBuffer from '../../core/AvBuffer'

class FileSource extends EventEmitter {
  constructor (file) {
    super()
    this.file = file
    if (typeof FileReader === 'undefined' || FileReader === null) {
      return this.emit('error', 'This browser does not have FileReader support.')
    }

    this.offset = 0
    this.length = this.file.size
    this.chunkSize = 1 << 20
    this.file[this.slice = 'slice'] || this.file[this.slice = 'webkitSlice'] || this.file[this.slice = 'mozSlice']
  }

  start () {
    if (this.reader) {
      if (!this.active) { return this.loop() }
    }

    this.reader = new FileReader()
    this.active = true

    this.reader.onload = e => {
      let buf = new AvBuffer(new Uint8Array(e.target.result))
      this.offset += buf.length

      this.emit('data', buf)
      this.active = false
      if (this.offset < this.length) { return this.loop() }
    }

    this.reader.onloadend = () => {
      if (this.offset === this.length) {
        this.emit('end')
        return this.reader = null
      }
    }

    this.reader.onerror = e => {
      return this.emit('error', e)
    }

    this.reader.onprogress = e => {
      return this.emit('progress', ((this.offset + e.loaded) / this.length) * 100)
    }

    return this.loop()
  }

  loop () {
    this.active = true
    let endPos = Math.min(this.offset + this.chunkSize, this.length)

    let blob = this.file[this.slice](this.offset, endPos)
    return this.reader.readAsArrayBuffer(blob)
  }

  pause () {
    this.active = false
    try {
      return __guard__(this.reader, x => x.abort())
    } catch (error) {}
  }

  reset () {
    this.pause()
    return this.offset = 0
  }
}

export default FileSource

function __guard__ (value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined
}
