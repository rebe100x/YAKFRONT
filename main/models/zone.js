/******************************ZONE*/
var mongoose = require('mongoose')
, Schema = mongoose.Schema;

var Zone = new Schema({
    name     : { type: String, required : true, index : true}
  , location       : { lat: {type: Number},lng:{type:Number} }
  , num : {type : Number}
  , formatted_address : {type : String}
  , address		: { type : { 
								arr: String,
								city: String,
								state: String,
								area: String,
								country: String,
								zip: String
							}
					}
	, creationDate	: {type: Date, required: true, default: Date.now}		
	, lastModifDate	: {type: Date, required: true, default: Date.now}		
	, box : { type : Schema.Types.Mixed}					
}, { collection: 'zone' });


Zone.statics.findNear = function (x,y,callback) {
	var center = [parseFloat(x), parseFloat(y)];
	z = 1;
	return this.find({"location" : {  "$near" : [parseFloat(x),parseFloat(y)], $maxDistance : z }},{},{'limit':1},callback );
}

Zone.statics.findAllNear = function (x,y,callback) {
	var center = [parseFloat(x), parseFloat(y)];
	z = 1;
	return this.find({"location" : {  "$near" : [parseFloat(x),parseFloat(y)], $maxDistance : z }},{},{sort:{name:1}},callback );
}

Zone.statics.findAll = function (callback) {
  return this.find({}, callback);
}
mongoose.model('Zone', Zone);

