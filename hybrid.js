var ndx = crossfilter(data);

var parseDate = d3.time.format("%Y-%m-%dT%X");

data.forEach(function(d){
	d.date = parseDate.parse(d.DateMadeUtc);
  d.localDate = parseDate.parse(d.ShiftDateTime);
  d.hour = d.date.getHours();
  d.localHour = d.localDate.getHours();
  d.count = 1;
});

var hourDim = ndx.dimension(function(d){ return d.localHour; });
var reservations = hourDim.group().reduceSum(dc.pluck('count'));
var minHour = hourDim.bottom(1)[0].localHour;
var maxHour = hourDim.top(1)[0].localHour;

var mainChart = dc.lineChart("#main");

mainChart
	.width(500).height(200)
	.dimension(hourDim)
	.group(reservations)
	.x(d3.time.scale().domain([minHour,maxHour]).range([0,20000]))
	.yAxisLabel("Reservations per Hour")  
	

var partnerDim = ndx.dimension(function(d) { return d.Partnername; });
var partnerTotal = partnerDim.group().reduceSum(function(d) {return d.count;});

var pie = dc.pieChart('#pie');
pie
	.width(300).height(200)
	.slicesCap(5)
	.dimension(partnerDim)
	.group(partnerTotal)
	.innerRadius(30)
	.renderLabel(false)
	.legend(dc.legend().gap(3))
	.colors(d3.scale.category10())


dc.renderAll();
