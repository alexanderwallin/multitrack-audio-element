import { Player } from '../../src/aurora'
import '../../src/devices/WebAudioDevice'
const player = Player.fromURL('audio/nino-rota/wav/sax1.wav')
player.play()
window.Player = Player
window.player = player
