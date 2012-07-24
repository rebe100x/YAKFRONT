$(document).ready(function() {

	/*INIT*/	
	curPos = {'x':0,'y':0,'z':10};
	
	var geolocalized = 0;
	var infowindow = null;

		
		console.log(curPos);
	/*bootstrap alert plugin*/
	$(".alert").alert();
	/*top locator button which pops up the locatorChooser popup*/
	$('#zoneLocButton').click(function(){
			$('#locationChooser .modal-body p.alertText').html("Vous pouvez naviguer sur les 3 zones couvertes pour l\'instant sur Yakwala :");
			$('#locationChooser').modal('show');
		});
	/*locator pop up links*/	
	$('.zoneLoc').click(updateXY);
	
	
	if(navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(getHTML5Pos,getErrHTML5Pos);
		
		
	}else {
		console.log("no html5 geoloc");
		
	}
	
	console.log(curPos);
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
		z = 10;
	}
	curPos = {'x':x,'y':y,'z':z};

	$('#locationChooser').modal('hide');
	
	if($('#mymap').length > 0){ // only for the map page
		google.maps.event.addDomListener(window, 'load', initialize(curPos.x,curPos.y,curPos.z)); 
	}
	//return curPos;
	
	
	
}

function getHTML5Pos(position) {
	x = position.coords.latitude;
	y = position.coords.longitude;
	z = 10;
	
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
	x = 48.297812;
	y = 4.086914;
	
	$.getJSON('/api/zones/'+x+'/'+y,function(data) {
	
		if(data.zone.length == 0){
			$('#locationChooser .modal-body p.alertText').html("Yakwala ne couvre pas encore votre zone géographique, vous pouvez choisir ci dessous votre zone de navigation :");
			$('#locationChooser').modal('show');
			console.log('not near area');
		}else{
			var zone = new Object(data.zone[0]);
			
			console.log(zone.box.br.lat);
			console.log(x +'>'+ zone.box.tl.lat+' && '+x +'<'+ zone.box.br.lat +'&&'+ y +'<'+ zone.box.tl.lng +'&&'+ y +'>'+ zone.box.br.lng);
			if(x < zone.box.tl.lat && x > zone.box.br.lat && y > zone.box.tl.lng && y < zone.box.br.lng ){
				console.log('inside');
				curPos = {'x':x,'y':y,'z':16};
			}else{
				console.log('outside');
				curPos = {'x':zone.location.lat,'y':zone.location.lng,'z':10};
				
			}
				
			if($('#mymap').length > 0)	
				google.maps.event.addDomListener(window, 'load', initialize(curPos.x,curPos.y,curPos.z)); 
		}
			
		
	});
	//google.maps.event.addDomListener(window, 'load', initialize(x,y,zoom)); 
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
	console.log(info);
}

function initialize(x,y,z) {
console.log('init'+x+'--'+y+'--'+z);
	var center = new google.maps.LatLng(x,y);
	infowindow = new google.maps.InfoWindow({content: ".",maxWidth : 300});
	var map = new google.maps.Map(document.getElementById('mymap'), {
		zoom: z,
		center: center,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	});

	var markers = [];
	
	$.getJSON('/api/infos',function(data) {
	
		var items = [];
		$.each(data.info, function(key,val) {
		//console.log(val);
			
			
			var latLng = new google.maps.LatLng(val.location['lat'],val.location['lng']);
			var marker = new google.maps.Marker({position: latLng});
			markers.push(marker);
			
			google.maps.event.addListener(marker, 'click', function() {
				//map.setZoom(8);
				//map.setCenter(marker.getPosition());
				var dateTmp = new Date(val.creationDate);
				console.log(val.creationDate);
				var dateCreation = dateTmp.getDate()+'/'+(dateTmp.getMonth()+1)+'/'+dateTmp.getFullYear();
				var infoContent = "<div class=\'infowindow\' ><img src=\'http://dev.backend.yakwala.com/BACKEND/"+val.thumb+"\' /><div class=\'title\'> "+val.title+" ("+dateCreation+")</div><div class=\'content\'>"+val.content.substring(0,250)+"...</div><div class=\'readmore\'><a target=\'_blank\' href=\'"+val.outGoingLink+"\'> Read more</a></div></div>";
				infowindow.setContent(infoContent);
				infowindow.open(map, this);
			});	
			
		});
		
		var markerClustererOptions = {gridSize:30,maxZoom: 17};
		var markerCluster = new MarkerClusterer(map, markers,markerClustererOptions);
		
		google.maps.event.addListener(markerCluster, 'click', function(data) {
			console.log('data'+data);
		});
	});
	
	
}
