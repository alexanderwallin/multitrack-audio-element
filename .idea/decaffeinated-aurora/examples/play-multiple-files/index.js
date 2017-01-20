import { Player } from '../../src/aurora'
import '../../src/devices/WebAudioDevice'

const urls = [
  'audio/nino-rota/wav/sax1.wav',
  'audio/nino-rota/wav/sax2.wav',
  'audio/nino-rota/wav/bass_drum.wav',
  'audio/nino-rota/wav/cymbals.wav',
  'audio/nino-rota/wav/french_horn.wav',
  'audio/nino-rota/wav/clarinet.wav',
  'audio/nino-rota/wav/flute.wav'
]

const players = urls.map((url) => Player.fromURL(url))

function play () {
  for (let player of players) {
    player.play()
  }
}

function stop () {
  for (let player of players) {
    player.stop()
  }
}

play()

window.play = play
window.stop = stop
