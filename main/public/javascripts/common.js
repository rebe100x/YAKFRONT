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
String.prototype.isUrl=function(){
	var regex = new RegExp("^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_\+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?");
	if(regex.test(this))
		return true;
	else
		return false;
}
String.prototype.isInt=function(){
	var intRegex = /^\d+$/;
	if(intRegex.test(this))
		return true;
	else
		return false;	
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



function killCookie(name, path){
	$.cookie(name, null, { path: path, expires: -5 });
}

var setdelay = (function(){
	var timer = 0;
	return function(callback, ms){
		clearTimeout (timer);
		timer = setTimeout(callback, ms);
	};
})();


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
	
	var bounds = result['geometry']['bounds'];
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
		,"location":{"lng":parseFloat(result.geometry.location.lng),"lat":parseFloat(result.geometry.location.lat)}
		//,"location":{"lng":parseFloat(result.geometry.location.ib),"lat":parseFloat(result.geometry.location.hb)}
		,"status":2 // need validation
		,"address": addressGmap
		,"formatted_address":result.formatted_address
		//,"bounds":{tr:{lat:bounds.Z.d,lng:bounds.fa.d},bl:{lat:bounds.Z.b,lng:bounds.fa.b}}
		,"bounds":{tr:{lat:bounds.tr.lat,lng:bounds.tr.lng},bl:{lat:bounds.bl.lat,lng:bounds.bl.lng}}
	};
	return placeGmap;
}	

function fixGmapResult(item){
	item.geometry.location.lat = item.geometry.location.lat();
	item.geometry.location.lng = item.geometry.location.lng();
	if(typeof item.geometry.bounds != 'undefined'){
		var latLngTR = item.geometry.bounds.getNorthEast();
		var latLngBL = item.geometry.bounds.getSouthWest();
		item.geometry.bounds = {tr:{lat:latLngTR.lat(),lng:latLngTR.lng()},bl:{lat:latLngBL.lat(),lng:latLngBL.lng()}};
	}else{
		var latLngTR = item.geometry.viewport.getNorthEast();
		var latLngBL = item.geometry.viewport.getSouthWest();
		item.geometry.bounds = {tr:{lat:latLngTR.lat(),lng:latLngTR.lng()},bl:{lat:latLngBL.lat(),lng:latLngBL.lng()}};
	}
		
	return item
}