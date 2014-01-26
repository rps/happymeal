// IIFE Wrapper
// (function(){

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



// Initial Render
var restaurants = {}, hours = {}, date, hour;

for(var i = 0; i<24; i++){
  hours[i] = 0;
}

for (var i = 0; i<register.length; i++){
  restaurants[register[i].RestaurantName] = restaurants[register[i].RestaurantName] || 0;
  restaurants[register[i].RestaurantName]++
  date = new Date(register[i].ShiftDateTime);
  hour = date.getUTCHours();

  hours[hour]++;
}

var chart;

$(document).ready(function() {  

  // Populate dropdown options
  $.each(availableMetrics[selectedLevel],function(key,value){
    $("#metrics").append("<option>" + value + "</option>");
  });

  var options = {
      chart: {
          renderTo: 'container',
          type: 'line'
      },
      title: {
          text: 'Hourly Count'
      },
      xAxis: {
          categories: ['12am','1am','2am','3am','4am','5am','6am','7am','8am','9am','10am','11am','12pm','1pm','2pm','3pm','4pm','5pm','6pm','7pm','8pm','9pm','10pm','11pm']
      },
      yAxis: {
          title: {
              text: 'Number of Reservations'
          }
      },
      series: [{
          name: 'Total',
          data: []
      }],
      credits: {
        enabled: false
      }
  };
  for(var h in hours){
    options.series[0].data[h] = hours[h];
  }

  chart = new Highcharts.Chart(options);
});

// })()

