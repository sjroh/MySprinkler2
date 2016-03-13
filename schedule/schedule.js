/**
 * Created by Kyle on 2/10/2016.
 */
var oauthToken;
var clientId = "1098632840077-a0im0gkftlvomqb612gtsan5pe8v09jp.apps.googleusercontent.com";
var scopes = "https://www.googleapis.com/auth/drive";

$("#serverInstructions").hide();
$("#setupInstructions").hide();
$(".addEvent").hide();
$(".removeEvent").hide();
$("#invalidTime").hide();
$("#invalidZones").hide();
var events;
var settings;

// GOOGLE SIGN IN CODE
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
    checkStatus();
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
// END OF GOOGLE SIGN IN CODE

function checkStatus(){
    if(signedIn){
        $("#signOut").show();
        $("#signIn").hide();
    } else{
        $("#signIn").show();
        $("#signOut").hide();
    }
}

$(document).ready(function(){

    var zonesClicked = [];
    if(!localStorage.getItem("settings")){
        $("#setupInstructions").show();
        console.log("couldn't retrieve settings obj from local storage");
    } else if(!localStorage.getItem("events")){
        $("#serverInstructions").show();
        console.log("couldn't retrieve events obj from local storage");
    } else{
        events = JSON.parse(localStorage.getItem("events"));
        settings = JSON.parse(localStorage.getItem("settings"));
        initializeZoneButtons();
        console.log("retrieved settings & events from browser storage");
        $("#scheduleBody").prepend(settings.calLink);
        $("#scheduleBody").prepend("<br><br>");
        $(".addEvent").show();
        $(".removeEvent").show();
    }

    // initialize input widgets first
    $('#basicExample .time').timepicker({
        'showDuration': true,
        'timeFormat': 'g:ia'
    });

    $('#basicExample .date').datepicker({
        'format': 'm/d/yyyy',
        'autoclose': true
    });

    // initialize datepair
    var basicExampleEl = document.getElementById('basicExample');
    var datepair = new Datepair(basicExampleEl);
    $('.saveEvent').click(function(){
        //if valid date, then
        var currDate = new Date();
        var sDate = datepair.getStartTime();
        var eDate = datepair.getEndTime();
        if(currDate >= sDate)
            $("#invalidTime").show();
        else
            $("#invalidTime").hide();

        if(zonesClicked.length == 0)
            $("#invalidZones").show();
        else
            $("#invalidZones").hide();

        if(currDate < sDate && zonesClicked.length != 0){
            $("#addModal").modal('hide');
            var event = {
                sTime: sDate,
                eTime: eDate,
                zones: zonesClicked,
                type: "manual"
            };
            events.current.push(event);
            updateEvents();
            updateCalendar();
            alert("You have added a water event!");
            console.log("Date given to datepicker: " + sDate + " -> " + eDate + " with zones " + zonesClicked);
            console.log("epoch: " + Math.round(sDate.getTime()/1000.0) + " -> " + Math.round(eDate.getTime()/1000.0));
        }
        //code here to save water event to google calendar & google drive & raspberry pi
        //else
        //error message
        //alert(datepair.getEndTime());
    });

    function updateEvents(){
        localStorage.setItem("events", JSON.stringify(events));//update browser variable
        var retrievePageOfFiles = function(request) {
            request.execute(function(resp) {
                if(resp.items.length == 0){
                    console.log("ERROR: Couldn't find events.txt to update!");
                }
                else{
                    console.log(resp.items[0].title + " file found");
                    console.log(resp.items[0]);
                    updateFile(resp.items[0].id, resp.items[0], events, null);
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
            'params': {'q': 'title = \'events.txt\''}
        });
        retrievePageOfFiles(initialRequest);
    }

    function updateFile(fileId, fileMetadata, fileData, callback) {
        const boundary = '-------314159265358979323846';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";

        var contentType = fileData.type || 'application/octet-stream';
        // Updating the metadata is optional and you can instead use the value from drive.files.get.
        var base64Data = btoa(JSON.stringify(fileData));
        var multipartRequestBody =
            delimiter +
            'Content-Type: application/json\r\n\r\n' +
            JSON.stringify(fileMetadata) +
            delimiter +
            'Content-Type: ' + contentType + '\r\n' +
            'Content-Transfer-Encoding: base64\r\n' +
            '\r\n' +
            base64Data +
            close_delim;

        var request = gapi.client.request({
            'path': '/upload/drive/v2/files/' + fileId,
            'method': 'PUT',
            'params': {'uploadType': 'multipart', 'alt': 'json'},
            'headers': {
                'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
            },
            'body': multipartRequestBody});
        if (!callback) {
            callback = function(file) {
                console.log("FILE UPDATED: " + file)
            };
        }
        request.execute(callback);
    }

    function updateCalendar(){

    }

    $(".zoneButton").click(function(){
        var zoneClicked = parseInt($(this).html());
        if($.inArray(zoneClicked, zonesClicked) == -1){//not in arr, so select
            $(this).addClass("zoneSelected");
            zonesClicked.push(zoneClicked);
        } else { //previously clicked, so un-select
            $(this).removeClass("zoneSelected");
            var index = $.inArray(zoneClicked, zonesClicked);
            zonesClicked.splice(index, 1);
        }
        console.log(zoneClicked + "<- clicked");
    });

    function initializeZoneButtons(){
        for(var i = 1; i < settings.zones.length + 1; i++){
            var htmlButton = "<a href=\"#\" class=\"zoneButton\">" + i + "</a>";
            $("#zoneButtons").append(htmlButton);
        }
    }

    function checkWidth(){
        if($(window).width() < 600){
            $(".modal-content").addClass("mobileModal");
            $(".mobile").show();
            $(".desktop").hide();
            $(".menu-btn").addClass("glyphicon glyphicon-chevron-right");
        } else{
            $(".modal-content").removeClass("mobileModal");
            $(".mobile").hide();
            $(".desktop").show();
            $(".menu-btn").addClass("glyphicon glyphicon-chevron-left");
        }
    }
    checkWidth();
    $("#menu-toggle").click(function(){
        if($(".menu-btn").hasClass("glyphicon-chevron-right")){
            $(".menu-btn").removeClass("glyphicon-chevron-right");
            $(".menu-btn").addClass("glyphicon-chevron-left");
        }else{
            $(".menu-btn").removeClass("glyphicon-chevron-left");
            $(".menu-btn").addClass("glyphicon-chevron-right");
        }
    });

});

