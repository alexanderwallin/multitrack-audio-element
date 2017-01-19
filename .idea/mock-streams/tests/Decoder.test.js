import test from 'ava'

import Source from '../src/Source'
import Decoder from '../src/Decoder'
import Sink from '../src/Sink'

test('decoder adds 1 to each number', async t => {
  const source = new Source([1,3,5,7,9], 10)
  const decoder = new Decoder()
  const sink = new Sink()
  await source.pipeThrough(decoder).pipeTo(sink)
  t.deepEqual(sink.received(), [2,4,6,8,10])
})