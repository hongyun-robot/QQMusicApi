const g_tk = require('../util/g_tk');
const {
  zzcSign,
  decodeAG1Response,
  encodeAG1Request,
} = require('@jixun/qmweb-sign');
const { SongTypeMap, EncryptedSongTypeMap } = require('../util/songFileType');

module.exports = {
  '/': async ({ res }) => {
    res.send('hello world');
  },
  '/url': async ({ req, res, request, cache, globalCookie }) => {
    const obj = { ...req.query, ...req.body };
    let { uin, qqmusic_key } = req?.cookies || globalCookie.userCookie();
    // if (Number(obj.ownCookie)) {
    //   uin = req.cookies.uin || uin;
    // }

    // const {
    //   id,
    //   type = 'MP3_128',
    //   mediaId = id,
    //   isRedirect = '0',
    //   encrypted = '0',
    // } = obj;
    // let module = 'music.vkey.GetVkey';
    // let method = 'UrlGetVkey';
    let typeMap = SongTypeMap;
    // if (!!+encrypted) {
    //   module = 'music.vkey.GetEVkey';
    //   method = 'CgiGetEVkey';
    //   typeMap = EncryptedSongTypeMap;
    // }
    const typeObj = typeMap['OGG_192'];

    // const file = `${typeObj.s}${id}${mediaId}${typeObj.e}`;
    const guid = (Math.random() * 10000000).toFixed(0);
    try {
      const payload = JSON.stringify({
        comm: {
          cv: 4747474,
          ct: 24,
          format: 'json',
          inCharset: 'utf-8',
          outCharset: 'utf-8',
          notice: 0,
          platform: 'yqq.json',
          needNewCode: 1,
          uin: uin,
          g_tk_new_20200303: g_tk(qqmusic_key),
          g_tk: g_tk(qqmusic_key),
        },
        req_1: {
          module: 'music.vkey.GetVkey',
          method: 'UrlGetVkey',
          param: {
            filename: [`${typeObj.s}004fXIwt4T8gsE004fXIwt4T8gsE${typeObj.e}`],
            guid,
            songmid: ['004fXIwt4T8gsE'],
            songtype: [0],
            uin: '1836017030',
            loginflag: 1,
            platform: '20',
            xcdn: 1,
            qdesc: 'lq96kOgg',
          },
        },
      });
      const body = await encodeAG1Request(payload);
      const sign = zzcSign(payload);
      const url = `https://u6.y.qq.com/cgi-bin/musics.fcg?_=${Date.now()}&encoding=ag-1&sign=${sign}`;

      const result = await request(
        {
          url,
          method: 'post',
          data: body,
          headers: {
            'content-type': 'text/plain',
          },
        },
        {
          responseType: 'arraybuffer',
        },
      );
      const respText = decodeAG1Response(result);
      const data = JSON.parse(respText);
      return res.send({
        result: 100,
        data,
      });
    } catch (error) {
      return res.send({
        result: 200,
        errMsg: error,
      });
    }
  },
};
