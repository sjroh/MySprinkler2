/**
 * Created by Kyle on 2/10/2016.
 */
$("#serverInstructions").hide();
$("#setupInstructions").hide();
$(".addEvent").hide();
$(".removeEvent").hide();
$("#invalidTime").hide();
$("#invalidZones").hide();

$(document).ready(function(){

    var zonesClicked = [];
    if(!localStorage.getItem("settings")){
        $("#setupInstructions").show();
        console.log("couldn't retrieve settings obj from local storage");
    } else if(!localStorage.getItem("events")){
        $("#serverInstructions").show();
        console.log("couldn't retrieve events obj from local storage");
    } else{
        var settings = JSON.parse(localStorage.getItem("settings"));
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
        if(currDate >= sDate){
            $(".invalidTime").show();
        }
        if(zonesClicked.length == 0){
            $(".invalidZones").show();
        }
        if(currDate < sDate && zonesClicked.length != 0){
            alert("You have added a water event!");
            console.log("Date given to datepicker: " + sDate + " -> " + eDate + " with zones " + zonesClicked);
            console.log("epoch: " + Math.round(sDate.getTime()/1000.0) + " -> " + Math.round(eDate.getTime()/1000.0));
        }
        //code here to save water event to google calendar & google drive & raspberry pi
        //else
        //error message
        //alert(datepair.getEndTime());
    });

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

});

	function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
        signedIn = false;
        checkStatus();
        window.location = "http://sjroh.github.io/MySprinkler2/";
    });
}
