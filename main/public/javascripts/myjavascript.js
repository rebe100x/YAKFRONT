var socket = io.connect('http://localhost:3000');
	
$(document).ready(function() {

	
	
		
	/*bootstrap alert plugin*/
	$(".alert").alert();
	
	/*top locator button which pops up the locatorChooser popup*/
	$('#zoneLocButton').click(function(){
			$('#locationChooser .modal-body p.alertText').html("");
			$('#locationChooser').modal('show');
		});
	/*locator pop up links*/	
	$('.zoneLoc').click(updateXY);
	
	
});


Array.prototype.cleanArray=function(id){
for(i=0;i<this.length;i++)
	if(id==this[i]._id) 
		this.splice(i, 1);
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

	socket.emit('position', curPos);
	
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
			
			
			socket.emit('position', curPos);
		
		
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
	
	
	google.maps.event.addListener(mk, 'dragend', function() {
		var position = mk.getPosition();
		$('#latitude').val(position.lat());	
		$('#longitude').val(position.lng());	

	});
}




