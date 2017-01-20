import EventEmitter from './core/EventEmitter'

class Queue extends EventEmitter {
  constructor (asset) {
    super()
    this.write = this.write.bind(this)
    this.asset = asset
    this.readyMark = 64
    this.finished = false
    this.buffering = true
    this.ended = false

    this.buffers = []
    this.asset.on('data', this.write)
    this.asset.on('end', () => {
      return this.ended = true
    }
        )

    this.asset.decodePacket()
  }

  write (buffer) {
    if (buffer) { this.buffers.push(buffer) }

    if (this.buffering) {
      if ((this.buffers.length >= this.readyMark) || this.ended) {
        this.buffering = false
        return this.emit('ready')
      } else {
        return this.asset.decodePacket()
      }
    }
  }

  read () {
    if (this.buffers.length === 0) { return null }

    this.asset.decodePacket()
    return this.buffers.shift()
  }

  reset () {
    this.buffers.length = 0
    this.buffering = true
    return this.asset.decodePacket()
  }
}

export default Queue
