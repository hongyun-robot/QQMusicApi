const StringHelper = require('../util/StringHelper');
const g_tk = require('../util/g_tk');
const {
  zzcSign,
  decodeAG1Response,
  encodeAG1Request,
} = require('@jixun/qmweb-sign');

module.exports = {
  // 根据 id 获取歌单详情
  '/': async ({ req, res, request }) => {
    const { id, song_begin = 0, song_num = 10 } = req.query;
    if (!id) {
      return res.send({
        result: 500,
        errMsg: 'id 不能为空',
      });
    }
    if (!req.cookies.qqmusic_key) {
      return res.send({
        result: 500,
        errMsg: 'cookie 不能为空',
      });
    }
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
        uin: req.cookies.uin,
        g_tk_new_20200303: g_tk(req.cookies.qqmusic_key),
        g_tk: g_tk(req.cookies.qqmusic_key),
      },
      req_1: {
        module: 'music.srfDissInfo.aiDissInfo',
        method: 'uniform_get_Dissinfo',
        param: {
          song_begin: Number(song_begin),
          song_num: Number(song_num),
          disstid: Number(id),
          ctx: 1,
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
    if (data.req_1.code !== 0) {
      return res.send({
        result: data.req_1.code,
        errMsg: data,
      });
    }
    data.req_1.data.songlist.forEach(i => {
      i.action.switch1 = i.action.switch;
      delete i.action.switch;
    });
    return res.send({
      result: 100,
      data,
    });
    // const result = await request({
    //   url: 'http://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg',
    //   data: {
    //     type: 1,
    //     utf8: 1,
    //     disstid: id, // 歌单的id
    //     loginUin: 0,
    //   },
    //   headers: {
    //     Referer: 'https://y.qq.com/n/yqq/playlist',
    //   },
    // });

    // if (Number(raw)) {
    //   res.send(result);
    // } else {
    //   const resData = {
    //     result: 100,
    //     data: result.cdlist[0] || {},
    //   };
    //   res && res.send(resData);
    //   return resData;
    // }
  },

  // 获取歌单分类
  '/category': async ({ req, res, request }) => {
    const { raw } = req.query;

    const result = await request({
      url: 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_tag_conf.fcg?format=json&inCharset=utf8&outCharset=utf-8',
      headers: {
        Referer: 'https://y.qq.com/',
      },
    });

    if (Number(raw)) {
      res.send(result);
    } else {
      res.send({
        result: 100,
        data: result.data.categories.map(item => ({
          type: item.categoryGroupName,
          list: (item.items || []).map(obj => ({
            id: obj.categoryId,
            name: obj.categoryName,
          })),
        })),
      });
    }
  },

  // 根据歌单分类筛选歌单
  '/list': async ({ req, res, request }) => {
    const {
      raw,
      num = 20,
      pageSize = num,
      pageNo = 1,
      sort = 5,
      category = 10000000,
    } = req.query;

    const result = await request({
      url: 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg',
      data: {
        inCharset: 'utf8',
        outCharset: 'utf-8',
        sortId: sort,
        categoryId: category,
        sin: pageSize * (pageNo - 1),
        ein: pageNo * pageSize - 1,
      },
      headers: {
        Referer: 'https://y.qq.com',
      },
    });

    if (Number(raw)) {
      res.send(result);
    } else {
      const { list = [], sortId, categoryId, ein, sum } = result.data;
      res.send({
        result: 100,
        data: {
          list,
          sort: sortId,
          category: categoryId,
          pageNo,
          pageSize,
          total: sum,
        },
      });
    }
  },

  // 获取歌单中 mid 和 id 强制使用传过来的cookie
  '/map': async ({ req, res, request }) => {
    const { dirid = 201, raw } = req.query;
    req.query.ownCookie = 1;
    const result = await request({
      url: 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_musiclist_getmyfav.fcg',
      data: {
        dirid,
        dirinfo: 1,
        g_tk: 5381,
        format: 'json',
      },
      headers: {
        Referer: 'https://y.qq.com/n/yqq/playlist',
      },
    });
    if (result.code === 1000) {
      return res.send({
        result: 301,
        errMsg: '未登陆',
      });
    }
    if (Number(raw)) {
      return res.send(result);
    }
    return res.send({
      result: 100,
      data: {
        id: result.map,
        mid: result.mapmid,
      },
    });
  },

  // 把歌曲添加到歌单，强制使用传过来的cookie
  '/add': async ({ req, res, request }) => {
    const { mid, dirid } = req.query;
    if (!mid || !dirid) {
      return res.send({
        result: 500,
        errMsg: 'mid ? dirid ?',
      });
    }
    req.query.ownCookie = 1;
    const result = await request(
      {
        url: 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_music_add2songdir.fcg?g_tk=5381',
        method: 'get',
        data: {
          midlist: mid,
          typelist: new Array(mid.split(',').length).fill(13).join(','),
          dirid,
          addtype: '',
          formsender: 4,
          r2: 0,
          r3: 1,
          utf8: 1,
          g_tk: 5381,
        },
      },
      {
        raw: true,
      },
    );

    switch (Number(result.code)) {
      case 0:
        return res.send({
          message: '删除成功',
          result: 100,
        });
      case 1000:
        return res.send({
          result: 301,
          errMsg: '先登录！',
        });
      default:
        return res.send({
          result: 200,
          errMsg: `删除出错: ${result.msg}`,
        });
    }
  },

  // 从歌单中删除歌曲，强制使用传过来的cookie
  '/remove': async ({ req, res, request }) => {
    const { id, dirid } = req.query;
    if (!id || !dirid) {
      return res.send({
        result: 500,
        errMsg: 'id ? dirid ?',
      });
    }
    req.query.ownCookie = 1;
    const result = await request({
      url: 'https://c.y.qq.com/qzone/fcg-bin/fcg_music_delbatchsong.fcg?g_tk=5381',
      data: {
        loginUin: req.cookies.uin,
        hostUin: 0,
        format: 'json',
        inCharset: 'utf8',
        outCharset: 'utf-8',
        notice: 0,
        platform: 'yqq.post',
        needNewCode: 0,
        uin: req.cookies.uin,
        dirid,
        ids: id,
        source: 103,
        types: new Array(id.split(',').length).fill(3).join(','),
        formsender: 4,
        flag: 2,
        utf8: 1,
        from: 3,
      },
    });

    switch (Number(result.code)) {
      case 0:
        return res.send({
          message: '删除成功',
          result: 100,
        });
      case 1000:
        return res.send({
          result: 301,
          errMsg: '先登录！',
        });
      default:
        return res.send({
          result: 200,
          errMsg: `删除出错: ${result.msg}`,
        });
    }
  },

  // 新建歌单 强制使用传过来的cookie
  '/create': async ({ req, res, request }) => {
    req.query.ownCookie = 1;
    const { name } = req.query;
    if (!name) {
      return res.send({
        result: 500,
        errMsg: 'name ? ',
      });
    }
    const result = await request({
      url: 'https://c.y.qq.com/splcloud/fcgi-bin/create_playlist.fcg?g_tk=5381',
      method: 'post',
      data: StringHelper.changeUrlQuery(
        {
          loginUin: req.cookies.uin,
          hostUin: 0,
          format: 'json',
          inCharset: 'utf8',
          outCharset: 'utf8',
          notice: 0,
          platform: 'yqq',
          needNewCode: 0,
          g_tk: 5381,
          uin: req.cookies.uin,
          name,
          show: 1,
          formsender: 1,
          utf8: 1,
          qzreferrer:
            'https://y.qq.com/portal/profile.html#sub=other&tab=create&',
        },
        '?',
      ).slice(1),
      headers: {
        Referer: 'https://y.qq.com/n/yqq/playlist',
      },
    });
    switch (Number(result.code)) {
      case 21:
        return res.send({
          result: 200,
          errMsg: '重名啦！',
        });
      case 0:
        return res.send({
          data: {
            dirid: result.dirid,
            message: '创建成功',
          },
          result: 100,
        });
      case 1:
        return res.send({
          result: 301,
          errMsg: '先登录！',
        });
      default:
        return res.send({
          result: 200,
          errMsg: `创建出错: ${result.msg}`,
        });
    }
  },

  // 删除歌单 强制使用传过来的Cookie
  '/delete': async ({ req, res, request }) => {
    req.query.ownCookie = 1;
    const { dirid } = req.query;
    if (!dirid) {
      return res.send({
        result: 500,
        errMsg: 'dirid ?',
      });
    }
    let result = await request(
      {
        url: 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_fav_modsongdir.fcg?g_tk=5381',
        method: 'post',
        data: StringHelper.changeUrlQuery(
          {
            loginUin: req.cookies.uin,
            hostUin: 0,
            format: 'fs',
            inCharset: 'GB2312',
            outCharset: 'gb2312',
            notice: 0,
            platform: 'yqq',
            needNewCode: 0,
            g_tk: 5381,
            uin: req.cookies.uin,
            delnum: 1,
            deldirids: dirid,
            forcedel: 1,
            formsender: 1,
            source: 103,
          },
          '?',
        ).slice(1),
        headers: {
          Referer: 'https://y.qq.com/n/yqq/playlist',
        },
      },
      {
        dataType: 'raw',
      },
    );
    result = JSON.parse(result.replace(/(^.+\()|(\).+$)/g, ''));

    switch (Number(result.code)) {
      case 0:
        return res.send({
          message: '删除成功',
          result: 100,
        });
      case 1:
        return res.send({
          result: 301,
          errMsg: '先登录！',
        });
      default:
        return res.send({
          result: 200,
          errMsg: `删除出错: ${result.msg}`,
        });
    }
  },

  // 收藏歌单 强制使用传过来的Cookie
  '/collect': async ({ req, res, request }) => {
    req.query.ownCookie = 1;
    // op: 1 收藏，2 取消收藏
    const { id, op } = req.query;
    if (!id || op === undefined) {
      return res.send({
        result: 500,
        errMsg: 'id or op?',
      });
    }

    if (!req.cookies.qqmusic_key) {
      return res.send({
        result: 500,
        errMsg: 'cookie 不能为空',
      });
    }
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
        uin: req.cookies.uin,
        g_tk_new_20200303: g_tk(req.cookies.qqmusic_key),
        g_tk: g_tk(req.cookies.qqmusic_key),
      },
      req_1: {
        module: 'music.musicasset.PlaylistFavWrite',
        method: op === '1' ? 'FavPlaylist' : 'CancelFavPlaylist',
        param: {
          uin: `${req.cookies.uin}`,
          v_playlistId: [+id],
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
    if (data.req_1.code !== 0) {
      return res.send({
        result: data.req_1.code,
        errMsg: data,
      });
    }
    return res.send({
      result: 100,
      data,
    });
  },

  // 这是一个把网易云歌单进行简单搬运到qq音乐的功能，运行的比较慢，看到的人感兴趣的就自己研究一下吧
  // '/move': async ({req, res, request}) => {
  //   const {id} = req.query;
  //   const url = `http://music.jsososo.com/api/playlist/detail?id=${id}`;
  //
  //   const result = await request(url);
  //   const list = [];
  //
  //   for (let index = 0; index < result.playlist.tracks.length; index++) {
  //     const item = result.playlist.tracks[index];
  //     const song = {
  //       name: item.name,
  //       artist: item.ar.map(a => a.name).join('/'),
  //       album: item.al.name,
  //     };
  //     const key = `${song.name} ${song.artist} ${song.album}`;
  //     try {
  //       const obj = await request(`http://music.jsososo.com/apiQ/song/find?key=${key}`);
  //       if (obj.data && obj.data.songmid) {
  //         list.push(obj.data.songmid);
  //         await request({
  //           url: `http://127.0.0.1:${global.PORT}/songlist/add`,
  //           data: {
  //             mid: obj.data.songmid,
  //             dirid: 201,
  //           }
  //         });
  //       }
  //     } catch (e) {
  //
  //     }
  //   }
  //
  //   res.send(list);
  // },
};
