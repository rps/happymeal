// Initial Render
var restaurants = {}, hours = {}, date, hour;
for (var i = 0; i<register.length; i++){
  restaurants[register[i].RestaurantName] = restaurants[register[i].RestaurantName] || 0;
  restaurants[register[i].RestaurantName]++
  date = new Date(register[i].DateMadeUtc);
  hour = date.getUTCHours();

  hours[hour] = hours[hour] || 0;
  hours[hour]++;
}

$(document).ready(function() {
  

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

    var chart1 = new Highcharts.Chart(options);
});
