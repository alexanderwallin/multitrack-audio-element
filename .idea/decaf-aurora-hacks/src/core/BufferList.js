class BufferList {
  constructor () {
    this.first = null
    this.last = null
    this.numBuffers = 0
    this.availableBytes = 0
    this.availableBuffers = 0
  }

  copy () {
    let result = new BufferList()

    result.first = this.first
    result.last = this.last
    result.numBuffers = this.numBuffers
    result.availableBytes = this.availableBytes
    result.availableBuffers = this.availableBuffers

    return result
  }

  append (buffer) {
    buffer.prev = this.last
    __guard__(this.last, x => x.next = buffer)
    this.last = buffer
    if (this.first == null) { this.first = buffer }

    this.availableBytes += buffer.length
    this.availableBuffers++
    return this.numBuffers++
  }

  advance () {
    if (this.first) {
      this.availableBytes -= this.first.length
      this.availableBuffers--
      this.first = this.first.next
      return (this.first != null)
    }

    return false
  }

  rewind () {
    if (this.first && !this.first.prev) {
      return false
    }

    this.first = __guard__(this.first, x => x.prev) || this.last
    if (this.first) {
      this.availableBytes += this.first.length
      this.availableBuffers++
    }

    return (this.first != null)
  }

  reset () {
    return (() => {
      let result = []
      while (this.rewind()) {
        continue
      }
      return result
    })()
  }
}

export default BufferList

function __guard__ (value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined
}
