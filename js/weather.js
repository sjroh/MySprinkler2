/**
 * Created by Kyle on 2/17/2016.
 */
var weatherData = {};
$.get('http://api.openweathermap.org/data/2.5/forecast/daily?lat=30.627977&lon=-96.334407&cnt=7&mode=json&appid=0039a67282bf9ff15995e2c340d6906b', function(data){
    weatherData = data.list;
   // console.log(weatherData);
    for(var i = 0; i < weatherData.length; i++){
        var className = "day" + (i+1).toString();
        var date = new Date(weatherData[i].dt);
        $(className).text(date.getMonth() + " " + date.getDay());
    }



    var d = new Date(weatherData[0].dt);
    var day = d.getDay();
    var month = d.getMonth();
    console.log(d);
});
