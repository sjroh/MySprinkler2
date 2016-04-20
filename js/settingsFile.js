/**
 * Created by Kyle on 2/17/2016.
 */


var weatherData = {
    haveLocation: false
};
var zoneNum = -1;

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


$('#zoneAlert').submit(function(){
    zoneNum = $('#zoneNum').val();
    $('#zoneAlert').hide();
    createSettingsFile();
    return false;
});

function createSettingsFile(){
    //first check if user has entered the needed data
    console.log("weatherdata: " + weatherData.haveLocation);
    console.log("zonenum: " + zoneNum);
    if(weatherData.haveLocation && zoneNum != -1)
    {
        var today = new Date();
        var index = today.getDay()+1;
        if(index == 7){
            index = 0;
        }
        var dayStart = index;

        var settings = {
            "location": {
                "lat": weatherData.lat,
                "long": weatherData.long
            },
            "currLevel": "Medium",
            "wateringHr": 5,
            "watered":{
                "wateredAmt": 0,
                "rainedAmt": 0
            },
            "custom":{
                "customLvl": -1,
                "weeklyCustom": 0.75,
                "weeklyCustomActivated": false
            },
            "weekStart": dayStart,
            "conversionRate": 1.0,
            "zones": zoneNum
        };
        insertFileInApplicationDataFolder(settings, "settings.txt");
        localStorage.setItem("settings", JSON.stringify(settings));
        console.log("Settings.txt successfully uploaded");
        $("#setup").hide();
        $("#serverInstructionsModal").modal();
        $("#serverInstructions").show();
    }
    else{
        console.log("user still needs to input info");
    }

}