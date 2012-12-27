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

function createFeedPageItem(val)
{
	item = $("<div />");
			item.attr("class", "myitem");

			/*define title element*/
			title = $("<div />");
			title.attr("class", "title");
			title.html("<img class='PersonImg' src='" + "/images/yakfav.png"+ "' />");

			/*create more linked element for title*/
			more = $("<a />");
			more.attr("class", "more");
			more.attr("href", val.outGoingLink);
			more.attr("target", "_blank");
			more.attr("rel", val._id);
			more.attr("data-toggle", "data-toggle");
			more.html(val.title);

			/*create posted by element*/
			postedby = $("<div />");
			postedby.attr("class", "postedby");
			/*convert date to french date*/
			date = new Date(val.pubDate).toLongFrenchFormat();

			if(val.origin != null)
				postedby.html("Posté par @" + val.origin + " le " + date);
			else
				postedby.html("Posté by @ananomys le " + date);

			//postedby.html(postedby.html().replace(/@(\S*)/g,'<a href="news/map/search/@$1">@$1</a>'))
			postedby.html(postedby.html().replace(/@(\S*)/g,'<a onclick="setSearchFor(this)">@$1</a>'));

			/*create hot level element*/
			hot = $("<div />");
			hot.attr("class", "hot");
			hot.append("<div class='hotLevel' style='width: " + val.heat + "%'></div>");
			
			/*create time ago element*/
			ago = $("<abbr />");
			ago.attr("class", "timeago");
			ago.css("float", "right");
			ago.css("marginRight", "8px");
			ago.css("fontSize", "11px")
			ago.attr("title", val.pubDate);

			/*create the yak image element*/
			yakimage = $("<span />");
			yakimage.html("<img class='yakImg' src='" + yakImages[val.yakType] + "' />");

			
			
			/*create info image*/
			img = $("<img />");
			img.attr("class", "img");
			img.attr("src", conf.backurl + val.thumb.replace("\/", "/"));
			
			/*create the read from source link*/
			outlink = $("<div />");
			outlink.html("<a></a>");
			outlink.find("a").attr("href", val.outGoingLink);
			outlink.find("a").attr("target", "_blank");
			outlink.find("a").html("read from source");

			/*create the expand button the +*/
			readmore = $("<a />");
			readmore.attr("class", "expand");
			readmore.css("cursor", "pointer");
			readmore.css("marginLeft", "12px");
			readmore.click(function(){

				var loading = $("<span />");

				loading.html("loading...");

				var readmore1 = $(this);

				readmore1.after(loading);

				readmore1.css("visibility", "hidden");

				$.getJSON('/api/afeed', { id: val._id} ,function(data) {

					var youtubes = findUrls(data.info[0].content);

					if (youtubes.length > 0) {

						for (var i = 0; i< youtubes.length; i++) {
							readmore1.parent().after('<a href="' + youtubes[i] +'" target="_blank" style="margin-right: 12px"><img src="http://img.youtube.com/vi/' + getVcode("v", youtubes[i])  + '/1.jpg" style="border: 0px;"></a>');	
						};
					};

					readmore1.parent().html(data.info[0].content.linkify());
				});	
			});
			readmore.html("+");

			/*create the content element*/
			content = $("<div />");
			content.attr("class", "content");
			content.html("<div class='theContent'>" + val.content.substring(0, subSize) + "</div>");
			
			/*place image in content*/
			content.prepend(img);
			/*append the read more*/
			content.find(".theContent").append(readmore);

			content.append("<br />");
			
			/*create the types elements*/
			type = $("<div />");
			type.attr("class", "type");
			type.html("Type: " + val.yakType);

			/*create the cats elements*/
			cat = $("<div />");
			cat.attr("class", "cat");
			var yakCatNames = "";
			$.each(val.yakCatName, function(key, val){
				yakCatNames += "#" + val + " "
			});
			//yakCatNames = yakCatNames.replace(/#(\S*)/g,'<a href="news/map/search/%23$1">#$1</a>');
			cat.html(yakCatNames.linkify("/news/map/search/%23", 1));

			/*create the freetags element*/
			freetags = $("<div />");
			freetags.attr("class", "freetags");
			var freetagNames = "";
			$.each(val.freeTag, function(key, val){
				freetagNames += "#" + val.replace(" ", "&nbsp;") + " "
			});
			//freetagNames = freetagNames.replace(/#(\S*)/g,'<a href="news/map/search/%23$1">#$1</a>');
			freetags.html(cat.html() +freetagNames.linkify("/news/map/search/%23", 1));

			/*create the address element*/
			address = $("<div />");
			address.attr("class", "address");
			address.html(val.address);

			/*append the more yakimage ago and posted by to title*/
			title.append(more);
			title.append(yakimage);
			title.append(ago);
			title.append(postedby);

			/*append title to item*/
			item.append(title);
			content.append(address);
			content.append("<div class='shareMe'>Partager <i class='icon-share' title='Share Me'></i></div>");
			item.append(content);
			item.append(freetags);

			return item;
}

function setSearchFor(el)
{
	$("#SearchWhat").val($(el).text().substring(1, $(el).text().length));
	triggerSearch(currentPage, 0);
}

function colorFirstRecord()
{
	//alert("fdsfsd");
	$("#feedContent").find(".myitem").eq(0).css("background", "#DEDEDE");
}

function mergeDeep(o1, o2) {
    var tempNewObj = o1;

    //if o1 is an object - {}
    if (o1.length === undefined && typeof o1 !== "number") {
        $.each(o2, function(key, value) {
            if (o1[key] === undefined) {
                tempNewObj[key] = value;
            } else {
                tempNewObj[key] = mergeDeep(o1[key], o2[key]);
            }
        });
    }

    //else if o1 is an array - []
    else if (o1.length > 0 && typeof o1 !== "string") {
        $.each(o2, function(index) {
            if (JSON.stringify(o1).indexOf(JSON.stringify(o2[index])) === -1) {
                tempNewObj.push(o2[index]);
            }
        });
    }

    //handling other types like string or number
    else {
        //taking value from the second object o2
        //could be modified to keep o1 value with tempNewObj = o1;
        tempNewObj = o2;
    }
    return tempNewObj;
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



function triggerSearch(currentPage, ismore)
{
	$('.searchButton').trigger('click', [currentPage, ismore]);
}

function setClickableArea()
{
	/*$(".more").click(function(e){

		e.preventDefault();

		var relid = $(this).attr("rel");

		$("#myModal").html("");

		$("#myModal").load("/news/loadingModal", function(){

			$("#myModal").modal();

			$('#myModal').on('shown', function () {
				$.getJSON('/api/afeed', { id: relid} ,function(data) {

					$("#myModalLabel").html(data.info[0].title);

					$(".modal-body").html("<div>" + data.info[0].content + "</div>");

				});	
			})
		});
		
	});*/
}


function setRefreshNews()
{

if($("#newsLoader").css("visibility") == "visible")
	return;
else
	{
		
		$("#newsLoader").css("visibility", "visible");

		$("#newsLoader").click(function(){

			var _id = $("#feedContent .more").eq(0).attr("rel");
			//alert(_id);

			$(".graybg").attr("class", "myitem");

			$("#newsLoader").html('Downloading please wait <i class="icon-download"></i>');

			var what = $("#locationInput").val();
			var where = $("#SearchWhere").val();
			var yaktype = "";
			$(".searchTypes active").each(function(){
				yaktype += $(this).attr("type") + ",";
			});

			loadData(0, 0, limit, 2, what , where, yaktype);

			//loadData(0, 0, limit, 2, _id, 1);

			$("#newsLoader").html('More recent news to load click here to refresh <i class="icon-refresh"></i>');

			$("#newsLoader").css("visibility", "hidden");

		});
	}
}

function setshortUrl()
{

	$(".icon-share").mouseenter(function(){
		if ($(this).find("span").length == 0) {
			$(this).prepend('<span>&nbsp;&nbsp;&nbsp;&nbsp;Loading</span>');
		};
		if ($(this).find(".buttons").length == 0) {
			var more = $(this);
			$.getJSON("https://api-ssl.bitly.com/v3/shorten?", 
	        { 
	            "format": "json",
	            "apiKey": "R_99c6f442bb006c1b26237dd9ef91ddda",
	            "login": "o_5ko6l8pajb",
	            "longUrl": conf.fronturl + "/news/feed/?id=" + more.parent().parent().parent().find(".more").attr("rel")
	        }, function(data){
	        	more.parent().parent().parent().find(".more").attr("title", data.data.url);
	        	setShare(more);
	        }
	        
			);
		}
	});
    
}

function serCurrentSearchInfo()
{
	if ($("#SearchWhat").val() != "") {
		$(".searchingWhat").html(" " + $("#SearchWhat").val() + " ");	
	}
	else
	{
		$(".searchingWhat").html(" tous les infos");
	}
	
	if ($(".searchingWhere").val() == "") {
		$(".searchingWhere").html(" " + $("#myfavplace li").eq(0).find("span").html());
	}
	
	$(".searchingDays").html($("#dayPrinter").html());

}



