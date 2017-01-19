/*
The Source is an analog for an encoded audio file (which would typically be
loaded over http). In this mock version, you initialise the source with
all the data it should contain, and the rate you want it to release data
as. In our simple mock setup the rate is set by specifying the interval between
integers in milliseconds. So, for example, if you set the rate to 2000, then it 
will release one integer every 2 seconds
*/

import { addGetters } from 'properties-and-events'
import { ReadableStream } from './streams'
import StreamWrapper from './StreamWrapper'

export default class Source extends StreamWrapper {
  constructor (data, interval) {
    super()
    addGetters(this, 'stream')
    this._data = data
    this._interval = interval
    const thiz = this
    let timerId
    this._stream = new ReadableStream({
      start(controller) {
        timerId = setInterval(() => {
          if (thiz._data.length == 0){
            clearInterval(timerId)
            controller.close()
          } else {
            let chunk = thiz._data.shift()
            controller.enqueue(chunk)
          }
        }, thiz._interval)
      },
      cancel() {
        clearInterval(timerId)
      }
    })
  }
}