var $now = $(".now");
var $start = $(".start");
var $end = $(".end");
var $paper = $("#paper");
var $repeat = $("#repeat");
var $window = $("#window");
var $ele;
var progress = 0;
$start.html("00:00");
$end.html("03:00");

function move(p){
	$now.css("width", p.toFixed(3) * 100 + "%");
}

$(".progress-bar").click(function(){
	let coordStart = this.getBoundingClientRect().left;
	let coordEnd = event.pageX;
	progress = (coordEnd - coordStart)/this.offsetWidth;
	move(progress);
	start();
});

var synth = new ABCJS.synth.CreateSynth();
var audioContext = window.AudioContext // Default
					|| window.webkitAudioContext
					|| false;
if(!audioContext) alert("No AudioContext!");
var myContext = new audioContext();
var visualObj;
var timer;
var pre_eles = [];
var vars = getUrlVars();
var fileName = vars["file"].split("/").pop().split(".")[0];
document.title =  decodeURIComponent(fileName);

function clearColor(){
	if(pre_eles){
		pre_eles.forEach(function(ele){
			$(ele).css("fill", "#000000");
		});
	}
}

function evcb(ev){
	clearColor();
	if(ev==null) return;
	eles = ev.elements;
	console.log(ev.elements);
	
	if(ev.elements[0]){
		ev.elements[0].forEach(function(ele){
			$(ele).css("fill", "#80ff00");
		});}
	pre_eles = ev.elements[0];
}

function btcb(beatnum, totalBeats, totalTime){
	move(beatnum/totalBeats);
	$start.html(conversion(beatnum/totalBeats*totalTime/1000));
	if(beatnum == totalBeats && $repeat.is(":checked")){
		start();
	}
}

function conversion(value){
	var minute = Math.floor(value/60);
	minute = minute.toString().length == 1?('0'+minute.toString()):minute.toString();
	var second = Math.round(value%60);
	second = second.toString().length == 1?('0'+second.toString()):second.toString();
	return minute + ":" + second;
}

function stop(){
	clearColor();
	if(synth) synth.stop();
	if(timer) timer.stop();
	timer = null;
}

function start(){
	stop();
	timer = new window.ABCJS.TimingCallbacks(visualObj[0], {
				eventCallback:evcb,
				beatCallback:btcb,
	});
	synth.start();
	timer.start();
	if(progress != 0){
		timer.setProgress(progress);
		synth.seek(progress);
	}
}
// Return url parameters, [key]val 
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}
function calcPitch(ele){
	var ps = [];
	var keys = ["C","D","E","F","G","A","B"]
	if(ele.hasOwnProperty("rest")){
		return "Rest";
	}
	if(ele.hasOwnProperty("pitches")){
		ele.pitches.forEach(function(p){
			var acc = ""
			if(p.hasOwnProperty("accidental")){
				if(p.accidental == "flat") acc = "b";
				if(p.accidental == "sharp") acc = "#";
			}
			var scale = 4 + Math.floor(p.pitch/7);
			var key = p.pitch%7;
			if(key<0) key += 7;
			var res = keys[key] + acc + scale.toString();
			ps.push(res);
		});
		return ps.join(",");
	}
}
function calcDuration(ele){
	var res;
	var duration = ele.duration*10000;
	if(duration % 10000 == 0){
		res = duration/10000;
		return res.toString()
	}else if(duration % 5000 == 0){
		res = duration/5000;
		return res.toString()+"/2"
	}else if(duration % 2500== 0){
		res = duration/2500;
		return res.toString() + "/4";
	}else if(duration % 1250 == 0){
		res = duration/1250;
		return res.toString() + "/8";
	}else if(duration % 625 == 0){
		res = duration/625;
		return res.toString() + "/16";
	}
	return "Null";
}

function clickListener(abcelem, tuneNumber, classes, analysis, drag, mouseEvent) {
	if($ele) $ele.css("fill", "#000000");
	var ele = abcelem;
	$ele = $(ele.abselem.elemset);
	var rect = $ele[0].getBoundingClientRect();
	if($window.css("display") == "none"){
		$ele.css("fill", "#5577ee");
		$window.css({"display":"", "top":rect.top+rect.height+$(window).scrollTop() , "left":rect.left});
		$window.find("#pitch").html(calcPitch(ele));
		$window.find("#duration").html(calcDuration(ele));
	}else{
		$window.css("display","none");
		$ele.css("fill", "#000000");
	}
	//$window.css({"display":"", "top":rect.top , "left":rect.left});
}

var thedata;
function genMiDiDownload(){
	var script = document.createElement('script');
	script.onload = function () {
	    //do stuff with the script
	    window.ABCJS.renderMidi("midi-download", thedata, { generateDownload: true, generateInline: false });
		//ABCJS.synth.getMidiFile(abc, {midiOutputType: 'encoded'})[0]
	};
	script.src = "abcjs_midi_6.0.0-beta.16-min.js";
	document.head.appendChild(script);
}

$.get(vars["file"], function(data){
	thedata = data;
	visualObj = window.ABCJS.renderAbc("paper", data, { clickListener: clickListener, responsive:"resize" });
	genMiDiDownload();
	/*var width = $("svg").attr("width"); var height = $("svg").attr("height");
	
	$("svg").attr("viewBox", "0 0 " + width.toString() + " " + height.toString()).attr("preserveAspectRatio", "xMinYMin slice");
	$("svg").attr("width", window.innerWidth);
	$("svg").attr("height", window.innerWidth*height/width);
	$paper.css("height","auto");*/
	synth.init({
	    audioContext: myContext,
	    visualObj: visualObj[0],
	    options: {
	        soundFontUrl: "https://gleitz.github.io/midi-js-soundfonts/MusyngKite/banjo-mp3.js",
	        pan: [ -0.3, 0.3 ] 
	    }
	}).then(()=>{
		synth.prime();
		$end.html(conversion(synth.duration));
	});

	$("#start").click(function(){
		progress = 0;
		start();
	});
	$("#stop").click(function(){
		stop();
		$start.html("00:00");
		progress = 0;
		move(0);
	});
	$("#pause").click(function(){
		if(!timer) return;
		synth.pause();
		timer.pause();
	});
	$("#resume").click(function(){
		if(!timer) return;
		if(!timer.isPaused) return;
		synth.resume();
		timer.start();
	});
});
