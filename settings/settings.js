/**
 *Created by Kyle on 2/10/2016
 *Edited by Abigail Rodriguez 2/21/16
 */
$("#serverInstructions").hide();

$(document).ready(function(){
	var numOfSectors = 5;

    if(!localStorage.getItem("settings")){
        $("#serverInstructions").show();
        console.log("couldn't retrieve settings obj from local storage")
    } else{
        initializeSectors();//
    }

    function initializeSectors(){
        //get number of sectors from settings.txt in google drive here
        var settings = JSON.parse(localStorage.getItem("settings"));
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


function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
        signedIn = false;
        checkStatus();
        window.location = "http://sjroh.github.io/MySprinkler2/";
    });
}