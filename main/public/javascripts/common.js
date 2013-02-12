/*VAR INIT COMMON VARIABLES*/
var yakImages = new Array ( 
				"/images/yakfav.png", 
				"/images/markers/type1.png", 
				"/images/markers/type2.png", 
				"/images/markers/type3.png", 
				"/images/markers/type4.png", 
				"/images/markers/type5.png" 
		);



function changeTitle(el)
{
	var username = $(el).text().substring(1, $(el).text().length)
	var url = "api/usersearch/" + username;
	var title = "";
	$.getJSON(url ,function(data) {
		//console.log(data);
		title += data.users[0].userdetails;
		el.attr("title", title);
		setToolTip(el);
	});
	
}

function setToolTip(el)
{
	$(el).tooltip({
	      'selector': '',
	      'placement': 'bottom',
	      'title' : $(el).attr("title")
		});
}



function setSearchFor(el)
{
	$("html, body").animate({ scrollTop: 0 }, "slow");
	$("#searchStr").val($(el).text().substring(1, $(el).text().length));
	getAndPrintInfo(0);
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


function buildItemDate(item){
	var thedate = '';
	if(item.yakType == 2){
		if(typeof(item.eventDate) != 'undefined' && typeof(item.eventDate[0]) != 'undefined' ){
			var dateTmpFrom = new Date(item.eventDate[0].dateTimeFrom);
			//console.log('TEST'+item.eventDate[0].dateTimeFrom);
			// TODO this does not work on SAFARI
			var dateTmpEnd = new Date(item.eventDate[item.eventDate.length-1].dateTimeFrom);
			var m = dateTmpFrom.getMinutes();
			if (m<10) {m = "0" + m}

			if(item.eventDate.length == 1)	
				thedate = 'Le '+dateTmpFrom.getDate()+'/'+(dateTmpFrom.getMonth()+1)+'/'+dateTmpFrom.getFullYear()+' à '+dateTmpFrom.getHours()+':'+m;
			else
				thedate = 'Du '+dateTmpFrom.getDate()+'/'+(dateTmpFrom.getMonth()+1)+'/'+dateTmpFrom.getFullYear()+' au '+dateTmpEnd.getDate()+'/'+(dateTmpEnd.getMonth()+1)+'/'+dateTmpEnd.getFullYear();
		}else{
			var dateTmp = new Date(item.pubDate);
			thedate = dateTmp.getDate()+'/'+(dateTmp.getMonth()+1)+'/'+dateTmp.getFullYear();
		}
		thedate = "<span class='timeago'>"+thedate+"</span>";
	}else{
			var div = $("<div />");
			var ago = $("<abbr />");
			ago.attr("class", "timeago");
			ago.attr("title", item.pubDate);
			div.append(ago);

			thedate = div.html();

	}

	return thedate;

}

function triggerSearch(currentPage, ismore)
{
	$('#searchBtn').trigger('click', [currentPage, ismore]);
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




function setshortUrl()
{

	$(".icon-share").mouseenter(function(){
		if($(this).find(".box").length > 0)
		{
			return;
		}
		if ($(this).find(".loadingMore").length == 0) {
			$(this).prepend('<img src="images/loader_big.gif" class="loadingMore" />');
		}
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
function setLocalnessSliderText(x, elid){	
	
	var sliderText = 'Localness';
	switch(x){
		case 0:
			sliderText = "Mondial";
		break;
		case 10:
			sliderText = "Mondial";
		break;
		case 20:
			sliderText = "National";
		break;
		case 30:
			sliderText = "National";
		break;
		case 40:
			sliderText = "Régional";
		break;	
		case 50:
			sliderText = "Régional";
		break;	
		case 60:
			sliderText = "Régional";
		break;	
		case 70:
			sliderText = "Local";
		break;	
		case 80:
			sliderText = "Très Local";
		break;	
		case 90:
			sliderText = "Super Local";
		break;	
		case 100:
			sliderText = "Super local";
			break;
		case 120:
			sliderText = "Hyper local";
			break;
		default:
			sliderText = "Local";
		break;			
	}
	if (typeof(elid) === 'undefined') {
		$("#localnessPrinter").html(sliderText);
	}
	else
	{
		$(elid).html(sliderText);
	}
	return sliderText;
	
}


function setLocalnessSliderTextMinified(x, elid){	
	
	var sliderText = 'Localness';
	switch(x){
		case 11:
			sliderText = "Local";
		break;
		case 12:
			sliderText = "Très Local";
		break;	
		case 13:
			sliderText = "Super Local";
		break;	
		case 14:
			sliderText = "Super Local";
		break;
		case 15:
			sliderText = "Hyper local";
			break;
		case 16:
			sliderText = "Hyper local";
			break;
		default:
			sliderText = "";
		break;			
	}
	if (typeof(elid) === 'undefined') {
		$("#localnessPrinter").html(sliderText);
	}
	else
	{
		$(elid).html(sliderText);
	}
	return sliderText;
	
}

function setTimeSliderText(x, text){
	var y = 0;
	if(x==0){
		y= 0;
		yText = "Aujourd'hui";
	}else{
		if(x > 0){
			y = Math.floor(Math.pow(x,2)/64); 
			//y = Math.floor(x/2);
		}else{
			y = (-1)*Math.floor(Math.pow(x,2)/64); 
			//y = (-1)*Math.floor(x/2);
			//y = Math.floor(-7.222723628*Math.pow(10,-7)*Math.pow(x,5) + 2.123355095*Math.pow(10,-4)*Math.pow(x,4) - 2.178300623*Math.pow(10,-2)*Math.pow(x,3) + 0.906040198*Math.pow(x,2) - 16.47223075*x + 360.0000001);
		}

	}

	var yText = "";

	var months = parseInt(y / 30);
	var days = y % 30;
	var dayText = "";
	var monthText = "";

	if(days == 0 && months == 0)
		dayText = "Aujourd'hui";
	else if(days == 0 && months > 0)
		dayText = "";
	else if(days == 1 && months == 0)
		dayText = "Demain";
	else if(days == -1 && months == 0)
		dayText = "Hier";
	else if(days == 1 || days == -1)
		dayText = "1 jour";
	else
		dayText = Math.abs(days)+" jours";
	if(months == 0)
		monthText = "";	
	else if(months == 1)
		monthText = "1 mois";	
	else
		monthText = Math.abs(months)+" mois";	


	if(monthText && dayText)
		yText = monthText+" et "+ dayText;
	else if(monthText && !dayText)
		yText = monthText
	else
		yText = dayText;

	if(y <= -2 && x < 0)
		yText = "Il y a "+yText;
	else if(y >= 2 && x > 0)
		yText = "Dans "+yText;
	
	$( "#dayPrinter" ).html(yText);
	if (typeof(text) === 'undefined')
		return y*24*60*60;
	else	
		return yText;
}


		
/*READY FUNCTIONS*/	
$(document).ready(function() {
	//ie fix for placeholder
	/*$("[placeholder]").focus(function() {
		  var input = $(this);
		  if (input.val() == input.attr("placeholder")) {
		    input.val("");
		    input.removeClass("placeholder");
		  }
	}).blur(function() {
	  var input = $(this);
	  if (input.val() == "" || input.val() == input.attr("placeholder")) {
	    input.addClass("placeholder");
	    input.val(input.attr("placeholder"));
	  }
	}).blur();

	$("[placeholder]").parents("form").submit(function() {
	  $(this).find("[placeholder]").each(function() {
	    var input = $(this);
	    if (input.val() == input.attr("placeholder")) {
	      input.val("");
	    }
	  })
	});*/

	$("textarea").blur(function(){;
		$(this).val(checkifSafeVideo($(this).val()));
	});

	$("input").blur(function(){;
		$(this).val(checkandremoveTags($(this).val()));
	});

	checkByWidth();
		$(window).resize(function(){
			checkByWidth()
	});

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
				var mydropdown = '<select onchange="changemyrange()" alt="' + id + '" range="80" class="dropdownRangeSelector"><option value="70" rangetext="Local">Local</option><option value="80" rangetext="Très Local" selected="selected">Très Local</option><option value="100" rangetext="Super Local">Super Local</option><option value="120" rangetext="Hyper Local">Hyper Local</option></select>';
				$('.favplacelist').append("<li id='newLI' pointname='" + placeGmap.title + "' location='" + JSON.stringify(placeGmap.location) +"' pointId='"+id+"' lat='"+placeGmap.location.lat+"' lng='"+placeGmap.location.lng+"' class='zoneLoc'><i class='icon-map-marker'></i><span> "+obj.formatted_address+"</span><i class='icon-remove icon-pointer'  onclick='removefavPlace($(this));'></i><span style='display: none' class='mylocalnessPrinter'></span>" + mydropdown +"</li>");

				$('#favplace,#favplace2').val('').focus();
				$('#newLI').find(".theslider").slider({
				range: "min",
				min: 0,
				max: 100,
				step:10,
				value: 20,
				slide: function(event,ui){
					setLocalnessSliderText(ui.value, $(this).parent().find(".localnessPrinter"));
				},
				change:function(event, ui){
					//changePlaceRange($(this).parent().attr("alt"), $(this).parent().attr("lat"), $(this).parent().attr("lng"), $(this).parent().attr("pointname"), ui.value);
					// curPos.z =  ui.value;
					//changeRange();
					//$.cookie("geoloc", JSON.stringify(curPos),{ expires: 10000, path : '/' });
				},
				create:function(event, ui){
					setLocalnessSliderText(parseInt($(this).attr("title")), $(this).parent().find(".localnessPrinter"));
					$(this).slider( "value", parseInt($(this).attr("title") ) );
					$("#newLI").removeAttr("id");
				}
			});
			});
			
			//var placeGmap = getPlaceFromGmapResult(obj);
			
			//$('#location').val(JSON.stringify(placeGmap.location));
			//$('#address').val(JSON.stringify(placeGmap.address));
		}
	});
	
	
	
	
	/*autour de moi*/
	/*$('#arroundme').click(function(){

			if(user.location){
				var latLng = new google.maps.LatLng(user.location['lat'],user.location['lng']);
				curPos.name = user.formatted_address;
				curPos.x =  user.location.lat;
				curPos.y =  user.location.lng;
				$("#searchPlaceStr").val(curPos.name);
				map.panTo(latLng);
				//map.setCenter(latLng);
			}else{
				window.location = '/settings/profile';
			}
	});*/
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
	var hash = res.replace(/(^|\s)@([A-Za-z0-9àáâãäåçèéêëìíîïðòóôõöùúûüýÿ\.]+)/gi, "$1<a class=\"userHashLink\" href=\"$2\">@$2</a>");
	if (ajaxified == 0)
    	res = hash.replace(/(^|\s)#([A-Za-z0-9àáâãäåçèéêëìíîïðòóôõöùúûüýÿ]+)/gi, "$1<a class=\"tagHashLink\" href=\"" + myurl +"$2\">#$2</a>");
   	else
   		res = hash.replace(/(^|\s)#([A-Za-z0-9àáâãäåçèéêëìíîïðòóôõöùúûüýÿ]+)/gi, "$1<a class=\"tagHashLink\" onclick=\"setSearchFor(this)\">#$2</a>");
	res = res.replace(/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/, "<a target=\"_blank\" class=\"externalLink\" href=\"http://$3\">$3</a>");
	return res;
 }

function isValidPhone(phonenumber){
	if (phonenumber != "") {
		var goodChars = "+- 1234567890()"
		for (i = 0; i < phonenumber.length; i++){   
		    var c = phonenumber.charAt(i);
		    if (goodChars.indexOf(c) < 0) return false;
		}
		return true;
	} else {
		return false;
	}
}
 function phoniphy(str){
 	var regex = '[2-9]\d{2}-\d{3}-\d{4}';
 	var numArray = str.match(/(\+3[23](?:\s*?\(0\))?(?:\s*?\d){8,9})/g);
 	var phones = $("<div />");
 	phones.append("<span><img src='images/phone.png' /></span>");
 	phones.attr("class", "phoneNumbers");
 	if (numArray != null) {
 		//alert(numArray.length);
 		for(j=0; j<numArray.length;j++)
	    {
	        if (isValidPhone(numArray[j])) {
	        	phones.append("<a href='tel:" + numArray[j] + "'><i class='icon-phone-sign'></i>" + numArray[j]  + "</a>");
	        }
	    }

 	}
 	return phones;
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
		text: "J'ai vu ça dans #Yakwala..." + el.parent().parent().find(".freetags").text(),
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
		$(api.element).find('.box').livequery(function(){
    		//element created
    		//alert("created");
    		//$(api.element).find(".loadingMore").hide();
    		$(api.element).prepend("<img src='images/ftg.png' class='ftgIcon' class='icon-share' /> ");
    		$(api.element).find('.buttons').css("display", "block");
    		$(this).trigger('mouseover'); // or similar
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

 function setFixedElement(el){

		var $scrollingDiv = el;
 
		$(window).scroll(function(){			
			/*if ($(window).scrollTop() != 0) {
			
				$scrollingDiv
					.stop()
					.css({"top": ($(window).scrollTop() + 50) + "px", "position": "absolute", "right": "0px"}, "slow" );			
			}
			else
			{
				$scrollingDiv.removeAttr("style")
			}*/

			if (isScrolledIntoView($(".next"))) {
				if ($(".next").css("display") != "none")
					$(".next").trigger('click');
			};
		});
}

function isScrolledIntoView(elem)
{
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();

    var elemTop = $(elem).offset().top;
    var elemBottom = elemTop + $(elem).height();

    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}


function killCookie(name, path)
{
	$.cookie(name, null, { path: path, expires: -5 });
}

function changePlaceRange(id, lat, lng, pointname, range)
{
	var newid;
	var point = new Object();
	var location = '{"lng":' + lng + ',"lat":' + lat +'}'
	point.name = pointname;
	
	point.location = JSON.parse(location);
	point.range = range;
	$.post("/delfavplace", {pointId: id}, function(){
		$.post("/favplace", {'place':point}, function(data){
			return data;

		});
	});
	
	
}

function drawAComment(val,infoId, from)
{
	
	var username = val.username;
	var userid = val.userid;
	//var comment =  wordFilter(val.comment.toString()).linkify();
	var comment =  wordFilter(val.comment.toString());
	var thumb	 = val.userthumb;
	date = "";
	if (typeof(val.date) != 'undefined' ) {
		var date	 = $.timeago(val.date);
	}

	if (typeof(from) === 'undefined' ) {
			if(user._id	!= userid)
				return "<div class='aComment'><img class='userthumb' src='" + thumb + "' /><span class='username'>" + username + "</span><span class='timeago'>" + date + "</span><div class='comment'>" + comment + "</div></div>";
			else
				return 	"<div class='aComment'><img class='userthumb' src='" + thumb + "' /><span class='username'>" + username + "</span><span class='timeago'>" + date + "</span><a class='delComment' onclick='deleteComment(this)' id='" + val._id +"' infoid='" + infoId + "'>X</a><div class='comment'>" + comment + "</div></div>";
	}
	else
	{
		var urlsearch = conf.fronturl + '/news/map/search/@' + username;
		if(user._id	!= userid)
			return "<div class='aComment'><img class='userthumb' src='" + thumb + "' /><a class='username' href='" + urlsearch + "'>" + username + "</a><span class='timeago'>" + date + "</span><div class='comment'>" + comment + "</div></div>";	
		else
			return "<div class='aComment'><img class='userthumb' src='" + thumb + "' /><a class='username' href='" + urlsearch + "'>" + username + "</a><span class='timeago'>" + date + "</span><a class='delComment' onclick='deleteComment(this)' id='" + val._id +"' infoid='" + infoId + "'>X</a><div class='comment'>" + comment + "</div></div>";		
	}

	

}

function deleteComment(el)
{
	var commentId = $(el).attr("id");
	var infoId = $(el).attr("infoid");
	
	$.post('/api/del_Comment', {commentId : commentId, infoId: infoId} , function(res){
	console.log(res);
	if (res.meta.code == '200')
	{
		$(el).parent().remove();
	}
	else
	{
		alert("Erreur");
	}

});
}

function setCommentText(len,item){
	if( len== 0)
		item.html("Poster un commentaire");
	else if(len == 1)
		item.html("Il y a 1 commentaire");
	else
		item.html("Il y a " + len + " commentaires");

}
function setLikeSystem()
		{
			$(".icon-thumbs-up").click(function(){

				var currEl = $(this);
				var thumbs = $(this).parent().find(".theUps");

				var currentLikes = parseInt(thumbs.html());
				$.post('/setLikes', {infoId : $(this).parent().attr("rel"), islike: 'like'} , function(res){
					if (res == 'updated')
					{
						thumbs.html(currentLikes + 1);
						//currEl.parent().find("i").eq(0).before("déjà aimé");
						currEl.parent().find("i").remove();
						
					}

				});
			});

			$(".icon-thumbs-down").click(function(){
				var currEl = $(this);
				var thumbs = $(this).parent().find(".theDowns");
				var currentLikes = parseInt(thumbs.html());
				$.post('/setLikes', {infoId : $(this).parent().attr("rel"), islike: 'dislike'} , function(res){
					if (res == 'updated')
					{
						thumbs.html(currentLikes + 1);
						//currEl.parent().find("i").eq(0).before("déjà détesté");
						currEl.parent().find("i").remove();
						
					}
				});
			});
		}


		var filterWords = ["con", "connard", "connasse", "salope"];


        // "i" is to ignore case
        var rgx = new RegExp(filterWords.join("|"), "gi");

        function wordFilter(str) {           
                return str.replace(rgx, "****");            
        }

function changeDataTitleForFeeds(data){
	for(var i = 0; i < data.length; i++){
        if(data[i].hasOwnProperty("humanName")){
            data[i]["title"] = data[i]["humanName"];
            delete data[i]["humanName"];
        }
    }
    var currValue = ''
    for(var i = 0; i < data.length; i++){
        if(data[i]["humanName"] == currValue){
            delete data[i];
        }
        else
        {
        	currValue = data[i]["humanName"];
        }
    }

    //console.log(data);
    return data;

}

function checkByWidth()
		{/*
			var windowWidth = $(window).width();
			console.log(windowWidth);

			// /$(".leftlink img").css("width", windowWidth/20 + "px");

			if(windowWidth >= 1200)
			{
				$(".searchYakwala").css("height", "40px");
				$(".searchYakwala input[type=search]").css("width", "150px");
				$("#heatSelector").css("width", "200px");
				$("#dayPrinter").css("width", "200px");

				$("#newsfeedMenu").removeAttr("style");
				$(".searchYakwala #typeContainer img").css("height", "20px");
				$(".searchYakwala #zoneLocButton").css("padding", "6px");
				$(".searchYakwala #btnMesalertes").css("padding", "6px");

				return;
			}

			if( windowWidth >= 980 )
			{
				$(".searchYakwala").css("height", "40px");
				$(".searchYakwala input[type=search]").css("width", "100px");
				$("#heatSelector").css("width", "170px");
				$("#dayPrinter").css("width", "170px");

				$("#newsfeedMenu").removeAttr("style");
				$(".searchYakwala #typeContainer img").css("height", "20px");
				$(".searchYakwala #zoneLocButton").css("padding", "6px");
				$(".searchYakwala #btnMesalertes").css("padding", "6px");
				return;
			}

			if(windowWidth >= 771)
			{
				$(".searchYakwala").css("height", "40px");
				$(".searchYakwala input[type=search]").css("width", "90px");
				$("#heatSelector").css("width", "110px");
				$("#dayPrinter").css("width", "110px");

				$("#newsfeedMenu").css("position", "absolute");
				$("#newsfeedMenu").css("right", "41px");
				$("#newsfeedMenu").css("left", "auto");
				$("#newsfeedMenu").css("margin-top", "3px");
				$(".searchYakwala #typeContainer img").css("height", "15px");
				$(".searchYakwala #zoneLocButton").css("padding", "4px");
				$(".searchYakwala #btnMesalertes").css("padding", "4px");
				return;
			}

			if(windowWidth < 771)
			{
				$(".searchYakwala").css("height", "100px");
				$("#newsfeedMenu").css("position", "relative");
				$("#newsfeedMenu").css("clear", "both");
				$("#newsfeedMenu").css("float", "left");
				$("#newsfeedMenu").css("left", "100px");
				return;
			}

			*/
		}

		function ytVidId(url) {
		    var p = /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?(?=.*v=((\w|-){11}))(?:\S+)?$/;
		    return (url.match(p)) ? RegExp.$1 : false;
		}

		function vimeoVidId(url) {
		    var p = /^(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(.*)?$/;
		    return (url.match(p)) ? RegExp.$1 : false;
		}

		function dailymotionVidId(url) {
		    var p = /^(?:https?:\/\/)?(?:www\.)?dailymotion\.com\/video\/(.*)?$/;
		    return (url.match(p)) ? RegExp.$1 : false;
		}

		function checkandremoveTags(str)
		{
			return str.replace(/<\/?[^>]+>/gi, '');
		}
		function checkifSafeVideo(str)
		{
			
			var div = $("<div />");
			div.html(str);

			// check for an iframe
			$.each(div.find("iframe"), function(){
				var checker = false;

				if (ytVidId($(this).attr("src"))) {
					checker = true;
					
				}
				else if (vimeoVidId($(this).attr("src"))) {
					checker = true;
					
				}
				else if(dailymotionVidId($(this).attr("src")))
				{
					checker = true;
					
				}
				else
				{
					checker = false;
				}
				if (!checker) {

					alert("actuellement nous permettonsdes vidéos venant de youtube, vimeo ou dailymotion... votre iframe sera automatiquement supprimé");
					$(this).remove();
				}
			});	
			
			return div.html();
		}
		
