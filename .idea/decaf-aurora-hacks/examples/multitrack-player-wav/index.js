import { MultitrackPlayer } from '../../src/aurora'

const urls = [
  'audio/nino-rota/wav/sax1.wav',
  'audio/nino-rota/wav/sax2.wav',
  'audio/nino-rota/wav/bass_drum.wav',
  'audio/nino-rota/wav/cymbals.wav',
  'audio/nino-rota/wav/french_horn.wav',
  'audio/nino-rota/wav/clarinet.wav',
  'audio/nino-rota/wav/flute.wav'
]

const player = new MultitrackPlayer(urls)

window.player = player
