/**
 * Created by Kyle on 2/8/2016.
 */
var signedIn = false;
var apiKey = 'AIzaSyBozblUKAA8gFXaRNswfYxCIQoZ7MhvHHQ';
$("#setup").hide();
var globalVariables = {};

/*function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    globalVariables.userName = profile.getName();
    $("#userName").html(profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail());
    signedIn = true;
    checkStatus();
}*/

function onSuccess(googleUser) {
    console.log('Logged in as: ' + googleUser.getBasicProfile().getName());
    signedIn = true;
    $("#userName").html(googleUser.getBasicProfile().getName());
    checkStatus();
    //gapi.client.load('drive', 'v2', listFilesInApplicationDataFolder);
    listFilesInApplicationDataFolder();
    //test
}
function onFailure(error) {
    console.log(error);
}
function renderButton() {
    gapi.signin2.render('my-signin2', {
        'scope': 'profile https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/drive',
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
        //var accessToken = gapi.auth.getToken().access_token;
        var accessToken = gapi.auth2.getAccessToken();
        var xhr = new XMLHttpRequest();
        xhr.open('GET', file.downloadUrl);
        xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
        xhr.onload = function() {
            console.log(xhr.responseText);
            var jsonResponse = updateJson(xhr.responseText);//update it (remove old entries older than 7 days// make new schedule, push to google drive & check weather here?
            //NOTE: should probably put some time stamp in the events.txt file to store when schedule/weather was updated & checked
            //perhaps we could check up to twice a day (if user logs in at least twice a day).
            addEventsToOverview(jsonResponse);//add events to overview on home page
        };
        xhr.onerror = function() {
            console.log("ERROR");
        };
        xhr.send();
    } else {
        console.log("No file.downloadUrl");
    }
}

function updateJson(jsonRetrieved){

}

function addEventsToOverview(jsonResponse){
    //sample json object
    jsonResponse = {
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
        if(sortedByDay[index].length == 0){
            sortedByDay[index].push(jsonResponse.current[i]);
        } else if(sortedByDay[index].length == 1){
            if(sortedByDay[index][0].sTime > startTime)
                sortedByDay[index].unshift(jsonResponse.current[i]);
            else
                sortedByDay[index].push(jsonResponse.current[i]);
        } else {
            for(var j = 0; j < sortedByDay[index].length; j++){
                //add in jsonresponse.current[i] in right spot
            }
        }
    }

    //now iterate thru sortedByDay and add to home.html in proper table td

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