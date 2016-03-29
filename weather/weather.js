/**
 * Created by Kyle on 2/10/2016.
 */
var oauthToken;
var clientId = "1098632840077-a0im0gkftlvomqb612gtsan5pe8v09jp.apps.googleusercontent.com";
var scopes = "https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/calendar";

$("#serverInstructions").hide();
$("#setupInstructions").hide();
$("#tableHolder").hide();
var signedIn = false;
var weatherImageSmall;
var weatherImageMobile;


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
    console.log("buttonRendered");
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
        $("#tableHolder").show();
        loadWeatherTable();
        console.log("retrieved settings from browser storage");
    }

    function loadWeatherTable(){
        var settings = JSON.parse(localStorage.getItem("settings"));
        $.get('http://api.openweathermap.org/data/2.5/forecast/daily?lat=' + settings.location.lat + '&lon=' + settings.location.long + '&cnt=7&mode=json&appid=0039a67282bf9ff15995e2c340d6906b', function(data){
            var weatherData = data.list;
            // console.log(weatherData);
            var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            var days = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];
            setWeatherImage(weatherData[0].weather[0]);
            for(var i = 0; i < weatherData.length; i++){
                var idName = "#day" + (i+1).toString();
                var idWName = "#w" + (i+1).toString();
                var date = new Date(0);
                date.setUTCSeconds(weatherData[i].dt);
                // date.setTime(weatherData[i].dt * 1000);//date = epoch value * 1000
                //date.setUTCSeconds()
                $(idName).html(days[date.getDay()] + "<br>" + months[date.getMonth()] + "  " + date.getUTCDate());
                console.log(weatherData[i].dt + ": " + date.toDateString());
                $(idWName).html("<img src='http://openweathermap.org/img/w/" + weatherData[i].weather[0].icon + ".png'>");
            }
        });
    }

    function setWeatherImage(weatherToday){
        console.log("weather: " + weatherToday.main);
        if(weatherToday.main == "Clear"){
            weatherImageMobile = "../images/sunnymobile.jpg";
            weatherImageSmall = "../images/sunnysmall.jpg";
        } else if(weatherToday.main == "Rain" || weatherToday.main == "Drizzle"){
            weatherImageMobile = "../images/rainmobile.jpg";
            weatherImageSmall = "../images/rainsmall.jpg";
        } else if(weatherToday.main == "Thunderstorm" || weatherToday.main == "Extreme"){
            weatherImageMobile = "../images/stormmobile.jpg";
            weatherImageSmall = "../images/stormsmall.jpg";
        } else{
            weatherImageMobile = "../images/wetgrass2mobile.jpg";
            weatherImageSmall = "../images/wetgrass2small.jpg";
        }
        checkWidth();
    }

    function checkWidth(){
        if($(window).width() < 600){
            $(".mobile").show();
            $(".slideshow").css('background-image', 'url(' + weatherImageMobile + ')');
            $(".desktop").hide();
            $(".menu-btn").addClass("glyphicon glyphicon-chevron-right");
        } else{
            $(".mobile").hide();
            $(".slideshow").css('background-image', 'url(' + weatherImageSmall + ')');
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