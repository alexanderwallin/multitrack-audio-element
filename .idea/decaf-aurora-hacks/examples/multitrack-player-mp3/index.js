import AV from 'av'
import { MultitrackPlayer } from '../../src/aurora'

import 'mp3'

const urls = [
  'audio/nino-rota/mp3/sax1_short_clip.mp3'
  // 'audio/nino-rota/mp3/sax2.mp3',
  // 'audio/nino-rota/mp3/bass_drum.mp3',
  // 'audio/nino-rota/mp3/cymbals.mp3',
  // 'audio/nino-rota/mp3/french_horn.mp3',
  // 'audio/nino-rota/mp3/clarinet.mp3',
  // 'audio/nino-rota/mp3/flute.mp3'
]

const player = new MultitrackPlayer(urls)

window.player = player
