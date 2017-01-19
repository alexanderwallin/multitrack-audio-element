/*
A simple writeable stream which will log whatever it gets to the console
*/

import { addGetters } from 'properties-and-events'
import { WritableStream } from './streams'
import StreamWrapper from './StreamWrapper'

export default class Logger extends StreamWrapper {
  constructor (description = '') {
    super()
    addGetters(this, 'received', 'stream')
    let received = this._received = []
    this._stream = new WritableStream({
      write(chunk) {
        received.push(chunk)
        console.log('Logger : ', description, chunk)
      },
      close () {
        console.log('All data was read, Logger is closing')
      },
      abort (e) {
        console.log('Something went wrong', e)
      }
    })
  }
}