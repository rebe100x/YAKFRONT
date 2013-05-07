		
/*READY FUNCTIONS*/	
$(document).ready(function() {

	
	/* Detect browser */
	var isChrome = window.chrome;
	if(!isChrome) {

		$("#alertInfo").show();
		$("#alertInfo span.alertText").html("Cette interface est omptimisée pour <a target='_blank' href='https://www.google.com/intl/fr/chrome/browser/?hl=fr'>Chrome</a>.");
	
	}
});
/*END READY FUNCTIONS*/





function moveMap(lat,lng){
	curPos.x = lat;
	curPos.y = lng;
	$.cookie("geoloc", JSON.stringify(curPos),{ expires: 10000 });
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


function placeMarker(location,mk) {
  	
	$('#latitude').val(location.lat());	
	$('#longitude').val(location.lng());	

	
	mk.setVisible(true);
	mk.setPosition(location);
	
	//getformattedAddress(location);
	
	
}

function getformattedAddress(position){
	
	var geoQuery = {"location": position};
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode( geoQuery, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				//$('#place').val(results[0].formatted_address).select();
				var placeGmap = getPlaceFromGmapResult(results[0]);
				//console.log(results);
				placeArray = placeGmap;
				$("#placeForm #placeInput").val(JSON.stringify(placeArray));
				console.log(placeGmap.address.state);
				$('#placeSearch').val(placeGmap.address.state+', '+placeGmap.address.area);
				$('#placeLabel').first().remove();
				$('#btn-place-adder').parent().before("<div id='placeLabel'><i class='icon-remove' onclick='placeArray=null;$(\"#placeInput\").val(JSON.stringify(placeArray));$(this).parent().remove();'></i> "+results[0].formatted_address+"</div>");
			} else {
				var salt = new Date().getTime();
				$('#btn-place-adder').parent().before("<div id='alert"+salt+"' class='control-label'><i class='icon-exclamation-sign'> </i>Adresse invalide ("+status+")</div>");
				setTimeout(function() {
					$("#alert"+salt).fadeOut();
				}, 3000);
				$('#place').select();
			}
		});
		//$("#place").val('').select();

}


function deletePlaceHTML(placeArray,results,self){
	
	
	
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
		if(item.types.inArray('route'))
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
	//console.log((result.geometry.location.Xa));
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
		,"location":{"lng":parseFloat(result.geometry.location.Ya),"lat":parseFloat(result.geometry.location.Xa)}
		,"status":2 // need validation
		,"address": addressGmap
		};
		
	return placeGmap;
}	

