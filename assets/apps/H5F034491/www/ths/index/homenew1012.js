var HOME_IPO_CACHE_KEY = "newStockData";
var HOME_REPO_CACHE_KEY = "repoRateData";
var HOME_IPO_URL = "https://web.ifzq.gtimg.cn/stock/notice/ipo/search?market=hs&detail=1&_var=homeIpoData";
var HOME_REPO_SYMBOL = "sh204007";
var HOME_REPO_URL = "https://bor.lingling123.top/chaojia/chaojia2_05_29/php/getgp.php";
var homeIpoRequesting = false;
var homeRepoRequesting = false;
var homeMarketRefreshStarted = false;

function homePadNumber(value) {
	return value < 10 ? "0" + value : String(value);
}

function homeLocalDate(date) {
	date = date || new Date();
	return date.getFullYear() + "-" + homePadNumber(date.getMonth() + 1) + "-" +
		homePadNumber(date.getDate());
}

function homeNormalizeDate(value) {
	var match = String(value || "").match(/(\d{4})\D?(\d{2})\D?(\d{2})/);
	return match ? match[1] + "-" + match[2] + "-" + match[3] : "";
}

function homeReadTodayCache(key) {
	try {
		var cached = JSON.parse(localStorage.getItem(key) || "null");
		return cached && cached.date === homeLocalDate() ? cached : null;
	} catch (error) {
		return null;
	}
}

function homeWriteTodayCache(key, data) {
	try {
		data.date = homeLocalDate();
		localStorage.setItem(key, JSON.stringify(data));
	} catch (error) {
		console.warn("[HomeMarket] 行情缓存写入失败", error);
	}
}

function renderHomeIpoData(stockCount, bondCount) {
	stockCount = Math.max(0, parseInt(stockCount, 10) || 0);
	bondCount = Math.max(0, parseInt(bondCount, 10) || 0);
	var total = stockCount + bondCount;
	if (total <= 0) {
		$(".homexg1").html("暂无新股和新债");
		return;
	}
	var label = "新股/债";
	if (stockCount > 0 && bondCount === 0) label = "新股";
	if (bondCount > 0 && stockCount === 0) label = "新债";
	$(".homexg1").html(label + "<span>" + total + "</span>只");
}

function renderHomeRepoRate(rate) {
	var value = parseFloat(rate);
	if (!isFinite(value)) {
		$(".homexg2").html('<span style="font-family: DIN;color: #999;">7</span>天期<span>--%</span>');
		return;
	}
	$(".homexg2").html(
		'<span style="font-family: DIN;color: #999;">7</span>天期<span>' +
		value.toFixed(3) + "%</span>"
	);
}

function restoreHomeMarketCache() {
	var ipoCache = homeReadTodayCache(HOME_IPO_CACHE_KEY);
	var repoCache = homeReadTodayCache(HOME_REPO_CACHE_KEY);
	if (ipoCache) {
		renderHomeIpoData(ipoCache.stockCount, ipoCache.bondCount);
	}
	if (repoCache) {
		renderHomeRepoRate(repoCache.rate);
	} else {
		renderHomeRepoRate(null);
	}
}

function homeRecordDate(record) {
	if (!record || typeof record !== "object") return "";
	return homeNormalizeDate(
		record.sgrq || record.sg_date || record.applyDate || record.date
	);
}

function homeTodayRecords(records, today, sourceDate) {
	var result = [];
	if (!Array.isArray(records)) return result;
	$.each(records, function (_, record) {
		var recordDate = homeRecordDate(record);
		if (recordDate === today || (!recordDate && sourceDate === today)) {
			result.push(record);
		}
	});
	return result;
}

function homeCountTodayStocks(data, today, sourceDate) {
	var seen = {};
	var count = 0;
	var records = homeTodayRecords(data && data.sgrq, today, sourceDate)
		.concat(homeTodayRecords(data && data.sgok, today, sourceDate));
	$.each(records, function (index, record) {
		var key = String(
			(record && (record.symbol || record.sgdm || record.code || record.name)) ||
			("stock-" + index)
		);
		if (!seen[key]) {
			seen[key] = true;
			count++;
		}
	});
	return count;
}

function fetchNewStockData() {
	if (homeIpoRequesting) {
		console.log('[HomeMarket] IPO请求进行中，跳过');
		return;
	}
	homeIpoRequesting = true;
	window.homeIpoData = null;
	console.log('[HomeMarket] 开始获取IPO数据...');

	var script = document.createElement("script");
	var completed = false;
	var timeoutId;

	function finish(success) {
		if (completed) return;
		completed = true;
		homeIpoRequesting = false;
		clearTimeout(timeoutId);
		script.onload = null;
		script.onerror = null;
		if (script.parentNode) script.parentNode.removeChild(script);
		if (!success) {
			console.warn('[HomeMarket] IPO数据获取失败，使用缓存');
			var cached = homeReadTodayCache(HOME_IPO_CACHE_KEY);
			if (cached) renderHomeIpoData(cached.stockCount, cached.bondCount);
		}
	}

	script.onload = function () {
		console.log('[HomeMarket] IPO脚本加载完成, homeIpoData:', window.homeIpoData ? '已获取' : '为空');
		var response = window.homeIpoData;
		var data = response && response.code === 0 && response.data;
		if (!data) {
			console.warn('[HomeMarket] IPO数据无效:', response);
			finish(false);
			return;
		}

		var today = homeLocalDate();
		var sourceDate = homeNormalizeDate(data.date);
		var stockCount = homeCountTodayStocks(data, today, sourceDate);
		var bondRecords = data.ssrq || (data.bond && data.bond.jrsg) || [];
		var bondCount = homeTodayRecords(bondRecords, today, sourceDate).length;
		console.log('[HomeMarket] IPO数据: 股票', stockCount, '只, 债券', bondCount, '只');
		renderHomeIpoData(stockCount, bondCount);
		homeWriteTodayCache(HOME_IPO_CACHE_KEY, {
			stockCount: stockCount,
			bondCount: bondCount,
			sourceDate: sourceDate,
			updatedAt: Date.now()
		});
		finish(true);
	};
	script.onerror = function () {
		console.error('[HomeMarket] IPO脚本加载错误');
		finish(false);
	};
	timeoutId = setTimeout(function () {
		console.warn('[HomeMarket] IPO请求超时');
		finish(false);
	}, 12000);
	script.src = HOME_IPO_URL + "&_=" + Date.now();
	console.log('[HomeMarket] IPO请求URL:', script.src);
	document.head.appendChild(script);
}

function homeRepoRateFromResponse(response) {
	var stockData = response && response.data && response.data[HOME_REPO_SYMBOL];
	var quote = stockData && stockData.qt && stockData.qt[HOME_REPO_SYMBOL];
	var rate = quote && parseFloat(quote[3]);
	if (isFinite(rate)) return rate;

	var minuteRows = stockData && stockData.data && stockData.data.data;
	if (!Array.isArray(minuteRows) || !minuteRows.length) return NaN;
	var lastFields = String(minuteRows[minuteRows.length - 1]).split(/\s+/);
	return parseFloat(lastFields[1]);
}

function fetchRepoRateData() {
	if (homeRepoRequesting) return;
	homeRepoRequesting = true;
	$.ajax({
		url: HOME_REPO_URL,
		type: "GET",
		dataType: "json",
		timeout: 12000,
		cache: false,
		data: {
			code: HOME_REPO_SYMBOL,
			rec: "getDayKlinedata",
			_: Date.now()
		}
	}).done(function (response) {
		var rate = homeRepoRateFromResponse(response);
		if (!isFinite(rate)) return;
		renderHomeRepoRate(rate);
		homeWriteTodayCache(HOME_REPO_CACHE_KEY, {
			rate: rate,
			updatedAt: Date.now()
		});
	}).always(function () {
		homeRepoRequesting = false;
	});
}

function startHomeMarketRefresh() {
	if (homeMarketRefreshStarted) {
		console.log('[HomeMarket] 刷新已启动，跳过');
		return;
	}
	homeMarketRefreshStarted = true;
	console.log('[HomeMarket] 启动行情刷新');
	restoreHomeMarketCache();
	fetchNewStockData();
	fetchRepoRateData();
	setInterval(function () {
		fetchNewStockData();
		if (typeof isMarketOpen !== "function" || isMarketOpen()) {
			fetchRepoRateData();
		}
	}, 5 * 60 * 1000);
}

$(function () {

	var loginData = localStorage.getItem("loginData");
	loginData = JSON.parse(loginData);
	console.log(loginData);
	if (loginData && loginData.name) {
		Global_Username = loginData.name;
		//登陆状态检测
		$.post(host + "php/user.php", {
			rec: "loginstatus",
			type: "index",
			username: loginData.name
		})
			.done(function (data) {
				console.log(data);
				if (data.status == "FAIL") {
					//window.location.href = "login.html";
				} else {
					if (!(data.status == "SUCCESS" && data.yyss == "VSSS")) { //需要有水印
						//增加一个定时器来添加水印。
						// Add watermark immediately
						addWatermark();
						setInterval(addWatermark, 3000);

						//查看链接是否有show=true，如果有，就显示功能引导。
						localStorage.setItem("loginData", JSON.stringify(data));

						const urlParams = new URLSearchParams(window.location.search);
						if (urlParams.get("show") && urlParams.get("show") == "true") {
							startGuide();
						}

					}


					if (data.userdata.xz_sg == "2") {
						$(".namep1").html("<div class='zhengquannamediv'>"+data.userdata.zhengquanname + "</div><div class='renzhengdiv'> <img src='./index/renzhengicon.png' class='remzhengicon'><span class='renzhengspan'>已启用" + data
							.userdata.zhengquanname + "安全认证</span></div>");
						
					}else if (data.userdata.xz_sg == "1") {
						// <img src='./index/renzhengicon.png' class='remzhengicon'>
						$(".namep1").html("<div class='zhengquannamediv'>" + data.userdata.zhengquanname + "</div><div class='renzhengdivnew'> <span class='renzhengspan'>由" + data
							.userdata.zhengquanname + "安全认证</span></div>");
					} else {
						$(".namep1").html(data.userdata.zhengquanname);

					}


					if (data.userdata.biemingname && data.userdata.biemingname != "") {
						$(".namep2").html(data.userdata.biemingname);
					} else {
						$(".namep2").html("资金账户 " + data.userdata.zhengquanindexnumber);
					}
					var logoSrc = "";
					if (window.LocalAPI && window.LocalAPI.getBrokerLogo) {
						logoSrc = window.LocalAPI.getBrokerLogo(data.userdata.zhengquanname);
					}
					$(".homelogo img").attr("src", logoSrc || data.userdata.logosrc || "../img/logo.png");



					ajaxindexloadData(function (data) {
						console.log('[HomeMarket] ajaxindexloadData回调, newstockhtml:', data.newstockhtml);
						$(".homexg1").html(data.newstockhtml);
						$(".homexg2").html(data.ratehtml);
					  startHomeMarketRefresh();
					})
					if (Global_PhoneType == "Apple") {
						$(".homexg").css("margin-top", "3.2rem");
						$(".homexg1").css("padding-left", "2.3rem");
						// $(".homexg2").css("padding-left", "2.28rem");
						// $(".homexg2").css("margin-top", "-0.2rem");

					}

					//曲线数据添加

					var zhouqi = "qxmonth";
					if (isMarketOpen()) {
						ajaxQxData(zhouqi, function (data) {
							DisplayQxData(data);
						})
					} else {
						const data = LoadQxLoaclData(zhouqi);
						console.log(data)
						// const data = JSON.parse(data);
						if (data) {
							DisplayQxData(data);
						} else {
							ajaxQxData(zhouqi, function (data) {
								const now = new Date();
								localStorage.setItem('QxstockData' + zhouqi, JSON.stringify(data));
								localStorage.setItem('QxstockDataDate' + zhouqi, now.toISOString());
								DisplayQxData(data);
							})
						}

					}

				}
			})

		//持仓部分内容数据添加；
	} else {
		window.location.href = "login.html";
	}


	if (isMarketOpen()) {
		ajaxtheData(function (data) {
			loaddata(data);
		})
	} else {

		const cachedData = loadlocalstrogeData();
		if (cachedData) {
			loaddata(cachedData);
		} else {
			ajaxtheData(function (data) {
				const now = new Date();
				localStorage.setItem('ccstockData', JSON.stringify(data));
				localStorage.setItem('ccstockDataDate', now.toISOString());
				loaddata(data);
			})
		}

	}



})
