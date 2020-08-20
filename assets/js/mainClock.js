var songExpectedTime = 100;
var songTimeLeft = 999;
var metaAudioOffset = 0;
var audio = document.getElementById("audio");
var throttleSongChange = false;
var safetyWindow = 5;
var mainLoopThrottle = 1000;

$(document).ready(() => {
    $.ajax({
        url: "https://ampupradio.com/state",
        dataType: "text",
        success: function (data) {
            songExpectedTime = Math.floor(parseInt(data)); // expected time drops with the loop while songTimeLeft updates approx <=5 times per song
            songTimeLeft = Math.floor(parseInt(data));
        }
    });
    var syncTimer; 
    audio.onwaiting = () => {//when audio starts loading
        syncTimer = setInterval(() =>{
            metaAudioOffset++; // count amount of seconds taken to load audio
        },1000);
    }
    audio.oncanplay = () => {//when audio is ready to be played (used instead of isplaying event incase user pauses audio while loading)
        clearInterval(syncTimer);
    }
    audio.src = "https://ampupradio.com:8000/stream.mp3";   
    mainLoop(); 
});

var mainLoop = () => { //main loop 
    setTimeout(function () {
        if(songExpectedTime <= safetyWindow && !throttleSongChange){
            throttleSongChange = true;

            //variable change to make changes happen on 0 is time = songExpectedTime - safetyWindow => new time = time + safetyWindow => delay everything by safetywindow
            

            //Time of change of song on server = songExpectedTime - safetyWindow
            setTimeout(() => { //catch song changes on the server  
                $("#songChanged").text("song changed on the server");
            }, (safetyWindow-1)*1000);

            //Time of change of song on client = songExpectedTime - safetyWindow
            setTimeout(() => { //using offset calculated to catch song changes on client 
                $("#songChanged").text("song changed on the client");
                throttleSongChange = false;
            }, (metaAudioOffset+safetyWindow-1)*1000);

            //reset text after 5 seconds of everything
            setTimeout(() => { //reset 
                $("#songChanged").text("time to wait again");
            }, (metaAudioOffset+safetyWindow+5)*1000);
        }

        //reduce amount of calls to file (max amount of calls to state file is 5)
        if (songExpectedTime < songTimeLeft / 2) { // update the timer to current time left on the song 
            $.ajax({
                url: "https://ampupradio.com/state",
                dataType: "text",
                success: function (data) {
                    songExpectedTime = Math.floor(parseInt(data));//set songExpectedTime to correct any drift
                    songTimeLeft = Math.floor(parseInt(data));//parse to int just to improve performance (thought that it would have to parse string to int on every loop so better be safe)
                }
            });
        }
        songExpectedTime = songExpectedTime - (mainLoopThrottle + 50)/1000; //rounding issues with firefox, use 1050 ms instead of 1000
        mainLoop();
    }, mainLoopThrottle + 50)
}




function secondsToHms(d) { //function for watching time
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    var hDisplay = h > 0 ? h + (h == 1 ? " hour: " : " hours: ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute: " : " minutes: ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return hDisplay + mDisplay + sDisplay;
}