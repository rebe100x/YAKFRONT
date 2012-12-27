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

$(document).ready(function() {
	$('.typeahead').typeahead();
	$('.btn-group1').button();
	triggerSearch(currentPage, 0);
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

	var skip = (currentPage - 1)*limit;
	var yaktype = "";
	var dateInterval = "";

	if($("#daynumber").val() =="" || $("#daynumber2").val() == "")
	{
		dateInterval = "3,3";
	}
	else
	{
		dateInterval = $("#daynumber2").val() + "," + $("#daynumber").val();
	}
	
	$(".searchTypes .active").each(function(){
		yaktype += $(this).attr("type") + ",";
	});

	var geoLocation = "";

	if ($("#wheretosearch").val() == "") {
		geoLocation = $("#myfavplace li").eq(0).attr("lat") + "," + $("#myfavplace li").eq(0).attr("lng") + "-";
	}
	else
	{
		geoLocation = $("#wheretosearch").val();
	}

	var dimension = "";

	if ($("#dimensionInput").val() == "") {
		dimension = mainConf.searchParams.sliderDefault;
	}
	else
	{
		dimension = $("#dimensionInput").val();
	}
	
	var lngslatstr = "";
	loadData(skip, limit, next , "", $("#SearchWhat").attr("value"), geoLocation, yaktype, dateInterval, "", dimension);
	serCurrentSearchInfo();
});
		
function loadData(askip, alimit, next, _id, what, where, yaktype, dateInterval, cattype, dimension)
{
	if (!next) {
		$("#feedContent").html("loading...");
	};

	if(typeof(what)==='undefined') what = '';
	if(typeof(where)==='undefined') where = '';
	if(typeof(yaktype)==='undefined') yaktype = '';
	if(typeof(cattype)==='undefined') cattype = '';
	if(typeof(next)==='undefined') next = 0;
	if(typeof(dimension)==='undefined') dimension = mainConf.searchParams.sliderDefault;

	var currentPage = parseInt($("#resultSet").html().trim());
	currentPage = currentPage + 1;

	var skip = (currentPage - 1)*limit;

	if (next == 1)
	{
		$(".next").hide();
		$("#loading").html("loading...");
	}

	$.getJSON('/api/feeds', { skip: askip, limit: alimit,  yaktype: yaktype, _id: _id, what: what, where: where, dateInterval: dateInterval, cattype: cattype, next: next, dimension: dimension} ,function(data) {
	
		var len = data.info.length;
		
		if(len == 0)
			$("#newsLoader").css("visibility", "hidden");

		if(next == 1 && data.info.length == 0)
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
		$.each(data.info, function(key,val) {
			/*define item element*/
			
			var item = createFeedPageItem(val);
			if(next != 1)
				$("#feedContent").prepend(item);
			else
				$("#feedContent").append(item);

			$("#resultSet").html(currentPage);
			$(".next").show();
			$("#loading").html("");
			
		});
		setClickableArea();
		setshortUrl();

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




