/**
 *Created by Kyle on 2/10/2016
 *Edited by Abigail Rodriguez 2/21/16
 */
$(document).ready(function(){
	var numOfSectors = 5;
    var sectorString = "<p>" +
    "Sector 1:" +
    "<button id = \”sec1\” class=\”btn btn-primary\” data-toggle=\”modal\” data-target=\”#exampleModal\” data-whatever=\”High\”>High</button>" +
    "<button id = \”sec1\” class=\”btn btn-primary\” data-toggle=\”modal\” data-target=\”#exampleModal\” data-whatever=\”Medium\”>Medium</button>" +
    "<button id = \”sec1\” class=\”btn btn-primary\” data-toggle=\”modal\” data-target=\”#exampleModal\” data-whatever=\”Low\”>Low</button>" +
    "<button  id = \”sec1\” class=\”btn btn-primary\” data-toggle=\”modal\” data-target=\”#exampleModal\” data-whatever=\”Custom\”>Custom</button>" +
    "</p>";
    var sectorStringBody =
    "<div class=\”modal fade\” id=\”exampleModal\” tabindex=\”-1\” role=\”dialog\” aria-labelledby=\”exampleModalLabel\”>" +
    "<div class=\”modal-dialog\” role=\”document\”>" +
    "<div class=\”modal-content\”>" +
    "<div class=\”modal-header\”>" +
    "<button type=\”button\” class=\”close\” data-dismiss=\”modal\” aria-label=\”Close\”><span aria-hidden=\”true\”>&times;</span></button>"+
    "<h4 class=\”modal-title\”>Time Preference</h4>" +
    "</div>" +
    "<div class=\”modal-body\”>" +
    "<!--http://jonthornton.github.io/jquery-timepicker/-->" +
    "<p id=\”basicExample\”>" +
    "<!--input type=\”text\” class=\”date start\” /-->" +
    "<input type=\”text\” class=\”time start\” /><br>" +
    "to <br>" +
    "<input type=\”text\” class=\”time end\” >" +
    "<!--input type=\”text\” class=\”date end\” /-->" +
    "</p>" +
    "</div>" +
    "<div class=\”modal-footer\”>" +
    "<button type=\”button\” class=\”btn btn-default\” data-dismiss=\”modal\”>Close</button>" +
    "<button type=\”button\” class=\”btn btn-default addEvent\”>Save changes</button>" +
    "</div>" +
    "</div>" +
    "</div>" +
    "</div>";

    $("#tab1").prepend(sectorString + " <br><br> " + sectorStringBody);



    function initializeNumberOfSectors(){
        //get number of sectors from settings.txt in google drive here
        numSectors = numOfSectors;

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
    initializeNumberOfSectors();

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