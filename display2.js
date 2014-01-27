// IIFE Wrapper
// (function(){
/*
// Dropdown Items
var views = {
  'admin': ['Choose Restaurant', 'Total Network Volume', 'Aggregated Metrics'],
  'cust': ['By Hour','By Size', 'By Partner', 'Custom']
};

// English to JSON key
var metricPairings = {
  'UTC Booking Time':'DateMadeUtc',
  'Local Booking Time':'ShiftDateTime',
  'Party Size':'Partysize',
  'Restaurant Name':'RestaurantName',
  'Partner Name':'Partnername',
  'Restaurant ID':'Rid'
};

// Filter options 
var availableMetrics = {
  'admin':['UTC Booking Time','Local Booking Time','Party Size','Restaurant Name','Partner Name','Restaurant ID'],
  'cust':['Local Booking Time','Party Size','Partner Name']
};

var selectedLevel = 'admin';

  // Populate dropdown options
  $.each(availableMetrics[selectedLevel],function(key,value){
    $("#metrics").append("<option>" + value + "</option>");
  });
*/

$(document).ready(function() {  
// d3.csv("data/mini.json", function(error, bookings) {

  // Various formatters.
  var formatNumber = d3.format(",d"),
      formatChange = d3.format("+,d"),
      formatDate = d3.time.format("%B %d, %Y"),
      formatTime = d3.time.format("%I:%M %p");

  // A nest operator, for grouping the booking list.
  var nestByDate = d3.nest()
      .key(function(d) { return d3.time.day(d.date); });

  // A little coercion, since the CSV is untyped.
  bookings.forEach(function(d, i) {
    d.index = i;
    d.date = parseDate(d.DateMadeUtc);
    d.localdate = parseDate(d.ShiftDateTime);
    // d.delay = +d.delay;
    // d.distance = +d.distance;
  });

  // Create the crossfilter for the relevant dimensions and groups.
  var booking = crossfilter(bookings),
      all = booking.groupAll(),
      date = booking.dimension(function(d) { return d.date; }),      // ignoring date since there is only one day
      dates = date.group(d3.time.day),
      localdate = booking.dimension(function(d) { return d.localdate; }),
      localdates = localdate.group(d3.time.day),
      party = booking.dimension(function(d) { return d.Partysize; }),
      parties = party.group(function(d) { return d; }),
      id = booking.dimension(function(d) { return d.Rid; }),
      restname = booking.dimension(function(d) { return d.RestaurantName; }),
      partname = booking.dimension(function(d) { return d.Partnername; }),
      hour = booking.dimension(function(d) { return d.date.getHours() + d.date.getMinutes() / 60; }),
      hours = hour.group(function(d) { return Math.floor(d); }),
      lochour = booking.dimension(function(d) { return d.localdate.getHours() + d.localdate.getMinutes() / 60; }),
      lochours = hour.group(function(d) { return Math.floor(d); });
      // delay = booking.dimension(function(d) { return Math.max(-60, Math.min(149, d.delay)); }),
      // delays = delay.group(function(d) { return Math.floor(d / 10) * 10; }),
      // distance = booking.dimension(function(d) { return Math.min(1999, d.distance); }),
      // distances = distance.group(function(d) { return Math.floor(d / 50) * 50; });

  var charts = [


      // barChart()
      //   .dimension(hour)
      //   .group(hours)
      // .x(d3.scale.linear()
      //   .domain([0, 24])
      //   .rangeRound([0, 10 * 24])),

			// Booking Time
      barChart()
        .dimension(lochour)
        .group(lochours)
      .x(d3.scale.linear()
        .domain([0, 24])
        .rangeRound([0, 10 * 24])),

      //Party Size
	    barChart()
	        .dimension(party)
	        .group(parties)
	      .x(d3.scale.linear()
	        .domain([0, 9])
	        .rangeRound([0, 10 * 10])),

  //   barChart()
  //       .dimension(distance)
  //       .group(distances)
  //     .x(d3.scale.linear()
  //       .domain([0, 2000])
  //       .rangeRound([0, 10 * 40])),

  //   barChart()
  //       .dimension(date)
  //       .group(dates)
  //       .round(d3.time.day.round)
  //     .x(d3.time.scale()
  //       .domain([new Date(2001, 0, 1), new Date(2001, 3, 1)])
  //       .rangeRound([0, 10 * 90]))
  //       .filter([new Date(2001, 1, 1), new Date(2001, 2, 1)])

  ];

  // Given our array of charts, which we assume are in the same order as the
  // .chart elements in the DOM, bind the charts to the DOM and render them.
  // We also listen to the chart's brush events to update the display.
  var chart = d3.selectAll(".chart")
      .data(charts)
      .each(function(chart) { chart.on("brush", renderAll).on("brushend", renderAll); });

  // Render the total.
  d3.selectAll("#total")
      .text(formatNumber(booking.size()));

  renderAll();

  // Renders the specified chart or list.
  function render(method) {
  	console.log(method);
    d3.select(this).call(method);
  }

  // Whenever the brush moves, re-rendering everything.
  function renderAll() {
    chart.each(render);
    d3.select("#active").text(formatNumber(all.value()));
  }

  // Like d3.time.format, but faster.
  function parseDate(d) {
    return new Date(d);
  }

  window.filter = function(filters) {
    filters.forEach(function(d, i) { charts[i].filter(d); });
    renderAll();
  };

  window.reset = function(i) {
    charts[i].filter(null);
    renderAll();
  };

  function barChart() {
    if (!barChart.id) barChart.id = 0;

    var margin = {top: 10, right: 10, bottom: 20, left: 10},
        x,
        y = d3.scale.linear().range([100, 0]),
        id = barChart.id++,
        axis = d3.svg.axis().orient("bottom"),
        brush = d3.svg.brush(),
        brushDirty,
        dimension,
        group,
        round;

    function chart(div) {
      var width = x.range()[1],
          height = y.range()[0];

      y.domain([0, group.top(1)[0].value]);

      div.each(function() {
        var div = d3.select(this),
            g = div.select("g");

        // Create the skeletal chart.
        if (g.empty()) {
          div.select(".title").append("a")
              .attr("href", "javascript:reset(" + id + ")")
              .attr("class", "reset")
              .text("reset")
              .style("display", "none");

          g = div.append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
            .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          g.append("clipPath")
              .attr("id", "clip-" + id)
            .append("rect")
              .attr("width", width)
              .attr("height", height);

          g.selectAll(".bar")
              .data(["background", "foreground"])
            .enter().append("path")
              .attr("class", function(d) { return d + " bar"; })
              .datum(group.all());

          g.selectAll(".foreground.bar")
              .attr("clip-path", "url(#clip-" + id + ")");

          g.append("g")
              .attr("class", "axis")
              .attr("transform", "translate(0," + height + ")")
              .call(axis);

          // Initialize the brush component with pretty resize handles.
          var gBrush = g.append("g").attr("class", "brush").call(brush);
          gBrush.selectAll("rect").attr("height", height);
          gBrush.selectAll(".resize").append("path").attr("d", resizePath);
        }

        // Only redraw the brush if set externally.
        if (brushDirty) {
          brushDirty = false;
          g.selectAll(".brush").call(brush);
          div.select(".title a").style("display", brush.empty() ? "none" : null);
          if (brush.empty()) {
            g.selectAll("#clip-" + id + " rect")
                .attr("x", 0)
                .attr("width", width);
          } else {
            var extent = brush.extent();
            g.selectAll("#clip-" + id + " rect")
                .attr("x", x(extent[0]))
                .attr("width", x(extent[1]) - x(extent[0]));
          }
        }

        g.selectAll(".bar").attr("d", barPath);
      });

      function barPath(groups) {
        var path = [],
            i = -1,
            n = groups.length,
            d;
        while (++i < n) {
          d = groups[i];
          path.push("M", x(d.key), ",", height, "V", y(d.value), "h9V", height);
        }
        return path.join("");
      }

      function resizePath(d) {
        var e = +(d == "e"),
            x = e ? 1 : -1,
            y = height / 3;
        return "M" + (.5 * x) + "," + y
            + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
            + "V" + (2 * y - 6)
            + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y)
            + "Z"
            + "M" + (2.5 * x) + "," + (y + 8)
            + "V" + (2 * y - 8)
            + "M" + (4.5 * x) + "," + (y + 8)
            + "V" + (2 * y - 8);
      }
    }

    brush.on("brushstart.chart", function() {
      var div = d3.select(this.parentNode.parentNode.parentNode);
      div.select(".title a").style("display", null);
    });

    brush.on("brush.chart", function() {
      var g = d3.select(this.parentNode),
          extent = brush.extent();
      if (round) g.select(".brush")
          .call(brush.extent(extent = extent.map(round)))
        .selectAll(".resize")
          .style("display", null);
      g.select("#clip-" + id + " rect")
          .attr("x", x(extent[0]))
          .attr("width", x(extent[1]) - x(extent[0]));
      dimension.filterRange(extent);
    });

    brush.on("brushend.chart", function() {
      if (brush.empty()) {
        var div = d3.select(this.parentNode.parentNode.parentNode);
        div.select(".title a").style("display", "none");
        div.select("#clip-" + id + " rect").attr("x", null).attr("width", "100%");
        dimension.filterAll();
      }
    });

    chart.margin = function(_) {
      if (!arguments.length) return margin;
      margin = _;
      return chart;
    };

    chart.x = function(_) {
      if (!arguments.length) return x;
      x = _;
      axis.scale(x);
      brush.x(x);
      return chart;
    };

    chart.y = function(_) {
      if (!arguments.length) return y;
      y = _;
      return chart;
    };

    chart.dimension = function(_) {
      if (!arguments.length) return dimension;
      dimension = _;
      return chart;
    };

    chart.filter = function(_) {
      if (_) {
        brush.extent(_);
        dimension.filterRange(_);
      } else {
        brush.clear();
        dimension.filterAll();
      }
      brushDirty = true;
      return chart;
    };

    chart.group = function(_) {
      if (!arguments.length) return group;
      group = _;
      return chart;
    };

    chart.round = function(_) {
      if (!arguments.length) return round;
      round = _;
      return chart;
    };

    return d3.rebind(chart, brush, "on");
  }

});