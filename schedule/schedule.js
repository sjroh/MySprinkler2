/**
 * Created by Kyle on 2/10/2016.
 */
$(document).ready(function(){

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


});