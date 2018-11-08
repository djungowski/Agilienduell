var retrys = 0;

var WSPort = 8081;
var IP = (location.host +"").split(":")[0];
var isWebsocketConnected = false;
var connTimer = null;
var sounds = true;
var ws;
var display = true;
var audio = null;
var serverSound = false;
var isFinalMode = false;
var player2 = false;
var runde = 1;

var viewOnly = false;
if(window.location.href.indexOf("viewonly")!==-1) {
	ip = window.location.href.split("ip=")[1];
	viewOnly = true;
}

$(document).ready(function() {
	$("#displayBtn").click(function() {
		$("#frame").hide();
		$("#startDiv").hide();
		$("#display").show();
		$(".controller").hide();
		$("#blackScreen").show();
		$("#connected").hide();
	});

	$("#controllerBtn").click(function() {
		$("#startDiv").hide();
		$("#display").show();
		$(".controller").show();
		$('#frame').remove();
		display = false;
	});

	$("#clearAllFailsBtn").click(function() {
		wsSend("clearAllFailsBtn", "");
	});

	$("#toggleSoundImg").click(function() {
		wsSend("toggleSound", "");
	});

	$("#serverSoundImg").click(function() {
		if(serverSound) {
			serverSound = false;
			$("#serverSoundImg").attr("src", "./img/noSound.png");
			if(audio != null)
				audio.pause();	
			if(intro != null)
				intro.pause();
		} else {
			serverSound = true;
			$("#serverSoundImg").attr("src", "./img/SoundOn.png");	
		}
	});
	init_xmarker();
	connectWs();

	if(viewOnly) {
		$("#displayBtn").click();
	}
});
	
	
var connectWs = function() {
	ws = new WebSocket('ws://'+IP+':'+WSPort);

	ws.onopen = function()
	{
		$("#notConnected").hide();
		$("#connected").text("Verbunden mit: "+'ws://'+IP+':'+WSPort);
		$("#connected").show();
		isWebsocketConnected = true;
		loadQuestions();
		//console.log("connected to Websocket Server!!!");
	}

	ws.onclose = function()
	{
		$("#notConnected").show();
		isWebsocketConnected = false;
		//console.log("disconnected from Websocket Server!!!");
		return null;
	}

	ws.onmessage = function (event) {
		console.log("msg: "+event.data)
		messageParts_a = event.data.split("###");
		var key = messageParts_a[0];
		var value = messageParts_a[1];
		if(key =="setFail") {
			if($(".marker"+value).css("color") == "rgb(127, 115, 115)") {
				$(".marker"+value).css("color","rgb(211, 16, 16)");
				if(sounds && (display || serverSound)) {
					audio = new Audio('./sounds/fail.mp3');
					audio.play();
				}
			} else {
				$(".marker"+value).css("color","rgb(127, 115, 115)");
			}
		} else if(key == "clearAllFailsBtn") {
			$.each($(".xmarker").find("span"), function() {
				$(this).css("color","rgb(127, 115, 115)");
			});
		} else if(key == "toggleSound") {
			if(sounds) {
				$("#toggleSoundImg").attr("src", "./img/noSound.png");
				if(audio != null)
					audio.pause();
				sounds = false;
			} else {
				$("#toggleSoundImg").attr("src", "./img/soundOn.png");
				sounds = true;
			}
		} else if(key == "file") {
			if(value == "fragen.txt") {
				try {
					var base64 = decodeURIComponent(atob(messageParts_a[2]));
					fragen = JSON.parse(base64);
					fillFragenEditor();
					fillFragenSelect();
				} catch(e) {
					console.log("Datei "+value+" konnte nicht geparsed werden!");
				}
			}
		} else if(key == "loadQuestion") {
			if(!(display && isFinalMode))
				loadQuestionToGui(value);
		} else if(key == "setAnswer") {
			setAnswer(value, messageParts_a[2]);
		} else if(key == "setAnz") {
			setAnz(value, messageParts_a[2]);
		} else if(key == "showIntro") {
			showIntro();
		} else if(key == "hideIntro") {
			hideIntro();
		} else if(key == "setIntroVolume") {
			introVolume = value;
			if(intro != null)
				intro.volume = introVolume;
		} else if(key == "setLeftPoints") {
			setLeftPoints(value);
		} else if(key == "setRightPoints") {
			setRightPoints(value);
		} else if(key == "startAnswerFail") {
			startAnswerFail();
		} else if(key == "setAnswerFailVolume") {
			answerFailVolume = value;
			if(answerFail != null)
				answerFail.volume = answerFailVolume;
		} else if(key == "startSchweinchen") {
			startSchweinchen();
		} else if(key == "stopSchweinchen") {
			stopSchweinchen();
		} else if(key == "setSchweinchenVolume") {
			schweinchenVolume = value;
			if(schweinchen != null)
				schweinchen.volume = schweinchenVolume;
		} else if(key == "toggleBlackScreen") {
			// if(display) {
			// 	$("#blackScreen").toggle();
			// }
		} else if (key == "toggleFinalMode"){
			setFinalMode(value);
		}
        else if (key == "setPlayer2ForFinalMode"){
            setPlayer2(value);
        }
        else if (key == "setRunde"){
            console.log('Set Runde to ' + value);
            setRunde(value);
        }
	}
}

function wsSend(key, msg)
{
	console.log("send", key, msg);
	if(isWebsocketConnected)
		ws.send(key+"###"+msg);
}

