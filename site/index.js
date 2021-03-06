var colWidth = 220; 
var $input = $("#input");
var $searchBtn = $("#searchBtn");
var $randomBtn = $("#randomBtn");
var $resetBtn = $("#resetBtn");
var file_name = "../data/data.json";

//var $listDiv = $("#listContainer");
var $listDiv = $("#listDiv");
var $listContainer = $("#listContainer");
var $list_temp = $(".list_temp").clone();
$(".list_temp").remove();
var theData;
var curData;
var simpleBar;
var msry;
var height = $listContainer.css("height");

var abc_url = "abcjs.html";

function doMasonry(){
	msry = $listDiv.masonry({
        // options
        itemSelector: '.grid-item',
        columnWidth: 240,
    });
}

function doSimpbar(){
	$listContainer.css("height", height);
	simpleBar = new SimpleBar($listContainer[0]);
	simpleBar.recalculate();
}

function genList(content){
	//console.log(content);
	//thedata = JSON.parse(content);
	curData = content;
	if(msry!=null) msry.masonry("remove", $listDiv.children());
	$listDiv.children().remove();
	curData.forEach(function(song, idx){
		var $list_item = $list_temp.clone();
		$list_item.find(".idx").html(song["index"] + ". ");
		$list_item.find(".name").html(song["name"]);
		$list_item.attr("data-url", song["url"]);
		$listDiv.append($list_item);
		//msry.masonry("addItems", $list_item);
	});
	if(msry!=null) {msry.masonry("addItems", $listDiv.children());msry.masonry();}
}

function search(string){
	var res = [];
	if(string.trim() == ""){ 
		return;
	}else{
		theData.forEach(function(item, idx){
			if(item.name.includes(string))
				res.push(item);
			/*
				for(var ele of item){
					if(ele.includes(string)){
						res.push(item);
						break;
					}
				}
			});*/
		});
		genList(res);
		//doMansry();
		//doSimpbar();
	}
}

function randomClick(){
	var len = curData.length;
	var idx = Math.floor(Math.random() * len);
	var item = curData[idx]
	openAbc(item.url);
}

function searchClick(){
	var val = $input.val();
	search(val);
	$input.val("");
	$input.blur();
}

function resetClick(){
	genList(theData);
}

function addListener(){
	$searchBtn.click(function(){
		searchClick();
	});

	$resetBtn.click(function(){
		resetClick();
	});

	$randomBtn.click(function(){
		randomClick()
	});

	$listDiv.on("click", ".list_temp", function(){
		openAbc($(this).attr("data-url"));
	});
}

function openAbc(file){
	var url = abc_url + "?file=" + file;
	console.log(url);
	window.open(url, '_blank');
}

$(function(){
	$.get(file_name, function(data){
		console.log(data);
		theData = data;
		doSimpbar();
		genList(data);
		doMasonry();
		addListener();
	});
});	