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
        navigator.geolocation.getCurrentPosition(createSettingsFile);
    } else {
        alert("Geolocation is not supported by this browser. Use another browser.");
    }
}

function createSettingsFile(position) {
    weatherData.lat = position.coords.latitude;
    weatherData.long = position.coords.longitude;

    var settings = {
        "location": {
            "lat": weatherData.lat,
            "long": weatherData.long
        },
        "zones": [
            {
                "currLevel": "high",
                "custom": "N/A"
            },
            {
                "currLevel": "high",
                "custom": "N/A"
            }
        ]
    };
    //var jsonse = JSON.stringify(settings);
    //var blob = new Blob([jsonse], {type: "application/json"});
    insertFileInApplicationDataFolder(settings, "settings.txt");
    //I STOPPED WORKING HERE -> I NEED TO NOW INSERT THE BLOB OBJ INTO DRIVE TO CREATE THE FILE
    //THEN CAL listFilesInApplicationDataFolder AGAIN TO OBTAIN SETTINGS.JSON FROM DRIVE


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

function createdFile(){
    alert("settings file should have been created");
}

/**
 * Insert new file in the Application Data folder.
 *
 * @param {File} fileData File object to read data from.
 * @param {Function} callback Function to call when the request is complete.
 */
function insertFileInApplicationDataFolder(jData, fileName) {
    /*const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    var reader = new FileReader();
    reader.readAsBinaryString(fileData);
    reader.onload = function(e) {
        var contentType = fileData.type || 'application/octet-stream';
        var metadata = {
            'title': fileName,
            'mimeType': contentType,
            'parents': [{'id': 'appfolder'}]
        };

        var base64Data = btoa(reader.result);
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
        if (!callback) {
            callback = function(file) {
                console.log(file)
            };
        }
        request.execute(callback);
    }*/

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