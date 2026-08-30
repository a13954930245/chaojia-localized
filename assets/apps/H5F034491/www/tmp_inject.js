
(function(){
  var KEY = 'admin';
  var rawSnaps = [{"date": "2026-07-31", "zzc": 146823.2784, "sz": 93651, "datas": [{"code": "cn_600664", "dryk": 5247, "zongchengben": 48976.8972, "zdrykzdryk": 5247}], "sprescount": 3}, {"date": "2026-08-03", "zzc": 148413.2784, "sz": 95241, "datas": [{"code": "cn_600664", "dryk": 1590, "zongchengben": 48976.8972, "zdrykzdryk": 1590}], "sprescount": 3}, {"date": "2026-08-04", "zzc": 155727.2784, "sz": 102555, "datas": [{"code": "cn_600664", "dryk": 7314, "zongchengben": 48976.8972, "zdrykzdryk": 7314}], "sprescount": 3}, {"date": "2026-08-05", "zzc": 160815.2784, "sz": 107643, "datas": [{"code": "cn_600664", "dryk": 5088, "zongchengben": 48976.8972, "zdrykzdryk": 5088}], "sprescount": 3}, {"date": "2026-08-06", "zzc": 152070.2784, "sz": 98898, "datas": [{"code": "cn_600664", "dryk": -8745, "zongchengben": 48976.8972, "zdrykzdryk": -8745}], "sprescount": 3}, {"date": "2026-08-07", "zzc": 161928.2784, "sz": 108756, "datas": [{"code": "cn_600664", "dryk": 9858, "zongchengben": 48976.8972, "zdrykzdryk": 9858}], "sprescount": 3}, {"date": "2026-08-10", "zzc": 6927473.6284, "sz": 16941808, "datas": [{"code": "cn_600664", "dryk": 6765545.35, "zongchengben": 10116483.5472, "zdrykzdryk": 6765545.35}], "sprescount": 3}, {"date": "2026-08-11", "zzc": 8617148.6284, "sz": 18631483, "datas": [{"code": "cn_600664", "dryk": 1689675, "zongchengben": 10116483.5472, "zdrykzdryk": 1689675}], "sprescount": 3}, {"date": "2026-08-12", "zzc": 9833714.6284, "sz": 19848049, "datas": [{"code": "cn_600664", "dryk": 1216566, "zongchengben": 10116483.5472, "zdrykzdryk": 1216566}], "sprescount": 3}, {"date": "2026-08-13", "zzc": 9946359.6284, "sz": 19960694, "datas": [{"code": "cn_600664", "dryk": 112645, "zongchengben": 10116483.5472, "zdrykzdryk": 112645}], "sprescount": 3}, {"date": "2026-08-14", "zzc": 10059004.6284, "sz": 20073339, "datas": [{"code": "cn_600664", "dryk": 112645, "zongchengben": 10116483.5472, "zdrykzdryk": 112645}], "sprescount": 3}, {"date": "2026-08-17", "zzc": 10284294.6284, "sz": 20298629, "datas": [{"code": "cn_600664", "dryk": 225290, "zongchengben": 10116483.5472, "zdrykzdryk": 225290}], "sprescount": 3}, {"date": "2026-08-18", "zzc": 10532113.6284, "sz": 20546448, "datas": [{"code": "cn_600664", "dryk": 247819, "zongchengben": 10116483.5472, "zdrykzdryk": 247819}], "sprescount": 3}, {"date": "2026-08-19", "zzc": 10396939.6284, "sz": 20411274, "datas": [{"code": "cn_600664", "dryk": -135174, "zongchengben": 10116483.5472, "zdrykzdryk": -135174}], "sprescount": 3}, {"date": "2026-08-20", "zzc": 10441997.6284, "sz": 20456332, "datas": [{"code": "cn_600664", "dryk": 45057.999999999, "zongchengben": 10116483.5472, "zdrykzdryk": 45057.999999999}], "sprescount": 3}, {"date": "2026-08-21", "zzc": 8391858.6284, "sz": 18406193, "datas": [{"code": "cn_600664", "dryk": -2050139, "zongchengben": 10116483.5472, "zdrykzdryk": -2050139}], "sprescount": 3}, {"date": "2026-08-24", "zzc": 8504503.6284, "sz": 18518838, "datas": [{"code": "cn_600664", "dryk": 112645, "zongchengben": 10116483.5472, "zdrykzdryk": 112645}], "sprescount": 3}, {"date": "2026-08-25", "zzc": 8481974.6284, "sz": 18496309, "datas": [{"code": "cn_600664", "dryk": -22529, "zongchengben": 10116483.5472, "zdrykzdryk": -22529}], "sprescount": 3}, {"date": "2026-08-26", "zzc": 8414387.6284, "sz": 18428722, "datas": [{"code": "cn_600664", "dryk": -67587.000000003, "zongchengben": 10116483.5472, "zdrykzdryk": -67587.000000003}], "sprescount": 3}, {"date": "2026-08-27", "zzc": 9698540.6284, "sz": 19712875, "datas": [{"code": "cn_600664", "dryk": 1284153, "zongchengben": 10116483.5472, "zdrykzdryk": 1284153}], "sprescount": 3}, {"date": "2026-08-28", "zzc": 10266288.0018, "sz": 20133000, "datas": [{"code": "cn_600664", "dryk": 567747.3734, "zongchengben": 9968861.1738, "zdrykzdryk": 567747.3734}], "sprescount": 3}];
  var all = JSON.parse(localStorage.getItem('local_dailySnapshots') || '{}');
  all[KEY] = rawSnaps;
  localStorage.setItem('local_dailySnapshots', JSON.stringify(all));

  // 让当前用户初始资金与原始对齐，复现收益率曲线
  // 原始 first_zzc=82894.89
  try {
    var login = JSON.parse(localStorage.getItem('loginData') || '{}');
    login.name = 'admin';
    login.userdata = login.userdata || {};
    login.userdata.username = 'admin';
    login.userdata.Id = '1';
    login.userdata.Initialmoney = '82894.89';
    localStorage.setItem('loginData', JSON.stringify(login));
  } catch(e){}

  localStorage.removeItem('QxstockDataqxmonth');
  localStorage.removeItem('QxstockDataDateqxmonth');
  console.log('INJECT_OK key=' + KEY + ' count=' + rawSnaps.length + ' firstZzc=' + rawSnaps[0].zzc + ' lastZzc=' + rawSnaps[rawSnaps.length-1].zzc);
  return '注入完成 ' + rawSnaps.length + ' 条';
})();
