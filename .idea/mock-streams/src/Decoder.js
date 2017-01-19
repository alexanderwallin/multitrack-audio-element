/*
This simple analog for an audio decoder just adds 1 to the numbers
received. This way, we can consider odd numbers to be encoded audio,
and even numbers to be decoded audio samples
*/

import { addGetters } from 'properties-and-events'
import { TransformStream } from './streams'
import StreamWrapper from './StreamWrapper'

export default class Decoder extends StreamWrapper {
  constructor () {
    super()
    addGetters(this, 'stream')
    this._stream = new TransformStream({
      transform (chunk, controller) {
        return controller.enqueue(chunk + 1)
      }
    })
  }
}