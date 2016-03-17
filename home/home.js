/**
 * Created by Kyle on 2/8/2016.
 */
var signedIn = false;
var globalAccessToken;
var globalAccessToken2;
var oauthToken;
var clientId = "1098632840077-a0im0gkftlvomqb612gtsan5pe8v09jp.apps.googleusercontent.com";
var scopes = "https://www.googleapis.com/auth/drive";
$("#setup").hide();
$("#serverInstructions").hide();
$("#fatalError").hide();
$("#loading").show();
$(".progress").hide();
var globalVariables = {};

function OnLoad() {
    window.setTimeout(checkAuth, 1000);
}

function checkAuth() {
    gapi.auth.authorize({ 'client_id': clientId, 'scope': scopes, 'immediate': true }, handleAuthResult);
}

function handleAuthResult(authResult) {
    var authorizeButton = document.getElementById('authorize-button');
    if (authResult && !authResult.error) {
        oauthToken = authResult.access_token;
        findFile('settings.txt');
        gapi.client.load('drive', 'v2'); //load the API.
    } else {
        authorizeButton.onclick = function (event) {
            gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, handleAuthResult);
            return false;
        }
    }
}

OnLoad();

function onSuccess(googleUser) {
    console.log('Logged in as: ' + googleUser.getBasicProfile().getName());
    signedIn = true;
    $("#userName").html(googleUser.getBasicProfile().getName());
    //globalAccessToken2 = googleUser.getAuthResponse().access_token;

   //var accessToken2 = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
    //alert(accessToken + " -------- " + accessToken2);

    //var globalAccessToken = localStorage.getItem("accessToken");
    //console.log("retrieved access key from stored browser obj: " + globalAccessToken);
    //console.log("accessKey from clicking signin on this page: " + globalAccessToken2);
    checkStatus();
    //gapi.client.load('drive', 'v2', findFile);
    //findFile();
    //addEventsToOverview();
}

function onFailure(error) {
    console.log(error);
}

function renderButton() {
    gapi.signin2.render('my-signin2', {
        'scope': 'profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive',
        'width': 240,
        'height': 50,
        'longtitle': true,
        'theme': 'dark',
        'onsuccess': onSuccess,
        'onfailure': onFailure
    });
}

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
        signedIn = false;
        checkStatus();
        window.location = "http://sjroh.github.io/MySprinkler2/";
    });
}

function checkStatus(){
    if(signedIn){
        $("#signOut").show();
        $("#signIn").hide();
    } else{
        $("#signIn").show();
        $("#signOut").hide();
    }
}


/**
 * List all files contained in the Application Data folder.
 *
 * @param {Function} callback Function to call when the request is complete.
 */

function findFile(fileName) {
    var retrievePageOfFiles = function(request) {
        request.execute(function(resp) {
            if(resp.items.length == 0){
                //no settings file in gdrive exists so show
                //setup warnings for user to click on
                //once they finish setup, create a settings.json file
                //and give instructions on how to setup server on pi
                //which will set up events.txt
                if(fileName == "settings.txt"){
                    localStorage.removeItem("settings");//remove in case previously created
                    $("#loading").hide();
                    $("#setup").show();
                    console.log("no settings file in drive exists");
                }else if(fileName == "events.txt"){ //no events file exists (but settings.txt should exist at this point)
                    localStorage.removeItem("events");//remove in case previously created
                    $("#loading").hide();
                    $("#serverInstructionsModal").modal();
                    $("#serverInstructions").show();
                }
            }
            else{
                console.log(resp.items[0].title + " file found");
                if(fileName == "settings.txt"){//found settings -> parse json to obtain settings data
                    downloadFile(resp.items[0]);
                    findFile("events.txt");
                } else if(fileName == "events.txt"){//found events -> parse json to obtain events data
                    downloadFile(resp.items[0]);
                }

            }
        });
    };
    /*var initialRequest = gapi.client.drive.files.list({
        'q': '(\'appfolder\' in parents) and (title = \'settings\')'
    });*/
    var initialRequest = gapi.client.request({
        'path': '/drive/v2/files',
        'method': 'GET',
        //'params': {'q': '(\'appfolder\' in parents)'}
        'params': {'q': 'title = \'' + fileName + '\''}
    });
    retrievePageOfFiles(initialRequest);
}

function downloadFile(file) {
    if (file.downloadUrl) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', file.downloadUrl);
        xhr.setRequestHeader('Authorization', 'Bearer ' + oauthToken);
        xhr.onload = function() {
            console.log("RESPONSE: " + xhr.responseText);
            var jsonResponse = JSON.parse(xhr.responseText);//update it (remove old entries older than 7 days// make new schedule, push to google drive & check weather here?
            if(file.title == "settings.txt"){
                localStorage.setItem("settings", xhr.responseText);
                loadWeather(jsonResponse);
                loadProgressBar(jsonResponse);
            } else if(file.title == "events.txt"){
                localStorage.setItem("events", xhr.responseText);
                addEventsToOverview(jsonResponse);
            }
            //NOTE: should probably put some time stamp in the events.txt file to store when schedule/weather was updated & checked
            //perhaps we could check up to twice a day (if user logs in at least twice a day).
            //addEventsToOverview(jsonResponse);//add events to overview on home page
        };
        xhr.onerror = function() {
            console.log("ERROR");
            $("#fatalError").show();
        };
        xhr.send();
    } else {
        console.log("No file.downloadUrl");
    }
       /* xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
        xhr.onload = function() {
            console.log("Response: " + xhr.responseText);
            var jsonResponse = updateJson(xhr.responseText);//update it (remove old entries older than 7 days// make new schedule, push to google drive & check weather here?
            //NOTE: should probably put some time stamp in the events.txt file to store when schedule/weather was updated & checked
            //perhaps we could check up to twice a day (if user logs in at least twice a day).
            //addEventsToOverview(jsonResponse);//add events to overview on home page
        };
        xhr.onerror = function() {
            console.log("ERROR");
        };
        xhr.send();
    } else {
        console.log("No file.downloadUrl");
    }*/
}

function loadWeather(settingsJson){

    var weatherData = {};
    var getString = "http://api.openweathermap.org/data/2.5/forecast/daily?lat=" + settingsJson.location.lat + "&lon=" + settingsJson.location.long +  "&cnt=7&mode=json&appid=0039a67282bf9ff15995e2c340d6906b";
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var days = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];
    $("#loading").hide();
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
    });
}

function loadProgressBar(settingsJson){
    var inchesNeed;
    if(settingsJson.currLevel == "High"){
        inchesNeed = 2;
    } else if(settingsJson.currLevel == "Medium"){
        inchesNeed = 1;
    } else if(settingsJson.currLevel == "Low"){
        inchesNeed = .5;
    } else{
        inchesNeed = settingsJson.customLvl;
    }

    var widthWater = (settingsJson.watered.wateredAmt/inchesNeed)*100;
    $("#wateringProgress").css("width", widthWater.toString() + "%");
    $("#wateringProgress").html(settingsJson.watered.wateredAmt +"\"");
    var widthRain = (settingsJson.watered.rainedAmt/inchesNeed)*100;
    $("#rainProgress").css("width", widthRain.toString() + '%');
    $("#rainProgress").html(settingsJson.watered.rainedAmt +"\"");

    $(".progress").show();
}

function addEventsToOverview(jsonResponse){
    //populate watering progress bar first



    //now populate events
    var currWeekEpoch = [];
    var date = Math.round(new Date().getTime()/1000.0);
    currWeekEpoch.push(date);
    for(var i = 0; i < 6; i++){
        var newDate = currWeekEpoch[i] + 86400;
        currWeekEpoch.push(newDate);
    }

    var sortedByDay = new Array(7);
    for(i = 0; i < 7; i++){
        sortedByDay[i] = [];
    }
    for(i = 0; i < jsonResponse.current.length; i++){
        var startTime = jsonResponse.current[i].sTime;
        var endTime = jsonResponse.current[i].eTime;
        var index = findIndexOfDay(startTime, currWeekEpoch);
        console.log(index.toString() + " found for " + startTime);
        if(index != -1){
            if(sortedByDay[index].length == 0){
                sortedByDay[index].push(jsonResponse.current[i]);
            } else {
                if(sortedByDay[index][0].sTime >= startTime){
                    sortedByDay[index].unshift(jsonResponse.current[i]);
                }
                else if(sortedByDay[index][sortedByDay[index].length - 1].sTime <= startTime){
                    sortedByDay[index].push(jsonResponse.current[i])
                } else{
                    for(var j = 1; j < sortedByDay[index].length; j++){
                        //add in jsonresponse.current[i] in right spot
                        if(sortedByDay[index][j].sTime >= startTime && sortedByDay[index][j - 1].sTime < startTime){
                            sortedByDay[index].splice(j, 0, jsonResponse.current[i]);
                        }
                    }
                }
            }
        }
    }

    //now iterate thru sortedByDay and add to home.html in the proper table td
    var colorStart;
    var colorEnd;
    var sTimeText;
    var eTimeText;
    for(i = 0; i < sortedByDay.length; i++){
        for(j = 0; j < sortedByDay[i].length; j++){
            startTime = new Date(0);
            startTime.setUTCSeconds(sortedByDay[i][j].sTime);
            console.log(startTime + " found for " + sortedByDay[i][j]);
            if(startTime.getHours() >= 12){
                colorStart = "blackTop";
                sTimeText = ((startTime.getHours() - 12) == 0) ? "12" : (startTime.getHours() - 12).toString();
                sTimeText += ":" + ((startTime.getMinutes() < 10) ? ("0" + startTime.getMinutes().toString()) : startTime.getMinutes().toString());
            }
            else{
                colorStart = "orangeTop";
                sTimeText = (startTime.getHours() == 0) ? "12" : startTime.getHours().toString();
                sTimeText += ":" + ((startTime.getMinutes() < 10) ? ("0" + startTime.getMinutes().toString()) : startTime.getMinutes().toString());
            }
            endTime = new Date(0);
            endTime.setUTCSeconds(sortedByDay[i][j].eTime);
            if(endTime.getHours() >= 12){
                colorEnd = "blackBottom";
                eTimeText = ((endTime.getHours() - 12) == 0) ? "12" : (endTime.getHours() - 12).toString();
                eTimeText += ":" + ((endTime.getMinutes() < 10) ? ("0" + endTime.getMinutes().toString()) : endTime.getMinutes().toString());
            }
            else{
                colorEnd = "orangeBottom";
                eTimeText = (endTime.getHours() == 0) ? "12" : endTime.getHours().toString();
                eTimeText += ":" + ((endTime.getMinutes() < 10) ? ("0" + endTime.getMinutes().toString()) : endTime.getMinutes().toString());
            }

            var htmlEvent = "<div class='" + colorStart + " " + colorEnd + " event'> " + sTimeText + " - " + eTimeText + "</div>";
            $("#e" + (i + 1).toString()).append(htmlEvent);
        }
    }
}

function findIndexOfDay(time, currWeekEpoch){
    var date = new Date(0);
    date.setUTCSeconds(time);

    for(var i = 0; i < 7; i++){
        var weekDate = new Date(0);
        weekDate.setUTCSeconds(currWeekEpoch[i]);
        if(date.getDate() === weekDate.getDate())
            return i;
    }
    return -1;

}

$(document).ready(function(){
    function checkWidth(){
        if($(window).width() < 750){
            $(".mobile").show();
            $(".desktop").hide();
            $(".menu-btn").addClass("glyphicon glyphicon-chevron-right");
        } else{
            $(".mobile").hide();
            $(".desktop").show();
            $(".menu-btn").addClass("glyphicon glyphicon-chevron-left");
        }
    }
    checkWidth();
    var userName = "";
    $("#userName").text(userName);
    $("#error").hide();
    $("#menu-toggle").click(function(){
        if($(".menu-btn").hasClass("glyphicon-chevron-right")){
            $(".menu-btn").removeClass("glyphicon-chevron-right");
            $(".menu-btn").addClass("glyphicon-chevron-left");
        }else{
            $(".menu-btn").removeClass("glyphicon-chevron-left");
            $(".menu-btn").addClass("glyphicon-chevron-right");
        }
    })
});