/**
 *Created by Kyle on 2/10/2016
 *Edited by Abigail Rodriguez 2/21/16
 */
var clientId = "1098632840077-a0im0gkftlvomqb612gtsan5pe8v09jp.apps.googleusercontent.com";
var scopes = "https://www.googleapis.com/auth/drive";
var oauthToken;

$("#serverInstructions").hide();
$("#setupInstructions").hide();
$(".tabs").hide();
var settings;

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

    if(!localStorage.getItem("settings")){
        $("#setupInstructions").show();
        console.log("couldn't retrieve settings obj from local storage");
    } else if(!localStorage.getItem("events")){
        $("#serverInstructions").show();
        console.log("couldn't retrieve events obj from local storage");
    } else{
        settings = JSON.parse(localStorage.getItem("settings"));
        $(".tabs").show();
        initializeSectors();
    }

    $(".btn").on('click', function(){//to change zone watering level
        var keywords = searchForKeyWords(this.className.split(/\s+/));//search for high, medium, low, custom and sec#

        if(keywords.length == 3){ //keyword = ['level', 'sec#', #]
            keywords[0] = keywords[0][0].toUpperCase() + keywords[0].slice(1);//capitalize first letter in level
            if(!alreadyActive(keywords[0], keywords[2])){//then change level
                settings.zones[keywords[2] - 1].currLevel = keywords[0];
                //put updated settings obj in settings.txt
                updateSettings();

                var activeIdentifier = "." + keywords[1] + "." + "active";
                $(activeIdentifier).removeClass("active");
                //iterate thru settings & fill sectors on page with correct setting
                $(this).addClass("active");
            }
        } //else do nothing

    });

    function alreadyActive(zoneLvl, zoneNum){
        if(settings.zones[zoneNum - 1].currLevel == zoneLvl){
            return true;
        }
        return false;
    }

    function searchForKeyWords(classArr){
        var returnArr = [];
        for(var i = 0; i < classArr.length; i++){
            if(classArr[i] == "high" || classArr[i] == "medium" || classArr[i] == "low" || classArr[i] == "custom"){
                returnArr.push(classArr[i]);
            } else if(classArr[i].length > 3){//test if 'sec#'
                if(classArr[i].substring(0,3) == "sec"){
                    returnArr.push(classArr[i]);
                    var sectorNum = parseInt(classArr[i].substring(3, classArr[i].length));
                    returnArr.push(sectorNum);
                }
            }
        }
        return returnArr;
    }

    function updateSettings(){
        var retrievePageOfFiles = function(request) {
            request.execute(function(resp) {
                if(resp.items.length == 0){
                    console.log("ERROR: Couldn't find settings.txt to update!");
                }
                else{
                    console.log(resp.items[0].title + " file found");
                    updateFile(resp.items[0].fileId, resp.items[0], settings, null);
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

    function initializeSectors(){
        //get number of sectors from settings.txt in google drive here
        var numSectors = settings.zones.length;
        var sectorHTML = $("#tab1").html();
        //setup content
        for(var i = 2; i < numSectors + 1/*already have 1*/; i++){
            var newID = "exampleModal" + (i).toString();
            var secID = "sec" + (i).toString();
            var copyHTML = sectorHTML;
            copyHTML = copyHTML.replace(/exampleModal1/g, newID);
            copyHTML = copyHTML.replace(/sec1/g, secID);
            copyHTML = copyHTML.replace("Sector 1:", "Sector " + (i).toString() + ":");
            $("#tab1").append(copyHTML);
        }


        //iterate thru settings & fill sectors on page with correct setting
        for(i = 0; i < settings.zones.length; i++){
            var identifier = ".sec" + (i+1).toString();
            if(settings.zones[i].currLevel == "High"){
                identifier += ".high";
            } else if(settings.zones[i].currLevel == "Medium"){
                identifier += ".medium";
            } else if(settings.zones[i].currLevel == "Low"){
                identifier += ".low";
            } else if(settings.zones[i].currLevel == "Custom"){
                identifier += ".custom";
            }
            $(identifier).addClass("active");
        }
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
    $('.addEvent').click(function(){
        //if valid date, then
        var currDate = new Date();
        var endDate = datepair.getStartTime();
        if(currDate >= endDate){
            alert("Sorry, invalid date");
        }
        else{
            alert("You have added a water event!");
        }
        //code here to save water event to google calendar & google drive & raspberry pi
        //else
        //error message
        //alert(datepair.getEndTime());


    });
    function checkWidth(){
        if($(window).width() < 600){
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

    $("#menu-toggle").click(function(){
        if($(".menu-btn").hasClass("glyphicon-chevron-right")){
            $(".menu-btn").removeClass("glyphicon-chevron-right");
            $(".menu-btn").addClass("glyphicon-chevron-left");
        }else{
            $(".menu-btn").removeClass("glyphicon-chevron-left");
            $(".menu-btn").addClass("glyphicon-chevron-right");
        }
    });


    jQuery('.tabs .tab-links a').on('click', function(e)  {
        var currentAttrValue = jQuery(this).attr('href');
 
        // Show/Hide Tabs
        jQuery('.tabs ' + currentAttrValue).show().siblings().hide();
 
        // Change/remove current tab to active
        jQuery(this).parent('li').addClass('active').siblings().removeClass('active');
 
        e.preventDefault();
    });
});
