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
$("#chooseCustomError").hide();

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
    var customChosen = "";

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

    $(".sec").on('click', function(){//to change zone watering level
        var keywords = searchForKeyWord(this.className.split(/\s+/));//search for high, medium, low, custom

        keywords[0] = keywords[0][0].toUpperCase() + keywords[0].slice(1);//capitalize first letter in level
        if(settings.currLevel != keywords[0] && keywords[0] != "Custom"){//then change level (custom is changed thru modal)
            settings.currLevel = keywords[0];
            //put updated settings obj in settings.txt
            updateSettings();

            $(".sec.active").removeClass("active");
            $(this).addClass("active");
        }

    });

    function searchForKeyWord(classArr){
        var returnArr = [];
        for(var i = 0; i < classArr.length; i++){
            if(classArr[i] == "high" || classArr[i] == "medium" || classArr[i] == "low" || classArr[i] == "custom"){
                returnArr.push(classArr[i]);
            }
        }
        return returnArr;
    }

    function updateSettings(){
        localStorage.setItem("settings", JSON.stringify(settings));
        var retrievePageOfFiles = function(request) {
            request.execute(function(resp) {
                if(resp.items.length == 0){
                    console.log("ERROR: Couldn't find settings.txt to update!");
                }
                else{
                    console.log(resp.items[0].title + " file found");
                    console.log(resp.items[0]);
                    updateFile(resp.items[0].id, resp.items[0], settings, null);
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
        var identifier = ".sec";
        if(settings.currLevel == "High"){
            identifier += ".high";
        } else if(settings.currLevel == "Medium"){
            identifier += ".medium";
        } else if(settings.currLevel == "Low"){
            identifier += ".low";
        } else if(settings.currLevel == "Custom"){
            identifier += ".custom";
            $(".custom.sec").html("Custom: " + settings.custom.customLvl + "\"");
        }
        $(identifier).addClass("active");
    }

    $(".blueButton").click(function(){
        if(this.id != customChosen){
            $("#" + customChosen).removeClass("active");
            $(this).addClass("active");
            customChosen = this.id;
        } //else do nothing, already chosen
    });

    $(".saveCustom").click(function(){
        if(customChosen == "custom1"){
            settings.currLevel = "Custom";
            settings.custom.customLvl = 0.25;
            updateSettings();
            $("#chooseCustomError").hide();
            $("#customModal").modal("hide");
            $(".sec.active").removeClass("active");
            $(".custom").addClass("active");
        } else if(customChosen == "custom2"){
            settings.currLevel = "Custom";
            settings.custom.customLvl = 1.5;
            updateSettings();
            $("#chooseCustomError").hide();
            $("#customModal").modal("hide");
            $(".sec.active").removeClass("active");
            $(".custom").addClass("active");
        } else if(customChosen == "custom3"){
            settings.currLevel = "Custom";
            settings.custom.customLvl = 3.0;
            updateSettings();
            $("#chooseCustomError").hide();
            $("#customModal").modal("hide");
            $(".sec.active").removeClass("active");
            $(".custom").addClass("active");
        } else { //error, need to choose
            $("#chooseCustomError").show();
        }
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
