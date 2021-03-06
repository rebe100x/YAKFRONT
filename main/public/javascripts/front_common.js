
/*VAR INIT COMMON VARIABLES*/

if (!Array.prototype.filter)
{
  Array.prototype.filter = function(fun /*, thisp */)
  {
    "use strict";

    if (this === void 0 || this === null)
      throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function")
      throw new TypeError();

    var res = [];
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in t)
      {
        var val = t[i]; // in case fun mutates this
        if (fun.call(thisp, val, i, t))
          res.push(val);
      }
    }

    return res;
  };
}


if (!Array.prototype.lastIndexOf)
{
  Array.prototype.lastIndexOf = function(searchElement /*, fromIndex*/)
  {
    "use strict";
 
    if (this == null)
      throw new TypeError();
 
    var t = Object(this);
    var len = t.length >>> 0;
    if (len === 0)
      return -1;
 
    var n = len;
    if (arguments.length > 1)
    {
      n = Number(arguments[1]);
      if (n != n)
        n = 0;
      else if (n != 0 && n != (1 / 0) && n != -(1 / 0))
        n = (n > 0 || -1) * Math.floor(Math.abs(n));
    }
 
    var k = n >= 0
          ? Math.min(n, len - 1)
          : len - Math.abs(n);
 
    for (; k >= 0; k--)
    {
      if (k in t && t[k] === searchElement)
        return k;
    }
    return -1;
  };
}

if ( !Array.prototype.forEach ) {
  Array.prototype.forEach = function(fn, scope) {
    for(var i = 0, len = this.length; i < len; ++i) {
      fn.call(scope, this[i], i, this);
    }
  }
}


var addAlert; 

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
	$("#searchStr").val($(el).text());
	$("#searchBtn").focus().trigger('click');
	$('#userChooser').modal('hide');
	return false;
}


function setSearchForUser(str)
{
	emptyUserChooser();
	$('#userChooser').modal('hide');
	$("#searchStr").val(str);
	$('#searchBtn').focus().trigger('click');
	$('#userChooser').modal('hide');
	return false;
}

function setSearchForTag(el)
{
	emptyUserChooser();
	$('#userChooser').modal('hide');
	$("#searchStr").val($(el).text());
	$('#searchBtn').focus().trigger('click');
	$('#userChooser').modal('hide');
	return false;
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
	var months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
	var thedate = '';
	var now = new Date();
	if(item.yakType == 2){
		if(typeof(item.eventDate) != 'undefined' && typeof(item.eventDate[0]) != 'undefined' ){

			var dateTmpFrom = new Date(item.eventDate[0].dateTimeFrom);
			//console.log('TEST'+item.eventDate[0].dateTimeFrom);
			// TODO this does not work on SAFARI
			var dateTmpEnd = new Date(item.eventDate[item.eventDate.length-1].dateTimeEnd);
			var m = dateTmpFrom.getMinutes();
			if (m<10) {m = "0" + m}

			var DaysDiff = Math.floor((dateTmpEnd.getTime() - dateTmpFrom.getTime())/(1000*60*60*24));
			var HoursDiff = Math.floor(dateTmpEnd.getHours() - dateTmpFrom.getHours());
			var minDiff = Math.floor(dateTmpEnd.getMinutes() - dateTmpFrom.getMinutes());
			if(DaysDiff == 0 ){
				if(HoursDiff == 0 && minDiff < 10)
					thedate = 'Le '+dateTmpFrom.getDate()+' '+months[dateTmpFrom.getMonth()];
				else
					thedate = 'Le '+dateTmpFrom.getDate()+' '+months[dateTmpFrom.getMonth()]+' à '+(dateTmpFrom.getHours())+':'+m;
			}else{
				if(HoursDiff == 0)
					thedate = 'Du '+dateTmpFrom.getDate()+' '+months[dateTmpFrom.getMonth()] + ' au '+dateTmpEnd.getDate()+' '+months[dateTmpEnd.getMonth()];
				else
					thedate = 'Du '+dateTmpFrom.getDate()+' '+months[dateTmpFrom.getMonth()]+' au '+dateTmpEnd.getDate()+' '+months[dateTmpEnd.getMonth()]+ ' à ' + (dateTmpFrom.getHours())+':'+m;
			} 

			if(item.eventDate.length == 1)	
			{
				thedate = thedate;
			}
			//else if more than one event date in array
			else 
			{
				//thedate = 'Du '+dateTmpFrom.getDate()+'/'+(dateTmpFrom.getMonth()+1)+'/'+dateTmpFrom.getFullYear()+' au '+dateTmpEnd.getDate()+'/'+(dateTmpEnd.getMonth()+1)+'/'+dateTmpEnd.getFullYear();
				var dates = "";
				for (var i = item.eventDate.length - 1; i >= 0; i--) {
					var dateTmpFromArray = new Date(item.eventDate[i].dateTimeFrom);
					var dateTmpEndArray = new Date(item.eventDate[i].dateTimeEnd);
					var m1 = dateTmpFromArray.getMinutes();
					var m2 = dateTmpEndArray.getMinutes();
					if (m1<10) {m1 = "0" + m1};
					if (m2<10) {m2 = "0" + m2};
					dates += 'Du '+dateTmpFromArray.getDate()+'/'+(dateTmpFromArray.getMonth()+1)+'/'+dateTmpFromArray.getFullYear() + ' ' + dateTmpFromArray.getHours()+':'+m+' au '+dateTmpEndArray.getDate()+'/'+(dateTmpEndArray.getMonth()+1)+'/'+dateTmpEndArray.getFullYear() + ' ' + dateTmpEndArray.getHours()+':'+m2 + "\n";
				};
				thedate = thedate + " <i class='icon-calendar customDates' title='" + dates + "'></i>";
			}
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
			$(this).prepend('<img src="/images/loader_big.gif" class="loadingMore" />');
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
	        	$(".infowindow[infoid='"+more.attr("rel")+"']").find(".more").attr("title", data.data.url);
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




function setLocalnessSliderTextMinified(x, elid){	
	
	var sliderText = 'Localness';
	switch(x){
		case 11:
			sliderText = "Local";
		break;
		case 60:
			sliderText = "Local";
			break;
		case 70:
			sliderText = "Local";
			break;
		case 12:
			sliderText = "Très Local";
		break;	
		case 80:
			sliderText = "Très Local";
		break;	
		case 90:
			sliderText = "Très Local";
		break;	
		case 13:
			sliderText = "Super Local";
		break;	
		case 100:
			sliderText = "Super Local";
		break;	
		case 110:
			sliderText = "Super Local";
		break;	
		case 14:
			sliderText = "Super Local";
		break;
		case 15:
			sliderText = "Hyper local";
			break;
		case 120:
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



function getDaysFrom(x){
	var y = 0;
	if(x==0){
		y= 0;
	}else{
		if(x > 0){
			y = Math.floor(Math.pow(x,2)/64); 
		}else{
			y = (-1)*Math.floor(Math.pow(x,2)/64); 
		}
	}

	return y;
}

function invGetDaysFrom(y){
	var x = 0;
	if(y==0){
		x= 0;
	}else{
		if(y > 0){
			x = Math.floor(8*Math.sqrt(y)); 
		}else{
			x = (-1)*Math.floor(8*Math.sqrt((-1)*y)); 
		}
	}

	return x;
}



function setTimeSliderText(y){
	
	var yText = '';
	


	
	

	var days = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
	var months = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Sept','Oct','Nov','Déc'];
	var now = new Date();
	var nowts = now.getTime();
	var ts2print = nowts + y*24*60*60*1000;
	var date2print = new Date(ts2print);
	var dayOfTheMonth = date2print.getDate();
	if(dayOfTheMonth==1)
		dayOfTheMonth = "1er";	
	yText = days[date2print.getDay()]+' '+ dayOfTheMonth+' '+months[date2print.getMonth()];
	
	if(y==0)
		yText = "Aujourd'hui";
	if(y==1)
		yText = "Demain";
	if(y==-1)
		yText = "Hier";
	//$("#dayPrinter span").html('<img class="blackArrow" src="/images/new/blackboxbg.png" />' + yText);
	$("#dayPrinter span").html(yText);
	setBlackBockPosition();
	return yText;
	
}

function setBlackBockPosition()
{
	if(typeof($(".ui-slider-handle").position()) != 'undefined')
	{
		var currElposition = $(".ui-slider-handle").position();	
		//console.log(currElposition);
		$("#blackBox").css("left", (currElposition.left - 78) + "px");
	}
}
		

function correctPlaceholder()
{
	 $("input[id!='searchStr']").each(function(){
      if($(this).val()=="" && $(this).attr("placeholder")!=""){
        $(this).val($(this).attr("placeholder"));
        $(this).focus(function(){
          if($(this).val()==$(this).attr("placeholder")) $(this).val("");
        });
        $(this).blur(function(){
          if($(this).val()=="") $(this).val($(this).attr("placeholder"));
        });
      }
    });
	$("textarea").each(function(){
      if($(this).val()=="" && $(this).attr("placeholder")!=""){
        $(this).val($(this).attr("placeholder"));
        $(this).focus(function(){
          if($(this).val()==$(this).attr("placeholder")) $(this).val("");
        });
        $(this).blur(function(){
          if($(this).val()=="") $(this).val($(this).attr("placeholder"));
        });
      }
    });
}

function preload(arrayOfImages) {
    $(arrayOfImages).each(function(){
        $('<img/>')[0].src = this;
    });
}

function  showPostForm()
{
	var el = $("#newsPost").parent();
	if(!$(el).hasClass('active')){
		$('#newsNav li').removeClass('active');	
		$(el).addClass('active');
		var contentToLoad = $(el).attr('contentToLoad');
		
		$('.tabContent').hide();
		$('#'+contentToLoad).fadeIn();	
		
		if(contentToLoad == "newspostContent"){
			// INIT MARKERLOCATION
			
			listenerHandle = google.maps.event.addListener(map, 'click', function(event) {
				getformattedAddress(event.latLng);
				placeMarker(event.latLng,markerLocation);
				google.maps.event.addListener(markerLocation, 'dragend', function() {
					//cleanMarkers();
					var position = markerLocation.getPosition();
					$('#latitude').val(position.lat());	
					$('#longitude').val(position.lng());	
					
					getformattedAddress(position);
					
				});		
			});
		}
		else{
			google.maps.event.removeListener(listenerHandle);
			markerLocation.setVisible(false);
		}
	}
		drawNewsFeed();
}

function  hidePostForm()
{
	var el = $("#newsFeed").parent();
	if(!$(el).hasClass('active')){
		$('#newsNav li').removeClass('active');	
		$(el).addClass('active');
		var contentToLoad = $(el).attr('contentToLoad');
		
		$('.tabContent').hide();
		$('#'+contentToLoad).fadeIn();	
		
		if(contentToLoad == "newspostContent"){
			// INIT MARKERLOCATION
			
			listenerHandle = google.maps.event.addListener(map, 'click', function(event) {
				getformattedAddress(event.latLng);
				placeMarker(event.latLng,markerLocation);
				google.maps.event.addListener(markerLocation, 'dragend', function() {
					//cleanMarkers();
					var position = markerLocation.getPosition();
					$('#latitude').val(position.lat());	
					$('#longitude').val(position.lng());	
					
					getformattedAddress(position);
					
				});		
			});
		}
		else{
			google.maps.event.removeListener(listenerHandle);
			markerLocation.setVisible(false);
		}
	}
		drawNewsFeed();
}



function setGravatar()
{
	if(typeof user.mail != 'undefined' && user.mail != null && user.mail != "")
	{
		var gravatarMail = $.trim(user.mail).toLowerCase();
		var gravatarLink = 'http://www.gravatar.com/avatar/' + $.md5(gravatarMail) + "?s=51";
		gravatarImage = "<img class='gravatarImage' src='"+gravatarLink+"' alt='Gravatar Image - Profile' title='Gravatar Image - Profile' />" ;
		$("#profileMenu").append(gravatarImage);
	}
}

function checkGravatar()
{
	var gravatarLink;
	// get the email
	if(typeof user.mail != 'undefined')
	{
		if(user.mail != null && user.mail != "")
		{
			var gravatarMail = $.trim(user.mail).toLowerCase();
			gravatarLink = 'http://www.gravatar.com/' + $.md5(gravatarMail) + '.json';
		}
	}
	(function($) {
				var url = gravatarLink;
				$.ajax({
				type: 'GET',
				url: url,
				async: false,
				contentType: "application/json",
				dataType: 'jsonp',
				success: function(data){ 
					if(typeof(data.entry != 'undefined'))
					{
						//console.log(data);	
						if(data.entry.length > 0)
						{
							var gravatarImage = data.entry[0].thumbnailUrl + "?s=150";

							gravatarImage = "<img class='gravatarImage' src='"+gravatarImage+"' alt='Gravatar Image - Profile' title='Gravatar Image - Profile' />" ;


							if(user.gravatarStatus == 2 && user.thumb.indexOf('no-user.png') != -1)
							{

								$("#gravatar").show();
								$("#gravatar").append(gravatarImage);
							}

						}

					}
				}
				});
			})(jQuery);	

}
$(document).ready(function() {
	/*preload([
    '/images/yakwala_sprite.png',
    '/images/yakwala_sprite-medium.png'
	]);*/
	
	if(typeof user != 'undefined'){
		if(user.gravatarStatus == 1)
			setGravatar();
		if(typeof(user.social) != 'undefined')
		{
			if(typeof(user.social.twitter[0]) != 'undefined')
			{
				if(typeof(user.social.twitter[0].friendsList) == 'undefined')
				{
					(function($) {
						var url = 'https://api.twitter.com/1/following/ids.json?cursor=-1&screen_name='+user.social.twitter[0].screen_name;
						$.ajax({
						type: 'GET',
						url: url,
						async: false,
						contentType: "application/json",
						dataType: 'jsonp',
						success: function(data){ 
							$.post('/user/settwitterFriend', { friendList : data.ids });
						}
						});
					})(jQuery);	
				}
			}
		}	
	}
	
	
	$(".myMedia a").click(function(){
		var popup = $(this).attr("rel");
		if(popup != "post_picture")
			$('#' + popup).modal('show');
		else
			$("#post_yakpicture").slideToggle();
	});


	$("#newsfeedContent").mCustomScrollbar({
		set_width:false, /*optional element width: boolean, pixels, percentage*/
		set_height:false, /*optional element height: boolean, pixels, percentage*/
		horizontalScroll:false, /*scroll horizontally: boolean*/
		scrollInertia:950, /*scrolling inertia: integer (milliseconds)*/
		mouseWheel:true, /*mousewheel support: boolean*/
		mouseWheelPixels:"auto", /*mousewheel pixels amount: integer, "auto"*/
		autoDraggerLength:true, /*auto-adjust scrollbar dragger length: boolean*/
		autoHideScrollbar:false, /*auto-hide scrollbar when idle*/
		scrollButtons:{ /*scroll buttons*/
			enable:false, /*scroll buttons support: boolean*/
			scrollType:"continuous", /*scroll buttons scrolling type: "continuous", "pixels"*/
			scrollSpeed:"auto", /*scroll buttons continuous scrolling speed: integer, "auto"*/
			scrollAmount:40 /*scroll buttons pixels scroll amount: integer (pixels)*/
		},
		advanced:{
			updateOnBrowserResize:true, /*update scrollbars on browser resize (for layouts based on percentages): boolean*/
			updateOnContentResize:true, /*auto-update scrollbars on content resize (for dynamic content): boolean*/
			autoExpandHorizontalScroll:false, /*auto-expand width for horizontal scrolling: boolean*/
			autoScrollOnFocus:true, /*auto-scroll on focused elements: boolean*/
			normalizeMouseWheelDelta:false /*normalize mouse-wheel delta (-1/1)*/
		},
		contentTouchScroll:true, /*scrolling by touch-swipe content: boolean*/
		callbacks:{
			onScrollStart:function(){}, /*user custom callback function on scroll start event*/
			onScroll:function(){}, /*user custom callback function on scroll event*/
			onTotalScroll:function(){}, /*user custom callback function on scroll end reached event*/
			onTotalScrollBack:function(){}, /*user custom callback function on scroll begin reached event*/
			onTotalScrollOffset:0, /*scroll end reached offset: integer (pixels)*/
			onTotalScrollBackOffset:0, /*scroll begin reached offset: integer (pixels)*/
			whileScrolling:function(){} /*user custom callback function on scrolling event*/
		},
		theme:"dark-2" /*"light", "dark", "light-2", "dark-2", "light-thick", "dark-thick", "light-thin", "dark-thin"*/
	});
	$(window).resize(function(){
		//console.log($(window).width());
	});
	

	

	if (navigator.appVersion.indexOf("MSIE") != -1){
   	correctPlaceholder();
   }
	
	checkforDevice();
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
		$(this).val(checkifSafeVideo(checkandremoveTags($(this).val())));
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
						$.map( results, function( item ) {fixGmapResult(item);});
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

			var liLnLat = $('.favplacelist li[lat="'+placeGmap.location.lat+'"][lng="'+placeGmap.location.lng+'"]');
			if (liLnLat.length > 0)
			{
				liLnLat.addClass("highlightedLi");
				setTimeout('removeHighlightLi()', '3000');
				return;
			}
				

			var point = new Object();
			
			point.name = placeGmap.title;
			point.location = placeGmap.location;
			$.post('/favplace', {'place':point},function(id) {
				var mydropdown = '<select onchange="changemyrange(this)" alt="' + id + '" range="80" class="dropdownRangeSelector"><option value="70" rangetext="Local">Local</option><option value="80" rangetext="Très Local" selected="selected">Très Local</option><option value="100" rangetext="Super Local">Super Local</option><option value="120" rangetext="Hyper Local">Hyper Local</option></select>';
				$('.favplacelist').append("<li id='newLI' pointname='" + placeGmap.title + "' location='" + JSON.stringify(placeGmap.location) +"' pointId='"+id+"' lat='"+placeGmap.location.lat+"' lng='"+placeGmap.location.lng+"' class='zoneLoc'><span class='redStars'></span><span> "+obj.formatted_address+"</span><span class='closePlace'  onclick='removefavPlace($(this));'></span><span style='display: none' class='mylocalnessPrinter'></span>" + mydropdown +"</li>");

				$('#favplace,#favplace2').val('').focus();
				$('#newLI').find(".theslider").slider({
				range: "min",
				min: 0,
				max: 100,
				step:10,
				value: 20,
				slide: function(event,ui){
					setLocalnessSliderTextMinified(ui.value, $(this).parent().find(".localnessPrinter"));
				},
				change:function(event, ui){
					
				},
				create:function(event, ui){
					setLocalnessSliderTextMinified(parseInt($(this).attr("title")), $(this).parent().find(".localnessPrinter"));
					$(this).slider( "value", parseInt($(this).attr("title") ) );
					$("#newLI").removeAttr("id");
				}
			});
			});
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
function removeHighlightLi()
{
	$(".favplacelist li").removeClass("highlightedLi");
}
function removefavPlace(obj){
	obj.parent().remove();
	
	$.post('/delfavplace', {'pointId':obj.parent().attr('pointId')},function(data) {
				
				
			});
}

function csl(str){
	console.log(str);
}

/*
String.prototype.linkify = function(myurl, ajaxified) {
	if(typeof(ajaxified)==='undefined') ajaxified = 0;
	if(typeof(myurl)==='undefined') myurl = "/news/map/search/%23";
	var res = this;
	var hash = res.replace(/(^|\s)@([A-Za-z0-9àáâãäåçèéêëìíîïðòóôõöùúûüýÿ\.]+)/gi, "$1<a class=\"userHashLink prevent-default\" href=\"$2\">@$2</a>");
	if (ajaxified == 0)
    	res = hash.replace(/(^|\s)#([A-Za-z0-9àáâãäåçèéêëìíîïðòóôõöùúûüýÿ]+)/gi, "$1<a class=\"tagHashLink prevent-default\" href=\"" + myurl +"$2\">#$2</a>");
   	else
   		res = hash.replace(/(^|\s)#([A-Za-z0-9àáâãäåçèéêëìíîïðòóôõöùúûüýÿ]+)/gi, "$1<a class=\"tagHashLink prevent-default\" onclick=\"setSearchFor(this)\">#$2</a>");
	res = res.replace(/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/, "<a target=\"_blank\" class=\"externalLink\" href=\"http://$3\">$3</a>");
	return res;
 }*/

String.prototype.linkify = function() {
	var res = this;	
	var hash = res.replace(/(^|\s)@([A-Za-z0-9àáâãäåçèéêëìíîïðòóôõöùúûüýÿ\.]+)/gi, "$1<a class=\"userHashLink prevent-default\" href=\"$2\">@$2</a>");
	res = hash.replace(/(^|\s)#([A-Za-z0-9àáâãäåçèéêëìíîïðòóôõöùúûüýÿ]+)/gi, "$1<a class=\"tagHashLink prevent-default\" onclick=\"setSearchFor(this)\">#$2</a>");
	res = res.replace(/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/g, "<a target=\"_blank\" class=\"externalLink\" href=\"http://$3\">$3</a>");
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
			var result = fixGmapResult(results[0]);
			$('#place').val(result.formatted_address).select();
			var placeGmap = getPlaceFromGmapResult(result);			
			placeArray.push(placeGmap);

			$("#placeInput").val(JSON.stringify(placeArray));
			
			$('#btn-place-adder').parent().before("<div class='pillItem'><i class='icon-remove' onclick='placeArray.cleanArrayByLocation("+result.geometry.location.lat+","+result.geometry.location.lng+");$(\"#placeInput\").val(JSON.stringify(placeArray));$(this).parent().remove();'></i> "+result.formatted_address+"</div>");
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









function setShare(el){
	//el.prepend('<span>&nbsp;&nbsp;&nbsp;&nbsp;Loading</span>');
	var infoid = el.attr("rel");
	el.sharrre({
	share: {
	googlePlus: true,
	facebook: true,
	twitter: true
	},
	enableTracking: true, // Here the original lib is modified to track to yakTrack.js instead of google analytics #RB 2apr2013
	yakwalaTrackingUrl : conf.trackurl,
	buttons: {
		googlePlus: {
			url: $(".infowindow[infoid='"+infoid+"']").find(".more").attr("href"),
			size: 'medium'
		},

	facebook: {
		url:  $(".infowindow[infoid='"+infoid+"']").find(".more").attr("href"),
		layout: 'button_count'
	},

	twitter: {
		text: "J'ai vu ça dans #Yakwala " + $(".infowindow[infoid='"+infoid+"']").find(".more").attr("title") + " " + $(".infowindow[infoid='"+infoid+"']").find(".tags").text(),
		count: 'horizontal',
		url: ' '
	}					
	},
	hover: function(api, options){
		
		$(api.element).find('.buttons').show();
	},
	hide: function(api, options){
		$(api.element).find('.buttons').hide();
	},
	render: function(api, options){
		$(api.element).find('.box').livequery(function(){
    		$(api.element).prepend('<div class="ftgIcon"></div>');
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
			if (isScrolledIntoView($(".loadingfeeditem"))) {
				if ($(".loadingfeeditem").css("display") != "none")
					$(".loadingfeeditem").trigger('click');
			};
		});
}

function isScrolledIntoView(elem)
{
	printLoadingFeedItem();
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();

    var elemTop = $(elem).offset().top;
    var elemBottom = elemTop + $(elem).height();

    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
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

function setCommentSpam(el)
{
	var infoid = $(el).parent().parent().find('.comment').attr('idinfo');	
	//console.log(infoid);
	var content = '<img src="'+$(el).parent().parent().find('.userthumb').attr('src').replace('128_128','24_24')+'"/>&nbsp;'+$(el).parent().parent().find('.comment').html()
					+'<br><b>Posté par </b><a target="_blank" href="'+conf.fronturl+'/news/feed/?idprofile='+$(el).parent().parent().find('.comment').attr('idposter')+'">'+$(el).parent().parent().find('.username').html()+'</a>'
					+'<br><b>Signalé par </b><a target="_blank" href="'+conf.fronturl+'/news/feed/?idprofile='+user._id+'">@'+user.login+'</a>'
					+'&nbsp;'+$(el).parent().parent().find('.timeago').html();
	$.post('/setSpams', {content_id : $(el).attr("rel"), content_type : 2,content : content , info_id: infoid, poster_id : $(el).parent().parent().find('.comment').attr('idposter')} , function(res){
		if (res != "0"){
			el.remove();
			user.illicite = user.illicite.concat(res)
		}

	});
}

function drawAComment(val,infoId, from)
{
	if(val.status != 1 )
		return true;
	
	var username = val.username;
	var userid = val.userid;
	//var comment =  wordFilter(val.comment.toString()).linkify();
	var comment =  checkandremoveTags(wordFilter(val.comment.toString()));
	var thumb	 = val.userthumb;
	

	date = "";
	if (typeof(val.date) != 'undefined' ) {
		var date	 = $.timeago(val.date);
	}

	var isSpammed = false;
	var comment_id = val._id;
	var iconSpam = "";
	$.each(user.illicite, function(key, val1){
		//console.log(val1);
		if(comment_id ==  val1.content_id && val1.content_type == 2)
			isSpammed = true;
	});	

	if(!isSpammed)
	{
		iconSpam = "<i class='icon-warning-sign' title='Signaler ce commentaire aux admins Yakwala' rel='" + comment_id + "' onclick='setCommentSpam(this)'></i>";
	}
	


	if (typeof(from) === 'undefined' ) {
			if(user._id	!= userid)
				return "<div class='aComment'><img class='userthumb' src='" + thumb + "' /><a class='username prevent-default' onclick='setSearchFor(this)'>@" + username + "</a><span class='timeago'>" + date + "</span><div class='comment' idposter='"+userid+"' idinfo='"+infoId+"'>" + comment + "</div><div>" + iconSpam + "</div></div>";
			else
				return 	"<div class='aComment'><img class='userthumb' src='" + thumb + "' /><a class='username prevent-default' onclick='setSearchFor(this)'>@" + username + "</a><span class='timeago'>" + date + "</span><a class='delComment' title='Supprimer ce commentaire' onclick='deleteComment(this)' id='" + val._id +"' infoid='" + infoId + "'></a><div class='comment' idposter='"+userid+"' idinfo='"+infoId+"'>" + comment + "</div><div></div></div>";
	}
	else
	{
		if(user._id	!= userid)
			return "<div class='aComment'><img class='userthumb' src='" + thumb + "' /><a class='username prevent-default' onclick='setSearchFor(this)'>@" + username + "</a><span class='timeago'>" + date + "</span><div class='comment' idposter='"+userid+"' idinfo='"+infoId+"'>" + comment + "</div><div>"+iconSpam+"</div></div>";	
		else
			return "<div class='aComment'><img class='userthumb' src='" + thumb + "' /><a class='username prevent-default' onclick='setSearchFor(this)'>@" + username + "</a><span class='timeago'>" + date + "</span><a class='delComment' title='Supprimer ce commentaire' onclick='deleteComment(this)' id='" + val._id +"' infoid='" + infoId + "'></a><div class='comment' idposter='"+userid+"' idinfo='"+infoId+"'>" + comment + "</div><div></div></div>";		
	}

	

}

function deleteComment(el) {
	var commentId = $(el).attr("id");
	var infoId = $(el).attr("infoid");
	
	$.post('/api/delComment', {commentId : commentId, infoId: infoId} , function(res){
	if (res.meta.code == '200')
		$(el).parent().remove();
	
	});
}

function setCommentText(comments,item){
	var len = 0;
	comments.forEach(function(com){
		if(com.status == 1)
			len++;
	});
	if( len== 0)
		item.html("<i class='commentLogo'></i>Poster un commentaire");
	else if(len == 1)
		item.html("<i class='commentLogo'></i>Il y a 1 commentaire");
	else
		item.html("<i class='commentLogo'></i>Il y a " + len + " commentaires");

}

function setyakBlackListSystem(item)
{
	var infoid = item.attr("rel");
    

	item.html("<i class='illiciteIcon'></i>Blacklister cette info");
	item.click(function(){
		var login = $(this).parent().parent().find('.itemTitle').text();
		
		$.post('/api/user/blacklist', {id : infoid, type : 'info', login : login} , function(res){
				if (res != "0")
				{
					var infoBL = {};
					infoBL._id = infoid;
					infoBL.login = login;
					user.listeNoire.info = user.listeNoire.info.concat(infoBL);
					item.parent().parent().parent().remove();
				}

		});

	});
}

function setSpamSystem(item,theinfo){
	var isSpammed = false;

	$.each(user.illicite, function(key, val){
		//console.log(val);
		if(item.attr("rel") ==  val.content_id && val.content_type == 1)
			isSpammed = true;
	});	

	if(!isSpammed)
	{
		item.html("<i class='signalerIcon'></i>Signaler cette info");

		item.click(function(){
			var thetags = '';
			if(typeof $(this).parent().parent().find(".tags").html() != 'undefined')
				thetags = $(this).parent().parent().find(".tags").html();
			var theimg = '';
			if(typeof $(this).parent().parent().find(".thumbImage").html() != 'undefined')
				theimg = $(this).parent().parent().find(".thumbImage").html().replace('512_0','120_90');
			var thecontent = $(this).parent().parent().find(".yakTypeImage").html()+' '+$(this).parent().parent().find(".itemTitle").html()+'<br>'+theimg+'<br>'+$(this).parent().parent().find(".theContent").html()+'<br>'+$(this).parent().parent().find(".infodetail").html()+'<br>'+thetags;
			$.post('/setSpams', {content_id : $(this).attr("rel"), content_type : 1, content: thecontent, poster_id:theinfo.user} , function(res){
				if (res != "0"){
					item.html("<i class='signalerIcon'></i>Vous avez déjà signalé cette info");
					item.alertid = res;
					user.illicite = user.illicite.concat(res)
				}
			});
		});
	}
	else
	{
		item.html("<i class='signalerIcon'></i>Vous avez déjà signalé cette info");
	}
}


function setLikeSystem(from)
		{
			$(".newYaklike").click(function(){

				var currEl = $(this);
				var thumbs = $(this).parent().find(".theUps");
				var infoid = $(this).parent().attr("rel");
				var currentLikes = parseInt(thumbs.html());
				$.post('/setLikes', {infoId : infoid, islike: 'like'} , function(res){
					if (res == 'updated')
					{
						if(currentLikes + 1 == 1)
							thumbs.html(currentLikes + 1 + " like");
						else
							thumbs.html(currentLikes + 1 + " likes");
						//currEl.parent().find("i").eq(0).before("déjà aimé");
						currEl.parent().find(".newYaklike").remove();

						var trackParams = {"params": [
											{"infoId":infoid},
											{"page": "map"}
									]
								};
						$.ajax({
							url: '/track/user/'+user._id+'/'+'7'+'/'+JSON.stringify(trackParams),
							type: "get",
							dataType: "json"
						});
						
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

		function ytVidId2(url) {
		    var p = /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/(.*)?$/;
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
			str = str.replace(/<script.*?>.*?<\/script>/gi, '');
			str = str.replace(/<script.*?>.*?/gi, '');
			str = str.replace(/.*?<\/script>/gi, '');
			str = str.replace(/script/gi, '');
			return str
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
				else if (ytVidId2($(this).attr("src"))) {
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
		

		function gup( name ){
			name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
			var regexS = "[\\?&]"+name+"=([^&#]*)";
			var regex = new RegExp( regexS );
			var results = regex.exec( window.location.href );
			if( results == null )
			return "";
			else
			return results[1];
		}

		function isTouchDevice() {
			var el = document.createElement('div');
			el.setAttribute('ongesturestart', 'return;');
			return typeof el.ongesturestart === "function";
		}

		function checkforDevice()
		{
			var ua = navigator.userAgent;
			var checker = {
				iphone: ua.match(/(iPhone|iPod|iPad)/),
				blackberry: ua.match(/BlackBerry/),
				android: ua.match(/Android/)
			};

			if (checker.android || checker.iphone || checker.blackberry)
				$("#zoomnavigation").remove();
		}

		function emptyUserChooser()
		{
			$("#userChooser .alertText").html('<img src="/images/loader_big.gif" />');
			$("#userChooser #uc_profile_brief").html("");
			$("#userChooser #uc_profile_yaks_alerts.mybtn").html("");
			$("#userChooser #uc_profile_yaks_posts").html("");
			$("#userChooser #subscribers_number").html("0");
			$("#userChooser #subscribed_number").html("0");
			$("#userChooser #thealerts").html("");
			$("#uc_profile_yaks_options").show();
			$("#userChooser #uc_profile_yaks_alerts.mybtn").show();		
			$("#uc_blacklist_user, #uc_filter_user, #uc_profile_yaks_search, #uc_illicite_user").show();
		}

		function bindClickAlertFeed(id, humanName, name)
		{
			var alertUser = {};
			alertUser._id = id;
			alertUser.humanName = humanName;
			alertUser.name = name;

			$.post('/user/setUserAlertsFeed', {'theuser':alertUser, 'addAlert' : addAlert, 'settype' : 'feed'},function(res) {
				if(res == '1')
				{
					if(addAlert == 0)
					{
						currHtml = "Ajouter a mes alertes";
						$("#userChooser #uc_profile_yaks_alerts.mybtn").html(currHtml);		
						if(typeof(user.feedsubs) != 'undefined')
						{
							$.each(user.feedsubs, function(i){
								 if(user.feedsubs[i]._id === id) user.feedsubs.splice(i,1);
							});	
						}
						addAlert = 1;
						
					}
					else
					{
						currHtml = "Supprimer de mes alertes";
						$("#userChooser #uc_profile_yaks_alerts.mybtn").html(currHtml);		
						user.feedsubs = user.feedsubs.concat(alertUser);
						addAlert = 0;
					}
					
					
				}
			});
		}

		function bindClickAlertUser(id, userName, userLogin, userThumb)
		{
			var alertUser = {};
			alertUser._id = id;
			alertUser.name = userName;
			alertUser.login = userName;
			alertUser.details = userName + "(@" + userLogin + ")";
			alertUser.thumb = userThumb;
			$.post('/user/setUserAlerts', {'theuser':alertUser, 'addAlert' : addAlert, 'settype' : 'user'},function(res) {
				if(res == 1)
				{
					if(addAlert == 0)
					{
						currHtml = "Ajouter a mes alertes";
						$("#userChooser #uc_profile_yaks_alerts.mybtn").html(currHtml);		
						if(typeof(user.feedsubs) != 'undefined')
						{
							$.each(user.usersubs, function(i){
								 if(user.usersubs[i]._id === id) user.usersubs.splice(i,1);
							});
						}
						addAlert = 1;
					}
					else
					{
						currHtml = "Supprimer de mes alertes";
						$("#userChooser #uc_profile_yaks_alerts.mybtn").html(currHtml);		
						user.usersubs = user.usersubs.concat(alertUser);
						addAlert = 0;
					}
				}
			});
			
		}

		/*print user profile: 
		if el is html => comes from a click, else it comes from the direct access news/feed/?idprofile=xxxx*/
		function showUserProfile(el){
			if(typeof $(el).html() == 'undefined')
				var userid = el;
			else	
				var userid = $(el).parent().find("input").val();

			emptyUserChooser();

			//console.log(userid);


			$('#userChooser').modal('show');
			$("#uc_illicite_user").html('Signaler cet utilisateur aux admins de Yakwala');
				
			$.getJSON('/api/usersearchbyid2/' + userid ,function(data) {

				var theuser = data.user[0];
				
				if(typeof theuser == 'undefined')
				{
					$("#userChooser p").hide();
					$("#userChooser #closeModal").after("<p class='nonExist'>Ce compte n'existe plus</p>");
					return;
				}

				if(theuser.status != 1)
				{
					$("#userChooser p").hide();
					$("#userChooser #closeModal").after("<p class='nonExist'>Ce compte est actuellement désactivé</p>");
					return;
				}




				if(userid != user._id){

					if($.inArray(userid,user.usersubs) && user.usersubs.length > 0)
					{

						addAlert = 0;
						var currHtml  = "Supprimer de mes alertes";
						$("#userChooser #uc_profile_yaks_alerts.mybtn").html(currHtml);		
						$("#userChooser #uc_profile_yaks_alerts.mybtn").unbind('click').click(function(){
							bindClickAlertUser(theuser._id, theuser.name, theuser.login, theuser.thumb);
						});
					}
						
					else
					{
						addAlert = 1;
						var currHtml = "Ajouter a mes alertes";
						$("#userChooser #uc_profile_yaks_alerts.mybtn").html(currHtml);		
						$("#userChooser #uc_profile_yaks_alerts.mybtn").unbind('click').click(function(){
							bindClickAlertUser(theuser._id, theuser.name, theuser.login, theuser.thumb);
						});
					}

					$("#uc_blacklist_user").unbind('click').click(function(){
						$.post('/api/user/blacklist', {id : theuser._id, type : 'user', login: theuser.login} , function(res){
								if (res != "0")
								{
									var blUser = {};
									blUser._id = theuser._id;
									blUser.login = theuser.login;
									user.listeNoire.user = user.listeNoire.user.concat(blUser);
									$('#userChooser').modal('hide');	
									getAndPrintInfo();
								}

						});
					});

					$("#uc_illicite_user").unbind('click').click(function(){
						
						var isSpammed = false;
						$.each(user.illicite, function(key, val){
							if(theuser._id ==  val.content_id && val.content_type == 3)
								isSpammed = true;
						});	
						if(!isSpammed){
							$.post('/setSpams', {content_id : theuser._id, content_type : 3, content:  '<img src="'+theuser.thumb.replace('128_128','24_24')+'" />  '+theuser.name+' ( '+theuser.mail+' ) <br>'}, function(res){		
								if (res != "0"){
									$("#uc_illicite_user").html("Vous venez de signaler cet utilisateur aux admins Yakwala.");
									user.illicite = user.illicite.concat(res)
								}
							});
						}else{
							$(this).html("Vous avez déjà signalé cet utilisateur");
						}
					});	

					$("#uc_filter_user, #uc_profile_yaks_search").unbind('click').on('click',function(){
						setSearchForUser('@'+theuser.humanName);
						$('#userChooser').modal('hide');

						$("#userChooser #uc_profile_yaks_alerts.mybtn").show();			
						//console.log(userid);
						if($.inArray(userid,user.usersubs) && user.usersubs.length > 0)
						{
							addAlert = 0;
							var currHtml  = "Supprimer de mes alertes";
							$("#userChooser #uc_profile_yaks_alerts.mybtn").html(currHtml);	

							$("#userChooser #uc_profile_yaks_alerts.mybtn").unbind('click').click(function(){
								bindClickAlertUser(theuser._id, userName, userLogin, userThumb);
							});
						}
							
						else
						{
							addAlert = 1;
							var currHtml = "Ajouter a mes alertes";
							$("#userChooser #uc_profile_yaks_alerts.mybtn").html(currHtml);		
							$("#userChooser #uc_profile_yaks_alerts.mybtn").unbind('click').click(function(){
								bindClickAlertUser(theuser._id, userName, userLogin, userThumb);
							});
						}

					});

					$("#uc_filter_user, #uc_profile_yaks_search").unbind('click').on('click',function(){
						setSearchForUser('@'+userName);
						$('#userChooser').modal('hide');
					});

					var alreadySpammed = false;
					for (var i = user.illicite.length - 1; i >= 0; i--) {
						if(user.illicite[i].content_type == 3)
							if(user.illicite[i].content_id == theuser._id)
								alreadySpammed = true;


						if(alreadySpammed)
						{
							$("#uc_illicite_user").unbind('click');
							$("#uc_illicite_user").html("Vous avez déjà signalé cet utilisateur");
						}
					}
					
				} else {

					$("#uc_blacklist_user, #uc_filter_user, #uc_profile_yaks_search, #uc_illicite_user").hide();
					$("#uc_profile_yaks_options").hide();
					$("#userChooser #uc_profile_yaks_alerts.mybtn").hide();		
				}


				

				$("#userChooser .nonExist").remove();
				$("#userChooser p").show();
				var userName = ""; var userBio = ""; var userThumb = ""; var userWeb = ""; var userLogin = "";
					

				$("#userChooser p.alertText").html("");
				if(typeof theuser.thumb != 'undefined')
					userThumb = "<span class='theimage span5'><img src='" + theuser.thumb +"' /></span>";

				if(typeof theuser.bio != 'undefined')
					userBio = theuser.bio;

				if(typeof theuser.name != 'undefined')
					userName = theuser.name;

				if(typeof theuser.web != 'undefined')
					userWeb = theuser.web;

				if(typeof theuser.login != 'undefined')
					userLogin = theuser.login;

				var thetags = "";

				for(i=0; i<theuser.tagsubs.length; i++)
				{
					thetags += "<a onclick='setSearchForTag(this)'>#" + theuser.tagsubs[i] + "</a> ";
				}	

				for(i=0; i<theuser.tag.length; i++)
				{
					thetags += "<a onclick='setSearchForTag(this)'>#" + theuser.tag[i] + "</a> ";
				}	

				if(thetags != '')
					thetags = "<b>Tags: </b>"+thetags;


				$("#userChooser #uc_profile_brief").html(userThumb+"<span class='theinfo span7'><div class='thename' id='uc_username'>" + userName + "</div>" + "<div class='thelogin '>@"+ userLogin+ "</div><div class='thebio'>" + userBio + "</div><div class='thelink'><a href='" + userWeb +"' target='_blank'>" + userWeb + "</a></div><div id='thealerts'>"+thetags+"</div></span>");
				
				$.getJSON('/api/countUserInfo/' + userid ,function(data) {
					if(typeof data.count != 'undefined')
						$("#userChooser #uc_profile_yaks_posts").html("Yassalas<br /><b>" + data.count + "<b>");		
				});

				
				

				
				var subscribed_number = 0;

				if(typeof theuser.tagsubs != 'undefined')
					subscribed_number += theuser.usersubs.length;
				if(typeof theuser.feedsubs != 'undefined')
					subscribed_number += theuser.feedsubs.length;

				$("#userChooser #subscribed_number").html(subscribed_number);

				$.getJSON('/api/countUserSubscribers/' + userid ,function(data) {
					if(typeof data != 'undefined')
						$("#userChooser #subscribers_number").html(data.count);		
				});


				$("#uc_profile_yaks_search").unbind('click').on('click',function(){
					setSearchForUser(theuser.login);
					$('#userChooser').modal('hide');
				});

				var uri = '/api/user/feed/' + theuser._id;
				
				$('#uc_newsfeed').html("");

				$.getJSON(uri,function(ajax) {
					$.each(ajax.data, function(key,val) {
						if(key < 3)
							printFeedItemPopUp(val);	
					});
				});
			});
		}


		function showFeedProfile(el)
		{

			$("#uc_profile_yaks_subscribed").remove();		

			var userid = $(el).parent().find("input").val();

			emptyUserChooser();

			$('#userChooser').modal('show');

			$.getJSON('/api/feedsearchbyid2/' + userid ,function(data) {
				if($.inArray(userid,user.feedsubs) && user.feedsubs.length > 0)
					addAlert = 0;
				else
					addAlert = 1;

				var theuser = data.user;
				//console.log(theuser);
				if(typeof theuser == 'undefined')
				{
					$("#userChooser p").hide();
					$("#userChooser #closeModal").after("<p class='nonExist'>Ce compte n'existe plus</p>");
					return;
				}

				if(theuser.status != 1)
				{
					$("#userChooser p").hide();
					$("#userChooser #closeModal").after("<p class='nonExist'>Ce compte est actuellement désactivée</p>");
					return;
				}

				

				$("#uc_blacklist_user").unbind('click').click(function(){
					$.post('/api/user/blacklist', {id : theuser._id, type : 'feed', login: theuser.humanName} , function(res){
							if (res != "0")
							{
								var blFeed = {};
								blFeed._id = theuser._id;
								blFeed.login = theuser.humanName;
								user.listeNoire.feed = user.listeNoire.feed.concat(blFeed);
								$('#userChooser').modal('hide');	
								getAndPrintInfo();
							}

					});
				});	

				

	
				$("#uc_filter_user, #uc_profile_yaks_search").unbind('click').on('click',function(){
					setSearchForUser('@'+theuser.humanName);
					$('#userChooser').modal('hide');

				});
					
				$("#userChooser .nonExist").remove();
				$("#userChooser p").show();
				var userName = ""; var userBio = ""; var userThumb = ""; var userWeb = ""; var userLogin = "";
					

				$("#userChooser p.alertText").html("");

				if(typeof theuser.thumbBig != 'undefined')
					userThumb = "<span class='theimage span5'><img src='" + theuser.thumbBig +"' /></span>";
				

				if(typeof theuser.description != 'undefined')
					userBio = theuser.description;

				if(typeof theuser.humanName != 'undefined')
					userName = theuser.humanName;

				if(typeof theuser.link != 'undefined')
					userWeb = theuser.link;

				if(typeof theuser.name != 'undefined')
					userLogin = theuser.name;

				var thetags = "";

				if(typeof theuser.yakCatNameArray != 'undefined'){
					for(i=0; i<theuser.yakCatNameArray.length; i++){
						thetags += "<a onclick='setSearchForTag(this)'>#" + theuser.yakCatNameArray[i] + "</a> ";
					}	
				}
				if(thetags != '')
					thetags = '<b>Tags :</b>'+thetags;


				$("#userChooser #uc_profile_brief").html(userThumb+"<span class='theinfo span7'><div class='thename' id='uc_username'>" + userName + "</div>" + "<div class='thelogin'>@"+ userLogin+ "</div><div class='thebio'>" + userBio + "</div><div class='thelink'><a href='" + userWeb +"' target='_blank'>" + userWeb + "</a></div><div id='thealerts'>"+thetags+"</div></span>");
				
				$.getJSON('/api/countFeedInfo/' + userid ,function(data) {
					if(typeof data.count != 'undefined')
						$("#userChooser #uc_profile_yaks_posts").html("Cette Semaine<br /><b>" + data.count + "<b>");		
				});

				
				//console.log(userid);
				if($.inArray(userid,user.feedsubs) && user.feedsubs.length > 0)
				{

					addAlert = 0;
					var currHtml  = "Supprimer de mes alertes";
					$("#userChooser #uc_profile_yaks_alerts.mybtn").html(currHtml);		
					$("#userChooser #uc_profile_yaks_alerts.mybtn").unbind('click').click(function(){
						bindClickAlertFeed(theuser.id, theuser.humanName, theuser.name);
					});
				}
					
				else
				{
					addAlert = 1;
					var currHtml = "Ajouter a mes alertes";
					$("#userChooser #uc_profile_yaks_alerts.mybtn").html(currHtml);		
					$("#userChooser #uc_profile_yaks_alerts.mybtn").unbind('click').click(function(){
						
						bindClickAlertFeed(theuser.id, theuser.humanName, theuser.name);
					});
				}
			


				var subscribed_number = 0;

				if(typeof theuser.tagsubs != 'undefined')
					subscribed_number += theuser.usersubs.length;
				if(typeof theuser.feedsubs != 'undefined')
					subscribed_number += theuser.feedsubs.length;

				$("#userChooser #subscribed_number").html(subscribed_number);

				$.getJSON('/api/countFeedSubscribers/' + userid ,function(data) {
					if(typeof data != 'undefined')
						$("#userChooser #subscribers_number").html(data.count);		
				});


				

				var uri = '/api/feed/feed/' + theuser._id;
				
				$('#uc_newsfeed').html("");

				$.getJSON(uri,function(ajax) {
					$.each(ajax.data, function(key,val) {
						if(key < 3)
							printFeedItemPopUp(val);	
					});
				});
			});
		}

		// clean the feed element on map and feed page
		function cleanFeed(){
			$('#newsfeed').html('');
		}

		

		function printFeedItemPopUp(item){
			var dateTmp = new Date(item.pubDate);
			var pubDate = dateTmp.getDate()+'/'+(dateTmp.getMonth()+1)+'/'+dateTmp.getFullYear();
			dateTmp = new Date(item.dateEndPrint);
			var dateTmp2 = new Date(item.dateEndPrint);
			var dateEndPrint = dateTmp2.getDate()+'/'+(dateTmp2.getMonth()+1)+'/'+dateTmp2.getFullYear();

			infoContent = $("<div />");
			infoContent.attr("class", "infowindow mapHighlighter");
			infoContent.attr("infoId", item._id);

			

			if(!(typeof item.thumb === 'undefined') && item.thumb != conf.batchurl && item.thumb != null && item.thumb != '') {
				thumbImage = item.thumb.replace('thumb/','');
				//thumbImage = thumbImage.replace('//','/');
				var thumbImageCode = $("<div />");
				thumbImageCode.attr("class", "thumbImage");
				thumbImageCode.append("<img src=\'"+thumbImage+"\' />");
				//thumbImageCode.append("<img src='http://batch.yakwala.fr/PROD/YAKREP/BACKEND/thumb/d44cf5f99c5ba8c818809a2a19aa390a.jpg' />");
				infoContent.append(thumbImageCode);
			
			}
			var yakTypeImage = $("<div />");
			yakTypeImage.attr("class", "yakTypeImage yakTypeImage" + item.yakType);
			//yakTypeImage.html("<img src='/images/markers/new/type" + item.yakType + ".png' />");
			infoContent.append(yakTypeImage);
			

				

			var itemTitle = $("<div />");
			itemTitle.attr("class", "itemTitle");
			itemTitle.html(item.title.linkify());

			thedate = buildItemDate(item);
			var postedBy = $("<div />");
			postedBy.attr("class", "postedBy");

			var onclickUser = "showUserProfile(this)";
			if(item.origin.indexOf('@') != 0)
			{
				item.origin ="@"+item.origin;
				onclickUser = "setSearchFor(this);";
			}

			

			if(item.yakType !=2 )
			{
				postedBy.html("Posté par <a class='prevent-default' onclick='" + onclickUser +"'>"+item.origin+"</a><input type='hidden' value='" + item.user + "' />" + "<span class=\'date\'> - "+thedate+"</span>");
			}
				
			else{
				postedBy.html("Posté par <a class='prevent-default' onclick='" + onclickUser + "'>"+item.origin+"</a><input type='hidden' value='" + item.user + "' />");
				itemTitle.append(" - <span class=\'dateAgenda\'>"+thedate+"</span>");			
			}
				
			infoContent.append(itemTitle);
			infoContent.append(postedBy);
			
			var thetags = "<div class=\'tags\'>";					

			
			if(item.yakCatName.length > 0)
			{
				for (var i = 0; i < item.yakCatName.length; i++) {
					thetags += '<a class="tagHashLink prevent-default" onclick="setSearchFor(this)">#' + item.yakCatName[i] +'</a> ';	
				}
			}

			

			if (typeof(item.freeTag) != 'undefined') {
					
					for (var i = 0; i < item.freeTag.length; i++) {
						if(item.freeTag[i] != ""){
							thetags += '<a class="tagHashLink prevent-default" onclick="setSearchFor(this)">#' + item.freeTag[i] +'</a> ';	
							if( i < item.freeTag.length -1)
								thetags += ', ';
						}
					}
			}
			thetags += "</div>";

			
			infoContent.append(thetags);


			if(typeof(item.address) != 'undefined' && item.address != 'null' && item.address != ''){
				var theaddress = "<div class=\'infodetail\'>"+item.address+"</div>";
				if(user.login == 'renaud.bessieres' || user.login == 'dany.srour') /// this is debug
					theaddress += "<div class=\'infodetail\'>"+pubDate+" >> "+dateEndPrint+"</div>";
				infoContent.append(theaddress);
			}
				
			/*PRINT ON THE FEED*/
			
			var li = $("<li />");
			li.attr("class", "mapHighlighterDetails");
			li.attr("infoId", item._id);
			li.append(infoContent);
			$('#uc_newsfeed').append(li);

			
		}