$.fn.countTo = function (options) {
	options = options || {};

	return $(this).each(function () {
		// set options for current element
		var settings = $.extend({}, $.fn.countTo.defaults, {
			from: $(this).data('from'),
			to: $(this).data('to'),
			speed: $(this).data('speed'),
			refreshInterval: $(this).data('refresh-interval'),
			decimals: $(this).data('decimals')
		}, options);

		// how many times to update the value, and how much to increment the value on each update
		var loops = Math.ceil(settings.speed / settings.refreshInterval),
			increment = (settings.to - settings.from) / loops;

		// references & variables that will change with each update
		var self = this,
			$self = $(this),
			loopCount = 0,
			value = settings.from,
			data = $self.data('countTo') || {};

		$self.data('countTo', data);

		// if an existing interval can be found, clear it first
		if (data.interval) {
			clearInterval(data.interval);
		}
		data.interval = setInterval(updateTimer, settings.refreshInterval);

		// initialize the element with the starting value
		render(value);

		function updateTimer() {
			value += increment;
			loopCount++;

			render(value);

			if (typeof (settings.onUpdate) == 'function') {
				settings.onUpdate.call(self, value);
			}

			if (loopCount >= loops) {
				// remove the interval
				$self.removeData('countTo');
				clearInterval(data.interval);
				value = settings.to;

				if (typeof (settings.onComplete) == 'function') {
					settings.onComplete.call(self, value);
				}
			}
		}

		function render(value) {
			var formattedValue = settings.formatter.call(self, value, settings);
			$self.html(formattedValue);
		}
	});
};

$.fn.countTo.defaults = {
	from: 0,
	to: 6589,
	speed: 1000,
	refreshInterval: 10,
	decimals: 0,
	formatter: formatter,
	onUpdate: null,
	onComplete: null
};

function formatter(value, settings) {
	return value.toFixed(settings.decimals);
}

// 设置其中某项数字小数点后显示个数
$('.counter').data('countToOptions', {
	formatter: function (value, options) {
		return value.toFixed(2); //小数点后显示1个 
	}
});

//千位数显示"," 
$('.math').data('countToOptions', {
	formatter: function (value, options) {
		return value.toFixed(options.decimals).replace(/\B(?=(?:\d{3})+(?!\d))/g, ',');
	}
});