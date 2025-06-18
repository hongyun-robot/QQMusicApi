function g_tk(qqmusic_key) {
  let n = 5381;
  const t = qqmusic_key;
  // if (t = e ? l("qqmusic_key") || l("p_skey") || l("skey") || l("p_lskey") || l("lskey") : l("skey") || l("qqmusic_key"))
  for (var r = 0, i = t.length; r < i; ++r) n += (n << 5) + t.charCodeAt(r);
  return 2147483647 & n;
}

module.exports = g_tk;
