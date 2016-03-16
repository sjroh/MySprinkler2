/**
 * Created by Kyle on 2/17/2016.
 */
/*
    Watering/inch ratio?:
    We have three settings:
        High: 2 inch
        Med: 1 inch
        Low: .5 inch
    What inch amount do you think works for each one?
 */


var weatherData = {
    haveLocation: false
};
//var iframeHtml = "";
var zoneNum = -1;
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
        navigator.geolocation.getCurrentPosition(setLocation);
        $("#locationAlert").hide();
    } else {
        alert("Geolocation is not supported by this browser. Please use Chrome.");
    }
}

function setLocation(position) {
    weatherData.lat = position.coords.latitude;
    weatherData.long = position.coords.longitude;
    weatherData.haveLocation = true;
    createSettingsFile();

    //should store in google app data now


    //the rest of the code in this function obtains the weather data for today to 7 days from now and puts it on the page
    //we're going to have to use this data somewhere to make the preliminary schedule for the week.
    //this code below should be moved somewhere else, into another function to be called every time the user logs in
    //and we have their google settings.txt file (with their lat and long coordinates in it)

    //MOVED TO LOAD WEATHER IN HOME.JS
    /*var getString = "http://api.openweathermap.org/data/2.5/forecast/daily?lat=" + weatherData.lat + "&lon=" + weatherData.long +  "&cnt=7&mode=json&appid=0039a67282bf9ff15995e2c340d6906b";
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var days = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];
    $.get(getString, function(data){
        weatherData.list = data.list;
        for(var i = 0; i < weatherData.list.length; i++){
            var idName = "#day" + (i+1).toString();
            var idWName = "#w" + (i+1).toString();
            var date = new Date(0);
            date.setUTCSeconds(weatherData.list[i].dt);
            // date.setTime(weatherData[i].dt * 1000);//date = epoch value * 1000
            //date.setUTCSeconds()
            $(idName).html(days[date.getDay()] + "<br>" + months[date.getMonth()] + "  " + date.getUTCDate());
            //console.log(weatherData.list[i].dt + ": " + date.toDateString());
            $(idWName).html("<img src='http://openweathermap.org/img/w/" + weatherData.list[i].weather[0].icon + ".png'>");
        }
    });*/

}

/**
 * Insert new file in the Application Data folder.
 *
 * @param {File} fileData File object to read data from.
 * @param {Function} callback Function to call when the request is complete.
 */
function insertFileInApplicationDataFolder(jData, fileName) {

    //found following code from https://gist.github.com/csusbdt/4525042
    const boundary = '-------314159265358979323846264';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";
    var contentType = 'application/json';
    var metadata = {
        'title': fileName,
        'mimeType': contentType
        //'parents': [{'id': 'appfolder'}]
    };
    var base64Data = btoa(JSON.stringify(jData));
    var multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: ' + contentType + '\r\n' +
        'Content-Transfer-Encoding: base64\r\n' +
        '\r\n' +
        base64Data +
        close_delim;
    var request = gapi.client.request({
        'path': '/upload/drive/v2/files',
        'method': 'POST',
        'params': {'uploadType': 'multipart'},
        'headers': {
            'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
        },
        'body': multipartRequestBody});
    request.execute(function(arg) {
        console.log(arg);
    });
}

/*$('#submitIframe').on('click', function(){
    iframeHtml = $("#iFrame").val();
    if(iframeHtml.length <=8  || (iframeHtml.substring(0,7) != "<iframe")){
        alert("Invalid Link: Try again");
        $("#iFrame").val("");
    }
    else{
        $('#calendarAlert').hide();
        createSettingsFile();
    }
});*/

$('#zoneAlert').submit(function(){
    zoneNum = $('#zoneNum').val();
    console.log("num: " + zoneNum);
    zoneNum++;
    console.log("num: " + zoneNum);
    zoneNum--;
    $('#zoneAlert').hide();
    createSettingsFile();
    return false;
});

function createSettingsFile(){
    //first check if user has entered the needed data
    console.log("weatherdata: " + weatherData.haveLocation);
    console.log("zonenum: " + zoneNum);
    if(/*iframeHtml != "" && */weatherData.haveLocation && zoneNum != -1)
    {
        var settings = {
            "location": {
                "lat": weatherData.lat,
                "long": weatherData.long
            },
            "currLevel": "Medium",
            "custom":{
                "customLvl": -1,
                "weeklyCustom": 0.75,
                "weeklyCustomActivated": false
            },
            "conversionRate": 1,
            "zones": zoneNum
        };
        insertFileInApplicationDataFolder(settings, "settings.txt");
        console.log("Settings.txt successfully uploaded");
        $("#setup").hide();
        $("#serverInstructionsModal").modal();
        $("#serverInstructions").show();
    }
    else{
        console.log("user still needs to input info");
        //user still needs to input calendar url and/or location permission
    }

}