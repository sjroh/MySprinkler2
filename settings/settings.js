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
$("#chooseCustomTimeError").hide();
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
    var customTimeChosen = "";

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

        if(settings.conversionRate == 0.5){
            $("#rate1").addClass("active");
        } else if(settings.conversionRate == 1){
            $("#rate2").addClass("active");
        } else if(settings.conversionRate == 1.5){
            $("#rate3").addClass("active");
        } else if(settings.conversionRate == 2.0){
            $("#rate4").addClass("active");
        }

        if(settings.wateringHr == 5){
            $("#time1").addClass("active");
        } else if(settings.wateringHr == 7){
            $("#time2").addClass("active");
        } else if(settings.wateringHr == 8){
            $("#time3").addClass("active");
        } else{ //watering hr is custom
            var amOrPm = (settings.wateringHr >= 12) ? "pm" : "am";
            var hr = (settings.wateringHr > 12) ? (settings.wateringHr - 12) : settings.wateringHr;
            $("#time4").html("Custom: " + hr + " " + amOrPm).addClass("active");
        }
    }

    $(".blueButton").click(function(){//custom watering per week in custom modal
        if(this.id != customChosen){
            if(customChosen != "") {
                $("#" + customChosen).removeClass("blueSelected");
            }
            $(this).addClass("blueSelected");
            customChosen = this.id;
        } //else do nothing, already chosen
    });

    $(".blueTimeButton").click(function(){//custom time buttons in custom time modal
        if(this.id != customTimeChosen){
            if(customTimeChosen != ""){
                $("#" + customTimeChosen).removeClass("blueTimeSelected");
            }
            $(this).addClass("blueTimeSelected");
            customTimeChosen = this.id;
        }
    });

    $(".rate").click(function(){
        if(this.id == "rate1" && settings.conversionRate != .5){
            $(".rate.active").removeClass("active");
            $(this).addClass("active");
            settings.conversionRate = .5;
            updateSettings();
        } else if(this.id == "rate2" && settings.conversionRate != 1){
            $(".rate.active").removeClass("active");
            $(this).addClass("active");
            settings.conversionRate = 1;
            updateSettings();
        } else if(this.id == "rate3" && settings.conversionRate != 1.5){
            $(".rate.active").removeClass("active");
            $(this).addClass("active");
            settings.conversionRate = 1.5;
            updateSettings();
        } else if(this.id == "rate4" && settings.conversionRate != 2){
            $(".rate.active").removeClass("active");
            $(this).addClass("active");
            settings.conversionRate = 2;
            updateSettings();
        }//else conversionRate is same as clicked rate
    });

    $(".time").click(function(){
        $(".customTime").removeClass("active");
        $(".customTime").html("Custom");
        if(this.id == "time1" && settings.wateringHr != 5){
            $(".time.active").removeClass("active");
            $(this).addClass("active");
            settings.wateringHr = 5;
            updateSettings();
        } else if(this.id == "time2" && settings.wateringHr != 7){
            $(".time.active").removeClass("active");
            $(this).addClass("active");
            settings.wateringHr = 7;
            updateSettings();
        } else if(this.id == "time3" && settings.wateringHr != 8){
            $(".time.active").removeClass("active");
            $(this).addClass("active");
            settings.wateringHr = 8;
            updateSettings();
        }
    });

    $(".saveCustom").click(function(){
        if(customChosen == "custom1" && (settings.custom.customLvl != 1.5 || settings.custom.customLvl == 1.5 && settings.currLevel != "Custom")){
            settings.currLevel = "Custom";
            settings.custom.customLvl = 1.5;
            $(".custom.sec").html("Custom: " + settings.custom.customLvl + "\"");
            updateSettings();
            $("#chooseCustomError").hide();
            $("#customModal").modal("hide");
            $(".sec.active").removeClass("active");
            $(".custom").addClass("active");
        } else if(customChosen == "custom2" && (settings.custom.customLvl != 3.0 || settings.custom.customLvl == 3.0 && settings.currLevel != "Custom")){
            settings.currLevel = "Custom";
            settings.custom.customLvl = 3.0;
            $(".custom.sec").html("Custom: " + settings.custom.customLvl + "\"");
            updateSettings();
            $("#chooseCustomError").hide();
            $("#customModal").modal("hide");
            $(".sec.active").removeClass("active");
            $(".custom").addClass("active");
        } else { //error, need to choose
            $("#chooseCustomError").show();
        }
    });

    $(".saveCustomTime").click(function(){
        $("#chooseCustomTimeError").hide();
        if(customTimeChosen == "customTime1" && settings.wateringHr != 4){
            settings.wateringHr = 4;
            $(".customTime").html("Custom: 4 am");
            updateSettings();
            $("#customTimeModal").modal("hide");
            $(".time.active").removeClass("active");
            $(".customTime").addClass("active");
        } else if(customTimeChosen == "customTime2" && settings.wateringHr != 6){
            settings.wateringHr = 6;
            $(".customTime").html("Custom: 6 am");
            updateSettings();
            $("#customTimeModal").modal("hide");
            $(".time.active").removeClass("active");
            $(".customTime").addClass("active");
        } else if(customTimeChosen == "customTime5" && settings.wateringHr != 16){
            settings.wateringHr = 16;
            $(".customTime").html("Custom: 4 pm");
            updateSettings();
            $("#customTimeModal").modal("hide");
            $(".time.active").removeClass("active");
            $(".customTime").addClass("active");
        } else if(customTimeChosen == "customTime6" && settings.wateringHr != 17){
            settings.wateringHr = 17;
            $(".customTime").html("Custom: 5 pm");
            updateSettings();
            $("#customTimeModal").modal("hide");
            $(".time.active").removeClass("active");
            $(".customTime").addClass("active");
        } else if(customTimeChosen == "customTime7" && settings.wateringHr != 18){
            settings.wateringHr = 18;
            $(".customTime").html("Custom: 6 pm");
            updateSettings();
            $("#customTimeModal").modal("hide");
            $(".time.active").removeClass("active");
            $(".customTime").addClass("active");
        } else if(customTimeChosen == "customTime8" && settings.wateringHr != 19){
            settings.wateringHr = 19;
            $(".customTime").html("Custom: 7 pm");
            updateSettings();
            $("#customTimeModal").modal("hide");
            $(".time.active").removeClass("active");
            $(".customTime").addClass("active");
        } else{ //error, need to choose one
            $("#chooseCustomTimeError").show();
        }
    });

    /*$("#closeCustomModal").click(function(){
        console.log("clicked close");
        if(settings.currLevel != "Custom"){//remove active class after canceling on modal
            console.log("in here");
            $(".custom.sec").removeClass("active");
        }
    });

    $("#closeCustomTimeModal").click(function(){
        var hr = settings.wateringHr;
        console.log("clicked close");
        if(hr == 5 || hr == 7 || hr == 9){ //then not custom time so remove active class after canceling on modal
            console.log("in here");
            $(".customTime").removeClass("active");
        }
    });*///doesn't work...remove later

    $("#submitRate").click(function(){
        var waterAmt = $("#waterAmt").val();
        var timeAmt = $("#timeAmt").val();
        var inchesPerHr = 60*waterAmt/timeAmt;
        $("#rateResult").html("Your lawn water rate is " + inchesPerHr + " inch(es) per hour.");
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
            $(".slideshow").css('background-image', 'url(../images/wetgrass2mobile.jpg');
            $(".menu-btn").addClass("glyphicon glyphicon-chevron-right");
        } else{
            $(".mobile").hide();
            $(".desktop").show();
            $(".slideshow").css('background-image', 'url(../images/wetgrass2small.jpg');
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
