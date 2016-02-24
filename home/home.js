/**
 * Created by Kyle on 2/8/2016.
 */
var signedIn = false;

var globalVariables = {};

/*function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    globalVariables.userName = profile.getName();
    $("#userName").html(profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail());
    signedIn = true;
    checkStatus();
}*/

function onSuccess(googleUser) {
    console.log('Logged in as: ' + googleUser.getBasicProfile().getName());
    signedIn = true;
    $("#userName").html(googleUser.getBasicProfile().getName());
    checkStatus();
    listFilesInApplicationDataFolder();
}
function onFailure(error) {
    console.log(error);
}
function renderButton() {
    gapi.signin2.render('my-signin2', {
        'scope': 'profile https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/drive.appdata',
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


/**
 * List all files contained in the Application Data folder.
 *
 * @param {Function} callback Function to call when the request is complete.
 */
function listFilesInApplicationDataFolder() {
    var retrievePageOfFiles = function(request) {
        request.execute(function(resp) {
            for(i in resp.items){
                if(resp.items[i] == "appsettings.json"){
                    alert("found settings");
                } else{
                    alert("no setttings exist");
                }
            }
        });
    };
    var initialRequest = gapi.client.drive.files.list({
        'q': '(\'appfolder\' in parents) and (title = \'settings\')'
    });
    retrievePageOfFiles(initialRequest);
}

$(document).ready(function(){
    function checkWidth(){
        if($(window).width() < 750){
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
    var userName = "nameHere";
    $("#userName").text(userName);
    $("#error").hide();
    $("#menu-toggle").click(function(){
        if($(".menu-btn").hasClass("glyphicon-chevron-right")){
            $(".menu-btn").removeClass("glyphicon-chevron-right");
            $(".menu-btn").addClass("glyphicon-chevron-left");
        }else{
            $(".menu-btn").removeClass("glyphicon-chevron-left");
            $(".menu-btn").addClass("glyphicon-chevron-right");
        }
    })
});