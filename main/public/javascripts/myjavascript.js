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
	$("html, body").animate({ scrollTop: 0 }, "slow");
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
//var socket = io.connect('http://localhost:3000');


		
/*READY FUNCTIONS*/	
$(document).ready(function() {

	
	
	/*bootstrap alert plugin*/
	$(".alert").alert();
	
	/*top locator button which pops up the locatorChooser popup*/
	$('#zoneLocButton').click(function(){
			$('#locationChooser .modal-body p.alertText').html("");
			$('#locationChooser').modal('show');
		});
	/*locator pop up links*/	
	//$('.zoneLoc').click(updateXY);

	
	
	$('#favplace,#favplace2').typeahead({
		minLength : 3,							
		source: function (typeahead, query) {
			
			if(query.length > 3){
				$(this).addClass('searching');
				//console.log("encode"+encodeURIComponent(query));
				//console.log("nomal"+query);
				/*
				var urlgmap = "http://maps.googleapis.com/maps/api/geocode/json?address=%C3%A9gh%C3%A9z%C3%A9e&sensor=false";
				$.post(urlgmap,function(data){
					var results = JSON.parse(data);
					if(results.status == 'OK')
						typeahead.process(data);
				});*/
				
				
				var addressQuery = {"address": query ,"region":"fr","language":"fr"};
				var geocoder = new google.maps.Geocoder();
				geocoder.geocode( addressQuery, function(results, status) {
				
					if (status == google.maps.GeocoderStatus.OK) {
						typeahead.process(results);
					} 
					
					if(status == google.maps.GeocoderStatus.ZERO_RESULTS){}
						
					if( status == google.maps.GeocoderStatus.INVALID_REQUEST 
						|| status == google.maps.GeocoderStatus.REQUEST_DENIED  
						|| status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT){
						var salt = new Date().getTime();
						$(this).before("<div id='alert"+salt+"' class='control-label'><i class='icon-exclamation-sign'> </i>Adresse invalide ("+status+")</div>");
						setTimeout(function() {
							$("#alert"+salt).fadeOut();
						}, 3000);
						$(this).select();
					}
				});
			}
		},
		property: "formatted_address",
		onselect: function(obj) {
			$('#favplace,#favplace2').removeClass('searching');
			var placeGmap = getPlaceFromGmapResult(obj);
			var point = new Object();
			point.name = placeGmap.title;
			point.location = placeGmap.location;
			$.post('/favplace', {'place':point},function(id) {
				$('.favplacelist').append("<li pointId='"+id+"' lat='"+placeGmap.location.lat+"' lng='"+placeGmap.location.lng+"' class='zoneLoc'><i class='icon-map-marker'></i><span> "+obj.formatted_address+"</span><i class='icon-remove icon-pointer'  onclick='removefavPlace($(this));'></i></li>");
				$('#favplace,#favplace2').val('').focus();
			});
			
			//var placeGmap = getPlaceFromGmapResult(obj);
			
			//$('#location').val(JSON.stringify(placeGmap.location));
			//$('#address').val(JSON.stringify(placeGmap.address));
		}
	});
	
	
	/*endroits favoris*/
	$('ul.favplacelist').delegate("li.zoneLoc span",'click', function () {
				var lat = parseFloat($(this).parent().attr('lat'));
				var lng = parseFloat($(this).parent().attr('lng'));	
				moveMap(lat,lng);
			});
	
	/*autour de moi*/
	$('#arroundme').click(function(){
		if(logged){
			if(user.location){
				var latLng = new google.maps.LatLng(user.location['lat'],user.location['lng']);
				map.panTo(latLng);
				//map.setCenter(latLng);
			}else{
				window.location = '/settings/profile';
			}
		}else
			window.location = '/user/login';
	});
});
/*END READY FUNCTIONS*/

function removefavPlace(obj){
	obj.parent().remove();
	
	$.post('/delfavplace', {'pointId':obj.parent().attr('pointId')},function(data) {
				
				
			});
}

function csl(str){
	console.log(str);
}

String.prototype.linkify = function(myurl, ajaxified) {
	if(typeof(ajaxified)==='undefined') ajaxified = 0;
	if(typeof(myurl)==='undefined') myurl = "/news/map/search/%23";
	var res = this;
	var hash = res.replace(/(^|\s)@([A-Za-z0-9àáâãäåçèéêëìíîïðòóôõöùúûüýÿ])/gi, "$1<a class=\"userHashLink\" href=\"$2\">@$2</a>");
	if (ajaxified == 0)
    	res = hash.replace(/(^|\s)#([A-Za-z0-9àáâãäåçèéêëìíîïðòóôõöùúûüýÿ]+)/gi, "$1<a class=\"tagHashLink\" href=\"" + myurl +"$2\">#$2</a>");
   	else
   		res = hash.replace(/(^|\s)#([A-Za-z0-9àáâãäåçèéêëìíîïðòóôõöùúûüýÿ]+)/gi, "$1<a class=\"tagHashLink\" onclick=\"setSearchFor(this)\">#$2</a>");
	res = res.replace(/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/, "<a target=\"_blank\" class=\"externalLink\" href=\"http://$3\">$3</a>");
	return res;
 }
 

Array.prototype.cleanArrayByName=function(str){
	for(i=0;i<this.length;i++)
		if(str==this[i]) 
			this.splice(i, 1);
}
Array.prototype.cleanArray=function(id){
	for(i=0;i<this.length;i++){
		if(id==this[i]._id) 
			this.splice(i, 1);
			}
}


Array.prototype.cleanArrayByLocation=function(lat,lng){
	for(i=0;i<this.length;i++){
		//console.log(this[i].location.lng+"="+lng);
		if(lng==this[i].location.lng && lat==this[i].location.lat) 
			this.splice(i, 1);
	}
}


function moveMap(lat,lng){
	curPos.x = lat;
	curPos.y = lng;
	$.cookie("geoloc", JSON.stringify(curPos),{ expires: 10000 });
	var latLng = new google.maps.LatLng(lat,lng);
	$('#locationChooser').modal('hide');
	if($('#mymap').length > 0){ // only for the map page
		google.maps.event.addDomListener(window, 'load', initialize(lat,lng,10)); 
	}
	
}

function updateXY(){
		
	var id = $(this).attr('id');
	switch(id){
	case 'zone1':
		x = 48.851875;
		y = 2.356374;
		z = 13;
	break;
	case 'zone2':
		x = 43.610787;
		y = 3.876715;
		z = 14;
	break;
	case 'zone3':
		x = 50.583346;
		y = 4.900031;
		z = 14;
	break;
	default:
		x = 48.851875;
		y = 2.356374;
		z = 13;
	}
	curPos = {'x':x,'y':y,'z':z};

	//socket.emit('position', curPos);
	
	//console.log(curPos);
			
	$('#locationChooser').modal('hide');
	
	if($('#mymap').length > 0){ // only for the map page
	// NOTE : initialize function is defined in map.jade and in new.jade : just a bit fifferent to deal the insertion
		google.maps.event.addDomListener(window, 'load', initialize(curPos.x,curPos.y,curPos.z)); 
	}
	//return curPos;
}



function getHTML5Pos(position) {
	x = position.coords.latitude;
	y = position.coords.longitude;
	z = 13;
	
	geolocalized = 1;
	
	//paris => redirect to Paris
	//x = 48.857939;
	//y = 2.352448;
	//mtpellier => redirect to Montpellier
	//x = 43.610352;
	//y = 3.877144;
	//nimes => redirect to Montpellier
	//x = 43.834527;
	//y = 4.372559;
	//Limoges => no redirect
	//x = 45.844108;
	//y =1.274414;
	//Troies => redirect to Paris
	//x = 48.297812;
	//y = 4.086914;
	
	curPos = {'x':x,'y':y,'z':z};
	
	$.getJSON('/api/zones/'+x+'/'+y,function(data) {
	
		//TODO : if there are info visible where the user is, dont print the alert, just let him surf
		// we are very far from any zone
		if(data.zone.length == 0){
			//console.log('not near area');
			$('#locationChooser .modal-body p.alertText').html("Yakwala ne couvre pas encore votre zone géographique, vous pouvez choisir ci dessous votre zone de navigation :");
			$('#locationChooser').modal('show');
		}else{ // a zone is not far
			var zone = new Object(data.zone[0]);
			
			//console.log(zone.box.br.lat);
			//console.log(x +'>'+ zone.box.tl.lat+' && '+x +'<'+ zone.box.br.lat +'&&'+ y +'<'+ zone.box.tl.lng +'&&'+ y +'>'+ zone.box.br.lng);
			
			// if we are inside the zone, we take the user location
			if(x < zone.box.tl.lat && x > zone.box.br.lat && y > zone.box.tl.lng && y < zone.box.br.lng ){
				//console.log('inside');
				curPos = {'x':x,'y':y,'z':16};
			}else{ // we are not far the zone but still out of it : we take the zone center location
				//console.log('outside');
				curPos = {'x':zone.location.lat,'y':zone.location.lng,'z':13};
				
			}
			
			
			//socket.emit('position', curPos);
		
		
			//if($('#mymap').length > 0)	
			//	google.maps.event.addDomListener(window, 'load', initialize(curPos.x,curPos.y,curPos.z)); 
			
		}
	
			
		if($('#mymap').length > 0)
				google.maps.event.addDomListener(window, 'load', initialize(curPos.x,curPos.y,curPos.z)); 	
		
	});
	
}

// On declare la variable survId afin de pouvoir par la suite annuler le suivi de la position
//var survId = navigator.geolocation.watchPosition(getHTML5Pos);
//Annule le suivi de la position si necessaire.
//navigator.geolocation.clearWatch(survId);
	
function getErrHTML5Pos(error) {
	var info = "Error while HTML5 geoloc : ";
	switch(error.code) {
		case error.TIMEOUT:
			info += "Timeout !";
		break;
		case error.PERMISSION_DENIED:
		info += "Permission denied";
		break;
		case error.POSITION_UNAVAILABLE:
			info += "Unavailable position";
		break;
		case error.UNKNOWN_ERROR:
		info += "Unknown error";
		break;
	}
	geolocalized = 0;
	//console.log(info);
	//$('#locationChooser').modal('show');
	x = 48.851875;
	y = 2.356374;
	z = 13;
	curPos = {'x':x,'y':y,'z':z};
	google.maps.event.addDomListener(window, 'load', initialize(curPos.x,curPos.y,curPos.z)); 
	
}


function placeMarker(location,mk) {
  	
	$('#latitude').val(location.lat());	
	$('#longitude').val(location.lng());	

	
	mk.setVisible(true);
	mk.setPosition(location);
	
	//getformattedAddress(location);
	
	
}

/* Get reverse address and print the result at the top of the input
* input : position x, y 
* 
* output : none
*/
function getformattedAddress(position){
	
	var geoQuery = {"location": position};
	var geocoder = new google.maps.Geocoder();
	geocoder.geocode( geoQuery, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			$('#place').val(results[0].formatted_address).select();
			var placeGmap = getPlaceFromGmapResult(results[0]);
			//console.log(results);
			placeArray.push(placeGmap);

			$("#placeInput").val(JSON.stringify(placeArray));
			
			$('#btn-place-adder').parent().before("<div class='pillItem'><i class='icon-remove' onclick='placeArray.cleanArrayByLocation("+results[0].geometry.location.Ya+","+results[0].geometry.location.Za+");$(\"#placeInput\").val(JSON.stringify(placeArray));$(this).parent().remove();'></i> "+results[0].formatted_address+"</div>");
		} else {
			var salt = new Date().getTime();
			$('#btn-place-adder').parent().before("<div id='alert"+salt+"' class='control-label'><i class='icon-exclamation-sign'> </i>Adresse invalide ("+status+")</div>");
			setTimeout(function() {
				$("#alert"+salt).fadeOut();
			}, 3000);
			$('#place').select();
		}
	});
}


function deletePlaceHTML(placeArray,results,self){
	
	
	
}
Array.prototype.inArray=function(needle){
	var length = this.length;
    for(var i = 0; i < length; i++) {
        if(this[i] == needle) return true;
    }
    return false;
}

Array.prototype.inArrayId=function(id){
	var length = this.length;
    for(var i = 0; i < length; i++) {
        if(this[i]._id == id) return true;
    }
    return false;
}


function getPlaceFromGmapResult(result){
	
	var addressGmap = {
		"street_number":""
		,"street":""
		,"arr":""
		,"city":""
		,"state":""
		,"area":""
		,"country":""
		,"zip":""
	};

	result.address_components.forEach(function(item) { 
		if(item.types.inArray('street_number'))
			addressGmap.street_number = item.long_name;
		if(item.types.inArray('route') || item.types.inArray('transit_station'))
			addressGmap.street = item.long_name;
		if(item.types.inArray('	sublocality'))
			addressGmap.arr = item.long_name;
		if(item.types.inArray('locality'))
			addressGmap.city = item.long_name;
		if(item.types.inArray('administrative_area_level_2'))
			addressGmap.state = item.long_name;
		if(item.types.inArray('administrative_area_level_1'))
			addressGmap.area = item.long_name;
		if(item.types.inArray('country'))
			addressGmap.country = item.long_name;
		if(item.types.inArray('postal_code'))
			addressGmap.zip = item.long_name;
	});
	//console.log((result.geometry.location));
	var placeGmap = {
		"title":result.formatted_address
		,"content":""
		,"thumb":""
		,"origin":"gmap"
		,"access":2
		,"licence":"gmap"
		,"outGoingLink":""
		,"yakCat":["504d89f4fa9a958808000001"]
		,"creationDate":new Date()
		,"lastModifDate":new Date()
		,"location":{"lng":parseFloat(result.geometry.location.Za),"lat":parseFloat(result.geometry.location.Ya)}
		,"status":2 // need validation
		,"address": addressGmap
		,"formatted_address":result.formatted_address
		};
		
	return placeGmap;
}	

String.prototype.addslashes=function () {
var str=this.replace(/\\/g,'\\\\');
str=str.replace(/\'/g,'\\\'');
str=str.replace(/\"/g,'\\"');
str=str.replace(/\0/g,'\\0');
return str;
}
String.prototype.stripslashes=function () {
var str=this.replace(/\\'/g,'\'');
str=str.replace(/\\"/g,'"');
str=str.replace(/\\0/g,'\0');
str=str.replace(/\\\\/g,'\\');
return str;
}

Date.prototype.toLongFrenchFormat = function ()
{
	var months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
	var date = this.getDate();
	if (date < 10)
	{
		date = "0" + date;	
	}
	var output = date + " " + months[this.getMonth()] + " " + this.getFullYear();
	return output;
}

function setShare(el){
	//el.prepend('<span>&nbsp;&nbsp;&nbsp;&nbsp;Loading</span>');
	el.sharrre({
	share: {
	googlePlus: true,
	facebook: true,
	twitter: true
	},
	enableTracking: true,
	buttons: {
		googlePlus: {
			url: el.parent().parent().find(".title").find(".more").attr("href"),
			size: 'medium'
		},

	facebook: {
		url:  el.parent().parent().find(".title").find(".more").attr("href"),
		layout: 'button_count'
	},

	twitter: {
		text: "J'ai vu ca dans #Yakwala..." + el.parent().parent().find(".freetags").text(),
		count: 'horizontal',
		url: el.parent().parent().find(".title").find(".more").attr("title")
	}					
	},
	hover: function(api, options){
		
		$(api.element).find('.buttons').show();
	},
	hide: function(api, options){
		//$(api.element).find("span").eq(0).remove();
		$(api.element).find('.buttons').hide();
	},
	render: function(api, options){
		//console.log($(api.element).find('.buttons'));
		//$(api.element).find('.buttons').css("display", "block");
		$(api.element).find('.buttons').livequery(function(){
    		//element created
    		//alert("created");

    		$(api.element).find('.buttons').css("display", "block");
    		$(api.element).find("span").eq(0).remove();
		});
	}

});
 
}

function getVcode( name, url )
{
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( url );
  if( results == null )
    return "";
  else
    return results[1];
}

function findUrls( text )
{
    var source = (text || '').toString();
    var urlArray = [];
    var url;
    var matchArray;

    // Regular expression to find FTP, HTTP(S) and email URLs.
    var regexToken = /(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)|((mailto:)?[_.\w-]+@([\w][\w\-]+\.)+[a-zA-Z]{2,3})/g;

    // Iterate through any URLs in the text.
    while( (matchArray = regexToken.exec( source )) !== null )
    {
        var token = matchArray[0];
        urlArray.push( token );
    }

    return urlArray;
}

$("document").ready(function(){

		var $scrollingDiv = $(".alwaysShown");
 
		$(window).scroll(function(){			
			if ($(window).scrollTop() != 0) {
			
				$scrollingDiv
					.stop()
					.css({"top": ($(window).scrollTop() + 50) + "px", "position": "absolute", "right": "0px"}, "slow" );			
			}
			else
			{
				$scrollingDiv.removeAttr("style")
			}

			if (isScrolledIntoView($(".next"))) {
				if ($(".next").css("display") != "none")
					$(".next").trigger('click');
			};
		});
});

function isScrolledIntoView(elem)
{
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();

    var elemTop = $(elem).offset().top;
    var elemBottom = elemTop + $(elem).height();

    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}

