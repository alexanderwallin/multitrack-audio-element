import test from 'ava'

import Source from '../src/Source'
import Sink from '../src/Sink'

test('source can be piped into sink', async t => {
  const source = new Source([1,3,5,7,9], 1)
  const sink = new Sink()
  await source.pipeTo(sink)
  t.deepEqual(sink.received(), [1,3,5,7,9])
})

test('source is piping at the right rate', async t => {
  const start = new Date()
  const source = new Source([1,3,5,7,9], 50)
  const sink = new Sink()
  await source.pipeTo(sink)
  const duration = new Date() - start
  t.true(duration > 250 && duration < 500)
})