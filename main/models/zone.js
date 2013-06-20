/******************************ZONE*/
var mongoose = require('mongoose')
, Schema = mongoose.Schema;

var Zone = new Schema({
    name     : { type: String, required : true, index : true, unique:true}
  , location	: { type : { lat: Number, lng: Number }, index : '2d'}	
  , num : {type : Number,unique:true,index:true}
  , status : {type : Number, index:1}
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
	, box : { type : {
						bl: {lat : Number, lng: Number},
    					tr : {lat : Number, lng: Number},
	}}					
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

Zone.statics.findGridZones = function (pageIndex, pageSize, searchTerm, sortProperties, sortDirections, status, callback) {
	var conditions = {
		"name" : new RegExp(searchTerm, 'i')
	};

	var sortBy = {};

	for (index in sortProperties) {
		var desc = 1;
		if (sortDirections[index] == "desc")
			desc = -1;
		sortBy[sortProperties[index]] = desc;
	}


	if (status >= 0) {
		conditions["status"] = status;
	}

	
	return this.find(
		conditions,
		{},
		{
			skip:(pageIndex -1)*pageSize,
			limit:pageSize,
			sort:sortBy
		},
		callback);
}

Zone.statics.countSearch = function (searchTerm, status, callback) {
	var search = new RegExp(searchTerm, 'i');

	var conditions = {
		"name" : search
	};

	if(status >= 0)
		conditions["status"] = status;
		
	return this.count(conditions, callback)-1;
}


mongoose.model('Zone', Zone);

