	
setInterval("$('.alert-error').fadeOut('slow');", 30000);

/*READY FUNCTIONS*/	
$(document).ready(function() {




	/* Detect browser */
	var isChrome = window.chrome;
	if(!isChrome) {

		$("#alertInfo").show();
		$("#alertInfo span.alertText").html("Cette interface est omptimisée pour <a target='_blank' href='https://www.google.com/intl/fr/chrome/browser/?hl=fr'>Chrome</a>.");
	
	}

	/*top locator button which pops up the locatorChooser popup*/
	$('#zoneLocButton').click(function(){
			$('#locationChooser .modal-body p.alertText').html("");
			$('#locationChooser').modal('show');
	});

	//Enabe alert dismissal
	//$(".alert").alert()

});
/*END READY FUNCTIONS*/



function setError(objId,str){	
	$(objId).before('<div class="alert alert-error"><a href="#" class="close" data-dismiss="alert">&times;</a><strong>Erreur: </strong> '+str+'</div>').focus();
	$('#newsfeedContainer').mCustomScrollbar("scrollTo","err");
}

function setGravatar()
{

	if(typeof user.mail != 'undefined' && user.mail != null && user.mail != ""){
		var gravatarMail = $.trim(user.mail).toLowerCase();
		var gravatarLink = 'http://www.gravatar.com/avatar/' + $.md5(gravatarMail) + "?s=51";
		gravatarImage = "<img class='gravatarImage' src='"+gravatarLink+"' alt='Gravatar Image - Profile' title='Gravatar Image - Profile' />" ;
		$("#profileMenu").attr('src',gravatarLink);
	}
}

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
				var mydropdown = '<select onchange="changemyrange()" alt="' + id + '" range="80" class="dropdownRangeSelector"><option value="70" rangetext="Local">Local</option><option value="80" rangetext="Très Local" selected="selected">Très Local</option><option value="100" rangetext="Super Local">Super Local</option><option value="120" rangetext="Hyper Local">Hyper Local</option></select>';
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


function moveMap(lat,lng){
	curPos.x = lat;
	curPos.y = lng;
	$.cookie("geoloc", JSON.stringify(curPos),{ expires: 10000 ,path : '/' });
	var latLng = new google.maps.LatLng(lat,lng);
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
	
	curPos = {'x':x,'y':y,'z':z};
	
	google.maps.event.addDomListener(window, 'load', initialize(curPos.x,curPos.y,curPos.z)); 	
	
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


/*Creates a clickable html table from the data json*/
function createTableParsing(data,type){
	var dataObj = data;
	var table = '<table class="table table-nohover table-condensed">';
	var header = '<thead><tr>';
	var body = '<tbody>';
	var num = 0;
	$.each(dataObj[0], function(key, val) {
		if(type == 'CSV')
			var checkedIcon = addCheckIconToTH(num);
		else
			var checkedIcon = addCheckIconToTH(key);
		header += '<th class="col_'+S(key).slugify()+' tableParsing"  key="'+key+'" num="'+num+'">'+checkedIcon+key+'</th>';
		num ++;
	}); 

	header += '</tr></thead>';

	dataObj.forEach(function(item) {
		body += '<tr>';	
		num = 0;
		$.each(item, function(key, val) {
			body += '<td class="col_'+S(key).slugify()+' tableParsing" key="'+key+'"" num="'+num+'">'+val+'</td>';	
			num ++;		
		}); 
		body += '</tr></tbody>';
	});
	table += header + body + '</table>';
	return table;
}

function addCheckIconToTH(key){
	var checkedIcon = '';
		$('#infoParsingForm input').each(function(){
			var inputVal = $(this).val(); 
			if(inputVal.indexOf("#YKL"+key)>=0)
				checkedIcon = '<i title="mapped" class="icon-check"></i>';		
		});
	return checkedIcon;	

}
function deletePlaceHTML(placeArray,results,self){
	
	
	
}

function normalizeTag(str) {

    var tmp =  str.replace(/(?:^|\s)\w/g, function(match) {
        return match.toUpperCase();
    }).replace(/(\s|,)/g,'').trim();

   	if(tmp.length > 0)
    	return "#"+tmp;
    else
    	return '';
}


