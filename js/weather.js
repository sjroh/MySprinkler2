/**
 * Created by Kyle on 2/17/2016.
 */
var weatherData = {};
$.getJson('api.openweathermap.org/data/2.5/forecast/daily?lat={30.627977}&lon={-96.334407}&cnt={7}', function(data){
    weatherData = data;
    console.log(weatherData);
});
