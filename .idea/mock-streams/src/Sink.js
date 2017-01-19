/*
A simple writeable stream which collects all the data it receives in an array,
which can later be read
*/

import { addGetters } from 'properties-and-events'
import { WritableStream } from './streams'
import StreamWrapper from './StreamWrapper'

export default class Sink extends StreamWrapper {
  constructor (description = '') {
    super()
    addGetters(this, 'received', 'stream')
    let received = this._received = []
    this._stream = new WritableStream({
      write(chunk) {
        received.push(chunk)
      }
    })
  }
}