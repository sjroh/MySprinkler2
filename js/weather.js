/**
 * Created by Kyle on 2/17/2016.
 */
var weatherData = {};
$.get('http://api.openweathermap.org/data/2.5/forecast/daily?lat=30.627977&lon=-96.334407&cnt=7&mode=json&appid=0039a67282bf9ff15995e2c340d6906b', function(data){
    weatherData = data;
   // console.log(weatherData);
    var d = new Date(weatherData.list[0].dt);
    console.log(d);
});
