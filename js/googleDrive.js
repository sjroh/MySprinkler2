var options = new gapi.auth2.SigninOptionsBuilder(
    {'scope': 'https://www.googleapis.com/auth/drive.appfolder'});

googleUser = auth2.currentUser.get();
googleUser.grant(options).then(
    function(success){
        console.log(JSON.stringify({message: "success", value: success}));
    },
    function(fail){
        alert(JSON.stringify({message: "fail", value: fail}));
    });