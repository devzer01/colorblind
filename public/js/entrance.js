var c = 3;
var round = 0;
var c4, c5;
var check = "\u2713";
var cross = "\u2718";
var ui;
var precision = 100;
var gameSeconds = 45;
var roundScore = 100;
var gameTimer;
var ageGroup , divScore, divCounter, dvBottom, correct, scoreCard, countRemain, mainContainer = null;
var gameMilliSeconds = 0;
var effects = {tick: "tick", correct: "correct", bust: "bust", countdown: "countdown"};
var firstText, secondText;
var score = 0;
var streak = 0;
var uiConfig = {};
function play(f, cb) {
    let effects = document.getElementById("ad" + f);
    effects.play();
    if (cb !== undefined && cb !== null) {
        effects.onended = cb;
    }
}

function first(text, text2) {
    document.getElementById("first").innerText = text;
    document.getElementById("second").innerText = text2;
    firstText = text;
}
function secondColor(name) {
    secondText = name;
    document.getElementById("second").className = cls[c] + " text-center";
}
function second(text) {
    document.getElementById("second").innerText = text;
}
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
function color()
{
    var rand = getRandomInt(100);
    if (rand < 40) c = 0;
    else if (rand >= 40 && rand < 65) c = 1;
    else if (rand >= 65 && rand < 90) c = 2;
    else if (rand >= 90 && rand <= 100) c = 3;
    return map[c];
}

function setup() {
    round++;
    var c1 = color();
    var c2 = color();
    var c3 = color();
    first(c1, c2);
    secondColor(c3);
    c4 = c3;
    c5 = c1;
}

function fnCorrect() {
    stats.outcome.push(1);
    stats.time.push(gameMilliSeconds);
    streak++;
    if (streak > 1 && streak % 10 === 0) gameSeconds += 2;
    var tmpstreak = streak;
    if (tmpstreak > 5) tmpstreak = 5;
    score += (roundScore * tmpstreak);
    showHide(check, "green");
    play(effects.correct, function () {
        correct.style.display = "none";
    });
}
function wrong() {
    stats.outcome.push(0);
    stats.time.push(gameMilliSeconds);
    streak = 0;
    --gameSeconds;
    showHide(cross, "red");
    play(effects.bust, function () {
        correct.style.display = "none";
    });
}
function showHide(text, color, stay) {
    correct.innerText = text;
    correct.style.color = color;
    correct.style.display = "block";
}
function overlay(text) {
    scoreCard.innerText = text;
    divScore.style.display = "block";
    // divScore.onclick = function () {
    //   this.style.display = "none";
    // };
}

function countdown() {
    ageGroup.style.display = "none";
    divCounter.style.display = "block";
    countRemain.innerText = 3;
    gameTimer = setInterval(function () {
        var foo = parseInt(countRemain.innerText);
        if (foo === 0) {
            clearInterval(gameTimer);
            return init();
        } else {
            play(effects.countdown);
            countRemain.innerText = --foo;
        }
    }, 1000);
}

function savestats() {
    var user = {id: firebase.auth().currentUser.uid};

    $.get("/score/" + user.id, function(d) {
        if (d.empty) {
            d['id'] = user.id;
            d['groupId'] = groupId;
            d['score'] = score;
            d['scores'] = [score];
            d['rounds'] = stats.outcome.length;
            d['roundss'] = [stats.outcome.length];
            d['maxStreak'] = stats.outcome.reduce(function (acl, va) {
                if (va === 1) {
                    acl[0]++;
                } else {
                    if (acl[1] < acl[0]) {
                        acl[1] = acl[0];
                        acl[0] = 0;
                    }
                }
                return acl;
            }, [0,0]).pop();
            d['avgTime'] = stats.time.map(function (k, v, a) {
                if (k === 0) return gameSeconds * precision;
                return a[k - 1] - v;
            }).reduce(function (acl, v) { return (acl + v) / 2; }, 0);

        } else {

            d.score = score;
            d.scores.push(score);
            d.rounds = stats.outcome.length;
            d.roundss.push(stats.outcome.length);
            d.maxStreak = stats.outcome.reduce(function (acl, va) {
                if (va === 1) {
                    acl[0]++;
                } else {
                    if (acl[1] < acl[0]) {
                        acl[1] = acl[0];
                        acl[0] = 0;
                    }
                }
                return acl;
            }, [0,0]).pop();
        }

        $.post("/score", d, function (data) {
            console.log(data);
        });
    });
}

function redirect() {
    var isAnonymous = firebase.auth().currentUser.isAnonymous;
    if (!isAnonymous) window.location.href = "https://enter.cognetic.io/welcome.html";
}

function finalSounds() {
    return setInterval(function() {
        play(effects.tick, null);
    }, 1000);
}

var gametimer2 = null;

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function init() {
    //var factor = precision.toString().replace("1", "").length;
    gameMilliSeconds = gameSeconds * 10;
    gametimer2 = null;
    correct.style.display = "none";
    divCounter.style.display = "none";
    dvBottom.style.display = "block";
    setup();
    gameTimer = window.setInterval(function () {
        --gameMilliSeconds;
        gameSeconds = Math.floor(gameMilliSeconds / 10);
        document.getElementById("game-seconds").innerText = (gameSeconds).toString();
        if (gameSeconds <= 5 && gametimer2 === null) {
            gametimer2 = finalSounds();
        }
        if (gameSeconds <= 0) {
            clearInterval(gameTimer);
            clearInterval(gametimer2);
            overlay(score);
            return savestats();
        }
    }, 100);
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function checkCookie() {
    groupId = getCookie("v2groupId");
    if (groupId !== null && groupId.trim().length !== 0) {
        ageGroup.style.display = "none";
        countdown();
    }
    //ageGroup.style.display = "none";
    //mainContainer.style.display = "none";
}

function initListeners()
{

    ageGroup = document.getElementById("ageGroups");
    divScore = document.getElementById("divNumber");
    divCounter = document.getElementById("divCounter");
    dvBottom = document.getElementById("dvBottom");
    correct = document.getElementById("correct");
    scoreCard = document.getElementById("scoreCard");
    countRemain = document.getElementById("countRemain");
    mainContainer = document.getElementById('mainContainer');

    document.getElementsByClassName("btys")[0].onclick = function (ev) {
        if (firstText === secondText) {
            fnCorrect();
        } else {
            wrong();
        }
        setup();
    };
    document.getElementsByClassName("btno")[0].onclick = function (ev) {
        if (firstText !== secondText) {
            fnCorrect();
        } else {
            wrong();
        }
        setup();
    };

}

var handleSignedInUser = function(user) {
    // document.getElementById('user-signed-in').style.display = 'block';
    // document.getElementById('user-signed-out').style.display = 'none';
    // document.getElementById('name').textContent = user.displayName;
    // document.getElementById('email').textContent = user.email;
    // document.getElementById('phone').textContent = user.phoneNumber;
    // if (user.photoURL){
    //     var photoURL = user.photoURL;
    //     // Append size to the photo URL for Google hosted images to avoid requesting
    //     // the image with its original resolution (using more bandwidth than needed)
    //     // when it is going to be presented in smaller size.
    //     if ((photoURL.indexOf('googleusercontent.com') != -1) ||
    //         (photoURL.indexOf('ggpht.com') != -1)) {
    //         photoURL = photoURL + '?sz=' +
    //             document.getElementById('photo').clientHeight;
    //     }
    //     // document.getElementById('photo').src = photoURL;
    //     // document.getElementById('photo').style.display = 'block';
    // } else {
    //     document.getElementById('photo').style.display = 'none';
    // }
    console.log(user);
    return user;
};


/**
 * Displays the UI for a signed out user.
 */
var handleSignedOutUser = function() {
    ui.start('#firebaseui-auth-container', uiConfig);
};


var cls = ["black", "red", "blue", "yellow"];
var db = null; var map = []; var groupId = null;
var stats = { time: [], outcome: [] };

// Initialize Firebase
var config = {
    apiKey: "AIzaSyBd855hO36BuuAXfQcudIM0qXV9X8EIbII",
    authDomain: "cogneticio.firebaseapp.com",
    databaseURL: "https://cogneticio.firebaseio.com",
    projectId: "cogneticio",
    storageBucket: "cogneticio.appspot.com",
    messagingSenderId: "1088761305754"
};

uiConfig = {
    callbacks: {
        signInFailure: function(error) {
            if (error.code !== 'firebaseui/anonymous-upgrade-merge-conflict') {
                return Promise.resolve();
            }
            // The credential the user tried to sign in with.
            var cred = error.credential;
            // Copy data from anonymous user to permanent user and delete anonymous
            // user.
            // ...
            // Finish sign-in after data is copied.
            return firebase.auth().signInWithCredential(cred);
        },
        signInSuccessWithAuthResult: function(result, redirectUrl) {
            var cu = firebase.auth().currentUser;
            if (cu.isAnonymouse) {
                cu.linkAndRetrieveDataWithCredential(result.credential).then(function (usercred) {
                    var user = usercred.user;
                    console.log("Anonymous account successfully upgraded", user);
                }, function (error) {
                    console.log("Error upgrading anonymous account", error);
                });
            }

            // var credential = result.credential;
            // var user = result.user;
            //var credential = firebase.auth.GoogleAuthProvider.credential(googleUser.getAuthResponse().id_token);
            //return firebase.auth().signInWithCredential(cred);
            return false;
        }
    },
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: 'popup',
    //autoUpgradeAnonymousUsers: true,
    signInSuccessUrl: '//enter.cognetic.io/',
    'signInOptions': [
        {
            provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            // Required to enable this provider in One-Tap Sign-up.
            authMethod: 'https://accounts.google.com/',
            // Required to enable ID token credentials for this provider.
            clientId: "1088761305754-vs9ef46o0iijs0059ccfbu7prfcttb6o.apps.googleusercontent.com"
        },
        {
            provider: firebase.auth.FacebookAuthProvider.PROVIDER_ID,
            scopes :[
                'public_profile',
                'email'
            ]
        }
    ],
    // Terms of service url.
    'tosUrl': 'https://www.google.com',
    // Privacy policy url.
    'privacyPolicyUrl': 'https://www.google.com',
    'credentialHelper': firebaseui.auth.CredentialHelper.ACCOUNT_CHOOSER_COM
};

var signInWithPopup = function() {
    window.open(getWidgetUrl(), 'Sign In', 'width=985,height=735');
};

var setAgeGroup = function() {
    groupId = $(this).data('group');
    setCookie("v2groupId", groupId, 365);
    countdown();
};

var signInWithRedirect = function() {
    window.location.assign(getWidgetUrl());
};

var initAuth = function() {
    ui = new firebaseui.auth.AuthUI(firebase.auth());
    ui.disableAutoSignIn();

    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
    firebase.auth().onAuthStateChanged(function (user) {
        user ? handleSignedInUser(user) : handleSignedOutUser();
    });
}

var authUiReset = function() {
    ui.reset();
    ui.start('#firebaseui-auth-container', uiConfig);
};

var initDb = function() {

    var ref = location.hash;
    if (ref === undefined || ref === null || ref.trim() === "") {
        ref = "#en";
    }

    var lang = ref.replace("#", "");

    $.get("/colors", function (data) {
        map = data.colors[lang];
    });
};


/ success callback when requesting audio input stream
function gotStream(stream) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var audioContext = new AudioContext();

    // Create an AudioNode from the stream.
    var mediaStreamSource = audioContext.createMediaStreamSource( stream );

    // Connect it to the destination to hear yourself (or any other node for processing!)
    mediaStreamSource.connect( audioContext.destination );
}
