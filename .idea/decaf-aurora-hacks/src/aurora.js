import Base from './core/Base'
import AvBuffer from './core/AvBuffer'
import BufferList from './core/BufferList'
import Stream from './core/Stream'
import Bitstream from './core/Bitstream'
import EventEmitter from './core/EventEmitter'
import UnderflowError from './core/UnderflowError'

// the original aurora imports the node versions by default, and then has
// a browserify trick to replace them with the browser versions
import HttpSource from './sources/browser/HttpSource'
import FileSource from './sources/browser/FileSource'

import BufferSource from './sources/BufferSource'

import Demuxer from './Demuxer'
import Decoder from './Decoder'
import AudioDevice from './AudioDevice'
import Asset from './Asset'
import Player from './Player'
import Track from './Track'
import MultitrackPlayer from './MultitrackPlayer'
import CachingAudioBuffer from './CachingAudioBuffer'

import './demuxers/CafDemuxer'
import './demuxers/M4aDemuxer'
import './demuxers/AiffDemuxer'
import './demuxers/WaveDemuxer'
import './demuxers/AuDemuxer'

import './decoders/LpcmDecoder'
import './decoders/XLawDecoder'

export {
  Base,
  Buffer,
  BufferList,
  Stream,
  Bitstream,
  EventEmitter,
  UnderflowError,
  HttpSource,
  FileSource,
  BufferSource,
  Demuxer,
  Decoder,
  AudioDevice,
  Asset,
  Player,
  Track,
  MultitrackPlayer,
  CachingAudioBuffer
}

export default {
  Base,
  Buffer,
  BufferList,
  Stream,
  Bitstream,
  EventEmitter,
  UnderflowError,
  HttpSource,
  FileSource,
  BufferSource,
  Demuxer,
  Decoder,
  AudioDevice,
  Asset,
  Player,
  Track,
  MultitrackPlayer,
  CachingAudioBuffer
}
