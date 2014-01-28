var ndx = crossfilter(data),
    all = ndx.groupAll();

d3.selectAll(".total-count")
      .text((ndx.size()));

dc.dataCount(".dc-data-count")
  .dimension(ndx)
  .group(all);

var parseDate = d3.time.format("%Y-%m-%dT%X");

data.forEach(function(d){
	d.date = parseDate.parse(d.DateMadeUtc);
  d.localDate = parseDate.parse(d.ShiftDateTime);
  d.hour = d.date.getHours();
  d.localHour = d.localDate.getHours();
  d.count = 1;
});

// Line Chart - Local Hourly Demand

var hourDim = ndx.dimension(function(d){ return d.localHour; });
var reservations = hourDim.group().reduceSum(dc.pluck('count'));
var minHour = hourDim.bottom(1)[0].localHour;
var maxHour = hourDim.top(1)[0].localHour;

var line = dc.lineChart("#line");

line
	.width(500).height(200)
	.dimension(hourDim)
	.group(reservations)
	.margins({top: 20, right: 10, bottom: 40, left: 40})
	.x(d3.scale.linear().domain([0,24]))
	.yAxisLabel("Reservations per Hour") 
	.elasticY(true)
	
line.yAxis().tickFormat(d3.format("s"))

// Pie Chart - Referrers

var partnerDim = ndx.dimension(function(d) { return d.Partnername; });
var partnerTotal = partnerDim.group().reduceSum(function(d) {return d.count;});

var pie = dc.pieChart('#pie');

var colorScale = d3.scale.ordinal().range(['#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854','#ffd92f']);

pie
	.width(300).height(200)
	.slicesCap(5)
	.dimension(partnerDim)
	.group(partnerTotal)
	.innerRadius(30)
	.renderLabel(false)
	.legend(dc.legend().gap(3))
	.colors(colorScale);

var pieTip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function (d) { console.log(d); return "<span style='color: #f0027f'>" +  d.data.key + "</span> : "  + numberFormat(d.value); });

// TODO - Add d3tips

// Row Chart - Restaurant Volume

var restDim = ndx.dimension(function(d){ return d.RestaurantName; });
var restTotal = restDim.group().reduceSum(function(d) { return d.count; });

var row = dc.rowChart('#row');

row
  .width(500)
  .height(500)
  .dimension(restDim)
  .group(restTotal)
  // .elasticX(true)
  .xAxis().ticks(4);


// Bar Chart - Party Size

var partyDim = ndx.dimension(function(d) { return d.Partysize; });
var partyTotal = partyDim.group().reduceSum(function(d) { return d.count; });

var bar = dc.barChart('#bar');

bar
	.width(500)
	.height(200)
	.margins({top: 20, right: 10, bottom: 40, left: 30})
	// .brushOn(false)
	.dimension(partyDim)
	.group(partyTotal)	
	.x(d3.scale.linear().domain([0,15]))
	.centerBar(true)
	.renderHorizontalGridLines(true)
	.elasticY(true)
	.yAxisLabel("Party Size") 
  .yAxis().tickFormat(d3.format("s"))

bar.xAxis().ticks(15);


var maxRest = restTotal.top(1)[0].value;
var minRest;
var ratio;

// Trigger elastic rows if data is too small
// document.addEventListener('mouseup',function(){
// 	setTimeout(function(e){
// 		minRest = restTotal.top(1)[0].value;
// 		ratio = minRest / maxRest;
// 		console.log(ratio);
// 		if(ratio < .25){
// 			row.elasticX(true);
// 			dc.redrawAll('restTotal');
// 		} else {
// 			row.elasticX(false);
// 			dc.redrawAll('restTotal');
// 		}
// 	},1);
// }, true);


dc.renderAll();
