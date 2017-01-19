import Source from './src/Source'
import Logger from './src/Logger'
import Decoder from './src/Decoder'

/*
This code just runs some tests directly in the browser, which can
at times be easier to debug than the node environment tests
*/

async function sourceToLoggerTest(){
  const source = new Source([1,3,5,7,9], 100)
  const logger = new Logger()
  window.logger = logger
  await source.pipeTo(logger)
}

async function decoderTest(){
  const source = new Source([1,3,5,7,9], 100)
  const decoder = new Decoder()
  const logger = new Logger()
  await source
    .pipeThrough(decoder)
    .pipeTo(logger)
}

async function runTests(){
  await sourceToLoggerTest()
  await decoderTest()
  console.log('all tests finished')
}

runTests()