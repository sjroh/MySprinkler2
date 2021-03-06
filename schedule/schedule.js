/**
 * Created by Kyle on 2/10/2016.
 */
var oauthToken;
var clientId = "1098632840077-a0im0gkftlvomqb612gtsan5pe8v09jp.apps.googleusercontent.com";
var scopes = "https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/calendar";

$("#serverInstructions").hide();
$("#setupInstructions").hide();
$(".addEvent").hide();
$(".removeEvent").hide();
$("#invalidTime").hide();
$("#tooManyZones").hide();
$("#invalidZones").hide();
$("#warningInstructions").hide();
$("#noEventsSelectedWarning").hide();
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
        gapi.client.load('drive', 'v2'); //load the API.
        gapi.client.load('calendar', 'v3');
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
renderButton();

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

    var zonesClicked = [];//keeps track of zones clicked when adding events
    var eventsClicked = [];//keeps track of events clicked when removing events
    if(!localStorage.getItem("settings")){
        $("#setupInstructions").show();
        console.log("couldn't retrieve settings obj from local storage");
    } else if(!localStorage.getItem("events")){
        $("#serverInstructions").show();
        console.log("couldn't retrieve events obj from local storage");
    } else{
        events = JSON.parse(localStorage.getItem("events"));
        settings = JSON.parse(localStorage.getItem("settings"));
        initializeButtons();
        console.log("retrieved settings & events from browser storage");
        if($(window).width() > 600){ //then use google calendar
            $("#scheduleBody").prepend(settings.calLink);
        } else{ //then use 'Agenda' view for mobile
            constructMobileAgenda();
        }

        $("#scheduleBody").prepend("<br><br>");
        $(".addEvent").show();
        $(".removeEvent").show();
    }

    $('input').focus(function(){
       this.blur();
    });

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
    $('#addEventSave').click(function(){
        //if valid date, then
        var currDate = new Date();
        var currDatePlus10 = new Date(currDate.getTime() + 10*60000);
        var sDate = datepair.getStartTime();
        var eDate = datepair.getEndTime();
        if(currDatePlus10 >= sDate || sDate >= eDate)
            $("#invalidTime").show();
        else
            $("#invalidTime").hide();

        if(zonesClicked.length == 0)
            $("#invalidZones").show();
        else
            $("#invalidZones").hide();

        if(/*currDatePlus10*/currDate < sDate && zonesClicked.length != 0 && sDate != eDate && sDate < eDate){
            $("#addModal").modal('hide');
            var event = {
                sTime: Math.round(sDate.getTime()/1000.0),
                eTime: Math.round(eDate.getTime()/1000.0),
                zones: zonesClicked,
                type: "manual"
            };
            events.current.push(event);
            updateCalendar(sDate, eDate, zonesClicked);//also insert event calendar id into events object
            alert("You have added a water event!");
            console.log("Date given to datepicker: " + sDate + " -> " + eDate + " with zones " + zonesClicked);
            console.log("epoch: " + Math.round(sDate.getTime()/1000.0) + " -> " + Math.round(eDate.getTime()/1000.0));
        }
    });

    function constructMobileAgenda(){
        var link = settings.calLink;
        var mode = "mode=AGENDA&amp;";
        var index = link.search("embed?") + 6;
        var link = [link.slice(0, index), mode, link.slice(index)].join('');
        var link = link.replace("width=\"800\"", "width=\"350\"");
        var link = link.replace("height=\"600\"", "height=\"300\"");
        console.log(link);
        $("#scheduleBody").prepend(link);
    }

    $("#removeEventSave").click(function(){
        var eventsIndexRemove = [];
        if(eventsClicked.length == 0){
            $("#noEventsSelectedWarning").show();
        } else{
            $("#noEventsSelectedWarning").hide();
            for(var i = 0; i < eventsClicked.length; i++){
                //first delete from calendar with delete request
                var xmlhttp = new XMLHttpRequest();

                var url = "https://www.googleapis.com/calendar/v3/calendars/" + settings.calId + "/events/" + eventsClicked[i];
                xmlhttp.open("DELETE", url, true);
                xmlhttp.setRequestHeader('Authorization', 'Bearer ' + oauthToken);
                xmlhttp.onload = function(){
                    console.log("RESPONSE: " + xmlhttp.responseText);
                };
                xmlhttp.onerror = function(){
                    console.log("ERROR");
                };
                xmlhttp.send();

                var k = 0;
                var found = false;
                while(!found){
                    if(eventsClicked[i] == events.current[k].id){
                        found = true;
                        eventsIndexRemove.push(k);
                    }
                    k++;
                }
            }
            console.log("found to remove: " + eventsIndexRemove);
            for(i = 0; i < eventsIndexRemove.length; i++){
                events.current.splice(eventsIndexRemove[i], 1);
            }
            updateEvents();
            $("#removeModal").modal("hide");
        }

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
                    //console.log("event id in here: " + events.current[events.current.length - 1].id);
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
                console.log("FILE UPDATED: " + file);
                location.reload();
            };
        }
        request.execute(callback);
    }

    function updateCalendar(sDate, eDate, zonesFor){
        var description = "Watering event on zone(s): ";
        for(var i = 0; i < zonesFor.length; i++){
            description+=zonesFor[i].toString();
            if(i != zonesFor.length - 1)
                description+=", ";
            else
                description+=".";
        }

        var event = {
          'summary': "Watering Event (Manual)",
            'description': description,
            'start':{
                'dateTime': sDate.toISOString()
            },
            'end':{
                'dateTime': eDate.toISOString()
            },
            'location': settings.location.lat.toString() + "," + settings.location.long.toString(),
            'reminders':{
                'useDefault':false
            }
        };

        var request = gapi.client.calendar.events.insert({
            'calendarId': settings.calId,
            'resource': event
        });

        request.execute(function(event){
            events.current[events.current.length - 1].id = event.id;
           console.log("Event created: " + events.current[events.current.length - 1].id );
            updateEvents();//now update events.txt
        });
    }

    $(".zoneButton").click(function(){
        var zoneClicked = parseInt($(this).html());
        if($.inArray(zoneClicked, zonesClicked) == -1){//not in arr, so select
            $(this).addClass("zoneSelected");
            zonesClicked.push(zoneClicked);
            if(zonesClicked.length > 1){
                $("#tooManyZones").show();
            }
        } else { //previously clicked, so un-select
            $(this).removeClass("zoneSelected");
            var index = $.inArray(zoneClicked, zonesClicked);
            zonesClicked.splice(index, 1);
            if(zonesClicked.length < 2){
                $("#tooManyZones").hide();
            }
        }
        zonesClicked.sort();
        console.log(zoneClicked + "<- clicked");
    });

    $(".eventButton").click(function(){//used when removing events
        var eventIdClicked = $(this).attr('id');//obtain eventId
        if($.inArray(eventIdClicked, eventsClicked) == -1){//not in arr, so select
            if($(this).hasClass("blueButton")){
                $(this).addClass("blueSelected");
            }
            else{//clicked on green button for auto added events
                $(this).addClass("greenSelected");//FOR FUTURE FUNCTIONALITY TO DELETE AUTO EVENTS (NOT IMPLEMENTED)
            }
            eventsClicked.push(eventIdClicked);
            addSameDayAutoEvents(eventIdClicked);
        } else{ //previously clicked, so un-select
            $(this).removeClass("blueSelected");
            $(this).removeClass("greenSelected");
            var index = $.inArray(eventIdClicked, eventsClicked);
            eventsClicked.splice(index, 1);
            removeSameDayAutoEvents(eventIdClicked);
        }
        console.log(eventIdClicked + " <- event clicked");
    });

    function addSameDayAutoEvents(eventIdClicked){//FOR FUTURE FUNCTIONALITY TO DELETE AUTO EVENTS (NOT IMPLEMENTED)

    }

    function removeSameDayAutoEvents(eventIdClicked){//FOR FUTURE FUNCTIONALITY TO DELETE AUTO EVENTS (NOT IMPLEMENTED)

    }

    function initializeButtons(){

        for(var i = 1; i < settings.zones + 1; i++){//initialize zone buttons on adding event modal
            var htmlButton = "<a href=\"#\" class=\"zoneButton\">" + i + "</a>";
            $("#zoneButtons").append(htmlButton);
        }
        var anyManualEvents = false;
        for(i = 0; i < events.current.length; i++){//initialize event buttons on removing event modal
            if(events.current[i].type == "manual"){//only allow manual events to be deleted
                anyManualEvents = true;
                var colorClass = (events.current[i].type == "auto") ? "greenButton" : "blueButton";//FOR FUTURE FUNCTIONALITY TO DELETE AUTO EVENTS (NOT IMPLEMENTED)
                var startDate = new Date(0);
                startDate.setUTCSeconds(events.current[i].sTime);
                var startString = obtainTimeString(startDate);
                var endDate = new Date(0);
                endDate.setUTCSeconds(events.current[i].eTime);
                var endString = obtainTimeString(endDate);
                var eventString = startString + "<br> to <br>" + endString;

                //now add zone description:
                var description = "Zone(s): ";
                for(j = 0; j < events.current[i].zones.length; j++){
                    description+=events.current[i].zones[j].toString();
                    if(j != events.current[i].zones.length - 1)
                        description+=", ";
                }
                eventString += "<br>" + description;
                htmlButton = "<a href=\"#\" id=\"" + events.current[i].id +"\" class=\"eventButton " + colorClass + "\">" + eventString + "</a><br><br>";

                $("#eventButtons").append(htmlButton);
            }
        }
        if(!anyManualEvents){
            $("#warningInstructions").show();
        }
    }

    function obtainTimeString(date){
        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var days = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];
        var day = days[date.getDay()] + ", " + months[date.getMonth()] + " " + date.getUTCDate() + " @ ";
        var timeStr;
        var minutes = date.getMinutes();
        var minutesStr;
        if(minutes < 10){
            minutesStr = "0" + minutes.toString();
        } else{
            minutesStr = minutes.toString();
        }
        if(date.getHours() >= 12){
            timeStr = ((date.getHours() - 12) == 0) ? "12" : (date.getHours() - 12).toString();
            timeStr += ":" + minutesStr + " pm";
        } else{
            timeStr = (date.getHours() == 0) ? "12" : date.getHours().toString();
            timeStr += ":" + minutesStr + " am";
        }
        return day + timeStr;
    }

    function checkWidth(){
        if($(window).width() < 600){
            //$(".modal-content").addClass("mobileModal");
            //$(".remove-modal-content").addClass("mobileModal");
            $(".slideshow").css('background-image', 'url(../images/wetgrass2mobile.jpg');
            $(".mobile").show();
            $(".desktop").hide();
            $(".menu-btn").addClass("glyphicon glyphicon-chevron-right");
        } else{
            //$(".modal-content").removeClass("mobileModal");
            //$(".remove-modal-content").removeClass("mobileModal");
            $(".slideshow").css('background-image', 'url(../images/wetgrass2small.jpg');
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

