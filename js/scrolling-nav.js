/**
 * Created by Kyle on 2/4/2016.
 */
var signedIn = false;
$(".signOut").hide();//hide by default


function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail());
    $(".signIn").hide();
    $(".signOut").show();
    signedIn = true;
    //window.location = "http://sjroh.github.io/MySprinkler2/home/home.html";
}

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
        $(".signIn").show();
        $(".signOut").hide();
        signedIn = false;
    });
}

//jQuery to collapse the navbar on scroll
$(document).ready(function(){



    function checkWidth(){
        if($(window).width() < 750){
            $(".mobile").show();
            $(".desktop").hide();
            $("#desktopSignOut").hide();
            $("#desktopSignIn").hide();
            if(signedIn){
                $("#mobileSignOut").show();
            } else{
                $("#mobileSignIn").show();
            }
            /*var googleButtons = document.getElementsByClassName("topMenu");
            var mobileButtonParent = document.getElementById("mobileButtonParent");
            console.log("button size: " + googleButtons.length);
            for(var i = 0; i < googleButtons.length; i++){//move buttons to mobile view
                var parent = googleButtons[i].parentNode;
                parent.removeChild(googleButtons[i]);
                //googleButtons[i].removeClass("topMenu");
                googleButtons[i].className += " bottomMenu";
                mobileButtonParent.appendChild(googleButtons[i]);
                $(".topMenu").removeClass("topMenu");
            }*/
        } else{
            $(".mobile").hide();
            $(".desktop").show();
            $("#mobileSignOut").hide();
            $("#mobileSignIn").hide();
            if(signedIn){
                $("#desktopSignOut").show();
            } else{
                $("#desktopSignIn").show();
            }
            /*googleButtons = document.getElementsByClassName("bottomMenu");

            var desktopButtonParent = document.getElementById("desktopButtonParent");
            for(i = 0; i < googleButtons.length; i++){//move buttons to desktop view
                parent = googleButtons[i].parentNode;
                parent.removeChild(googleButtons[i]);
                //googleButtons[i].removeClass("bottomMenu");
                googleButtons[i].className += " topMenu";
                desktopButtonParent.appendChild(googleButtons[i]);
                $(".bottomMenu").removeClass("bottomMenu");
            }*/
        }
    }
    checkWidth();
    $(window).resize(checkWidth);

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