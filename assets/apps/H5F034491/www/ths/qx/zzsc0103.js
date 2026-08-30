$(function () {
	var jjrmodelidlist; //用于存放从数据库取出的所有节假日的id
	var jjrmodeltimelist; //用于存放从数据库取出的所有节假日的time
	var jjrmodelztlist; //用于存放从数据库取出的所有节假日的状态 盈亏
	var jjrmodelbllist; //用于存放从数据库取出的所有节假日的状态 盈亏比例
	var jjrmodelbcolor; //背景色
	var jjrmodelcolor; //字体颜色
	var jjrmodelclass; //样式
	var shouyi; //显示盈亏 1显示盈亏比例

	createSelectYear(); //创建年份下拉,并给对应事件
	createMonthSelect(); //创建月份下拉，并给对应事件

	// getjjrszModelByYear(withID("aboluo-yearSelect").value, parseInt(withID("aboluo-selectmonth").value),
	// 	function() {
	// 		createTabledate(parseInt(withID("aboluo-yearSelect").value), parseInt(withID(
	// 			"aboluo-selectmonth").value), 0);
	// 		$('#yuefen').text(parseInt(withID("aboluo-selectmonth").value));
	// 	}); //从数据库取出已经设置了的节假日的数据，例：休息，上班等

	$('.clickbl').toggle(function () {

		$('aside').css('background-image', 'url(qx/rilibgn2a.jpg)');
		createTabledate(parseInt(withID("aboluo-yearSelect").value), parseInt(withID(
			"aboluo-selectmonth").value), 1);
		$('#lv').show();
		// $('#leiji').text($("#shouyibili").val());
		$("#showtype").val('1');

		$('.myk').hide();
		$(".mykbili").css("display", "block");
		$('#mlv').show();
		$("#mleijilv").show();
		$("#mleiji").hide();
		$("#yleijilv").show();
		$("#yleiji").hide();
		$(".jieduan").hide();
	}, function () {

		$('aside').css('background-image', 'url(qx/rilibgna.jpg)');
		createTabledate(parseInt(withID("aboluo-yearSelect").value), parseInt(withID(
			"aboluo-selectmonth").value), 0);
		$('#lv').hide();
		// $('#leiji').text($("#shouyi").val());	
		$("#showtype").val('0');
		$('.myk').css("display", "block");
		$('.mykbili').hide();
		$('#mlv').hide();
		$("#mleiji").show();
		$("#mleijilv").hide();
		$("#yleiji").show();
		$("#yleijilv").hide();
		$(".jieduan").show();

	});

});









//阻止冒泡
function stopBubble(e) {
	if (e && e.stopPropagation) { // 别的浏览器
		e.stopPropagation();
	} else { //IE
		window.event.cancelBubble = true;
	}
}


//定义了yearselect并赋值,且添加事件，选择则对应的table日期也将改变,且已选中日期会跳到当前选择月的日期，然后给右边明细栏赋值
function createSelectYear() {
	withClass("aboluo-calendar-select-year").innerHTML =
		'<select name="aboluo-yearSelect" id="aboluo-yearSelect" style="point er-events:none;" ></select>';
	var yearSelect = withID("aboluo-yearSelect");
	var Nowtime = new Date();
	var currYear = Nowtime.getFullYear();
	for (var i = 0; i <= 2; i++) {
		yearSelect.options.add(new Option((currYear - i) + "年 ", currYear - i));
		if (currYear == i + 1970) {
			yearSelect.options[i].selected = true;
		}
	}
	yearSelect.onchange = function (e) {
		var aclick = withClass("aboluo-aclick");
		//重新赋值给变全局变量,所有的带状态的日期;然后下一步将创建table,完成动态样式,
		//这里要重读数据就5个位置,选择年时,上一个月,下一个月,设置节假日button,返回今天button
		getjjrszModelByYear(withID("aboluo-yearSelect").value, parseInt(withID("aboluo-selectmonth").value),
			function () {


				createTabledate(withID("aboluo-yearSelect").value, withID("aboluo-selectmonth").value,
					gettype());
				if (aclick == "") {
					//说明没选,或选的当天,算出选的这个月有多少天,与原来的那个月的天数一对比,如果原来的天数大于现在的天数,那么对换
					//这里先算当前月当前天,然后算出选择的那个月总天数,然后对比,如果当前天大于选择的那个月那天,对换
					var pervdays1 = getCurrMonthLashDay(withID("aboluo-yearSelect").value, withID(
						"aboluo-selectmonth").value);
					if (new Date().getDate() > pervdays1) {
						//setRigth(withID("aboluo-yearSelect").value,withID("aboluo-selectmonth").value,pervdays1);	
					} else {
						//setRigth(withID("aboluo-yearSelect").value,withID("aboluo-selectmonth").value,new Date().getDate());
					}
				} else {
					var adate = aclick.getAttribute("date");
					var aarr = adate.split("-");
					aarr[0] = parseInt(aarr[0]);
					aarr[1] = parseInt(aarr[1]);
					aarr[2] = parseInt(aarr[2]);
					var pervdays = getCurrMonthLashDay(withID("aboluo-yearSelect").value, withID(
						"aboluo-selectmonth").value);
					if (aarr[2] > pervdays) {
						aarr[2] = pervdays;
					}
					//setRigth(withID("aboluo-yearSelect").value,withID("aboluo-selectmonth").value,aarr[2]);	
				}

			});

	};
}




//创建月的下拉框，并赋值,且添加事件，选择则对应的table日期也将改变,且已选中日期会跳到当前选择月的日期，然后给右边明细栏赋值
function createMonthSelect() {
	var selectmonth = newElement('select');
	selectmonth.name = "aboluo-selectmonth";
	selectmonth.id = "aboluo-selectmonth";
	selectmonth.onchange = function (e) {
		var aclick = withClass("aboluo-aclick");
		//console.log('333',withID("aboluo-selectmonth").value);
		getjjrszModelByYear(withID("aboluo-yearSelect").value, selectmonth.options[selectmonth.selectedIndex].value,
			function () {
				createTabledate(withID("aboluo-yearSelect").value, selectmonth.options[selectmonth
					.selectedIndex].value, gettype());
				$('#yuefen').text(selectmonth.options[selectmonth.selectedIndex].value);
				if (aclick == "") {
					//说明没选,或选的当天,算出选的这个月有多少天,与原来的那个月的天数一对比,如果原来的天数大于现在的天数,那么对换
					//这里先算当前月当前天,然后算出选择的那个月总天数,然后对比,如果当前天大于选择的那个月那天,对换
					var pervdays1 = getCurrMonthLashDay(withID("aboluo-yearSelect").value, selectmonth.options[
						selectmonth.selectedIndex].value);
					if (new Date().getDate() > pervdays1) {
						//setRigth(withID("aboluo-yearSelect").value,selectmonth.options[selectmonth.selectedIndex].value,pervdays1);	
					} else {
						//setRigth(withID("aboluo-yearSelect").value,selectmonth.options[selectmonth.selectedIndex].value,new Date().getDate());
					}
				} else {
					var adate = aclick.getAttribute("date");
					var aarr = adate.split("-");
					aarr[0] = parseInt(aarr[0]);
					aarr[1] = parseInt(aarr[1]);
					aarr[2] = parseInt(aarr[2]);
					var pervdays = getCurrMonthLashDay(withID("aboluo-yearSelect").value, selectmonth.options[
						selectmonth.selectedIndex].value);
					if (aarr[2] > pervdays) {
						aarr[2] = pervdays;
					}
					//setRigth(withID("aboluo-yearSelect").value,selectmonth.options[selectmonth.selectedIndex].value,aarr[2]);	
				}
			});


	};
	var Nowtime = new Date();
	var currMonth = Nowtime.getMonth();
	for (var i = 0; i < 12; i++) {
		selectmonth.options.add(new Option((i + 1) + "月", i + 1));
		if (currMonth == i) {
			selectmonth.options[i].selected = true;
		}
	}
	var next = withClass("aboluo-month-a-next");
	var parent = next.parentNode;
	parent.insertBefore(selectmonth, next);
}


//根据传入的年月，创建对应的table日期,并且在每个td中创建a标签用于事件，与样式内边框的设置
function createTabledate(year, yue, yktype) {

	var rilitabledele = withClass("aboluo-rilitbody");
	if (rilitabledele != "" && rilitabledele != null && rilitabledele != 'undefined') {
		rilitabledele.parentNode.removeChild(rilitabledele);
	}
	var rilitable = newElement('tbody');
	rilitable.setAttribute("class", "aboluo-rilitbody");
	var rili = withClass("aboluo-rilitable");
	rili.appendChild(rilitable);
	//先得到当前月第一天是星期几,然后根据这个星期算前面几天的上个月最后几天.
	var date = setdateinfo(year, yue, 1);
	var weekday = date.getDay();
	var pervLastDay;

	//console.log('这是时间',date);
	if (weekday != 0) {
		pervLastDay = weekday;
	} else {
		pervLastDay = weekday + 7;
	}
	//得到上个月最后一天;
	var pervMonthlastDay = getPervMonthLastDay(year, yue);




	//上月最后几天循环
	var lastdays = pervMonthlastDay - pervLastDay + 1;
	var tr = newElement('tr');
	tr.style.borderBottom = "0px solid #ff8974";
	//alert(lastdays)


	var pretianshu = pervMonthlastDay - lastdays; //上个月循环天数

	//console.log(lastdays,pervMonthlastDay);
	if (pretianshu < 6) {
		for (var i = lastdays; i <= pervMonthlastDay; i++) {
			var td = newElement("td");
			var a = getA(parseInt(yue) - 1 == 0 ? parseInt(year) - 1 : year, parseInt(yue) - 1 == 0 ? 12 : parseInt(
				yue) - 1, i, i);


			a.style.color = "#BFBFC5";
			//		a.href ='javascript:pervA('+parseInt(yue)-1==0?parseInt(year)-1:year+','+parseInt(yue)-1==0?12:parseInt(yue)-1+','+i+');';
			td.appendChild(a);
			td.setAttribute("class", "aboluo-pervMonthDays");
			tr.appendChild(td);
		}
	}

	//这个月开始的循环
	var startDays = 7 - weekday == 7 ? 0 : 7 - weekday; //原	var startDays=7-weekday==7?0:7-weekday;
	for (var i = 1; i <= startDays; i++) {
		var td = newElement("td");
		var ii = i;
		var b = getA(year, yue, i, ii);
		td.appendChild(b);
		tr.appendChild(td);
	}
	rilitable.appendChild(tr);
	//指定年月最后一天
	var currMonthLashDay = getCurrMonthLashDay(year, yue);
	//当月除开第一行的起点
	var currmonthStartDay = currMonthLashDay - (currMonthLashDay - startDays) + 1;
	//当月还剩余的天数
	var syts = currMonthLashDay - startDays;
	//循环次数
	var xhcs = 0;
	if (check(syts / 7)) {
		//是小数 //向上取整
		xhcs = Math.ceil(syts / 7);
	} else {
		xhcs = syts / 7;
		if(yue==2 && xhcs<5){
			xhcs+=1;
		}
	}
	//这是下个月开始的变量;
	var jilvn = 1;
	for (var i = 0; i < xhcs; i++) {
		var tr1 = newElement('tr');
		if (i != xhcs - 1) {
			tr1.style.borderBottom = "0px solid #ff8974";
		}
		for (var n = 1; n <= 7; n++) {
			var td = newElement('td');
			if (startDays == 32) { //原		if(startDays==0){
				var c = getA(parseInt(yue) + 1 == parseInt(13) ? parseInt(year) + 1 : year, parseInt(yue) + 1 ==
					parseInt(13) ? 1 : parseInt(yue) + 1, jilvn, jilvn);
				c.style.color = "#BFBFC5";
				td.appendChild(c);
				td.setAttribute("class", "aboluo-nextMonthDays");
				jilvn++;
				tr1.appendChild(td);
				continue;
			} else {
				startDays++;
				var d = getA(year, yue, startDays, startDays);
				td.appendChild(d);
				if (startDays == currMonthLashDay) {
					startDays = 32; //原	startDays=0;
				}
				tr1.appendChild(td);
			}

		}
		rilitable.appendChild(tr1);
	}
	//setHolidayred();//设置星期六星期天的样式
	//setTrHeight();//设置table日期的行高

	if (parseInt(yktype) === 1) {
		setB(yue);
	} else {
		setA(yue); //设置td中a的事件
	}

	//
}


















//定义全局变量，
var Globalriliykdata = null;
var jjrmodelidlist = [];
var jjrmodeltimelist = []; //这里时间的格式为yyyy-MM-dd HH:mm:ss
var jjrmodelztlist = []; //盈亏
var jjrmodelbllist = []; //盈亏比例
var jjrmodelbcolor = []; //背景色
var jjrmodelcolor = []; //字体颜色
var jjrmodelclass = []; //样式


function getjjrszModelByYear(year, yue, Callback = function () { }, data = null) {
	if (data != null) {
		DisplayRiliData(data, function () {
			Callback();
		});
	} else {


		if (isMarketOpen()) {
			AjaxRiliData(year, yue, function (data) {
				DisplayRiliData(data, function () {
					Callback();
				});
			})
		} else {

			const data = LoadRiliLoaclData(year, yue);

			if (data) {
				DisplayRiliData(data, function () {
					Callback();
				});
			} else {
				AjaxRiliData(year, yue, function (data) {
					const now = new Date();
					localStorage.setItem('RilistockData_' + year + "_" + yue, JSON.stringify(data));
					localStorage.setItem('RilistockDataDate_' + year + "_" + yue, now.toISOString());
					DisplayRiliData(data, function () {
						Callback();
					});
				})
			}
		}

	}



}


function LoadRiliLoaclData(year, yue) {
	const storedData = localStorage.getItem('RilistockData_' + year + "_" + yue);
	const storedDate = localStorage.getItem('RilistockDataDate_' + year + "_" + yue);

	if (storedData && storedDate) {
		const lastStoredDate = new Date(storedDate);
		const now = new Date();

		const lastMarketClose = getLastMarketCloseTime();
		// Check if the stored data is from the latest market close time to now
		if (lastStoredDate >= lastMarketClose && lastStoredDate <= now) {
			return JSON.parse(storedData);
		}
	}
	return null;
}

function AjaxRiliData(year, yue, callback) {
	$.post(host + "/php/userqx.php", {
		rec: "qxrili",
		year: year,
		yue: yue,
		username: Global_Username
	})
		.done(function (json) {
			callback(json);

		})
		.fail(function () {
			alert("提交出现错误!");
		});
}


//给tbody中的td中的A设置事件，上个月的天数,这个月的天数,下个月的天数三种对应的事件
//这里还有个功能就是判断当前的A中日期是不是数据库中有带状态的日期,如果是就给相当的样式
function setA(yue) {
	$('#leiji').text($("#shouyi").val());

	console.log('ghh');
	var tbody = withClass("aboluo-rilitbody");
	var arr = tbody.getElementsByTagName("a");

	for (var i = 0; i < arr.length; i++) {
		var date = arr[i].getAttribute("date");

		var datearr = date.split("-");


		for (var n = 0; n < jjrmodelidlist.length; n++) {

			if (formatByDate(jjrmodeltimelist[n]) == formatByDate(date) && yue == datearr[1]) {
				var span = newElement('span');
				span.setAttribute("class", jjrmodelclass[n]);

				arr[i].style.background = jjrmodelbcolor[n];
				//arr[i].style.borderBottom="1px solid #ff8974";
				arr[i].style.color = jjrmodelcolor[n];
				arr[i].setAttribute("ztid", jjrmodelidlist[n]);
				arr[i].setAttribute("jjrzt", jjrmodelztlist[n]);

				var spans = arr[i].querySelectorAll('span');
				spans.forEach(function (span) {
					span.remove();
				});
				span.innerHTML = jjrmodelztlist[n];
				//arr[i].appendChild(span);



				if (jjrmodelztlist[n].replace("万", "") > 0) { //盈利
					var span = newElement('span');
					span.setAttribute("class", "aboluo-td-a-ban");
					arr[i].style.background = "#ff745f";
					//arr[i].style.borderBottom="1px solid #ff8974";
					arr[i].style.color = "#fff";
					arr[i].setAttribute("ztid", jjrmodelidlist[n]);
					arr[i].setAttribute("jjrzt", jjrmodelztlist[n]);
					span.innerHTML = jjrmodelztlist[n];
					arr[i].appendChild(span);
				} else if (jjrmodelztlist[n].replace("万", "") < 0) { //2亏损
					var span = newElement('span');
					span.setAttribute("class", "aboluo-td-a-xiu");
					//arr[i].style.borderBottom="1px solid #88a9fa";
					arr[i].setAttribute("ztid", jjrmodelidlist[n]);
					arr[i].setAttribute("jjrzt", jjrmodelztlist[n]);
					arr[i].style.background = "#6f92e6";
					arr[i].style.color = "#fff";
					span.innerHTML = jjrmodelztlist[n];
					arr[i].appendChild(span);
				} else if (jjrmodelztlist[n].replace("万", "") == 0) { //0
					var span = newElement('span');
					span.setAttribute("class", "aboluo-td-a-ban");
					//arr[i].style.borderBottom="1px solid #88a9fa";
					arr[i].setAttribute("ztid", jjrmodelidlist[n]);
					arr[i].setAttribute("jjrzt", jjrmodelztlist[n]);
					arr[i].style.background = "#fff";
					arr[i].style.color = "#000";
					span.innerHTML = jjrmodelztlist[n];
					arr[i].appendChild(span);
				} else { // 休假
					var span = newElement('span');
					span.setAttribute("class", "aboluo-td-a-xiujia");
					arr[i].setAttribute("ztid", jjrmodelidlist[n]);
					arr[i].setAttribute("jjrzt", jjrmodelztlist[n]);
					span.innerHTML = jjrmodelztlist[n];
					arr[i].appendChild(span);
				}

			}

			if (formatByDate(jjrmodeltimelist[n]) == formatByDate(date) && yue != datearr[1] && (typeof jjrmodelbllist[n] !== 'number' && isNaN(jjrmodelbllist[n]))) {
				var span = newElement('span');
				span.setAttribute("class", "aboluo-td-a-xiujia");
				arr[i].setAttribute("ztid", jjrmodelidlist[n]);
				arr[i].setAttribute("jjrzt", jjrmodelztlist[n]);
				span.innerHTML = jjrmodelztlist[n];
				arr[i].appendChild(span);
			}
		}
	}
}


//给tbody中的td中的A设置事件，上个月的天数,这个月的天数,下个月的天数三种对应的事件
//这里还有个功能就是判断当前的A中日期是不是数据库中有带状态的日期,如果是就给相当的样式
function setB(yue) {
	$('#leiji').text($("#shouyibili").val());
	var tbody = withClass("aboluo-rilitbody");
	var arr = tbody.getElementsByTagName("a");

	for (var i = 0; i < arr.length; i++) {
		var date = arr[i].getAttribute("date");

		var datearr = date.split("-");

		for (var n = 0; n < jjrmodelidlist.length; n++) {

			if (formatByDate(jjrmodeltimelist[n]) == formatByDate(date) && yue == datearr[1]) {
				//console.log('334', jjrmodelbllist[n])
				if (jjrmodelbllist[n] > 0) { //盈利
					var span = newElement('span');
					span.setAttribute("class", "aboluo-td-a-ban");
					arr[i].style.background = "#ff745f";
					//arr[i].style.borderBottom="1px solid #ff8974";
					arr[i].style.color = "#fff";
					arr[i].setAttribute("ztid", jjrmodelidlist[n]);
					arr[i].setAttribute("jjrzt", jjrmodelbllist[n]);
					span.innerHTML = jjrmodelbllist[n] + '%';
					arr[i].appendChild(span);
				} else if (jjrmodelbllist[n] < 0) { //2亏损
					var span = newElement('span');
					span.setAttribute("class", "aboluo-td-a-xiu");
					//arr[i].style.borderBottom="1px solid #88a9fa";
					arr[i].setAttribute("ztid", jjrmodelidlist[n]);
					arr[i].setAttribute("jjrzt", jjrmodelbllist[n]);
					arr[i].style.background = "#6f92e6";
					arr[i].style.color = "#fff";
					span.innerHTML = jjrmodelbllist[n] + '%';
					arr[i].appendChild(span);
				} else if (jjrmodelbllist[n] == '0.00') { //0

					var span = newElement('span');
					span.setAttribute("class", "aboluo-td-a-ban");
					//arr[i].style.borderBottom="1px solid #88a9fa";
					arr[i].setAttribute("ztid", jjrmodelidlist[n]);
					arr[i].setAttribute("jjrzt", jjrmodelbllist[n]);
					arr[i].style.background = "#fff";
					arr[i].style.color = "#000";
					span.innerHTML = jjrmodelbllist[n] + '%';
					arr[i].appendChild(span);
				} else { // 休假
					var span = newElement('span');
					span.setAttribute("class", "aboluo-td-a-xiujia");
					arr[i].setAttribute("ztid", jjrmodelidlist[n]);
					arr[i].setAttribute("jjrzt", jjrmodelbllist[n]);
					span.innerHTML = jjrmodelbllist[n];
					arr[i].appendChild(span);
				}
			}
			if (formatByDate(jjrmodeltimelist[n]) == formatByDate(date) && yue != datearr[1] && (typeof jjrmodelbllist[n] !== 'number' && isNaN(jjrmodelbllist[n])) ) {
				var span = newElement('span');
				span.setAttribute("class", "aboluo-td-a-xiujia");
				arr[i].setAttribute("ztid", jjrmodelidlist[n]);
				arr[i].setAttribute("jjrzt", jjrmodelztlist[n]);
				span.innerHTML = jjrmodelztlist[n];
				arr[i].appendChild(span);
			}
		}
	}
}




function formatByDate(date) {
	date = date.substring(0, 10);
	var daxx = date.toString().split("-");
	return daxx[0] + "-" + (daxx[1].length < 2 ? '0' + daxx[1] : daxx[1]) + "-" + (daxx[2].length < 2 ? '0' + daxx[2] :
		daxx[2]);
}




//创建元素
function newElement(val) {
	return document.createElement(val);
}

//创建date对象并赋值
function setdateinfo(year, yue, day) {
	var date = new Date();
	date.setFullYear(parseInt(year));
	date.setMonth(parseInt(yue) - 1);
	console.log('月份', date.setMonth(parseInt(yue) - 1));

	date.setDate(parseInt(day));
	return date;
}

//根据年月日判断是不是星期六星期天 //yue 按12算
function isweekend(year, yue, day) {
	var date = new Date();
	date.setFullYear(year);
	date.setMonth(yue - 1);
	date.setDate(day);
	var week = date.getDay();
	if (week == 0 || week == 6) {
		return true;
	}
	return false;
}

//根据getDay()返回对应的星期字符串
function getWeek(val) {
	var weekxq = new Array();
	weekxq[0] = "星期日";
	weekxq[1] = "星期一";
	weekxq[2] = "星期二";
	weekxq[3] = "星期三";
	weekxq[4] = "星期四";
	weekxq[5] = "星期五";
	weekxq[6] = "星期六";
	return weekxq[val];
}

//判断c是否是小数
function check(c) {
	var r = /^[+-]?[1-9]?[0-9]*\.[0-9]*$/;
	return r.test(c);
}

//得到指定月的上个月最后一天传进来按 12月算
function getPervMonthLastDay(year, yue) {
	//当月就是  yue-1 也就是计算机里面的0-11月份,那么算上个月的最后一天就是当月的0天
	return parseInt(new Date(year, yue - 1, 0).getDate());
}

//得到指定月最后一天 传进来按 12月算
function getCurrMonthLashDay(year, yue) {
	if (yue >= 12) {
		year = year + 1;
		yue = yue - 12;
	}
	return parseInt(new Date(year, yue, 0).getDate());
}


//创建a标签并设置公用属性
function getA(year, yue, day, ii) {
	var a = newElement("a");
	var todayD = new Date();
	var tMonth = todayD.getMonth() + 1; // 月
	var tDate = todayD.getDate(); // 日
	a.href = "javascript:;";
	if (yue == tMonth && tDate == ii) {
		ii = '今';
	}
	if (ii >= 1 && ii <= 9) {
		ii = '0' + ii
	}


	a.innerHTML = ii;
	a.style.textDecoration = "none";
	a.setAttribute("date", year + "-" + yue + "-" + day);
	return a;
}

//得到对象
function gettype() {

	return $("#showtype").val();
}

//得到id对象
function withID(id) {
	return document.getElementById(id);
}
//得到传入参数为class的对象(同名返回第一个)
function withClass(id) {
	var targets = targets || document.getElementsByTagName("*");
	var list = [];
	for (var k in targets) {
		var target = targets[k];
		if (target.className == id) {
			return target;
		}
	}
	return "";
}



function nTabs(thisObj, Num) {
	if (thisObj.className == "active") return;
	var tabObj = thisObj.parentNode.id;

	var tabList = document.getElementById(tabObj).getElementsByTagName("li");
	for (i = 0; i < tabList.length; i++) {
		if (i == Num) {
			thisObj.className = "on";
			document.getElementById(tabObj + "_Content" + i).style.display = "block";
			if (i == 1) {
				//getMonthdata(2023);
			}

		} else {
			tabList[i].className = "normal";
			if (document.getElementById(tabObj + "_Content" + i)) {
				document.getElementById(tabObj + "_Content" + i).style.display = "none";
			}
		}
	}
}

// function nTabs(thisObj, Num) {
// 	// Get the parent container
// 	var tabObj = thisObj.parentNode;

// 	// Remove 'on' class from all tabs
// 	var tabList = tabObj.getElementsByTagName("li");
// 	for (var i = 0; i < tabList.length; i++) {
// 		tabList[i].className = "";

// 		// // Hide all content sections
// 		// var contentId = tabObj.id + "_Content" + i;
// 		// var content = document.getElementById(contentId);
// 		// if (content) {
// 		// 	content.className = "none"; // Using your existing class
// 		// }
// 	}

// 	// Set current tab as active
// 	thisObj.className = "on";

// 	// Show current content
// 	var currentContent = document.getElementById(tabObj.id + "_Content" + Num);
// 	if (currentContent) {
// 		currentContent.className = ""; // Remove 'none' class
// 	}

// 	// Special handling for specific tabs if needed
// 	if (Num == 1) { // Yearly tab
// 		// getMonthdata(2023); // Uncomment if needed
// 	}
// }

function getMonthdata(year) {
	//Globalriliykdata
	/* $.ajax({
	  type:"POST",
	  url:"/m/userqxnew.php?rec=qxrilidatamonth",
	  async:false,
	  data:{"y":year,},
	  dataType:"json",	

	  success:function(json){ */
	var json = "";
	//json = JSON.parse(Globalriliykdata);

	for (const [key, value] of Object.entries(Globalriliykdata.data)) {
		if (year == key) {
			json = value;
			break;
		}
		//console.log(`键: ${key}, 值: ${value}`);
	}

	console.log(json);
	if(json==""){
		return;
	}
	var data = json.data;

	console.log('Monthdata', json)
	var html = '';
	//for (var i = 0; i < data.length; i++) {
	for (const [key, value] of Object.entries(data)) {
		if (value.yk != "-") {
			var yks = parseInt(value.yk);
			if (yks > 0) {
				yks = "+" + yks;
			}
		} else {
			var yks = value.yk;
		}

		html += '<li class=' + value.class + '>';
		if (value.yk == json.maxyk) {
			best = '<i><img src="qx/muzhi.png"></i>';
		} else {
			best = '';
		}
		html = html + best;
		html += value.month + '<span class="myk">' + yks + '</span><span class="mykbili">' + value.ykl + '</span></li>';
	}

	$(".yuebox").html(html);
	$('#mleiji').text(json.yk);
	$("#mleiji").addClass(json.css);
	$('#mleijilv').text(json.ykl);
	$('#mrilisz').text(json.dpykl);

	$("#mrilisz").addClass(json.szcss);

}



function getYeardata() {


	var json = "";
	json = Globalriliykdata;
	console.log(json);
	var data = json.data;

	//	console.log('yeardata',json)
	var html = '';
	//for (var i = 0; i < data.length; i++) {
	for (const [key, value] of Object.entries(data)) {
		if (value.yk != "-") {
			var yks = parseInt(value.yk);
			if (yks > 0) {
				yks = "+" + yks;
			}
		} else {
			var yks = value.yk;
		}
		html += '<li class=' + value.class + '>';
		if (value.yk == json.maxyk) {
			best = '<i><img src="qx/muzhi.png"></i>';
		} else {
			best = '';
		}
		html = html + best;
		html += value.year + '年<span class="myk">' + yks + '</span><span class="mykbili">' + value.ykl + '</span></li>';
	}

	$(".yearbox").html(html);
	$('#yleiji').text(json.yk.toFixed(2));
	$('#yleijilv').text(json.ykl);
	$('#yrilisz').text(json.dpykl);
	$("#yleiji").addClass(json.css);
	$("#yleijilv").addClass(json.css);
	$("#yrilisz").addClass(json.szcss);

}
/* }
}); */
/* } */


window.onload = function () {
	function someFunction(data) {

	}
	window.someFunction = someFunction;

	function LoadRilifunc() {
		getjjrszModelByYear(withID("aboluo-yearSelect").value, parseInt(withID("aboluo-selectmonth").value),
			function () {
				createTabledate(parseInt(withID("aboluo-yearSelect").value), parseInt(withID(
					"aboluo-selectmonth").value), 0);
				$('#yuefen').text(parseInt(withID("aboluo-selectmonth").value));
			});
	}
	window.LoadRilifunc = LoadRilifunc;
};