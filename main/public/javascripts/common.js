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


