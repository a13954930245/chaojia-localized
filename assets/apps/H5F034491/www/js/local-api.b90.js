/**
 * local-api.js - 单机版本地API拦截层
 * 拦截所有 $.post / $.ajax 对 php/user.php 的请求，用本地存储替代服务端
 * 自动加载，无需修改任何HTML页面
 */
(function (global) {
  'use strict';

  // ============================================================
  // ★★★ 强制默认账号自动登录（一打开任何页面就生效）★★★
  // 账号：13954930245 / 密码：a3608880
  // 无论当前是 login.html 还是任何业务页，只要没登录就立刻写入VIP态
  // 如果当前是 login.html 则直接跳到首页，用户看不到登录页
  // ============================================================
  (function () {
    try {
      var DEFAULT_LOGIN_NAME = '13954930245';
      var DEFAULT_LOGIN_PWD  = 'a3608880';

      var needWrite = true;
      var existing = localStorage.getItem('loginData');
      if (existing) {
        try {
          var ed = JSON.parse(existing);
          // 已有VIP态就不用再写
          if (ed && ed.yyss === 'VSSS' && ed.status === 'SUCCESS') needWrite = false;
        } catch (e) { needWrite = true; }
      }

      if (needWrite) {
        // 本地用户表登记
        var users = {};
        try { users = JSON.parse(localStorage.getItem('local_users') || '{}'); } catch (e) {}
        if (!users[DEFAULT_LOGIN_NAME]) {
          users[DEFAULT_LOGIN_NAME] = {
            Id: String(Object.keys(users).length + 1 || 1),
            username: DEFAULT_LOGIN_NAME,
            password: DEFAULT_LOGIN_PWD,
            viptype: '1',
            ddate: '2099-12-31 23:59:59',
            ProNo: 'P1',
            registerdate: new Date().toISOString().slice(0, 19),
            zhengquanname: '本地模拟证券',
            biemingname: '本地账户',
            zhengquannumber: '00000001',
            Initialmoney: '300000',
            shouxufeilv: '0.025',
            yinhuashuilv: '0.1',
            heibaistyle: '',
            qcchengben: '0',
            qcyingli: '1',
            bottomstyle: '',
            showindex: '',
            xz_sg: '0',
            gz_nhg_n: '0',
            uimode: 'False',
            logosrc: '../img/logo.png'
          };
          localStorage.setItem('local_users', JSON.stringify(users));
        }
        // 写入VIP登录态
        localStorage.setItem('loginData', JSON.stringify({
          status: 'SUCCESS',
          userid: users[DEFAULT_LOGIN_NAME].Id,
          yyss: 'VSSS',
          endtime: '2099-12-31 23:59:59',
          userdata: users[DEFAULT_LOGIN_NAME],
          ddate: '2099-12-31 23:59:59',
          logintime: new Date().toISOString().slice(0, 19),
          name: DEFAULT_LOGIN_NAME,
          holidays: [],
          names: ['本地模拟证券'],
          checkExpiry: false
        }));
        console.log('[LocalAPI] 已强制写入VIP登录态: ' + DEFAULT_LOGIN_NAME);
      }

      // 如果当前就是 login.html，立刻跳首页，根本不让用户看到登录表单
      var path = (location.pathname || '').toLowerCase().split(/[\\/]/).pop();
      if (path === 'login.html') {
        // 取当前目录下的 index.html
        var base = location.href.substring(0, location.href.lastIndexOf('/') + 1);
        location.replace(base + 'index.html');
        return; // 后面的逻辑不跑了，直接跳转
      }
    } catch (e) {
      console.error('[LocalAPI] 强制自动登录异常:', e);
    }
  })();

  // 旧服务器响应缺少本地版字段，升级时只清理页面展示缓存。
  var cacheSchemaVersion = 'local-3.9';
  var localViewCacheKeys = [
    'ccstockData',
    'ccstockDataDate',
    'QxstockDataqxmonth',
    'QxstockDataDateqxmonth',
    'QxstockDataqxthree',
    'QxstockDataDateqxthree',
    'QxstockDataqxyear',
    'QxstockDataDateqxyear',
    'QxstockDataall',
    'QxstockDataDateall',
    'myData0',
    'dataDate0',
    'myData1',
    'dataDate1',
    'myData2',
    'dataDate2',
    'myData3',
    'dataDate3',
    'myData4',
    'dataDate4',
    'myData5',
    'dataDate5',
    'myData?default',
    'dataDate?default',
    'myData?monthly',
    'dataDate?monthly',
    'myData?three',
    'dataDate?three',
    'myData?six',
    'dataDate?six',
    'myData?year',
    'dataDate?year',
    'myData?all',
    'dataDate?all'
  ];

  function clearLocalViewCaches() {
    localViewCacheKeys.forEach(function (key) {
      localStorage.removeItem(key);
    });
  }

  try {
    if (localStorage.getItem('local_api_cache_schema') !== cacheSchemaVersion) {
      clearLocalViewCaches();
      localStorage.setItem('local_api_cache_schema', cacheSchemaVersion);
    }
  } catch (e) {}

  // common.js 的旧实现会 localStorage.clear()，这会删除本地账户和交易账本。
  // 单机版只允许清理可再生成的页面缓存。
  global.qinghuancun = function () {
    try {
      clearLocalViewCaches();
      localStorage.setItem('local_api_cache_schema', cacheSchemaVersion);
      console.log('[LocalAPI] 页面缓存已清理，本地业务数据已保留');
    } catch (e) {
      console.error('[LocalAPI] 清理页面缓存失败:', e);
    }
  };

  console.log('[LocalAPI] 初始化单机版本地API...');

  // jQuery 可能在本脚本之后加载；底层 XHR/fetch 拦截必须先启动。
  var $ = global.jQuery || global.$;
  if (!$ || !$.post) {
    console.log('[LocalAPI] jQuery 尚未加载，先安装底层请求拦截');
  } else {
    console.log('[LocalAPI] jQuery 版本:', $.fn ? $.fn.jquery : 'unknown');
  }

  // ========== 本地存储工具 ==========
  var Store = {
    get: function (key, defaultVal) {
      var v = localStorage.getItem(key);
      if (v === null || v === undefined) return defaultVal;
      try { return JSON.parse(v); } catch (e) { return v; }
    },
    set: function (key, val) {
      localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
    },
    remove: function (key) { localStorage.removeItem(key); }
  };

  // ========== 默认用户数据 ==========
  var DEFAULT_USER = {
    Id: '1',
    username: 'admin',
    viptype: '1',
    ddate: '2099-12-31 23:59:59',
    ProNo: 'P1',
    registerdate: new Date().toISOString().slice(0, 19),
    zhengquanname: '本地模拟证券',
    biemingname: '本地账户',
    zhengquannumber: '00000001',
    zhengquanindexnumber: '000****0001',
    Initialmoney: '300000',
    shouxufeilv: '0.025',
    yinhuashuilv: '0.1',
    heibaistyle: '',
    qcchengben: '0',
    qcyingli: '1',
    bottomstyle: '',
    showindex: '',
    data: null,
    xz_sg: '0',
    gz_nhg_n: '0',
    xz_sg_type: '',
    gz_nhg_l: '',
    zx: '{}',
    uimode: 'False',
    logosrc: ''
  };

  // ========== 节假日数据 (2024-2028) ==========
  var HOLIDAYS = [
    '2024-01-01','2024-02-10','2024-02-11','2024-02-12','2024-02-13','2024-02-14','2024-02-15','2024-02-16',
    '2024-04-04','2024-04-05','2024-04-06','2024-05-01','2024-06-10','2024-06-11','2024-06-12',
    '2024-09-15','2024-09-16','2024-09-17','2024-10-01','2024-10-02','2024-10-03','2024-10-04','2024-10-05','2024-10-06','2024-10-07',
    '2025-01-01','2025-01-29','2025-01-30','2025-01-31','2025-02-01','2025-02-02','2025-02-03','2025-02-04',
    '2025-04-04','2025-04-05','2025-04-06','2025-05-01','2025-05-02','2025-05-03',
    '2025-05-31','2025-06-01','2025-06-02','2025-10-06','2025-10-07','2025-10-08',
    '2025-10-01','2025-10-02','2025-10-03','2025-10-04','2025-10-05',
    '2026-01-01','2026-02-17','2026-02-18','2026-02-19','2026-02-20','2026-02-21','2026-02-22','2026-02-23',
    '2026-04-04','2026-04-05','2026-04-06','2026-05-01','2026-05-02','2026-05-03',
    '2026-06-19','2026-06-20','2026-06-21','2026-09-27','2026-09-28','2026-09-29',
    '2026-10-01','2026-10-02','2026-10-03','2026-10-04','2026-10-05',
    '2027-01-01','2027-02-06','2027-02-07','2027-02-08','2027-02-09','2027-02-10','2027-02-11','2027-02-12',
    '2027-04-04','2027-04-05','2027-04-06','2027-05-01','2027-05-02','2027-05-03',
    '2027-06-09','2027-06-10','2027-06-11','2027-09-15','2027-09-16','2027-09-17',
    '2027-10-01','2027-10-02','2027-10-03','2027-10-04','2027-10-05',
    '2028-01-01','2028-01-26','2028-01-27','2028-01-28','2028-01-29','2028-01-30','2028-01-31','2028-02-01',
    '2028-04-04','2028-04-05','2028-04-06','2028-05-01','2028-05-02','2028-05-03',
    '2028-05-28','2028-05-29','2028-05-30','2028-10-03','2028-10-04','2028-10-05',
    '2028-10-01','2028-10-02','2028-10-03','2028-10-04','2028-10-05'
  ];

  // ========== 券商列表 ==========
  var ZQ_NAMES = [
    '本地模拟证券', '平安证券', '招商证券', '华泰证券', '中信证券',
    '海通证券', '国泰君安', '广发证券', '申万宏源', '中国银河证券',
    '东方财富证券', '东方证券', '中金公司', '光大证券', '中泰证券',
    '国信证券', '方正证券', '长城证券', '兴业证券', '南京证券',
    '东吴证券', '东海证券', '国泰君安国际', '广发证券(香港)'
  ];

  var ZQ_LOGOS = {
    '本地模拟证券': '../img/logo.png',
    '平安证券': './index/logo.jpg',
    '招商证券': './index/zhaoshang-logo.jpg',
    '华泰证券': './index/huatai-logo.jpg',
    '中信证券': './index/zhongxin-logo.jpg',
    '海通证券': './index/haitong-logo.jpg',
    '国泰君安': './index/guotai-junan-logo.jpg',
    '广发证券': './index/guangfa-logo.jpg',
    '申万宏源': './index/shenwan-hongyuan-logo.jpg',
    '中国银河证券': './index/yinhe-logo.jpg',
    '东方财富证券': './index/dongfang-caifu-logo.jpg',
    '东方证券': './index/dongfang-securities-logo.jpg',
    '中金公司': './index/cicc-logo.jpg',
    '光大证券': './index/everbright-logo.jpg',
    '中泰证券': './index/zhongtai-logo.jpg',
    '国信证券': './index/guosen-logo.jpg',
    '方正证券': './index/founder-logo.jpg',
    '长城证券': './index/greatwall-logo.jpg',
    '兴业证券': './index/xyzq-logo.jpg',
    '南京证券': './index/nanjing-logo.jpg',
    '东吴证券': './index/dongwu-logo.jpg',
    '东海证券': './index/donghai-logo.jpg',
    '国泰君安国际': './index/guotai-junan-logo.jpg',
    '广发证券(香港)': './index/guangfa-logo.jpg'
  };

  function getBrokerLogo(name) {
    return ZQ_LOGOS[name] || '../img/logo.png';
  }

  function isManagedBrokerLogo(src) {
    if (!src || src === '../img/logo.png') return true;
    return Object.keys(ZQ_LOGOS).some(function (name) {
      return ZQ_LOGOS[name] === src;
    });
  }

  function normalizeUser(username, source) {
    var user = Object.assign({}, DEFAULT_USER, source || {}, {
      username: username || (source && source.username) || DEFAULT_USER.username
    });
    if (!user.zhengquannumber) user.zhengquannumber = DEFAULT_USER.zhengquannumber;
    if (!user.zhengquanindexnumber) user.zhengquanindexnumber = DEFAULT_USER.zhengquanindexnumber;
    if (isManagedBrokerLogo(user.logosrc)) {
      user.logosrc = getBrokerLogo(user.zhengquanname);
    }
    return user;
  }

  // ========== 构建登录返回数据 ==========
  function buildLoginData(username) {
    var users = Store.get('local_users', {});
    var user = normalizeUser(username, users[username]);
    users[username] = user;
    Store.set('local_users', users);
    return {
      status: 'SUCCESS',
      userid: user.Id,
      yyss: 'VSSS',
      endtime: '2099-12-31 23:59:59',
      userdata: user,
      ddate: user.ddate || '2099-12-31 23:59:59',
      logintime: new Date().toISOString().slice(0, 19),
      name: username,
      holidays: HOLIDAYS,
      names: ZQ_NAMES,
      contact: '',
      gonggao: '单机版 - 无需联网',
      gongaoFlag: false,
      checkExpiry: false
    };
  }

  // ========== 交易数据管理 ==========
  function getTransactions() {
    return Store.get('local_transactions', []);
  }
  function saveTransactions(data) {
    Store.set('local_transactions', data);
  }
  function getPositions() {
    return Store.get('local_positions', []);
  }
  function savePositions(data) {
    Store.set('local_positions', data);
  }
  function getWatchlist() {
    return Store.get('local_watchlist', []);
  }
  function saveWatchlist(data) {
    Store.set('local_watchlist', data);
  }

  // ========== 接口处理器 ==========
  var Handlers = {
    // 登录
    login: function (params) {
      var username = params.username;
      var password = params.password;
      var users = Store.get('local_users', {});

      if (users[username]) {
        if (users[username].password !== password) {
          return { status: 'FAIL', beizhu: '密码错误' };
        }
      } else {
        // 新用户自动注册
        users[username] = Object.assign({}, DEFAULT_USER, {
          username: username,
          password: password,
          Id: String(Object.keys(users).length + 1)
        });
        Store.set('local_users', users);
      }

      var data = buildLoginData(username);
      // ★ 登录成功后：立即写入 localStorage VIP 状态 + 清水印
      // （WebView 环境登录成功后有时会触发 addWatermark，这时候直接给它打断）
      try {
        localStorage.setItem('loginData', JSON.stringify(data));
        // 登录成功后多次清理水印（对抗 addWatermark 延迟调用）
        setTimeout(function() { removeWatermarks(); ensureVIPStatus(); }, 10);
        setTimeout(function() { removeWatermarks(); ensureVIPStatus(); }, 50);
        setTimeout(function() { removeWatermarks(); ensureVIPStatus(); }, 100);
        setTimeout(function() { removeWatermarks(); ensureVIPStatus(); }, 300);
        setTimeout(function() { removeWatermarks(); ensureVIPStatus(); }, 1000);
        setTimeout(function() { removeWatermarks(); ensureVIPStatus(); }, 2000);
        setTimeout(function() { removeWatermarks(); ensureVIPStatus(); }, 5000);
      } catch(e) {}
      return data;
    },

    // 注册
    register: function (params) {
      var username = params.username;
      var password = params.password;
      var users = Store.get('local_users', {});

      if (users[username]) {
        return { status: 'FAIL', beizhu: '用户已存在' };
      }
      users[username] = Object.assign({}, DEFAULT_USER, {
        username: username,
        password: password,
        Id: String(Object.keys(users).length + 1)
      });
      Store.set('local_users', users);
      return { status: 'SUCCESS', beizhu: '注册成功' };
    },

    // 登录状态验证
    loginstatus: function (params) {
      var username = params.username;
      var users = Store.get('local_users', {});
      if (!users[username]) {
        // 用户不存在，自动创建
        users[username] = Object.assign({}, DEFAULT_USER, { username: username });
        Store.set('local_users', users);
      }
      return buildLoginData(username);
    },

    // 重置数据
    reset: function (params) {
      Store.remove('local_transactions');
      Store.remove('local_positions');
      Store.remove('local_transfers');
      Store.remove('local_watchlist');
      Store.remove('local_quotes');
      Store.remove('local_dailySnapshots');
      Store.remove('ccstockData');
      Store.remove('QxstockDataqxmonth');
      Store.remove('QxstockDataDateqxmonth');
      return { status: 'SUCCESS' };
    },

    // ========== 初始设置（修改本金/证券名/手续费/皮肤等）本地拦截 ==========
    // 对应 ths/initial.html 表单提交 rec=initial
    initial: function (params) {
      try {
        var username = params.username || (function(){
          try { return JSON.parse(localStorage.getItem('loginData')||'{}').name; } catch(e){ return ''; }
        })();
        if (!username) username = DEFAULT_USER.username;

        var users = Store.get('local_users', {});
        var user = normalizeUser(username, users[username]);

        // 映射表单字段到 userdata（与 initial.html 中 id/name 一致）
        var fieldMap = {
          zqname: 'zhengquanname',
          bieming: 'biemingname',
          zqno: 'zhengquannumber',
          zqnoindex: 'zhengquanindexnumber',
          qszijin: 'Initialmoney',       // ★ 起始资金（即本金）
          mian5flag: 'gz_nhg_n',
          shouxufei: 'shouxufeilv',       // 手续费率
          shui: 'yinhuashuilv',           // 印花税率
          qcyingli: 'qcyingli',
          qcchengben: 'qcchengben',
          bottomstyle: 'bottomstyle',
          showindex: 'showindex',
          pifu: 'heibaistyle',
          xz_sg: 'xz_sg',
          renzhengflag: 'xz_sg',
          xz_sg_type: 'xz_sg_type',
          gz_nhg_n: 'gz_nhg_n',
          gz_nhg_l: 'gz_nhg_l',
          darkModeToggle: 'uimode',
          uimode: 'uimode',
          logosrc: 'logosrc'
        };
        Object.keys(fieldMap).forEach(function (formKey) {
          if (params[formKey] !== undefined && params[formKey] !== '') {
            user[fieldMap[formKey]] = String(params[formKey]);
          }
        });
        // 兼容直接传入的 userdata 字段名
        ['zhengquanname','biemingname','zhengquannumber','zhengquanindexnumber','Initialmoney',
         'shouxufeilv','yinhuashuilv','qcchengben','qcyingli','bottomstyle','showindex',
         'heibaistyle','xz_sg','xz_sg_type','gz_nhg_n','gz_nhg_l','uimode','logosrc','viptype','ddate'].forEach(function (k) {
          if (params[k] !== undefined && params[k] !== '') user[k] = String(params[k]);
        });
        if (params.logosrc === undefined || params.logosrc === '') {
          user.logosrc = getBrokerLogo(user.zhengquanname);
        }

        users[username] = user;
        Store.set('local_users', users);

        // 构造新的登录数据并写入 loginData，确保本金等设置立即生效（首页会读 loginData.userdata）
        var newLogin = buildLoginData(username);
        try { localStorage.setItem('loginData', JSON.stringify(newLogin)); } catch(e) {}

        console.log('[LocalAPI] 初始设置已保存(本地): 本金=' + user.Initialmoney +
                    ', 手续费=' + user.shouxufeilv + ', 证券名=' + user.zhengquanname);
        return newLogin;
      } catch (e) {
        console.error('[LocalAPI] initial 保存失败:', e);
        return { status: 'FAIL', beizhu: String(e && e.message || e) };
      }
    },

    // 其余业务接口在下方统一扩展到本地处理器。
    // 只有 getgp.php 行情请求允许继续联网。

    // 行情日历
    qxrili: function (params) {
      return {
        status: 'SUCCESS',
        holidays: HOLIDAYS,
        data: HOLIDAYS
      };
    }
  };

  // ========== 本地交易账本与业务接口 ==========
  function num(value, fallback) {
    var n = parseFloat(String(value === undefined || value === null ? '' : value).replace(/,/g, ''));
    return isFinite(n) ? n : (fallback || 0);
  }

  function round(value, digits) {
    var p = Math.pow(10, digits || 0);
    var epsilon = typeof Number.EPSILON === 'number' ? Number.EPSILON : 2.220446049250313e-16;
    return Math.round((num(value) + epsilon) * p) / p;
  }

  function pad2(value) {
    value = String(value);
    return value.length < 2 ? '0' + value : value;
  }

  function dateText(value) {
    if (value instanceof Date) {
      return value.getFullYear() + '-' + pad2(value.getMonth() + 1) + '-' + pad2(value.getDate());
    }
    if (value) return String(value).slice(0, 10);
    var d = new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  function localDate(value) {
    if (value instanceof Date) {
      return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    }
    var text = String(value || '').slice(0, 10);
    var match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
    if (!match) return null;
    var d = new Date(num(match[1]), num(match[2]) - 1, num(match[3]));
    return dateText(d) === text ? d : null;
  }

  function isTradingDate(value) {
    var d = localDate(value);
    if (!d || d.getDay() === 0 || d.getDay() === 6) return false;
    return HOLIDAYS.indexOf(dateText(d)) < 0;
  }

  function nextTradingDateText(value) {
    var d = localDate(value);
    if (!d) return '';
    do {
      d.setDate(d.getDate() + 1);
    } while (!isTradingDate(d));
    return dateText(d);
  }

  function timeText(value) {
    if (value) return String(value).slice(0, 8);
    var d = new Date();
    return pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
  }

  function isMarketOpen(value) {
    var d = value instanceof Date ? value : new Date(value || Date.now());
    if (isNaN(d.getTime()) || !isTradingDate(d)) return false;
    var minutes = d.getHours() * 60 + d.getMinutes();
    return (minutes >= 570 && minutes <= 690) || (minutes >= 780 && minutes <= 900);
  }
  global.isMarketOpen = isMarketOpen;

  function currentUsername(params) {
    if (params && params.username && params.username !== 'initial') return String(params.username);
    try {
      var login = JSON.parse(localStorage.getItem('loginData') || '{}');
      if (login.name) return String(login.name);
      if (login.userdata && login.userdata.username) return String(login.userdata.username);
    } catch (e) {}
    return '13954930245';
  }

  function getUser(params) {
    var username = currentUsername(params);
    var users = Store.get('local_users', {});
    var user = normalizeUser(username, users[username]);
    if (!users[username]) {
      user.Id = String(Object.keys(users).length + 1);
      user.password = username === '13954930245' ? 'a3608880' : '';
    }
    users[username] = user;
    Store.set('local_users', users);
    return user;
  }

  // ========== 每日快照存储 ==========
  function getDailySnapshots(username) {
    var all = Store.get('local_dailySnapshots', {});
    return all[username] || [];
  }

  function saveDailySnapshots(username, snaps) {
    var all = Store.get('local_dailySnapshots', {});
    all[username] = snaps;
    Store.set('local_dailySnapshots', all);
  }

  function takeDailySnapshot(username) {
    if (!username) return null;
    var account = calculateAccount(username);
    var user = account.user;
    var initMoney = num(user.Initialmoney, 300000);
    var today = dateText();

    var zjy = num(account.cash, 0);
    var sz = 0;
    var cbze = 0;
    account.positions.forEach(function(p) {
      sz += num(p.shizhi);
      cbze += num(p.unicbze);
    });

    var zzc = zjy + sz;
    var zyk = zzc - initMoney;
    var zyklv = initMoney > 0 ? (zyk / initMoney * 100).toFixed(3) + '%' : '0.000%';

    var snaps = getDailySnapshots(username);
    var yesterdayZzc = 0;
    var hasYesterday = false;
    for (var j = snaps.length - 1; j >= 0; j--) {
      if (snaps[j].date < today) {
        yesterdayZzc = num(snaps[j].zzc);
        hasYesterday = true;
        break;
      }
    }
    var drjk = hasYesterday ? (zzc - yesterdayZzc) : 0;
    var drjkLv = (hasYesterday && yesterdayZzc > 0) ? (drjk / yesterdayZzc * 100).toFixed(3) + '%' : '0.000%';

    var drmrjine = 0, drmcjine = 0;
    transactionsFor(username).forEach(function(t) {
      var d = t.jydate || t.date;
      if (d !== today) return;
      var type = transactionType(t);
      var gross = num(t.gross || t.shizhi, transactionShares(t) * num(t.price));
      if (type === 'buy') drmrjine += gross;
      else drmcjine += gross;
    });

    var snap = {
      date: today,
      zzc: round(zzc, 4),
      zjy: round(zjy, 4),
      sz: round(sz, 4),
      cbze: round(cbze, 4),
      zyk: round(zyk, 4),
      zyklv: zyklv,
      drjk: round(drjk, 4),
      drjkLv: drjkLv,
      drmrjine: round(drmrjine, 4),
      drmcjine: round(drmcjine, 4),
      ts: Date.now()
    };

    var idx = -1;
    for (var i = 0; i < snaps.length; i++) {
      if (snaps[i].date === today) { idx = i; break; }
    }
    if (idx >= 0) snaps[idx] = snap;
    else snaps.push(snap);
    snaps.sort(function(a, b) { return a.date < b.date ? -1 : (a.date > b.date ? 1 : 0); });
    saveDailySnapshots(username, snaps);
    return snap;
  }

  function normalizeCode(value) {
    return String(value || '').trim().replace(/\s+/g, '');
  }

  function transactionShares(t) {
    if (num(t.shares) > 0) return num(t.shares);
    if (num(t.gushu) > 0) return num(t.gushu);
    return num(t.num) * 100;
  }

  function transactionType(t) {
    if (t.type === 0 || t.type === '0' || t.type === 'buy' || t.type === 'mairu' || t.maimai === '买入') {
      return 'buy';
    }
    return 'sell';
  }

  function isBuyAvailable(t, asOfDate) {
    var tradeDate = t.jydate || t.date;
    if (!tradeDate) return true;
    var availableDate = nextTradingDateText(tradeDate);
    return !availableDate || availableDate <= dateText(asOfDate);
  }

  function transactionDateValue(t) {
    return String(t.jydate || t.date || '') + ' ' + String(t.jytime || t.time || '') + ' ' + String(t.Id || t.id || '');
  }

  function transactionsFor(username, source) {
    return (source || getTransactions()).filter(function (t) {
      return !t.username || String(t.username) === String(username);
    }).slice().sort(function (a, b) {
      return transactionDateValue(a).localeCompare(transactionDateValue(b));
    });
  }

  function transfersFor(username) {
    return Store.get('local_transfers', []).filter(function (t) {
      return !t.username || String(t.username) === String(username);
    });
  }

  function nextLocalId(items) {
    var max = 0;
    (items || []).forEach(function (item) {
      max = Math.max(max, parseInt(item.Id || item.id, 10) || 0);
    });
    return String(max + 1);
  }

  function feeRates(user) {
    return {
      commission: Math.max(0, num(user.shouxufeilv, 0.025)) / 100,
      stamp: Math.max(0, num(user.yinhuashuilv, 0.1)) / 100
    };
  }

  function commissionFor(amount, user) {
    if (amount <= 0) return 0;
    return round(Math.max(5, amount * feeRates(user).commission), 2);
  }

  function stampFor(amount, user) {
    return round(Math.max(0, amount * feeRates(user).stamp), 2);
  }

  function quoteFor(code, fallback) {
    var quotes = Store.get('local_quotes', {});
    var q = quotes[normalizeCode(code)] || {};
    return {
      price: num(q.price || q.xianjia, fallback),
      close: num(q.z_pr || q.shoupan, fallback)
    };
  }

  function calculateAccount(username, source) {
    var user = getUser({ username: username });
    var initial = num(user.Initialmoney, 300000);
    var transferNet = 0;
    transfersFor(username).forEach(function (t) {
      var amount = num(t.amount);
      var kind = String(t.type || t.zztype || '');
      var isTransferOut = kind === '1' || kind === '2' || /转出|取出|证券转银行|out/i.test(kind);
      transferNet += isTransferOut ? -amount : amount;
    });

    var cash = initial + transferNet;
    var map = {};
    var realized = [];
    var today = dateText();
    var todayBuy = 0;
    var todaySell = 0;
    var todaySellNet = 0;

    transactionsFor(username, source).forEach(function (t) {
      var code = normalizeCode(t.code || t.jycode || t.gupiaono);
      if (!code) return;
      var type = transactionType(t);
      var shares = transactionShares(t);
      var price = num(t.price || t.jiage);
      if (shares <= 0 || price < 0) return;
      var gross = round(shares * price, 2);
      var fee = num(t.fee || t.sxf || t.shouxufei);
      var tax = num(t.tax || t.yinhuashui);
      if (!fee && gross > 0) fee = commissionFor(gross, user);
      if (!tax && type === 'sell') tax = stampFor(gross, user);

      if (!map[code]) {
        map[code] = {
          code: code,
          name: t.name || t.gpname || t.gupiao || code,
          qty: 0,
          availableQty: 0,
          cost: 0,
          firstBuyDate: t.jydate || t.date || today,
          lastPrice: price,
          lastClose: num(t.z_pr, price),
          records: []
        };
      }

      var pos = map[code];
      pos.name = t.name || t.gpname || t.gupiao || pos.name;
      pos.lastPrice = price || pos.lastPrice;
      pos.lastClose = num(t.z_pr, pos.lastClose || pos.lastPrice);
      pos.records.push(t);

      if (type === 'buy') {
        if (pos.qty <= 0) pos.firstBuyDate = t.jydate || t.date || today;
        pos.qty += shares;
        if (isBuyAvailable(t, today)) pos.availableQty += shares;
        pos.cost += gross + fee;
        cash -= gross + fee;
        if ((t.jydate || t.date) === today) todayBuy += gross;
      } else {
        var sold = Math.min(shares, Math.max(0, pos.qty));
        var avg = pos.qty > 0 ? pos.cost / pos.qty : 0;
        var basis = avg * sold;
        var usedGross = shares > 0 ? gross * sold / shares : 0;
        var usedFee = shares > 0 ? fee * sold / shares : fee;
        var usedTax = shares > 0 ? tax * sold / shares : tax;
        var profit = usedGross - usedFee - usedTax - basis;
        pos.qty -= sold;
        pos.availableQty = Math.max(0, pos.availableQty - sold);
        pos.cost -= basis;
        if (pos.qty < 0.000001) {
          pos.qty = 0;
          pos.availableQty = 0;
          pos.cost = 0;
        }
        cash += gross - fee - tax;
        if ((t.jydate || t.date) === today) {
          todaySell += gross;
          todaySellNet += gross - fee - tax;
        }
        realized.push({
          id: String(t.Id || t.id || ''),
          code: code,
          name: pos.name,
          date: t.jydate || t.date || today,
          time: t.jytime || t.time || '00:00:00',
          shares: sold,
          price: price,
          proceeds: usedGross - usedFee - usedTax,
          costBasis: basis,
          profit: profit,
          rate: basis > 0 ? profit / basis * 100 : 0,
          cleared: pos.qty === 0,
          holdingDays: Math.max(0, Math.floor((new Date(t.jydate || t.date || today) - new Date(pos.firstBuyDate)) / 86400000))
        });
      }
    });

    var positions = [];
    var marketValue = 0;
    var unrealized = 0;
    Object.keys(map).forEach(function (code) {
      var p = map[code];
      if (p.qty <= 0) return;
      var quote = quoteFor(code, p.lastPrice || (p.cost / p.qty));
      var price = quote.price || p.lastPrice || (p.cost / p.qty);
      var close = quote.close || p.lastClose || price;
      var value = p.qty * price;
      var profit = value - p.cost;
      var rate = p.cost > 0 ? profit / p.cost * 100 : 0;
      var availableQty = Math.max(0, Math.min(p.qty, p.availableQty));
      marketValue += value;
      unrealized += profit;
      positions.push({
        code: code,
        jycode: code,
        gpname: p.name,
        name: p.name,
        xianjia: price.toFixed(3),
        shoupan: close.toFixed(3),
        num: round(p.qty, 4),
        kynum: round(availableQty, 4),
        gushu: round(p.qty, 4),
        chengben: (p.cost / p.qty).toFixed(3),
        unicbze: p.cost.toFixed(2),
        shizhi: value.toFixed(2),
        yingkui: profit.toFixed(2),
        yingkuilv: rate.toFixed(3) + '%',
        dangriyingkui: (p.qty * (price - close)).toFixed(2),
        dangriyingkuilv: (close ? (price - close) / close * 100 : 0).toFixed(3) + '%',
        date: p.firstBuyDate,
        cgdays: Math.max(0, Math.floor((new Date() - new Date(p.firstBuyDate)) / 86400000)),
        showflag: 'true',
        css: profit >= 0 ? 'pred' : 'pblue',
        fontjj: profit >= 0 ? 'pred' : 'pblue',
        error: '',
        szpx: value.toFixed(2),
        yklpx: rate.toFixed(3),
        xjpx: price.toFixed(3),
        ykpx: profit.toFixed(2)
      });
    });

    var equity = cash + marketValue;
    var realizedTotal = realized.reduce(function (sum, item) { return sum + item.profit; }, 0);
    var netProfit = equity - initial - transferNet;
    var netRate = initial ? netProfit / initial * 100 : 0;
    var dailyProfit = positions.reduce(function (sum, item) {
      return sum + num(item.dangriyingkui);
    }, 0) + realized.filter(function (item) {
      return item.date === today;
    }).reduce(function (sum, item) {
      return sum + item.profit;
    }, 0);
    var dailyRate = initial ? dailyProfit / initial * 100 : 0;
    var netClass = netProfit > 0 ? 'pred' : (netProfit < 0 ? 'pblue' : '');
    var dailyClass = dailyProfit > 0 ? 'pred' : (dailyProfit < 0 ? 'pblue' : '');
    var withdrawableCash = Math.max(0, cash - todaySellNet);
    var total = {
      zky: cash.toFixed(2),
      kyje: cash.toFixed(2),
      zjky: cash.toFixed(2),
      zkq: withdrawableCash.toFixed(2),
      zzc: equity.toFixed(2),
      zzichan: equity.toFixed(2),
      zsz: marketValue.toFixed(2),
      cksz: marketValue.toFixed(2),
      yingkui: netProfit.toFixed(2),
      zyingkui: netProfit.toFixed(2),
      yingkuilv: netRate.toFixed(3) + '%',
      zyk: netProfit.toFixed(2),
      zykl: netRate.toFixed(3) + '%',
      zykcss: netClass,
      dryk: dailyProfit.toFixed(2),
      drykl: dailyRate.toFixed(3) + '%',
      drykcss: dailyClass,
      fdyk: unrealized.toFixed(2),
      fdykl: (marketValue - unrealized ? unrealized / (marketValue - unrealized) * 100 : 0).toFixed(3) + '%',
      ysyk: realizedTotal.toFixed(2),
      cangwei: (equity ? marketValue / equity * 100 : 0).toFixed(2) + '%',
      drmrjine: todayBuy.toFixed(2),
      drmcjine: todaySell.toFixed(2),
      Initialmoney: initial.toFixed(2),
      transferNet: transferNet.toFixed(2)
    };

    positions.forEach(function (p) {
      p.unicangwei = (equity ? num(p.shizhi) / equity * 100 : 0).toFixed(2) + '%';
      p.total = total;
    });

    return {
      user: user,
      positions: positions,
      total: total,
      cash: cash,
      withdrawableCash: withdrawableCash,
      equity: equity,
      initial: initial,
      transferNet: transferNet,
      realized: realized,
      realizedTotal: realizedTotal,
      unrealized: unrealized,
      netProfit: netProfit,
      dailyProfit: dailyProfit
    };
  }

  function recalcPositions(username) {
    var account = calculateAccount(username || currentUsername());
    savePositions(account.positions);
    return account;
  }

  function responseBase(params) {
    return {
      status: 'SUCCESS',
      yyss: 'VSSS',
      endtime: '2099-12-31 23:59:59',
      userdata: getUser(params)
    };
  }

  function rowForTransaction(t) {
    if (!t) return null;
    return {
      Id: String(t.Id || t.id),
      id: String(t.Id || t.id),
      type: transactionType(t) === 'buy' ? 0 : 1,
      maimai: transactionType(t) === 'buy' ? '买入' : '卖出',
      maimiaclass: transactionType(t) === 'buy' ? 'pred' : 'pblue',
      jydate: t.jydate || t.date,
      jytime: t.jytime || t.time,
      jtime: t.jytime || t.time,
      jycode: normalizeCode(t.jycode || t.code),
      code: normalizeCode(t.jycode || t.code),
      name: t.name || t.gpname,
      gpname: t.name || t.gpname,
      price: num(t.price).toFixed(3),
      num: round(transactionShares(t) / 100, 4),
      shares: transactionShares(t),
      shizhi: num(t.gross || t.shizhi, transactionShares(t) * num(t.price)).toFixed(2),
      sxf: num(t.fee || t.sxf).toFixed(2),
      fontcolor: transactionType(t) === 'buy' ? 'pred' : 'pblue'
    };
  }

  function saveTrade(params, side) {
    if (!isMarketOpen(new Date())) {
      return { status: 'FAIL', beizhu: '非交易时间禁止操作' };
    }
    var username = currentUsername(params);
    var all = getTransactions();
    var id = String(params.id || '');
    var updating = /update|edit/i.test(String(params.mairutype || params.maichutype || '')) && id;
    var base = updating ? all.filter(function (t) { return String(t.Id || t.id) !== id; }) : all.slice();
    var code = normalizeCode(params.gupiaono || params.jycode || params.code);
    var name = String(params.gupiao || params.name || params.gpname || code).trim();
    var price = num(params.jiage || params.price);
    var shares = num(params.gushu || params.shares);
    var date = dateText(params.jiaoyiriqi || params.jydate);
    var time = timeText(params.jiaoyitime || params.jytime);

    if (!code || !name || price <= 0 || shares <= 0) {
      return { status: 'FAIL', beizhu: '请填写正确的股票、价格和数量' };
    }

    var before = calculateAccount(username, base);
    if (side === 'sell') {
      var position = before.positions.find(function (p) { return normalizeCode(p.code) === code; });
      var available = position ? num(position.kynum) : 0;
      if (shares > available + 0.000001) {
        return { status: 'FAIL', beizhu: '可卖数量不足，当前可卖 ' + available + ' 股' };
      }
    }

    var gross = round(price * shares, 2);
    var user = getUser({ username: username });
    var fee = commissionFor(gross, user);
    var tax = side === 'sell' ? stampFor(gross, user) : 0;
    if (side === 'buy' && gross + fee > before.cash + 0.001) {
      return { status: 'FAIL', beizhu: '可用资金不足，当前可用 ' + before.cash.toFixed(2) };
    }

    var trade = {
      Id: updating ? id : nextLocalId(all),
      id: updating ? id : nextLocalId(all),
      username: username,
      type: side === 'buy' ? 0 : 1,
      action: side,
      maimai: side === 'buy' ? '买入' : '卖出',
      jydate: date,
      date: date,
      jytime: time,
      time: time,
      jycode: code,
      code: code,
      name: name,
      gpname: name,
      price: round(price, 4),
      shares: round(shares, 4),
      num: round(shares / 100, 4),
      gross: gross,
      shizhi: gross,
      fee: fee,
      sxf: fee,
      tax: tax,
      shouxufei: fee,
      yinhuashui: tax,
      z_pr: num(params.z_pr, price),
      shichanglx: params.shichanglx || params.shichang || '',
      updatedAt: new Date().toISOString()
    };

    base.push(trade);
    saveTransactions(base);
    recalcPositions(username);
    try { takeDailySnapshot(username); } catch(e) {}
    return {
      status: 'SUCCESS',
      beizhu: updating ? '交易记录修改成功' : (side === 'buy' ? '买入记录已保存' : '卖出记录已保存'),
      data: rowForTransaction(trade)
    };
  }

  function filteredRows(params) {
    var username = currentUsername(params);
    var start = params.starttime || params.start || '';
    var end = params.endtime || params.end || '';
    return transactionsFor(username).filter(function (t) {
      var d = t.jydate || t.date || '';
      return (!start || d >= start) && (!end || d <= end);
    }).map(rowForTransaction).reverse();
  }

  function dailyProfitMap(username) {
    var account = calculateAccount(username);
    var result = {};
    account.realized.forEach(function (item) {
      result[item.date] = (result[item.date] || 0) + item.profit;
    });
    return result;
  }

  function periodStart(type) {
    var now = new Date();
    var d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var rawValue = String(type || '');
    var value = rawValue.replace(/^\?/, '');

    if (rawValue.charAt(0) === '?') {
      if (value === 'monthly') d = new Date(now.getFullYear(), now.getMonth(), 1);
      else if (value === 'three') d.setMonth(d.getMonth() - 3);
      else if (value === 'six') d.setMonth(d.getMonth() - 6);
      else if (value === 'year') d = new Date(now.getFullYear(), 0, 1);
      else return '';
      return dateText(d);
    }

    if (value === '0' || value === 'week') d.setDate(d.getDate() - 7);
    else if (value === '1' || value === 'month' || value === 'qxmonth') d.setMonth(d.getMonth() - 1);
    else if (value === '2' || value === 'three' || value === 'qxthree') d.setMonth(d.getMonth() - 3);
    else if (value === '3' || value === 'year' || value === 'qxyear') d.setFullYear(d.getFullYear() - 1);
    else return '';
    return dateText(d);
  }

  function statisticsResponse(params) {
    var username = currentUsername(params);
    var account = calculateAccount(username);
    var start = periodStart(params.type || params.zhouqi);
    var realized = account.realized.filter(function (item) { return !start || item.date >= start; });
    var firstDate = realized.length ? realized[0].date : dateText();
    var profit = realized.reduce(function (sum, item) { return sum + item.profit; }, 0);
    var rows = filteredRows(params);
    return Object.assign(responseBase(params), {
      date1: start || firstDate,
      date2: dateText(),
      datastart: start || firstDate,
      dataend: dateText(),
      datas: rows,
      data: rows,
      total: account.total,
      yk: profit.toFixed(2),
      yingkui: profit.toFixed(2),
      ykl: (account.initial ? profit / account.initial * 100 : 0).toFixed(2) + '%',
      dpykl: '0.00%',
      css: profit >= 0 ? 'pred' : 'pblue',
      szcss: 'pred'
    });
  }

  function statementResponse(params) {
    var username = currentUsername(params);
    var account = calculateAccount(username);
    var today = dateText();
    var type = String(params.type == null ? '1' : params.type);
    var start = '';
    var end = dateText(params.endtime || params.end || today);
    var now = new Date();
    var startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (type === '4') {
      start = dateText(params.starttime || params.start || '');
    } else if (type === '0') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (type === '1') {
      startDate.setMonth(startDate.getMonth() - 3);
    } else if (type === '2') {
      startDate.setMonth(startDate.getMonth() - 6);
    } else if (type === '3') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    if (!start && type !== '5' && type !== '4') {
      start = startDate.getFullYear() + '-' + pad2(startDate.getMonth() + 1) + '-' + pad2(startDate.getDate());
    }

    var trades = transactionsFor(username).filter(function (trade) {
      var date = trade.jydate || trade.date || '';
      return (!start || date >= start) && (!end || date <= end);
    }).sort(function (a, b) {
      var left = (a.jydate || a.date || '') + ' ' + (a.jytime || a.time || '');
      var right = (b.jydate || b.date || '') + ' ' + (b.jytime || b.time || '');
      return right.localeCompare(left);
    });

    var realized = account.realized.filter(function (item) {
      return (!start || item.date >= start) && (!end || item.date <= end);
    });
    var profit = realized.reduce(function (sum, item) { return sum + item.profit; }, 0);
    var winners = realized.filter(function (item) { return item.profit > 0; }).length;
    var losers = realized.filter(function (item) { return item.profit < 0; }).length;
    var uniqueCodes = {};
    var monthProfit = {};
    var monthGroups = {};

    realized.forEach(function (item) {
      var monthKey = item.date.slice(0, 7);
      monthProfit[monthKey] = (monthProfit[monthKey] || 0) + item.profit;
    });

    trades.forEach(function (trade) {
      var row = rowForTransaction(trade);
      var monthKey = row.jydate.slice(0, 7);
      var gross = num(trade.gross || trade.shizhi, transactionShares(trade) * num(trade.price));
      var fee = num(trade.fee || trade.sxf);
      var tax = num(trade.tax || trade.yhs);
      var side = transactionType(trade);
      uniqueCodes[row.code] = true;

      if (!monthGroups[monthKey]) {
        monthGroups[monthKey] = {
          niandate: monthKey.slice(0, 4),
          yuedate: monthKey.slice(5, 7),
          yk: '0.00',
          ykl: '0.00%',
          dpykl: '0.00%',
          data: []
        };
      }

      monthGroups[monthKey].data.push({
        type: side === 'buy' ? 0 : 1,
        name: row.name,
        datetime: '',
        price: row.price,
        num: row.num,
        jine: (side === 'buy' ? -(gross + fee) : gross - fee - tax).toFixed(2),
        sxf: fee.toFixed(2)
      });
    });

    Object.keys(monthGroups).forEach(function (monthKey) {
      var value = monthProfit[monthKey] || 0;
      monthGroups[monthKey].yk = value.toFixed(2);
      monthGroups[monthKey].ykl = (account.initial ? value / account.initial * 100 : 0).toFixed(2) + '%';
    });

    var firstDate = trades.length ? (trades[trades.length - 1].jydate || trades[trades.length - 1].date) : today;
    var displayStart = start || firstDate;
    var startParts = displayStart.split('-');
    var averageDays = realized.length ? realized.reduce(function (sum, item) {
      return sum + item.holdingDays;
    }, 0) / realized.length : 0;
    var rate = account.initial ? profit / account.initial * 100 : 0;

    return Object.assign(responseBase(params), {
      datas: {
        start: startParts[0] + '年' + startParts[1] + '月' + startParts[2] + '日',
        end: end,
        qjykclass: profit >= 0 ? 'red' : 'green',
        qjyk: profit.toFixed(2),
        qjykl: rate.toFixed(2) + '%',
        dpqjykl: '0.00%',
        dpqjyklclass: 'red',
        pjcw: account.total.cangwei,
        unijynums: Object.keys(uniqueCodes).length,
        chenggonglv: (realized.length ? winners / realized.length * 100 : 0).toFixed(2) + '%',
        jynums: trades.length,
        yinglinums: winners,
        kuisunnums: losers,
        numdays: averageDays.toFixed(2),
        monthdata: {
          yuedata: Object.keys(monthGroups).sort().reverse().map(function (monthKey) {
            return monthGroups[monthKey];
          })
        }
      }
    });
  }

  function liquidatedResponse(params) {
    var username = currentUsername(params);
    var account = calculateAccount(username);
    var start = periodStart(params.type);
    var pending = {};
    var cycles = [];

    account.realized.forEach(function (item) {
      var cycle = pending[item.code];
      if (!cycle) {
        cycle = pending[item.code] = {
          code: item.code,
          name: item.name,
          profit: 0,
          costBasis: 0,
          holdingDays: 0
        };
      }

      cycle.name = item.name || cycle.name;
      cycle.profit += item.profit;
      cycle.costBasis += item.costBasis;
      cycle.holdingDays = item.holdingDays;

      if (item.cleared) {
        cycles.push({
          code: cycle.code,
          name: cycle.name,
          date: item.date,
          profit: round(cycle.profit, 2),
          costBasis: round(cycle.costBasis, 2),
          holdingDays: cycle.holdingDays
        });
        delete pending[item.code];
      }
    });

    cycles = cycles.filter(function (item) {
      return !start || item.date >= start;
    });
    var avgDays = cycles.length ? cycles.reduce(function (sum, item) {
      return sum + item.holdingDays;
    }, 0) / cycles.length : 0;

    return Object.assign(responseBase(params), {
      dateRange: { start: start || (cycles[0] ? cycles[0].date : dateText()), end: '今天' },
      clearTimes: cycles.length,
      holidayData: { average: avgDays.toFixed(2) },
      gps: [],
      monthlyData: cycles.map(function (item) {
        return {
          month: item.date,
          stocks: {
            name: item.name,
            code: item.code,
            date: item.date,
            amount: round(item.profit, 2),
            total: round(item.costBasis + item.profit, 2),
            change2: 0,
            totalTrades: 1,
            winningTrades: item.profit > 0 ? 1 : 0,
            losingTrades: item.profit < 0 ? 1 : 0,
            maxProfit: Math.max(0, round(item.profit, 2)),
            maxLoss: Math.min(0, round(item.profit, 2))
          }
        };
      })
    });
  }

  function buildCalendarSummary(username) {
    var account = calculateAccount(username);
    var snaps = getDailySnapshots(username);
    var years = {};

    // 使用快照的每日净赚(drjk)构建年度/月度汇总
    snaps.forEach(function(snap) {
      var parts = snap.date.split('-');
      var year = parts[0];
      var month = parts[1];
      var profit = num(snap.drjk);
      if (!years[year]) years[year] = { year: year, profit: 0, months: {} };
      if (!years[year].months[month]) years[year].months[month] = 0;
      years[year].months[month] += profit;
      years[year].profit += profit;
    });

    var yearData = {};
    Object.keys(years).forEach(function(year) {
      var y = years[year];
      var months = {};
      var max = null;
      Object.keys(y.months).forEach(function(month) {
        var profit = y.months[month];
        if (max === null || profit > max) max = profit;
        months[year + month] = {
          month: parseInt(month, 10) + '月',
          daytime: year + '-' + month + '-01',
          yk: round(profit, 2).toFixed(2),
          ykl: (account.initial ? profit / account.initial * 100 : 0).toFixed(2) + '%',
          dpykl: '0.00%',
          class: profit >= 0 ? 'pred' : 'pblue',
          css: profit >= 0 ? 'pred' : 'pblue',
          szcss: 'pred'
        };
      });
      yearData[year] = {
        year: year,
        yk: round(y.profit, 2).toFixed(2),
        ykl: (account.initial ? y.profit / account.initial * 100 : 0).toFixed(2) + '%',
        dpykl: '0.00%',
        maxyk: max === null ? '-' : round(max, 2).toFixed(2),
        class: y.profit >= 0 ? 'pred' : 'pblue',
        css: y.profit >= 0 ? 'pred' : 'pblue',
        szcss: 'pred',
        data: months
      };
    });

    return {
      data: yearData,
      yk: round(account.netProfit, 2).toFixed(2),
      ykl: (account.initial ? account.netProfit / account.initial * 100 : 0).toFixed(2) + '%',
      dpykl: '0.00%',
      maxyk: Object.keys(yearData).reduce(function (best, key) {
        var value = num(yearData[key].yk);
        return best === null || value > best ? value : best;
      }, null) || 0,
      css: account.netProfit >= 0 ? 'pred' : 'pblue',
      szcss: 'pred'
    };
  }

  function calendarResponse(params) {
    var username = currentUsername(params);
    var account = calculateAccount(username);
    var snaps = getDailySnapshots(username);
    var year = String(params.year || new Date().getFullYear());
    var month = pad2(params.yue || (new Date().getMonth() + 1));
    var prefix = year + '-' + month + '-';

    // 使用快照数据生成日历（每个快照包含当日净赚）
    var rows = snaps.filter(function(snap) {
      return snap.date.indexOf(prefix) === 0;
    }).map(function(snap) {
      return {
        id: snap.date,
        d: snap.date,
        yk: round(num(snap.drjk), 2).toFixed(2),
        ykl: snap.drjkLv || '0.00%'
      };
    });

    // 如果今天在所选月份中且还没有快照，添加当前未实现盈亏
    var today = dateText();
    if (today.indexOf(prefix) === 0) {
      var hasToday = snaps.some(function(s) { return s.date === today; });
      if (!hasToday && rows.length === 0) {
        rows.push({
          id: today,
          d: today,
          yk: round(account.dailyProfit, 2).toFixed(2),
          ykl: (account.initial ? account.dailyProfit / account.initial * 100 : 0).toFixed(2) + '%'
        });
      }
    }

    var profit = rows.reduce(function(sum, row) { return sum + num(row.yk); }, 0);
    return Object.assign(responseBase(params), {
      holidays: HOLIDAYS,
      data: rows,
      yk: profit.toFixed(2),
      ykl: (account.initial ? profit / account.initial * 100 : 0).toFixed(2),
      dpykl: '0.00%',
      css: profit >= 0 ? 'pred' : 'pblue',
      szcss: 'pred',
      zhenglidata: buildCalendarSummary(username)
    });
  }

  function curveResponse(params) {
    var username = currentUsername(params);
    var account = calculateAccount(username);
    var snaps = getDailySnapshots(username);
    var today = dateText();

    // 使用快照数据生成资金曲线
    // 每个快照包含当日净赚(drjk)和总资产(zzc)
    var start = periodStart(params.zhouqi || params.type);
    var points = [];
    var cumulativeProfit = 0;

    snaps.forEach(function(snap) {
      if (!start || snap.date >= start) {
        var dailyProfit = num(snap.drjk);
        cumulativeProfit += dailyProfit;
        points.push({
          d: snap.date,
          date: snap.date,
          cdate: snap.date,
          yk: round(dailyProfit, 2),
          value: round(cumulativeProfit, 2),
          dpzhdie: 0,
          ykl: snap.drjkLv || '0.00',
          first_ykl: round(cumulativeProfit / (account.initial || 1) * 100, 2)
        });
      }
    });

    // 如果今天还没有快照，添加当前盈亏
    var hasToday = snaps.some(function(s) { return s.date === today; });
    if (!hasToday) {
      var currentProfit = account.netProfit;
      var currentDailyProfit = account.dailyProfit;
      // 从最后一个快照到今天的累计
      var lastSnapshotProfit = snaps.length > 0 ? num(snaps[snaps.length - 1].zyk) : 0;
      var todayCumulative = currentProfit;
      points.push({
        d: today,
        date: today,
        cdate: today,
        yk: round(currentDailyProfit, 2),
        value: round(todayCumulative, 2),
        dpzhdie: 0,
        ykl: (account.initial ? currentProfit / account.initial * 100 : 0).toFixed(2),
        first_ykl: round(account.initial ? currentProfit / account.initial * 100 : 0, 2)
      });
    }

    points.sort(function(a, b) { return a.date < b.date ? -1 : (a.date > b.date ? 1 : 0); });

    if (!points.length) {
      points.push({
        d: today,
        date: today,
        cdate: today,
        yk: 0,
        value: 0,
        dpzhdie: 0,
        ykl: '0.00',
        first_ykl: 0
      });
    }

    var rates = points.map(function(point) { return num(point.first_ykl); });
    var minRate = Math.min.apply(Math, rates);
    var maxRate = Math.max.apply(Math, rates);
    var chartPadding = Math.max((maxRate - minRate) * 0.1, 0.1);
    var chartMin = Math.floor((Math.min(0, minRate) - chartPadding) * 100) / 100;
    var chartMax = Math.ceil((Math.max(0, maxRate) + chartPadding) * 100) / 100;
    var chartInterval = round((chartMax - chartMin) / 4, 2) || 0.05;

    var lastPoint = points[points.length - 1];
    var rateText = (account.initial ? lastPoint.value / account.initial * 100 : 0).toFixed(2) + '%';

    return Object.assign(responseBase(params), {
      data: points,
      datas: points,
      date: points.map(function(p) { return p.date; }),
      days: points.map(function(p) { return p.cdate; }),
      showdate: points.map(function(p) { return p.cdate; }),
      timesdata: points.map(function(p) { return p.cdate; }),
      tiqiandate: today,
      values: points.map(function(p) { return p.value; }),
      ykdata: points.map(function(p) { return p.value; }),
      yk: lastPoint.value.toFixed(2),
      ykl: rateText,
      myyk: lastPoint.value.toFixed(2),
      sylzhudata: {
        myykl: rateText,
        myyklfs: rateText,
        shaykl: '0.00%',
        shayklfs: '0.00%',
        shykl: '0.00%',
        shyklfs: '0.00%',
        chykl: '0.00%',
        chyklfs: '0.00%'
      },
      zhenglidata: buildCalendarSummary(username),
      RiliData: calendarResponse({
        username: username,
        year: new Date().getFullYear(),
        yue: new Date().getMonth() + 1
      }),
      paoying: rateText,
      minindexykl: minRate,
      maxindexykl: maxRate,
      minfirykl: chartMin,
      maxfirykl: chartMax,
      interval: chartInterval,
      mondayalign: 'left',
      dpykl: '0.00%',
      css: lastPoint.value >= 0 ? 'pred' : 'pblue',
      szcss: 'pred'
    });
  }

  Object.assign(Handlers, {
    mairu: function (params) {
      return saveTrade(params, 'buy');
    },

    maichu: function (params) {
      return saveTrade(params, 'sell');
    },

    mairuload: function (params) {
      var username = currentUsername(params);
      var account = calculateAccount(username);
      var row = params.id ? transactionsFor(username).find(function (t) {
        return String(t.Id || t.id) === String(params.id);
      }) : null;
      return Object.assign(responseBase(params), {
        zky: account.cash.toFixed(2),
        row: rowForTransaction(row)
      });
    },

    mcload: function (params) {
      var username = currentUsername(params);
      var account = calculateAccount(username);
      var row = params.id ? transactionsFor(username).find(function (t) {
        return String(t.Id || t.id) === String(params.id);
      }) : null;
      if (!row && params.code) {
        var position = account.positions.find(function (p) {
          return normalizeCode(p.code) === normalizeCode(params.code);
        });
        if (position) {
          row = {
            Id: '',
            type: 1,
            jydate: dateText(),
            jytime: timeText(),
            jycode: position.code,
            code: position.code,
            name: position.gpname,
            gpname: position.gpname,
            price: position.xianjia,
            shares: position.kynum,
            num: num(position.kynum) / 100
          };
        }
      }
      return Object.assign(responseBase(params), { row: rowForTransaction(row) });
    },

    ccload: function (params) {
      var username = currentUsername(params);
      var account = recalcPositions(username);
      try { takeDailySnapshot(username); } catch(e) {}
      return Object.assign(responseBase(params), {
        total: account.total,
        data: account.positions
      });
    },

    indexload: function (params) {
      var username = currentUsername(params);
      var account = recalcPositions(username);
      var user = getUser(params);
      try { takeDailySnapshot(username); } catch(e) {}

      var xz_sg = parseInt(user.xz_sg || '0', 10);
      var xz_sg_type = user.xz_sg_type || '0';
      var gz_nhg_n = user.gz_nhg_n || '14';

      var newstockhtml;
      if (xz_sg <= 0) {
        newstockhtml = '暂无新股和新债';
      } else {
        var label = xz_sg_type === '1' ? '新债' : (xz_sg_type === '2' ? '新股/债' : '新股');
        newstockhtml = label + '<span>' + xz_sg + '</span>只';
      }

      var ratehtml = '<span style="font-family: DIN;color: #999;">' + gz_nhg_n + '</span>天期<span>2.500%</span>';

      return Object.assign(responseBase(params), {
        total: account.total,
        data: account.positions,
        datas: account.positions,
        newstockhtml: newstockhtml,
        ratehtml: ratehtml
      });
    },

    mingxiload: function (params) {
      return Object.assign(responseBase(params), { datas: filteredRows(params) });
    },

    deletejy: function (params) {
      var username = currentUsername(params);
      var id = String(params.id || '');
      var all = getTransactions();
      var before = all.length;
      all = all.filter(function (t) {
        return !(String(t.Id || t.id) === id && (!t.username || String(t.username) === username));
      });
      saveTransactions(all);
      recalcPositions(username);
      try { takeDailySnapshot(username); } catch(e) {}
      return {
        status: before === all.length ? 'FAIL' : 'SUCCESS',
        beizhu: before === all.length ? '未找到交易记录' : '交易记录已删除'
      };
    },

    gupiaodel: function (params) {
      return Handlers.deletejy(params);
    },

    savesanban: function (params) {
      var quotes = Store.get('local_quotes', {});
      var code = normalizeCode(params.gupiaono || params.code);
      var previous = quotes[code] || {};
      var price = num(params.price);
      var close = num(params.z_pr, price);
      var change = params.change === undefined ?
        num(previous.change, price - close) : num(params.change);
      var percent = params.percent === undefined ?
        num(previous.percent, close ? change / close * 100 : 0) : num(params.percent);
      quotes[code] = {
        gpname: params.gupiao || previous.gpname || '',
        price: price,
        z_pr: close,
        change: change,
        percent: percent,
        verified: params.quoteverified === '1' || params.verified === true || previous.verified === true,
        updatedAt: new Date().toISOString()
      };
      Store.set('local_quotes', quotes);
      var username = currentUsername(params);
      recalcPositions(username);
      try { takeDailySnapshot(username); } catch(e) {}
      return 1;
    },

    lsload: function (params) {
      return Object.assign(statisticsResponse(params), { datas: filteredRows(params) });
    },

    drcjload: function (params) {
      return Object.assign(statisticsResponse(params), { datas: filteredRows(params) });
    },

    dzdload: function (params) {
      return statementResponse(params);
    },

    liquidatedstocks: function (params) {
      return liquidatedResponse(params);
    },

    ggmingxiload: function (params) {
      var username = currentUsername(params);
      var account = calculateAccount(username);
      var code = normalizeCode(params.jycode || params.code);
      var rows = transactionsFor(username).filter(function (t) {
        return normalizeCode(t.jycode || t.code) === code;
      }).map(rowForTransaction);
      var position = account.positions.find(function (p) { return normalizeCode(p.code) === code; });
      var realized = account.realized.filter(function (r) { return r.code === code; });
      var realizedTotal = realized.reduce(function (sum, item) { return sum + item.profit; }, 0);
      return Object.assign(responseBase(params), {
        currentPrice: position ? num(position.xianjia) : (rows[0] ? num(rows[0].price) : 0),
        mingxidatas: rows,
        totalunitdata: {
          floatingpl: position ? position.yingkui : '0.00',
          floatingplratio: position ? position.yingkuilv : '0.00%',
          realizedpl: realizedTotal.toFixed(2),
          rplratio: account.initial ? (realizedTotal / account.initial * 100).toFixed(2) + '%' : '0.00%',
          totalpl: (realizedTotal + (position ? num(position.yingkui) : 0)).toFixed(2)
        },
        totalTrades: rows.length,
        totalBuy: rows.filter(function (r) { return r.type === 0; }).length,
        totalSell: rows.filter(function (r) { return r.type === 1; }).length
      });
    },

    qxrili: function (params) {
      return calendarResponse(params);
    },

    qxdata: function (params) {
      return curveResponse(params);
    },

    alldata: function (params) {
      return curveResponse(Object.assign({}, params, { zhouqi: 'all' }));
    },

    thisMonthData: function (params) {
      return curveResponse(Object.assign({}, params, { zhouqi: 'qxmonth' }));
    },

    threeMonthsData: function (params) {
      return curveResponse(Object.assign({}, params, { zhouqi: 'qxthree' }));
    },

    oneYearData: function (params) {
      return curveResponse(Object.assign({}, params, { zhouqi: 'qxyear' }));
    },

    zx_read: function (params) {
      var username = currentUsername(params);
      var quotes = Store.get('local_quotes', {});
      var datas = getWatchlist().filter(function (item) {
        return !item.username || String(item.username) === username;
      }).map(function (item) {
        var code = normalizeCode(item.code);
        var quote = quotes[code] || {};
        var price = num(quote.price || quote.xianjia, item.xianjia);
        var close = num(quote.z_pr || quote.shoupan, item.shoupan || price);
        var change = quote.change === undefined ?
          price - close : num(quote.change, price - close);
        var percent = quote.percent === undefined ?
          (close ? change / close * 100 : 0) : num(quote.percent);
        return {
          gpname: quote.gpname || item.gpname || code,
          code: code,
          codeType: String(item.codeType || item.codetype || ''),
          xianjia: price,
          shoupan: close,
          zhangdie: change,
          fudu: percent / 100
        };
      });
      return { status: 'success', datas: datas };
    },

    zx_add: function (params) {
      var username = currentUsername(params);
      var code = normalizeCode(params.code);
      if (!/^\d{6}$/.test(code)) {
        return { status: 'fail', message: '请输入正确的6位股票代码' };
      }
      var quote = Store.get('local_quotes', {})[code] || {};
      var stockName = String(quote.gpname || '').trim();
      if (quote.verified !== true || !stockName || stockName === code) {
        return { status: 'fail', message: '未查询到该股票，请输入正确的股票代码' };
      }
      var list = getWatchlist();
      var exists = list.some(function (item) {
        return normalizeCode(item.code) === code && (!item.username || String(item.username) === username);
      });
      if (!exists) {
        list.push({
          username: username,
          code: code,
          codetype: String(params.codetype || ''),
          codeType: String(params.codetype || ''),
          gpname: stockName
        });
        saveWatchlist(list);
      }
      return {
        status: 'success',
        message: exists ? '已在自选列表中' : '添加成功',
        gpname: stockName,
        code: code
      };
    },

    zx_delete: function (params) {
      var username = currentUsername(params);
      var code = normalizeCode(params.deletecode || params.code);
      var list = getWatchlist().filter(function (item) {
        return !(normalizeCode(item.code) === code && (!item.username || String(item.username) === username));
      });
      saveWatchlist(list);
      return { status: 'SUCESS', message: '删除成功' };
    },

    'shu-recieve': function (params) {
      var username = currentUsername(params);
      var all = Store.get('local_transfers', []);
      var migrated = false;
      all.forEach(function (item) {
        if (String(item.type) === '0') {
          item.type = '转入';
          item.zztype = '0';
          migrated = true;
        } else if (String(item.type) === '1') {
          item.type = '转出';
          item.zztype = '1';
          migrated = true;
        }
      });
      if (migrated) Store.set('local_transfers', all);

      if (params.action === 'submit_transfer' || params.zijinjine) {
        var amount = num(params.zijinjine);
        if (amount <= 0) return { status: false, message: '请输入正确的转账金额', data: transfersFor(username) };
        var id = nextLocalId(all);
        var transferCode = String(params.zztype == null ? '0' : params.zztype);
        if (transferCode === '1') {
          var withdrawable = calculateAccount(username).withdrawableCash;
          if (amount > withdrawable + 0.000001) {
            return {
              status: false,
              message: '转出金额不能超过可取资金',
              data: transfersFor(username).slice().reverse()
            };
          }
        }
        all.push({
          id: id,
          username: username,
          type: transferCode === '1' ? '转出' : '转入',
          zztype: transferCode,
          date: dateText(params.timeriqi),
          time: timeText(params.timem),
          amount: round(amount, 2).toFixed(2)
        });
        Store.set('local_transfers', all);
      }
      return { status: true, data: transfersFor(username).slice().reverse() };
    },

    'shu-deleteTransaction': function (params) {
      var username = currentUsername(params);
      var id = String(params.transaction_id || params.id || '');
      var all = Store.get('local_transfers', []).filter(function (item) {
        return !(String(item.id) === id && (!item.username || String(item.username) === username));
      });
      Store.set('local_transfers', all);
      return { status: 'success' };
    },

    updatelog: function () {
      return {
        status: 'SUCCESS',
        content: '<p><b>单机版</b></p><p>除股票行情外，登录、交易、持仓、资金、统计、自选股和转账均保存在本机。</p>'
      };
    }
  });

  global.LocalAPI = {
    version: '3.0-local',
    handlers: Handlers,
    handle: function (rec, params) {
      return Handlers[rec] ? Handlers[rec](params || {}) : null;
    },
    getBrokerLogo: getBrokerLogo,
    calculateAccount: calculateAccount,
    recalcPositions: recalcPositions,
    takeDailySnapshot: takeDailySnapshot,
    getDailySnapshots: getDailySnapshots
  };

  // ========== 拦截 AJAX 请求 ==========
  function parseRequestData(data) {
    var params = {};
    if (!data) return params;
    if (typeof data === 'string') {
      data.replace(/^\?/, '').split('&').forEach(function (pair) {
        if (!pair) return;
        var index = pair.indexOf('=');
        var rawKey = index >= 0 ? pair.slice(0, index) : pair;
        var rawValue = index >= 0 ? pair.slice(index + 1) : '';
        params[decodeURIComponent(rawKey.replace(/\+/g, ' '))] =
          decodeURIComponent(rawValue.replace(/\+/g, ' '));
      });
      return params;
    }
    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      data.forEach(function (value, key) { params[key] = value; });
      return params;
    }
    if (typeof URLSearchParams !== 'undefined' && data instanceof URLSearchParams) {
      data.forEach(function (value, key) { params[key] = value; });
      return params;
    }
    if (typeof data === 'object') {
      Object.keys(data).forEach(function (key) { params[key] = data[key]; });
    }
    return params;
  }

  function queryParams(url) {
    var value = String(url || '');
    var index = value.indexOf('?');
    return index >= 0 ? parseRequestData(value.slice(index + 1)) : {};
  }

  function requestRec(url, params) {
    return String((params && params.rec) || queryParams(url).rec || '');
  }

  function isMarketUrl(url) {
    var value = String(url || '');
    return /(?:^|\/)getgp\.php(?:[?#]|$)/i.test(value) ||
      /^https?:\/\/web\.ifzq\.gtimg\.cn\/appstock\//i.test(value) ||
      /^https?:\/\/web\.ifzq\.gtimg\.cn\/stock\/notice\//i.test(value) ||
      /^https?:\/\/push2his\.eastmoney\.com\//i.test(value) ||
      /^https?:\/\/push2\.eastmoney\.com\//i.test(value) ||
      /kline/i.test(value);
  }

  function shouldLocalize(url) {
    var value = String(url || '');
    var isRemote = /^(?:https?:)?\/\//i.test(value);
    return !isMarketUrl(value) && (isRemote || /\.php(?:[?#]|$)/i.test(value));
  }

  function defaultLocalResponse(rec) {
    return {
      status: 'SUCCESS',
      yyss: 'VSSS',
      endtime: '2099-12-31 23:59:59',
      data: [],
      datas: [],
      message: rec ? '本地接口已处理: ' + rec : '本地请求已处理'
    };
  }

  function localResult(url, data) {
    var params = Object.assign({}, queryParams(url), parseRequestData(data));
    var rec = requestRec(url, params);
    try {
      if (rec && Handlers[rec]) {
        console.log('[LocalAPI] 本地处理:', rec);
        return Handlers[rec](params);
      }
      console.warn('[LocalAPI] 未定义的非行情接口已阻止联网:', rec || url);
      return defaultLocalResponse(rec);
    } catch (e) {
      console.error('[LocalAPI] 本地接口异常:', rec, e);
      return { status: 'FAIL', beizhu: String(e && e.message || e), data: [], datas: [] };
    }
  }

  function setXHRValue(xhr, key, value) {
    try {
      Object.defineProperty(xhr, key, { configurable: true, value: value });
    } catch (e) {
      try { xhr[key] = value; } catch (ignore) {}
    }
  }

  // 方法1: XMLHttpRequest 底层拦截
  var OriginalXHR = window.XMLHttpRequest;
  function PatchedXHR() {
    var xhr = new OriginalXHR();
    var _url = '';
    var originalOpen = xhr.open;
    xhr.open = function(method, url) {
      _url = String(url || '');
      return originalOpen.apply(xhr, arguments);
    };

    var originalSend = xhr.send;
    xhr.send = function(body) {
      if (shouldLocalize(_url)) {
        var result = localResult(_url, body);
        var resultStr = typeof result === 'string' ? result : JSON.stringify(result);
        setTimeout(function() {
          setXHRValue(xhr, 'readyState', 4);
          setXHRValue(xhr, 'status', 200);
          setXHRValue(xhr, 'statusText', 'OK');
          setXHRValue(xhr, 'responseText', resultStr);
          setXHRValue(xhr, 'response', xhr.responseType === 'json' ? result : resultStr);
          if (typeof xhr.onreadystatechange === 'function') xhr.onreadystatechange();
          if (typeof xhr.onload === 'function') xhr.onload();
          try { xhr.dispatchEvent(new Event('load')); } catch (e) {}
          try { xhr.dispatchEvent(new Event('loadend')); } catch (e) {}
        }, 10);
        return;
      }
      return originalSend.apply(xhr, arguments);
    };
    return xhr;
  }

  window.XMLHttpRequest = PatchedXHR;
  console.log('[LocalAPI] XMLHttpRequest 已拦截，getgp.php 保持联网');

  // 方法2: 重写 jQuery 请求
  var originalAjax = $ && $.ajax;
  function newAjax(url, settings) {
    var opts = typeof url === 'string' ? (settings || {}) : (url || {});
    if (typeof url === 'string') opts.url = url;
    var reqUrl = opts.url || '';
    if (!shouldLocalize(reqUrl)) {
      return originalAjax.apply(this, arguments);
    }
    var result = localResult(reqUrl, opts.data);
    var jq = global.jQuery || global.$ || $;
    var deferred = jq.Deferred();
    setTimeout(function() {
      if (typeof opts.success === 'function') opts.success(result, 'success', {});
      deferred.resolve(result, 'success', {});
      if (typeof opts.complete === 'function') opts.complete({}, 'success');
    }, 10);
    return deferred.promise();
  }

  // 重写 $.post
  var originalPost = $ && $.post;
  function newPost(url, data, success, dataType) {
    if (shouldLocalize(url)) {
      var result = localResult(url, data);
      var jq = global.jQuery || global.$ || $;
      var deferred = jq.Deferred();
      setTimeout(function() {
        deferred.resolve(result);
        if (typeof success === 'function') success(result);
      }, 10);
      return deferred.promise();
    }
    return originalPost.apply(this, arguments);
  }

  function installJQueryInterceptors() {
    var jq = global.jQuery || global.$;
    if (!jq || !jq.ajax || !jq.post || !jq.Deferred) return false;
    $ = jq;
    if (jq.ajax !== newAjax) {
      originalAjax = jq.ajax;
      try {
        Object.defineProperty(jq, 'ajax', {
          value: newAjax,
          writable: true,
          configurable: true
        });
      } catch (e) {
        jq.ajax = newAjax;
      }
    }
    if (jq.post !== newPost) {
      originalPost = jq.post;
      try {
        Object.defineProperty(jq, 'post', {
          value: newPost,
          writable: true,
          configurable: true
        });
      } catch (e) {
        jq.post = newPost;
      }
    }
    if (global.$ && global.$ !== jq) {
      try {
        global.$.ajax = newAjax;
        global.$.post = newPost;
      } catch (ignore) {}
    }
    if (global.jQuery && global.jQuery !== jq) {
      try {
        global.jQuery.ajax = newAjax;
        global.jQuery.post = newPost;
      } catch (ignore) {}
    }
    return true;
  }
  installJQueryInterceptors();

  // 方法3: fetch 拦截，远程行情 getgp.php 仍使用原始 fetch。
  var originalFetch = window.fetch;
  function newFetch(input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    if (!shouldLocalize(url) || typeof Promise === 'undefined') {
      return originalFetch.apply(this, arguments);
    }
    var result = localResult(url, init && init.body);
    var text = typeof result === 'string' ? result : JSON.stringify(result);
    return Promise.resolve({
      ok: true,
      status: 200,
      statusText: 'OK',
      url: url,
      json: function () { return Promise.resolve(result); },
      text: function () { return Promise.resolve(text); },
      clone: function () { return this; }
    });
  }
  if (originalFetch) window.fetch = newFetch;
  console.log('[LocalAPI] $.ajax、$.post、XHR、fetch 已本地化');

  // ========== 移除水印（超级强化版 - 适配 WebView 环境） ==========
  // 方法1: CSS 终极轰炸（所有能想到的选择器都加 !important）
  (function injectSuperCSS() {
    var style = document.createElement('style');
    style.setAttribute('data-localapi', 'nowatermark');
    style.textContent = `
      /* 基础水印类 */
      .watermark, [class*="watermark"], [class*="Watermark"], [class*="WATERMARK"],
      [id*="watermark"], [id*="Watermark"], [id*="WATERMARK"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        width: 0 !important;
        height: 0 !important;
        background: none !important;
        background-image: none !important;
        pointer-events: none !important;
        position: absolute !important;
        left: -99999px !important;
        top: -99999px !important;
        z-index: -99999 !important;
      }
      /* 背景水印图（这是原来的水印方式！） */
      body, html, .backpic, .gpmiddle, *[style*="watermark"] {
        background-image: none !important;
        background: none !important;
      }
      /* fixed + 高 z-index */
      div[style*="z-index: 99999"], div[style*="z-index:99999"],
      div[style*="z-index: 9999"], div[style*="z-index:9999"],
      div[style*="z-index: 999999"], div[style*="z-index:999999"] {
        display: none !important;
      }
      /* pointer-events: none + fixed = 水印 */
      div[style*="pointer-events: none"][style*="position: fixed"],
      div[style*="pointer-events:none"][style*="position:fixed"],
      div[style*="pointer-events: none"][style*="position:fixed"],
      div[style*="pointer-events:none"][style*="position: fixed"] {
        display: none !important;
      }
      /* 仅隐藏可识别的 canvas 水印，保留 ECharts 等业务图表 */
      canvas.watermark, canvas[class*="watermark"], canvas[id*="watermark"],
      canvas[data-watermark],
      canvas[style*="position: fixed"][style*="pointer-events: none"],
      canvas[style*="position:fixed"][style*="pointer-events:none"] {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }
      /* 暴力兜底：所有带 watermark 的元素 */
      [data-watermark], [attr*="watermark"] {
        display: none !important;
      }
      body::before, body::after, html::before, html::after {
        content: none !important;
        background: none !important;
        background-image: none !important;
      }
    `;
    if (document.head) {
      document.head.appendChild(style);
    } else {
      // head 还没准备好，documentElement 插入
      (document.documentElement || document).appendChild(style);
    }
    // 再次尝试 head（等 head 出现后再插一次）
    var tryHead = setInterval(function() {
      if (document.head && !document.querySelector('style[data-localapi="nowatermark"]')) {
        document.head.appendChild(style.cloneNode(true));
        clearInterval(tryHead);
      }
    }, 10);
    setTimeout(function() { clearInterval(tryHead); }, 5000);
  })();

  // 方法2: 疯狂重写 addWatermark / createWatermark / 所有可能的水印函数
  var watermarkFunctionNames = [
    'addWatermark', 'createWatermark', 'initWatermark', 'showWatermark',
    'watermark', 'Watermark', 'setWatermark', 'buildWatermark',
    'addWaterMark', 'createWaterMark', 'initWaterMark',
    'init_shuiyin', 'create_shuiyin', 'shuiyin', 'watermarkCreate'
  ];
  function killWatermarkFn() {
    for (var i = 0; i < watermarkFunctionNames.length; i++) {
      var name = watermarkFunctionNames[i];
      try {
        window[name] = function () { return false; };
        if (global !== window) global[name] = function () { return false; };
        this[name] = function () { return false; };
      } catch(e) {}
    }
    // 尝试从 common.js 的闭包里抓函数（如果能抓到）
    try {
      if (window.top && window.top !== window) {
        for (var j = 0; j < watermarkFunctionNames.length; j++) {
          try { window.top[watermarkFunctionNames[j]] = function(){}; } catch(e){}
        }
      }
    } catch(e) {}
  }
  killWatermarkFn();
  setInterval(killWatermarkFn, 1000);

  // 方法3: DOM 元素暴力移除
  function removeWatermarks() {
    try {
      // 3.1 直接移除匹配类名/id的元素
      var selectors = [
        '.watermark', '[class*="watermark"]', '[class*="Watermark"]', '[class*="WATERMARK"]',
        '[id*="watermark"]', '[id*="Watermark"]', '[id*="WATERMARK"]',
        '[data-watermark]', '[data-shuiyin]'
      ];
      for (var si = 0; si < selectors.length; si++) {
        try {
          var elms = document.querySelectorAll(selectors[si]);
          for (var ei = 0; ei < elms.length; ei++) {
            if (elms[ei] && elms[ei].parentNode) elms[ei].parentNode.removeChild(elms[ei]);
            else if (elms[ei] && elms[ei].remove) elms[ei].remove();
          }
        } catch(e) {}
      }

      // 3.2 只移除带明确水印特征的 canvas，不能破坏业务图表。
      try {
        var canvases = document.querySelectorAll(
          'canvas.watermark, canvas[class*="watermark"], canvas[id*="watermark"], ' +
          'canvas[data-watermark], ' +
          'canvas[style*="position: fixed"][style*="pointer-events: none"], ' +
          'canvas[style*="position:fixed"][style*="pointer-events:none"]'
        );
        for (var ci = 0; ci < canvases.length; ci++) {
          if (canvases[ci].parentNode) canvases[ci].parentNode.removeChild(canvases[ci]);
          else if (canvases[ci].remove) canvases[ci].remove();
        }
      } catch(e) {}

      // 3.3 移除所有 fixed + 高 z-index 的 div
      try {
        var allDivs = document.getElementsByTagName('div');
        for (var di = allDivs.length - 1; di >= 0; di--) {
          var el = allDivs[di];
          if (!el || !el.style) continue;
          var cs = window.getComputedStyle ? window.getComputedStyle(el) : null;
          var styleText = (el.getAttribute('style') || '').toLowerCase();
          var zidx = 0;
          try { zidx = parseInt(cs ? cs.zIndex : el.style.zIndex) || 0; } catch(e) {}
          var isFixed = (el.style.position && el.style.position.toLowerCase() === 'fixed') ||
                        (cs && cs.position && cs.position.toLowerCase() === 'fixed') ||
                        styleText.indexOf('position:fixed') >= 0 || styleText.indexOf('position: fixed') >= 0;
          var noPointer = styleText.indexOf('pointer-events:none') >= 0 ||
                          styleText.indexOf('pointer-events: none') >= 0 ||
                          (cs && cs.pointerEvents && cs.pointerEvents.toLowerCase() === 'none');

          // 满足条件就移除
          if (zidx >= 9999 || (isFixed && noPointer)) {
            // 额外检查：如果这个元素没有子元素或者里面只有 canvas/图片，极可能是水印
            var childCnt = el.children ? el.children.length : 0;
            var innerHtml = (el.innerHTML || '').toLowerCase();
            if (childCnt === 0 || childCnt === 1 || innerHtml.indexOf('canvas') >= 0 ||
                innerHtml.indexOf('borilxx') >= 0 || innerHtml.indexOf('激活') >= 0) {
              if (el.parentNode) el.parentNode.removeChild(el);
              else if (el.remove) el.remove();
            }
          }
        }
      } catch(e) {}

      // 3.4 清除 body 和 所有元素上的 background-image 水印
      try {
        var allElements = document.querySelectorAll('*');
        for (var k = 0; k < allElements.length; k++) {
          var e = allElements[k];
          if (!e || !e.style) continue;
          var bg = e.style.backgroundImage || '';
          if (bg && bg.toLowerCase().indexOf('water') >= 0) {
            e.style.backgroundImage = 'none !important';
            e.style.setProperty('background-image', 'none', 'important');
          }
        }
        if (document.body) {
          var bodyBg = document.body.style.backgroundImage || '';
          if (bodyBg && bodyBg !== 'none') {
            document.body.style.setProperty('background-image', 'none', 'important');
          }
        }
        if (document.documentElement) {
          var htmlBg = document.documentElement.style.backgroundImage || '';
          if (htmlBg && htmlBg !== 'none') {
            document.documentElement.style.backgroundImage = 'none';
          }
        }
      } catch(e) {}
    } catch(e) {}
  }

  // 方法4: MutationObserver（DOM 变化就立即清理）
  var observer;
  var observerCleanupScheduled = false;
  function startObserver() {
    try {
      if (observer) return;
      observer = new MutationObserver(function(mutations) {
        var hasAddedNodes = false;
        for (var i = 0; i < mutations.length; i++) {
          if (mutations[i].addedNodes && mutations[i].addedNodes.length) {
            hasAddedNodes = true;
            break;
          }
        }
        if (!hasAddedNodes || observerCleanupScheduled) return;
        observerCleanupScheduled = true;
        setTimeout(function () {
          observerCleanupScheduled = false;
          removeWatermarks();
        }, 20);
      });
      var target = document.body || document.documentElement || document;
      observer.observe(target, {
        childList: true,
        subtree: true
      });
    } catch(e) {}
  }

  // 方法5: localStorage 始终覆盖 VIP 状态（WebView localStorage 有坑，每次都重写）
  function ensureVIPStatus() {
    try {
      var raw = localStorage.getItem('loginData');
      if (raw) {
        var ld;
        try { ld = JSON.parse(raw); } catch(e) { return; }
        var changed = ld.yyss !== 'VSSS' ||
          ld.endtime !== '2099-12-31 23:59:59' ||
          ld.status !== 'SUCCESS' ||
          ld.checkExpiry !== false;
        ld.yyss = 'VSSS';
        ld.endtime = '2099-12-31 23:59:59';
        ld.status = 'SUCCESS';
        ld.checkExpiry = false;
        if (ld.userdata) {
          changed = changed || ld.userdata.viptype !== '1' ||
            ld.userdata.ddate !== '2099-12-31 23:59:59';
          ld.userdata.viptype = '1';
          ld.userdata.ddate = '2099-12-31 23:59:59';
        }
        if (changed) {
          localStorage.setItem('loginData', JSON.stringify(ld));
          console.log('[LocalAPI] VIP状态已更新: yyss=VSSS, endtime=2099-12-31');
        }
      }
    } catch(e) {}
  }

  // ========== 启动阶段：立即执行多次（WebView 异步加载） ==========
  function superBoot() {
    killWatermarkFn();
    ensureVIPStatus();
    removeWatermarks();
  }
  // 狂轰滥炸：不同时间点都执行，确保覆盖所有可能的时机
  superBoot();
  setTimeout(superBoot, 1);
  setTimeout(superBoot, 10);
  setTimeout(superBoot, 50);
  setTimeout(superBoot, 100);
  setTimeout(superBoot, 300);
  setTimeout(superBoot, 500);
  setTimeout(superBoot, 1000);
  setTimeout(superBoot, 2000);
  setTimeout(superBoot, 5000);
  // 低频兜底；新增 DOM 由 MutationObserver 立即处理。
  setInterval(superBoot, 500);

  // 强制重写函数
  function forceOverride() {
    try {
      var jq = window.jQuery || window.$;
      if (jq) {
        installJQueryInterceptors();
      }
      if (window.XMLHttpRequest !== PatchedXHR) {
        try {
          Object.defineProperty(window, 'XMLHttpRequest', {
            value: PatchedXHR,
            writable: true,
            configurable: true
          });
        } catch (e) {
          try { window.XMLHttpRequest = PatchedXHR; } catch (ignore) {}
        }
      }
      if (!originalFetch && window.fetch && window.fetch !== newFetch) {
        originalFetch = window.fetch;
      }
      if (originalFetch && window.fetch !== newFetch) {
        try {
          Object.defineProperty(window, 'fetch', {
            value: newFetch,
            writable: true,
            configurable: true
          });
        } catch (e) {
          try { window.fetch = newFetch; } catch (ignore) {}
        }
      }
    } catch(e) {}
    // 水印函数杀死
    killWatermarkFn();
    // VIP 状态覆盖
    ensureVIPStatus();
    // DOM 清理
    removeWatermarks();
  }

  // 立即执行
  forceOverride();
  setTimeout(forceOverride, 10);
  setTimeout(forceOverride, 100);
  setTimeout(forceOverride, 500);
  setTimeout(forceOverride, 1000);
  setInterval(forceOverride, 1000);

  // DOMContentLoaded 时再启动 MutationObserver
  function bootWhenReady() {
    try {
      startObserver();
    } catch(e) {}
    // DOM ready 后多清几次
    setTimeout(superBoot, 50);
    setTimeout(superBoot, 200);
    setTimeout(superBoot, 1000);
  }
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    bootWhenReady();
  } else {
    document.addEventListener('DOMContentLoaded', bootWhenReady);
    document.addEventListener('load', bootWhenReady);
    window.addEventListener('load', bootWhenReady);
    // jQuery ready 兜底
    try { $(document).ready(bootWhenReady); } catch(e) {}
  }

  // ========== 初始化默认账户 ==========
  (function initDefaultUser() {
    var users = Store.get('local_users', {});
    var needSnapshot = false;
    if (!users['admin']) {
      users['admin'] = Object.assign({}, DEFAULT_USER, {
        username: 'admin',
        password: 'admin',
        Id: '1'
      });
      Store.set('local_users', users);
      needSnapshot = true;
    }
    // 兼容体验账号
    if (!users['111@111.com']) {
      users['111@111.com'] = Object.assign({}, DEFAULT_USER, {
        username: '111@111.com',
        password: '12345678',
        Id: '4',
        zhengquanname: '中国银河证券',
        biemingname: '**5793',
        zhengquannumber: '**5793',
        zhengquanindexnumber: '3406****5793',
        Initialmoney: '300000',
        shouxufeilv: '0.085',
        yinhuashuilv: '0.5'
      });
      Store.set('local_users', users);
      needSnapshot = true;
    }
    // 首次初始化时创建快照
    if (needSnapshot) {
      try { takeDailySnapshot('admin'); } catch(e) {}
      try { takeDailySnapshot('111@111.com'); } catch(e) {}
    }
  })();

  console.log('[LocalAPI] 单机版本地API初始化完成');
  console.log('[LocalAPI] 可用接口:', Object.keys(Handlers));
  console.log('[LocalAPI] 默认账号: admin/admin 或 111@111.com/12345678');
  console.log('[LocalAPI] jQuery请求拦截:', installJQueryInterceptors() ? '已安装' : '等待jQuery加载');
})(typeof window !== 'undefined' ? window : this);
