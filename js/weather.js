/**
 * Created by Kyle on 2/17/2016.
 */
var weatherData = {};
$.get('http://api.openweathermap.org/data/2.5/forecast/daily?lat=30.627977&lon=-96.334407&cnt=7&mode=json&appid=0039a67282bf9ff15995e2c340d6906b', function(data){
    weatherData = data.list;
   // console.log(weatherData);
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for(var i = 0; i < weatherData.length; i++){
        var idName = "#day" + (i+1).toString();
        var date = new Date(weatherData[i].dt);
       // date.setTime(weatherData[i].dt * 1000);//date = epoch value * 1000
        //date.setUTCSeconds();
        $(idName).text(months[date.getMonth()] + " " + date.getDay());
        console.log("Date: " + [date.getMonth()] + " " + date.getDay());
    }
});
