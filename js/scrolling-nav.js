/**
 * Created by Kyle on 2/4/2016.
 */
var signedIn = false;

/*function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail());
    signedIn = true;
    checkStatus();
    window.location = "http://sjroh.github.io/MySprinkler2/home/home.html";
}*/

function onSuccess(googleUser) {
    console.log('Logged in as: ' + googleUser.getBasicProfile().getName());
    signedIn = true;
    checkStatus();
    var accessToken = googleUser.getAuthResponse().access_token;
    //var accessToken2 = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;

    //localStorage.setItem("accessToken", googleUser.getAuthResponse().access_token);
    alert("accesstoken stored in browser");
    window.location = "http://sjroh.github.io/MySprinkler2/home/home.html";


}
function onFailure(error) {
    console.log(error);
}
function renderButton() {
    gapi.signin2.render('my-signin2', {
        'scope': 'profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive',
        'width': 240,
        'height': 40,
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
    });
}

function checkStatus(){
    if($(window).width() < 750){
        $("#desktopSignOut").hide();
        //$("#desktopSignIn").hide();
        if(signedIn){
            $("#mobileSignOut").show();
            //$("#mobileSignIn").hide();
        } else{
            //$("#mobileSignIn").show();
            $("#mobileSignOut").hide();
        }
    } else{
        $("#mobileSignOut").hide();
        //$("#mobileSignIn").hide();
        if(signedIn){
            $("#desktopSignOut").show();
            //$("#desktopSignIn").hide();
        } else{
            //$("#desktopSignIn").show();
            $("#desktopSignOut").hide();
        }
    }
}
checkStatus();

//jQuery to collapse the navbar on scroll
$(document).ready(function(){
    var desktop = false;
    var mobile = false;
    function checkWidth(){
        if($(window).width() < 750){
            if(!mobile){
                $(".mobile").show();
                $(".desktop").hide();
                var googleButton = document.getElementById("signIn");
                var mobileButtonParent = document.getElementById("mobileButtonParent");
                //console.log("button size: " + googleButtons.length);
                var parent = googleButton.parentNode;
                if(parent){
                    parent.removeChild(googleButton);
                    mobileButtonParent.appendChild(googleButton);
                    /*for(var i = 0; i < googleButtons.length; i++){//move buttons to mobile view
                     var parent = googleButtons[i].parentNode;
                     parent.removeChild(googleButtons[i]);
                     //googleButtons[i].removeClass("topMenu");
                     googleButtons[i].className += " bottomMenu";
                     mobileButtonParent.appendChild(googleButtons[i]);
                     $(".topMenu").removeClass("topMenu");
                     }*/
                    mobile = true;
                    desktop = false;
                }

            }

        } else{
            if(!desktop){
                $(".mobile").hide();
                $(".desktop").show();
                var googleButton = document.getElementById("signIn");
                var desktopButtonParent = document.getElementById("desktopButtonParent");
                var parent = googleButton.parentNode;
                if(parent){
                    parent.removeChild(googleButton);
                    desktopButtonParent.appendChild(googleButton);
                    /*for(i = 0; i < googleButtons.length; i++){//move buttons to desktop view
                     parent = googleButtons[i].parentNode;
                     parent.removeChild(googleButtons[i]);
                     //googleButtons[i].removeClass("bottomMenu");
                     googleButtons[i].className += " topMenu";
                     desktopButtonParent.appendChild(googleButtons[i]);
                     $(".bottomMenu").removeClass("bottomMenu");
                     }*/
                    mobile = false;
                    desktop = true;
                }

            }

        }
    }
    checkWidth();
    $(window).resize(checkWidth);
    $(window).resize(checkStatus);
    function hideThis(){
        $('.adem').hide();
    }
    $(".adem").delay(2000).queue(function(){
        $(this).addClass('animated fadeOutUp').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', hideThis).dequeue();
    });

});


$(window).scroll(function() {
    if ($(".navbar").offset().top > 50) {
        $(".navbar-fixed-top").addClass("top-nav-collapse");
    } else {
        $(".navbar-fixed-top").removeClass("top-nav-collapse");
    }
});

//jQuery for page scrolling feature - requires jQuery Easing plugin
$(function() {
    $('a.page-scroll').bind('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });
});