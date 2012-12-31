var limit = mainConf.searchParams.limit;
var yakImages = new Array ( 
		"/images/yakfav.png", 
		"/images/markers/type1.png", 
		"/images/markers/type2.png", 
		"/images/markers/type3.png", 
		"/images/markers/type4.png", 
		"/images/markers/type5.png" 
);
var subSize = mainConf.searchParams.subSize;
var currentPage = 1;
// French
$.timeago.settings.strings = {
   // environ ~= about, it's optional
   prefixAgo: "il y a",
   prefixFromNow: "d'ici",
   seconds: "moins d'une minute",
   minute: "environ une minute",
   minutes: "environ %d minutes",
   hour: "environ une heure",
   hours: "environ %d heures",
   day: "environ un jour",
   days: "environ %d jours",
   month: "environ un mois",
   months: "environ %d mois",
   year: "un an",
   years: "%d ans"
   //gerterter
};

function setLiveUpdateTrigger()
{
	if ($("#feedContent #liveupdate").length > 0)
		return;

	var urltosearch = '/api/geoinfos/48.851875/2.356374/5/null/0/1,2,3,4/null/10/0';

	$("#feedContent .hidden").remove();

	var liveupdate = $("<div />");

	var itemsCount = 0;

	liveupdate.attr("id", "liveupdate");

	liveupdate.click(function(){
		$("#feedContent .hidden").removeClass("hidden");
		$("#feedContent #liveupdate").remove();
	});

	$.getJSON(urltosearch ,function(data) {

		itemsCount = data.data.info.length;

		$.each(data.data.info, function(key,val) {
			var item = createFeedPageItem(val);
			item.addClass("hidden");
			
			$("#liveupdate").after(item);
		});

		liveupdate.html(itemsCount + " more news, click here to load");
	});

	
	$("#feedContent").prepend(liveupdate);
}



$(document).ready(function() {
	$('.typeahead').typeahead();
	$('.btn-group1').button();
	triggerSearch(currentPage, 0);

	//for testing
	loadTops();
	
});

$(".btn-group1").click(function(){
	setTimeout(function(){ triggerSearch(currentPage, 0) }, 1000);	
});

$(".next").click(function(){
	currentPage = currentPage + 1;
	var skip = (currentPage - 1)*limit;
	triggerSearch(currentPage, 1);
});
		
$(".searchButton").click(function(event, currentpage, next){

	if(event.which)
	{
		currentPage = 1;
		$("#feedContent").html("");
	}

	var x1 = $("#locationChooser .zoneLoc").eq(0).attr("lat");

	var y1 = $("#locationChooser .zoneLoc").eq(0).attr("lng");

	var x2 = mainConf.searchParams.sliderDefault;

	var y2 = "null";

	var heat = 0;

	var type = "1,2,3,4";

	var str = $("#SearchWhat").attr("value");
	if ($.trim(str) == "") {
		str = "null";
	};

	var skip = (currentPage - 1)*limit;

	loadData(x1, y1, x2, y2, heat, type, str, limit, skip, next);

});
		
//function loadData(askip, alimit, next, _id, what, where, yaktype, dateInterval, cattype, dimension)
function loadData(x1, y1, x2, y2, heat, type, str, limit, skip, next)
{
	if (!next) {
		$("#feedContent").html("loading...");
	};

	if (next == 1)
	{
		$(".next").hide();
		$("#loading").html("loading...");
	}
	
	// searching throuhg cirle 
	//variables to be used x1/y1/x2/y2/heat/type/str/limit/skip
	var urltouse = 'api/geoinfos/';
	urltouse += x1 + "/" // x1;
	urltouse += y1	 + "/" // y1;
	urltouse += x2 + "/" // x2;
	urltouse += y2 + "/" // y2;
	urltouse += heat + "/" // heat;
	urltouse += type + "/" // type;
	urltouse += str + "/" // str;
	urltouse += limit + "/"  // limit;
	urltouse += skip + "/" // skip;
	$.getJSON(urltouse ,function(data) {
	
		var len = data.data.info.length;
		
		if(len == 0)
			$("#newsLoader").css("visibility", "hidden");

		if(next == 1 && data.data.info.length == 0)
		{
			$("#loading").html("no more results to load");
			return;
		}
		if (!next) {
			$("#feedContent").html("");
		};
	
		var item, title, content, address, more, postedby, date, type, cat, img, outlink, hot, ago, yakimage;
		//alert(data.info.length);
		
		$.getJSON('/api/afeed', { id: getVcode("id", window.location)} ,function(data1) {
		//console.log(data1);
		
		
		data = mergeDeep(data, data1);
			//console.log(data);
		$.each(data.data.info, function(key,val) {
			/*define item element*/
			
			var item = createFeedPageItem(val);
			//var item2 = item;
			if(next != 1)
				$("#feedContent").prepend(item);
			else
				$("#feedContent").append(item);

			//for testing 
			//$("#topsFeed").prepend(item2);

			$("#resultSet").html(currentPage);
			$(".next").show();
			$("#loading").html("");
			
		});
		setClickableArea();
		setshortUrl();
	    setInterval("setLiveUpdateTrigger()", 30000);

		$("abbr.timeago").timeago();
		if(typeof(data1.info) === 'undefined')
		{
			
		}
		else
		{
			if(data1.info.length == 1)
					colorFirstRecord();
		}
		});
	});
}

//for testing
function loadTops()
{
	var urltouse = '/api/geoinfos/48.851875/2.356374/5/null/0/1,2,3,4/null/10/0';
	/*urltouse += x1 + "/" // x1;
	urltouse += y1	 + "/" // y1;
	urltouse += x2 + "/" // x2;
	urltouse += y2 + "/" // y2;
	urltouse += heat + "/" // heat;
	urltouse += type + "/" // type;
	urltouse += str + "/" // str;
	urltouse += skip + "/" // skip;
	urltouse += limit // limit; */

	$.getJSON(urltouse ,function(data) {
		$.each(data.data.info, function(key,val) {
			var item = createTopsItem(val);
			$("#topsFeed").prepend(item);
		});
	});

}


