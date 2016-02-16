/**
 * Created by Kyle on 2/4/2016.
 */
function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail());
    $(".signIn").hide();
    $(".signOut").show();
    //window.location = "http://sjroh.github.io/MySprinkler2/home/home.html";
}

function signOut() {
    alert("testing");
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
        $(".signIn").show();
        $(".signOut").hide();
    });
}

//jQuery to collapse the navbar on scroll
$(document).ready(function(){



    function checkWidth(){
        if($(window).width() < 750){
            $(".mobile").show();
            $(".desktop").hide();
            var googleButtons = document.getElementsByClassName("topMenu");
            var mobileButtonParent = document.getElementById("mobileButtonParent");
            for(var i = 0; i < googleButtons.length; i++){//move buttons to mobile view
                var parent = googleButtons[i].parentNode;
                googleButtons[i].removeClass("topMenu");
                googleButtons[i].addClass("bottomMenu");
                parent.removeChild(googleButtons[i]);
                mobileButtonParent.appendChild(googleButtons[i]);
            }
        } else{
            $(".mobile").hide();
            $(".desktop").show();
            googleButtons = document.getElementsByClassName("bottomMenu");
            var desktopButtonParent = document.getElementById("desktopButtonParent");
            for(i = 0; i < googleButtons.length; i++){//move buttons to desktop view
                parent = googleButtons[i].parentNode;
                googleButtons[i].removeClass("bottomMenu");
                googleButtons[i].addClass("topMenu");
                parent.removeChild(googleButtons[i]);
                desktopButtonParent.appendChild(googleButtons[i]);
            }
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