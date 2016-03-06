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
var globalVariables = {};

function OnLoad() {
    window.setTimeout(checkAuth, 1);
}

function checkAuth() {
    gapi.auth.authorize({ 'client_id': clientId, 'scope': scopes, 'immediate': true }, handleAuthResult);
}

function handleAuthResult(authResult) {
    var authorizeButton = document.getElementById('authorize-button');
    if (authResult && !authResult.error) {
        oauthToken = authResult.access_token;
        listFilesInApplicationDataFolder();
        gapi.client.load('drive', 'v2'); //load the API.
    } else {
        authorizeButton.onclick = function (event) {
            gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, handleAuthResult);
            return false;
        }
    }
}






function onSuccess(googleUser) {
    console.log('Logged in as: ' + googleUser.getBasicProfile().getName());
    signedIn = true;
    $("#userName").html(googleUser.getBasicProfile().getName());
    globalAccessToken2 = googleUser.getAuthResponse().access_token;

    var accessToken2 = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
    //alert(accessToken + " -------- " + accessToken2);

    var globalAccessToken = localStorage.getItem("accessToken");
    console.log("retrieved access key from stored browser obj: " + globalAccessToken);
    console.log("accessKey from clicking signin on this page: " + globalAccessToken2);
    checkStatus();
    //gapi.client.load('drive', 'v2', listFilesInApplicationDataFolder);
    listFilesInApplicationDataFolder();
    addEventsToOverview();
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
        //window.location = "http://sjroh.github.io/MySprinkler2/";
    });
}

function checkStatus(){
    if(signedIn){
        $("#signOut").show();
        //$("#signIn").hide();
    } else{
        $("#signIn").show();
        //$("#signOut").hide();
    }
}


/**
 * List all files contained in the Application Data folder.
 *
 * @param {Function} callback Function to call when the request is complete.
 */

function listFilesInApplicationDataFolder() {
    var retrievePageOfFiles = function(request) {
        request.execute(function(resp) {
            if(resp.items.length == 0){
                //no settings file in gdrive exists so show
                //location warning for user to click on
                //once they click on this, create a settings.json file
                $("#setup").show();
                console.log("no file in drive exists");
            }
            else{
                //found settings -> parse json to obtain settings data
                console.log(resp.items.length + " file(s) found");
                for(var i = 0; i < resp.items.length; i++){
                    console.log(resp.items[i]);
                    downloadFile(resp.items[i]);
                    //var url = resp.items[i].downloadUrl;
                    //var fileId = resp.items[i].id;
                    //console.log(url);
                    //getFile(fileId);
                    /*var reader = new FileReader();
                    reader.onload = function(){
                        console.log(reader.result);
                    };
                    reader.readAsText(resp.items[i]);*/
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
        'params': {'q': 'title = \'settings.txt\''}
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

function updateJson(jsonRetrieved){

}

function addEventsToOverview(/*jsonResponse*/){
    //sample json object
    var jsonResponse = {
        prev: {},
        current: [
            {
                sTime: 1456958100,
                eTime: 1456958400,
                zoneID: 1
            },
            {
                sTime: 1456950000,
                eTime: 1456951200,
                zoneID: 1
            },
            {
                sTime: 1457210400,
                eTime: 1457210760,
                zoneID: 2
            },
            {
                sTime: 1457297400,
                eTime: 1457297700,
                zoneID: 3
            },
            {
                sTime: 1457268900,
                eTime: 1457269500,
                zoneID: 4
            },
            {
                sTime: 1457265329,
                eTime: 1457266529,
                zoneID: 4
            }
        ]
    };

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
            if(endTime.getHours() > 12){
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
        if(date.getDay() === weekDate.getDay())
            return i;
    }
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
    var userName = "nameHere";
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