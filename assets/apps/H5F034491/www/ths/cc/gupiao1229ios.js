$(function () {
  var gpdata;
  getgplist("", "desc");
  startHoldingQuoteRefresh();

  // Define common styles to apply to all icons
  const iconStyles = {
    "background-size": "5.5rem",
    "background-repeat": "no-repeat",
    "background-position": "center"
  };

  function initializeIconDefaults() {
    const isDark = document.body.classList.contains('dark-mode');

    if (Global_PhoneType == "Apple") {
      // APPLE INITIAL STATE
      let szpxImg = isDark ? "url(./cc/apple/szpxiosBDDark1.png)" : "url(./cc/apple/szpxiosBD.png)";
      let ykpxImg = isDark ? "url(./cc/apple/ykpxiosBDark1.png)" : "url(./cc/apple/ykpxiosB.png)";
      let gspxImg = isDark ? "url(./cc/apple/gspxiosB1Dark.png)" : "url(./cc/apple/gspxiosB1.png)";
      let jgpxImg = isDark ? "url(./cc/apple/jgpxiosBDark.png)" : "url(./cc/apple/jgpxiosB.png)";
      let cspxImg = isDark ? "url(./cc/apple/cspxiosBDark.png)" : "url(./cc/apple/cspxiosB.png)";
      let kypxImg = isDark ? "url(./cc/apple/kypxiosBDark.png)" : "url(./cc/apple/kypxiosB.png)";

      $(".navicon-fixed .szpxios").css($.extend({}, iconStyles, { "background-size": "6.3rem", "background-image": szpxImg, "background-color": "transparent" }));
      $(".navicon-scrollable .ykpxios").css($.extend({}, iconStyles, { "background-size": "4rem", "background-image": ykpxImg, "background-color": "transparent", "margin-top": "0.1rem" }));
      $(".navicon-scrollable .gspxios").css($.extend({}, iconStyles, { "background-size": "120%", "background-image": gspxImg, "background-color": "transparent", "margin-top": "0.1rem" }));
      $(".navicon-scrollable .jgpxios").css($.extend({}, iconStyles, { "background-size": "93%", "background-image": jgpxImg, "background-color": "transparent" }));
      $(".navicon-scrollable .cspxios").css($.extend({}, iconStyles, { "background-size": "5.8rem", "background-image": cspxImg, "background-color": "transparent" }));
      $(".navicon-scrollable .kypxios").css($.extend({}, iconStyles, { "background-size": "5.8rem", "background-image": kypxImg, "background-color": "transparent" }));
      $(".navicon-scrollable .yklpxios").hide().off('click');
    } else {
      // ANDROID INITIAL STATE
      let szpxImg = isDark ? "url(./cc/ios_arrowiosMK0Dark.png)" : "url(./cc/ios_arrowiosMK0.png)";
      let ykpxImg = isDark ? "url(./cc/ykpxiosNonActive1_dark.png)" : "url(./cc/ykpxiosNonActive1.png)";
      let gspxImg = isDark ? "url(./cc/gspxiosAndroidDark.png)" : "url(./cc/gspxiosAndroid.png)";
      let jgpxImg = isDark ? "url(./cc/jgpxiosAndroidDark.png)" : "url(./cc/jgpxiosAndroid.png)";
      let cspxImg = isDark ? "url(./cc/ios_arrowiosPLD0Dark.png)" : "url(./cc/ios_arrowiosPLD0.png)";
      let kypxImg = isDark ? "url(./cc/ios_arrowiosPLD01Dark.png)" : "url(./cc/ios_arrowiosPLD01.png)";
      let yklpxImg = isDark ? "url(./cc/ios_arrowiosPLD00Dark.png)" : "url(./cc/ios_arrowiosPLD00.png)";

      $(".navicon-fixed .szpxios").css($.extend({}, iconStyles, { "background-size": "6.2rem", "background-image": szpxImg, "background-color": "transparent" }));
      $(".navicon-scrollable .ykpxios").css($.extend({}, iconStyles, { "background-size": "3.7rem", "background-image": ykpxImg, "background-color": "transparent" }));
      $(".navicon-scrollable .gspxios").css($.extend({}, iconStyles, { "background-size": "7rem", "background-image": gspxImg, "background-color": "transparent" }));
      $(".navicon-scrollable .jgpxios").css($.extend({}, iconStyles, { "background-size": "7rem", "background-image": jgpxImg, "background-color": "transparent" }));
      $(".navicon-scrollable .cspxios").css($.extend({}, iconStyles, { "background-size": "5.6rem", "background-image": cspxImg, "background-color": "transparent" }));
      $(".navicon-scrollable .kypxios").css($.extend({}, iconStyles, { "background-size": "5.6rem", "background-image": kypxImg, "background-color": "transparent" }));
      $(".navicon-scrollable .yklpxios").show().css($.extend({}, iconStyles, { "background-size": "5.6rem", "background-image": yklpxImg, "background-color": "transparent" }));
    }
  }

  function createToggleHandler(selector, images, sortKey) {
    let state = 0; // 0=BS, 1=Desc, 2=Asc
    let isCurrentlyActive = false;
    const element = $(selector);
    element.addClass('sort-handler');

    function applyThemedImage(active, currentState) {
      const isDark = document.body.classList.contains('dark-mode');
      const isApple = (Global_PhoneType === "Apple");
      let imgData;

      if (!active) {
        // INACTIVE STATE: Grey "BD" Images
        imgData = isApple ? (isDark ? images.appleDarkInactive : images.appleInactive) : (isDark ? images.androidDarkDefault : images.androidDefault);
      } else {
        // ACTIVE STATE: Cycle 1(Desc), 2(Asc), 0(BS Highlight)
        if (currentState === 0) {
          imgData = isApple ? (isDark ? images.appleDarkDefault : images.appleDefault) : (isDark ? images.androidDarkDefault : images.androidDefault);
        } else {
          const key = 'state' + currentState;
          if (isDark) {
            // Priority: state1DarkApple/state1DarkAndroid -> state1Dark -> state1
            const platformKey = key + 'Dark' + (isApple ? 'Apple' : 'Android');
            const genericDarkKey = key + 'Dark';
            imgData = images[platformKey] || images[genericDarkKey] || images[key];
          } else {
            imgData = images[key];
          }
        }
      }

      // Apply Styles
      let styleObj = typeof imgData === 'string' ? { 'background-image': `url(${imgData})` } : $.extend({}, imgData);
      if (styleObj['background-image'] && !styleObj['background-image'].startsWith('url(')) {
        styleObj['background-image'] = `url(${styleObj['background-image']})`;
      }
      element.css($.extend({}, iconStyles, styleObj));
    }

    element.on('reset-to-inactive', function () {
      state = 0;
      isCurrentlyActive = false;
      applyThemedImage(false, 0);
    });

    element.click(function () {
      const previouslyActive = isCurrentlyActive;
      $('.sort-handler').not(this).trigger('reset-to-inactive');
      isCurrentlyActive = true;

      if (!previouslyActive) {
        state = 1; // Click 1 -> Desc
      } else {
        if (state === 1) state = 2;      // Click 2 -> Asc
        else if (state === 2) state = 0; // Click 3 -> BS
        else state = 1;                  // Cycle back
      }

      applyThemedImage(true, state);
      if (state === 0) getgplist("", "desc");
      else getgplist(sortKey, (state === 1 ? "desc" : "asc"));
    });

    applyThemedImage(false, 0);
  }

  initializeIconDefaults();

  // 1. SZPX
  createToggleHandler(".szpxios", {
    androidDefault: { "background-image": "./cc/ios_arrowiosMK0.png", "background-size": "6.2rem" },
    androidDarkDefault: { "background-image": "./cc/ios_arrowiosMK0Dark.png", "background-size": "6.2rem" },
    appleInactive: { "background-image": "./cc/apple/szpxiosBD.png", "background-size": "6.3rem" },
    appleDarkInactive: { "background-image": "./cc/apple/szpxiosBDDark1.png", "background-size": "6.3rem" },
    appleDefault: { "background-image": "./cc/szpxiosBSL.png", "background-size": "6.2rem" },
    appleDarkDefault: { "background-image": "./cc/szpxiosBS.png", "background-size": "6.2rem" },
    state1: { "background-image": "./cc/ios_arrowiosMK1.png", "background-size": "6.2rem" },
    state1DarkAndroid: { "background-image": "./cc/ios_arrowiosMK1DarkAndroid.png", "background-size": "6.2rem" },
    state1DarkApple: { "background-image": "./cc/ios_arrowiosMK1Dark.png", "background-size": "6.2rem" },
    state2: { "background-image": "./cc/ios_arrowiosMK2.png", "background-size": "6.2rem" },
    state2DarkAndroid: { "background-image": "./cc/ios_arrowiosMK2DarkAndroid.png", "background-size": "6.2rem" },
    state2DarkApple: { "background-image": "./cc/ios_arrowiosMK2Dark.png", "background-size": "6.2rem" }
  }, "szpx");

  // 2. YKPX
  createToggleHandler(".ykpxios", {
    androidDefault: { "background-image": "./cc/ykpxiosNonActive1.png", "background-size": "4rem" },
    androidDarkDefault: { "background-image": "./cc/ykpxiosNonActive1_dark.png", "background-size": "4rem" },
    appleInactive: { "background-image": "./cc/apple/ykpxiosB.png", "background-size": "4rem", "margin-top": "0.1rem" },
    appleDarkInactive: { "background-image": "./cc/apple/ykpxiosBDark1.png", "background-size": "4rem", "margin-top": "0.1rem" },
    appleDefault: { "background-image": "./cc/ykpxiosBSL.png", "background-size": "4rem" },
    appleDarkDefault: { "background-image": "./cc/arrowiosyk2BS.png", "background-size": "4rem" },
    state1: { "background-image": "./cc/arrowiosyk2N.jpg", "background-size": "4rem" },
    state1DarkAndroid: { "background-image": "./cc/arrowiosyk2NDarkAndroid.png", "background-size": "3.8rem" },
    state1DarkApple: { "background-image": "./cc/arrowiosyk2NDark.png", "background-size": "4rem" },
    state2: { "background-image": "./cc/arrowiosyk1N.png", "background-size": "4rem" },
    state2DarkAndroid: { "background-image": "./cc/arrowiosyk1NDarkAndroid.png", "background-size": "3.8rem" },
    state2DarkApple: { "background-image": "./cc/arrowiosyk1NDark.png", "background-size": "4rem" }
  }, "ykpx");

  // 3. GSPX
  createToggleHandler(".gspxios", {
    androidDefault: { "background-image": "./cc/gspxiosAndroid.png", "background-size": "7rem" },
    androidDarkDefault: { "background-image": "./cc/gspxiosAndroidDark.png", "background-size": "7rem" },
    appleInactive: { "background-image": "./cc/apple/gspxiosB1.png", "background-size": "120%", "margin-top": "0.1rem" },
    appleDarkInactive: { "background-image": "./cc/apple/gspxiosB1Dark.png", "background-size": "120%", "margin-top": "0.1rem" },
    appleDefault: { "background-image": "./cc/gspxiosBSL.png", "background-size": "7.1rem" },
    appleDarkDefault: { "background-image": "./cc/gspxiosDBS.png", "background-size": "120%" },
    state1: { "background-image": "./cc/gspxiosD.png", "background-size": "7rem" },
    state1DarkAndroid: { "background-image": "./cc/gspxiosDDarkAndroid.png", "background-size": "7rem" },
    state1DarkApple: { "background-image": "./cc/gspxiosDDark.png", "background-size": "120%" },
    state2: { "background-image": "./cc/gspxiosU.png", "background-size": "7rem" },
    state2DarkAndroid: { "background-image": "./cc/gspxiosUDarkAndroid.png", "background-size": "7rem" },
    state2DarkApple: { "background-image": "./cc/gspxiosUDark.png", "background-size": "120%" }
  }, "gushu");

  // 4. JGPX
  createToggleHandler(".jgpxios", {
    androidDefault: { "background-image": "./cc/jgpxiosAndroid.png", "background-size": "7rem" },
    androidDarkDefault: { "background-image": "./cc/jgpxiosAndroidDark.png", "background-size": "7rem" },
    appleInactive: { "background-image": "./cc/apple/jgpxiosB.png", "background-size": "93%" },
    appleDarkInactive: { "background-image": "./cc/apple/jgpxiosBDark.png", "background-size": "93%" },
    appleDefault: { "background-image": "./cc/jgpxiosBSL1.png", "background-size": "7rem" },
    appleDarkDefault: { "background-image": "./cc/jgpxiosDBS.png", "background-size": "7rem" },
    state1: { "background-image": "./cc/jgpxiosD1.png", "background-size": "7rem" },
    state1DarkAndroid: { "background-image": "./cc/jgpxiosDDarkAndroid.png", "background-size": "7rem" },
    state1DarkApple: { "background-image": "./cc/jgpxiosDDark.png", "background-size": "7rem" },
    state2: { "background-image": "./cc/jgpxiosU1.png", "background-size": "7rem" },
    state2DarkAndroid: { "background-image": "./cc/jgpxiosUDarkAndroid.png", "background-size": "7rem" },
    state2DarkApple: { "background-image": "./cc/jgpxiosUDark.png", "background-size": "7rem" }
  }, "xianjia");

  // 5. CSPX
  createToggleHandler(".cspxios", {
    androidDefault: "./cc/ios_arrowiosPLD0.png",
    androidDarkDefault: "./cc/ios_arrowiosPLD0Dark.png",
    appleInactive: { "background-image": "./cc/apple/cspxiosB.png", "background-size": "5.8rem" },
    appleDarkInactive: { "background-image": "./cc/apple/cspxiosBDark.png", "background-size": "5.8rem" },
    appleDefault: { "background-image": "./cc/cspxiosDownDarkBSL.png", "background-size": "5.8rem" },
    appleDarkDefault: { "background-image": "./cc/cspxiosDownDarkBS.png", "background-size": "5.8rem" },
    state1: "./cc/cspxiosDown.png",
    state1DarkAndroid: "./cc/cspxiosDownDarkAndroid.png",
    state1DarkApple: "./cc/cspxiosDownDark.png",
    state2: "./cc/cspxiosUp.png",
    state2DarkAndroid: "./cc/cspxiosUpDarkAndroid.png",
    state2DarkApple: "./cc/cspxiosUpDark.png"
  }, "chengben");

  // 6. KYPX
  createToggleHandler(".kypxios", {
    androidDefault: "./cc/ios_arrowiosPLD01.png",
    androidDarkDefault: "./cc/ios_arrowiosPLD01Dark.png",
    appleInactive: { "background-image": "./cc/apple/kypxiosB.png", "background-size": "5.8rem" },
    appleDarkInactive: { "background-image": "./cc/apple/kypxiosBDark.png", "background-size": "5.8rem" },
    appleDefault: { "background-image": "./cc/ios_arrowiosISP1NDarkBSL.png", "background-size": "5.8rem" },
    appleDarkDefault: { "background-image": "./cc/ios_arrowiosISP1NDarkBS.png", "background-size": "5.8rem" },
    state1: "./cc/ios_arrowiosISP1N.png",
    state1DarkAndroid: "./cc/kypxiosBDarkAndroid.png",
    state1DarkApple: "./cc/ios_arrowiosISP1NDark.png",
    state2: "./cc/ios_arrowiosISP2N.png",
    state2DarkAndroid: "./cc/ios_arrowiosISP2NDarkAndroid.png",
    state2DarkApple: "./cc/ios_arrowiosISP2NDark.png"
  }, "kynum");

  // 7. YKLPX (Android Only)
  if (typeof Global_PhoneType !== 'undefined' && Global_PhoneType !== "Apple") {
    createToggleHandler(".yklpxios", {
      androidDefault: "./cc/ios_arrowiosPLD00.png",
      androidDarkDefault: "./cc/ios_arrowiosPLD00Dark.png",
      state1: "./cc/yklpxiosDown.png",
      state1DarkAndroid: "./cc/yklpxiosDownDark.png",
      state2: "./cc/yklpxiosUp.png",
      state2DarkAndroid: "./cc/yklpxiosUpDark.png"
    }, "yingkuilv");
  }

  // 8. CPXIOS (Static)
  createToggleHandler(".cpxios", {
    androidDefault: "./cc/ios_arrowiosyk11N.jpg",
    appleDefault: "./cc/ios_arrowiosyk11N.jpg",
    appleInactive: "./cc/ios_arrowiosyk11N.jpg",
    state1: "./cc/ios_arrowiosyk11N.jpg",
    state2: "./cc/ios_arrowiosyk11N.jpg"
  }, "code");
});
/**
 +----------------------------------------------------------
 * 删除股票
 +----------------------------------------------------------
 */

function returnFloat(value) {
  var value = Math.round(parseFloat(value) * 100) / 100;
  var s = value.toString().split(".");
  if (s.length == 1) {
    value = value.toString() + ".00";
    return value;
  }
  if (s.length > 1) {
    if (s[1].length < 2) {
      value = value.toString() + "0";
    }
    return value;
  }
}

var holdingQuoteRefreshTimer = null;
var holdingQuoteRefreshBusy = false;
var holdingSortField = "";
var holdingSortOrder = "desc";
var HOLDING_QUOTE_REFRESH_MS = 5000;
var HOLDING_QUOTE_URL = "https://bor.lingling123.top/chaojia/chaojia2_05_29/php/getgp.php";

function holdingQuoteSymbol(value) {
  var code = String(value || "").replace(/\D/g, "").slice(-6);
  if (!code) return "";
  if (/^(4|8|92)/.test(code)) return "bj" + code;
  if (/^(5|6|9)/.test(code)) return "sh" + code;
  return "sz" + code;
}

function fetchHoldingQuote(stock) {
  var symbol = holdingQuoteSymbol(stock && (stock.code || stock.jycode));
  if (!symbol || typeof fetch !== "function") {
    return Promise.resolve(false);
  }

  var url = HOLDING_QUOTE_URL + "?code=" + encodeURIComponent(symbol) +
    "&rec=getDayKlinedata&_=" + Date.now();

  return fetch(url, { cache: "no-store" })
    .then(function (response) {
      if (!response.ok) throw new Error("行情请求失败");
      return response.json();
    })
    .then(function (payload) {
      var market = payload && payload.data && payload.data[symbol];
      var quote = market && (
        (market.qt && market.qt[symbol]) ||
        (market.data && market.data.qt && market.data.qt[symbol])
      );
      var ticks = market && market.data && market.data.data;
      var price = quote ? parseFloat(quote[3]) : NaN;
      var close = quote ? parseFloat(quote[4]) : NaN;

      if ((!isFinite(price) || price <= 0) && ticks && ticks.length) {
        price = parseFloat(String(ticks[ticks.length - 1]).split(" ")[1]);
      }
      if (!isFinite(price) || price <= 0) return false;
      if (!isFinite(close) || close <= 0) {
        close = parseFloat(stock.shoupan) || price;
      }

      if (!window.LocalAPI) return false;
      LocalAPI.handle("savesanban", {
        username: Global_Username,
        code: symbol.slice(2),
        gupiao: quote && quote[1] ? quote[1] : (stock.gpname || stock.name || ""),
        price: price,
        z_pr: close
      });
      return true;
    })
    .catch(function (error) {
      console.log("[LocalAPI] 持仓行情暂不可用:", symbol, error.message);
      return false;
    });
}

function renderHoldingData(data, field, order) {
  loadccdata(data, field, order);
  localStorage.setItem("ccstockData", JSON.stringify(data));
  localStorage.setItem("ccstockDataDate", new Date().toISOString());
}

function refreshHoldingQuotes(data, field, order) {
  if (holdingQuoteRefreshBusy || !data || !Array.isArray(data.data) || !data.data.length) {
    return;
  }

  holdingQuoteRefreshBusy = true;
  Promise.all(data.data.map(fetchHoldingQuote))
    .then(function (results) {
      if (results.some(function (updated) { return updated; })) {
        ajaxtheData(function (updatedData) {
          renderHoldingData(updatedData, field, order);
        });
      }
    })
    .then(function () {
      holdingQuoteRefreshBusy = false;
    }, function () {
      holdingQuoteRefreshBusy = false;
    });
}

function requestHoldingData(field, order, refreshQuotes) {
  ajaxtheData(function (data) {
    renderHoldingData(data, field, order);
    if (refreshQuotes) refreshHoldingQuotes(data, field, order);
  });
}

function startHoldingQuoteRefresh() {
  if (holdingQuoteRefreshTimer) clearInterval(holdingQuoteRefreshTimer);
  holdingQuoteRefreshTimer = setInterval(function () {
    if (document.hidden || !isMarketOpen() || holdingQuoteRefreshBusy) return;
    ajaxtheData(function (data) {
      refreshHoldingQuotes(data, holdingSortField, holdingSortOrder);
    });
  }, HOLDING_QUOTE_REFRESH_MS);

  window.addEventListener("beforeunload", function () {
    if (holdingQuoteRefreshTimer) clearInterval(holdingQuoteRefreshTimer);
  });
}

function getgplist(field, order) {
  holdingSortField = field || "";
  holdingSortOrder = order || "desc";
  loginstatus(function (data) {
    $(".drcjios").html(data.userdata.zhengquanname);
    $(".zqnumber2").html(data.userdata.zhengquannumber);

    if (Global_PhoneType === "Apple") {
      $(".zqname2").css("margin-top", ".15rem");
    }

    // The account ledger is local and cheap to recalculate. Always render it
    // first so transactions made after the market close never show stale cache.
    requestHoldingData(field, order, true);
  });
}



function showzj(setdata) {
  if (Global_PhoneType == 'Apple' && setdata.dryk.replace("+", "").replace(",", "") > 0) {
    setdata.dryk = setdata.dryk.replace("+", "");
  }
  var dryk = setdata.dryk + "<span>" + setdata.drykl + "</span>";
  var cwbg = setdata.cangwei + " 1.35rem";
  // var cw = "<span>仓位</span>&nbsp;" + setdata.cangwei;

var displayCangwei = (parseFloat(setdata.cangwei) === 0) ? "--" : setdata.cangwei;
var cw = "<span>仓位</span>&nbsp;" + displayCangwei;

  //console.log(cw);
  $(".cangwei").css("background-size", cwbg);

  $("#cangwei").html(cw);
  $("#zichan").html(setdata.zzc);

  $("#tyk").html(setdata.zyk);
  $("#dryk").html(dryk);
  // $(".dryk2").text(setdata.totaldrykbili);
  $("#totalsz").html(setdata.zsz);
  $("#kequ").html(setdata.zkq);
  $("#keyong").html(setdata.zky);

  if (setdata.zykcss) {
    $("#tyk").addClass(setdata.zykcss); //浮动盈亏css
    $("#dryk").addClass(setdata.drykcss);
    if (setdata.dryk.length > 9) {
      $("#dryk").css("font-size", ".9rem");
      $("#dryk").css("margin-top", ".1rem");
      $("#dryk span").css("font-size", ".7rem");
    }
    if (setdata.dryk.length > 10) {
      $("#dryk").css("font-size", ".83rem");
      $("#dryk").css("margin-top", ".16rem");
      $("#dryk span").css("font-size", ".66rem");
    }
    $("#dryk").css(setdata.drykcss);
    $("#dryk").addClass(setdata.dryklcss);
  }
  //账户
  $(".drcjios").html(setdata.zhengquanname);
  $(".zqnumber2").html(setdata.zhengquannumber);
}

//冒泡排序
function listSortBy(myArray, field, order) {
  //冒泡排序
  //myArray=gpdata;
  //console.log('111',myArray)
  if (field != "") {
    if (myArray.length > 0) {
      for (var i = 0; i < myArray.length; i++) {
        //在这要注意myArray.length-i-1，意思是第一次从数组第一个值开始，第二次从第二个值开始.....
        for (var j = 0; j < myArray.length - i - 1; j++) {
          var str_i = myArray[j][field];
          if (str_i == null) str_i = 0;
          var str_j = myArray[j + 1][field];
          if (str_j == null) str_j = 0;
          //判断值是否大于后面值，如果大于进行换位处理
          if (order == "asc") {
            if (parseFloat(str_i) > parseFloat(str_j)) {
              var tmp = myArray[j];
              myArray[j] = myArray[j + 1];
              myArray[j + 1] = tmp;
            }
          } else if (order == "desc") {
            if (parseFloat(str_i) < parseFloat(str_j)) {
              var tmp = myArray[j];
              myArray[j] = myArray[j + 1];
              myArray[j + 1] = tmp;
            }
          }
        }
      }
    }
  }
  return myArray;
}
