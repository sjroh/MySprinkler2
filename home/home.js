/**
 * Created by Kyle on 2/8/2016.
 */
var signedIn = false;
$("#setup").hide();
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
    //gapi.client.load('drive', 'v2', listFilesInApplicationDataFolder);
    listFilesInApplicationDataFolder();
    //test
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
            if(resp.items.length == 0){
                //no settings file in gdrive exists so show
                //location warning for user to click on
                //once they click on this, create a settings.json file
                $("#setup").show();
                console.log("no file in drive exists");
            }
            else{
                //found settings -> parse json to obtain settings data
                console.log(resp.items.length + " file(s) found");
                for(var i = 0; i < resp.items.length; i++){
                    var title = resp.items[i].title;
                    console.log(resp.items[i].title + ": ");
                    var url = resp.items[i].downloadUrl;
                    console.log(url);
                    getFile(url);
                    /*var reader = new FileReader();
                    reader.onload = function(){
                        console.log(reader.result);
                    };
                    reader.readAsText(resp.items[i]);*/
                }
            }
        });
    };
    /*var initialRequest = gapi.client.drive.files.list({
        'q': '(\'appfolder\' in parents) and (title = \'settings\')'
    });*/
    var initialRequest = gapi.client.request({
        'path': '/drive/v2/files',
        'method': 'GET',
        'params': {'q': '(\'appfolder\' in parents)'}
    });
    retrievePageOfFiles(initialRequest);
}

function getFile(downloadUrl){
    var accessToken = gapi.auth.getToken().access_token;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', downloadUrl);
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xhr.onload = function() {
        console.log("CONTENT: " + xhr.responseText);
    };
    xhr.onerror = function() {
        console.log("fuck error");
    };
    xhr.send();
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