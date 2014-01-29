// (function(){

/* 
 * Initial setup
 */

// Add data to crossfilter
var ndx = crossfilter(data),
    all = ndx.groupAll();

// Formatting helpers
var parseDate = d3.time.format('%Y-%m-%dT%X');
    percentage = d3.format('.2p'),
    roundPercentage = function(d) { return percentage(d3.round(d, 3)); };

// Format the data
data.forEach(function(d){
	d.date = parseDate.parse(d.DateMadeUtc);
  d.localDate = parseDate.parse(d.ShiftDateTime);
  d.hour = d.date.getHours();
  d.localHour = d.localDate.getHours();
  d.count = 1;
});

// Count of all records
d3.selectAll('.total-count')
      .text((ndx.size()));

// Count of selected records
dc.dataCount('.dc-data-count')
  .dimension(ndx)
  .group(all);

// Helper function
var calcTotal = function(chart) {
	var dataVar = chart.data(),
			totalVar = 0;
	for(var item in dataVar){
		totalVar += dataVar[item].value;
	}
	return totalVar;
};  

/* 
 * Chart variables
 */

// Dimensions
var hourDim = ndx.dimension(function(d){ return d.localHour; }),
    partnerDim = ndx.dimension(function(d) { return d.Partnername; }),
    restaurantDim = ndx.dimension(function(d){ return d.RestaurantName; }),
    partyDim = ndx.dimension(function(d) { return d.Partysize; });

// Counts of bookings
var hourlyTotal = hourDim.group().reduceSum(function(d) { return d.count; }),
    partnerTotal = partnerDim.group().reduceSum(function(d) { return d.count; }),
    restaurantTotal = restaurantDim.group().reduceSum(function(d) { return d.count; });

// Count of party size 
var partyTotal = partyDim.group().reduceSum(function(d) { return d.count; });

// Margins
var marginSetting = {top: 20, right: 10, bottom: 40, left: 40};

/* 
 * Local hourly reservations
 */

// Demand chart
var hourlyChart = dc.lineChart('#line');

hourlyChart
	.width(350)
	.height(200)
	.margins(marginSetting)
	.dimension(hourDim)
	.group(hourlyTotal)
	.x(d3.scale.linear().domain([0,24]))
	.yAxisLabel('Reservations') 
	.elasticY(true);
	
hourlyChart.yAxis().tickFormat(d3.format('s'));

/* 
 * Reservations from referrers
 */

// Coloration
var colorScale = d3.scale.ordinal().range(['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6']);

// Referrer chart
var referrerChart = dc.pieChart('#pie');

// Sizing variables
var totalPie = 0;

referrerChart
	.width(350)
	.height(200)
	.dimension(partnerDim)
	.group(partnerTotal)
	.colors(colorScale)
	.innerRadius(30)
	.slicesCap(5)
	.on('preRender', function(chart){
		totalPie = calcTotal(chart);
	})
	.on('preRedraw', function(chart){
		totalPie = calcTotal(chart);
	})
  .title(function (p) {
  	return percentage(p.value/totalPie);
	})
  .renderLabel(false)
	.legend(dc.legend().gap(3));

/* 
 * Reservations per restaurant
 */

// Restaurant chart
var restaurantChart = dc.rowChart('#row');

// Sizing variables
var currentMaxRow = 0,
		ratio,
		chartMax = restaurantTotal.top(1)[0].value;

restaurantChart
  .width(350)
  .height(500)
  .dimension(restaurantDim)
  .group(restaurantTotal)
  .on('postRedraw', function(chart){
  	currentMaxRow = restaurantTotal.top(1)[0].value;
  	ratio = currentMaxRow/chartMax;
  	if(ratio < .25 || ratio > 1){
  		restaurantChart.elasticX(true);
  		chartMax = currentMaxRow;
  		dc.redrawAll();
  	} else {
  		restaurantChart.elasticX(false);
  		chartMax = currentMaxRow;
  	}
  })
  .xAxis().ticks(4);

/* 
 * Distribution of party size
 */

// Party size chart
var partyChart = dc.barChart('#bar');

partyChart
	.width(350)
	.height(200)
	.margins(marginSetting)
	.dimension(partyDim)
	.group(partyTotal)	
	.centerBar(true)
	.renderHorizontalGridLines(true)
	.x(d3.scale.linear().domain([0,15]))
	.elasticY(true)
	.yAxisLabel('Reservations') 
  .yAxis().tickFormat(d3.format('s'))

partyChart.xAxis().ticks(14);

// Render all charts
dc.renderAll();

// })()
