/* 歌曲文件类型
    MASTER: 臻品母带2.0,24Bit 192kHz,size_new[0]
    ATMOS_2: 臻品全景声2.0,16Bit 44.1kHz,size_new[1]
    ATMOS_51: 臻品音质2.0,16Bit 44.1kHz,size_new[2]
    FLAC: flac 格式,16Bit 44.1kHz~24Bit 48kHz,size_flac
    OGG_640: ogg 格式,640kbps,size_new[5]
    OGG_320: ogg 格式,320kbps,size_new[3]
    OGG_192: ogg 格式,192kbps,size_192ogg
    OGG_96: ogg 格式,96kbps,size_96ogg
    MP3_320: mp3 格式,320kbps,size_320mp3
    MP3_128: mp3 格式,128kbps,size_128mp3
    ACC_192: m4a 格式,192kbps,size_192aac
    ACC_96: m4a 格式,96kbps,size_96aac
    ACC_48: m4a 格式,48kbps,size_48aac
*/

const SongTypeMap = {
  ACC_48: {
    s: 'C200',
    e: '.m4a',
  },
  ACC_96: {
    s: 'C400',
    e: '.m4a',
  },
  ACC_192: {
    s: 'C600',
    e: '.m4a',
  },
  MP3_128: {
    s: 'M500',
    e: '.mp3',
  },
  MP3_320: {
    s: 'M800',
    e: '.mp3',
  },
  OGG_96: {
    s: 'O400',
    e: '.ogg',
  },
  OGG_192: {
    s: 'O600',
    e: '.ogg',
  },
  OGG_320: {
    s: 'O800',
    e: '.ogg',
  },
  OGG_640: {
    s: 'O801',
    e: '.ogg',
  },
  ape: {
    s: 'A000',
    e: '.ape',
  },
  FLAC: {
    s: 'F000',
    e: '.flac',
  },
  ATMOS_51: {
    s: 'Q001',
    e: '.flac',
  },
  ATMOS_2: {
    s: 'Q000',
    e: '.flac',
  },
  MASTER: {
    s: 'AI00',
    e: '.flac',
  },
};

/* 加密歌曲文件类型
MASTER: 臻品母带2.0,24Bit 192kHz,size_new[0]
ATMOS_2: 臻品全景声2.0,16Bit 44.1kHz,size_new[1]
ATMOS_51: 臻品音质2.0,16Bit 44.1kHz,size_new[2]
FLAC: mflac 格式,16Bit 44.1kHz~24Bit 48kHz,size_flac
OGG_640: mgg 格式,640kbps,size_new[5]
OGG_320: mgg 格式,320kbps,size_new[3]
OGG_192: mgg 格式,192kbps,size_192ogg
OGG_96: mgg 格式,96kbps,size_96ogg
*/
const EncryptedSongTypeMap = {
  OGG_96: {
    s: 'O4M0',
    e: '.mgg',
  },
  OGG_192: {
    s: 'O6M0',
    e: '.mgg',
  },
  OGG_320: {
    s: 'O800',
    e: '.mgg',
  },
  OGG_640: {
    s: 'O801',
    e: '.mgg',
  },
  FLAC: {
    s: 'F0M0',
    e: '.mflac',
  },
  ATMOS_51: {
    s: 'Q0M1',
    e: '.mflac',
  },
  ATMOS_2: {
    s: 'Q0M0',
    e: '.mflac',
  },
  MASTER: {
    s: 'AIM0',
    e: '.mflac',
  },
};

module.exports = { SongTypeMap, EncryptedSongTypeMap };
