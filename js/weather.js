/**
 * Created by Kyle on 2/17/2016.
 */
var weatherData = {};

/*$.get('http://api.openweathermap.org/data/2.5/forecast/daily?lat=30.627977&lon=-96.334407&cnt=7&mode=json&appid=0039a67282bf9ff15995e2c340d6906b', function(data){
    weatherData = data.list;
    // console.log(weatherData);
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var days = ["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat", "Sun"];
    for(var i = 0; i < weatherData.length; i++){
        var idName = "#day" + (i+1).toString();
        var idWName = "#w" + (i+1).toString();
        var date = new Date(0);
        date.setUTCSeconds(weatherData[i].dt);
        // date.setTime(weatherData[i].dt * 1000);//date = epoch value * 1000
        //date.setUTCSeconds()
        $(idName).html(days[date.getDay()] + "<br>" + months[date.getMonth()] + "  " + date.getUTCDate());
        console.log(weatherData[i].dt + ": " + date.toDateString());
        $(idWName).html("<img src='http://openweathermap.org/img/w/" + weatherData[i].weather[0].icon + ".png'>");
    }
});*/

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {
    weatherData.lat = position.coords.latitude;
    weatherData.long = position.coords.longitude;

    //should store in google app data now
    var getString = "http://api.openweathermap.org/data/2.5/forecast/daily?lat=" + weatherData.lat + "&lon=" + weatherData.long +  "&cnt=7&mode=json&appid=0039a67282bf9ff15995e2c340d6906b";
    $.get(getString, function(data){
        weatherData = data.list;
        // console.log(weatherData);
        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var days = ["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat", "Sun"];
        for(var i = 0; i < weatherData.length; i++){
            var idName = "#day" + (i+1).toString();
            var idWName = "#w" + (i+1).toString();
            var date = new Date(0);
            date.setUTCSeconds(weatherData[i].dt);
            // date.setTime(weatherData[i].dt * 1000);//date = epoch value * 1000
            //date.setUTCSeconds()
            $(idName).html(days[date.getDay()] + "<br>" + months[date.getMonth()] + "  " + date.getUTCDate());
            console.log(weatherData[i].dt + ": " + date.toDateString());
            $(idWName).html("<img src='http://openweathermap.org/img/w/" + weatherData[i].weather[0].icon + ".png'>");
        }
    });

}