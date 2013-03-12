// The place model



var mongoose = require('mongoose')
, Schema = mongoose.Schema;

var Place = new Schema({
	title	: { type: String, required: true, index:true}
,	content	: { type: String }
,	thumb	: { type: String }
,	origin	: { type: String }
,	access	: { type:Number }
,	licence	: { type: String }
,	outGoingLink	: { type: String }
,	creationDate	: {type: Date, required: true, default: Date.now}		
,	lastModifDate	: {type: Date, required: true, default: Date.now}		
,	location	: { type : { lat: Number, lng: Number }, index : '2d',required: true}
,	formatted_address : { type: String }
,	address		: { type : { 
								street_number: String,
								street: String,
								arr: String,
								city: String,
								state: String,
								area: String,
								country: String,
								zip: String
							}
					}
,	heat : {type:Number}
,	yakCat	: {type: [Schema.Types.ObjectId],index:1}
,	yakcatName: [String]
,	yakTag	: {type: [String],index:1}
,	freeTag	: {type: [String],index:1}		
,	contact : {type : {
						tel: String,
						mobile:String,
						mail:String,
						transportation:String,
						web:String,
						opening:String,
						closing :String,
						specialopening: String
				}
			}
,	status	: {type: Number}	
,	user	: {type: Schema.ObjectId}		
,	zone	: {type: Schema.ObjectId}
},{ collection: 'place' });


Place.statics.format = function (theplace) {
	if(theplace.thumb != undefined)
		if(theplace.user != 0 && theplace.user != undefined  )
			var thethumb = 	conf.fronturl+'/pictures/120_90/'+theplace.thumb;
		else
			var thethumb = 	conf.batchurl+theplace.thumb;
	else
		var thethumb = 	'';

	var formattedPlace = {
		_id:theplace._id,
		title: theplace.title,
		content: theplace.content, 
		thumb: theplace.thumb,
		outGoingLink: theplace.outGoingLink,
		yakCat: theplace.yakCat,
		creationDate: theplace.creationDate,
		lastModifDate: theplace.lastModifDate,
		location: theplace.location,
		address: theplace.address,
		contact: theplace.contact,
		formatted_address: theplace.formatted_address 
	};
  return formattedPlace;
}  

Place.statics.formatLight = function (theplace) {
	var formattedPlace = {
		_id:theplace._id,
		title: theplace.title,
		formatted_address: theplace.formatted_address 
	};
  return formattedPlace;
}  
  
Place.statics.findAll = function (callback) {
  return this.find({},{},{sort:{title:1}}, callback);
}

Place.statics.searchOne = function (str,exact,callback) {
  if(!exact)
	searchStr = new RegExp(str,'i');
  else
	searchStr = new RegExp('^'+str+'$','i');
  
  var cond = {
	"status":1,
	$or:[ {'title': {$regex:searchStr}}, {'content': {$regex:searchStr}} , {"freeTag": {$regex:searchStr}} , {"yakTag": {$regex:searchStr}}],	
};
  return this.find(cond,{},{limit:1}, callback);
}


Place.statics.findById = function (id, callback) {
	return this.findOne({'_id': id}, callback);
}

Place.statics.findAll = function (callback) {
	return this.find({},[],{sort:{title:1}}, callback);
}

/* Search for places :
* call /api/search/string for basic search and refine with following params
* params : 
	- count : limit
	- sensitive : 1 for case sensitive search 	
	- location : {lat:float, lng:float}
	- maxd : maxDistance to location // default : 1
* string : the string to search
*
*/
Place.statics.search = function(string,count,from,sensitive,lat,lng,maxd,callback){
	var limit = (typeof(count) != 'undefined' && count > 0) ? count : 100;		
	var case_sensitive = (typeof(sensitive) != 'undefined' && sensitive > 0) ? 'g' : 'gi';	
	var maxDistance = (typeof(maxd) != 'undefined' && maxd > 0) ? maxd : 1;	
	var skip = (typeof(from) != 'undefined' && from > 0) ? from : 0;		
	var input = new RegExp(string,case_sensitive);
	
	if(typeof(lat) != 'undefined' && lat > 0 && typeof(lng) != 'undefined' && lng > 0 && typeof(maxDistance) != 'undefined' && maxDistance > 0)
		var cond = {
			"title": {$regex:input},	
			"location" : {  "$near" : [parseFloat(lat),parseFloat(lng)], $maxDistance : parseFloat(maxDistance) },
			"status":1,
			"access":1
		};
	else
		var cond = {
			"title": {$regex:input},	
			"status":1,
			//"access":1
		};
	return this.find(
	cond,
	{
		_id: 1, 
		title: 1,
		content: 1, 
		thumb: 1,
		outGoingLink: 1,
		yakCat: 1,
		creationDate: 1,
		lastModifDate: 1,
		location: 1,
		address: 1 
	},
	{	
		skip:skip, // Starting Row
		limit:limit, // Ending Row
		
	},callback);
}

Place.statics.countSearch = function (searchTerm, status, yakcats, users, callback) {
	var search = new RegExp(searchTerm, 'i');

	var conditions = {
		"title" : search
	};

	if (status == 2) {
		conditions["status"] = { $in: [2,10] };
	}
	else if (status != 4) {
		conditions["status"] = status;
	}


	if (0 < yakcats.length)
		conditions["yakCat"] = { $all: yakcats };

	if (0 < users.length)
		conditions["user"] = { $in: users };

	return this.count(conditions, callback);
}

Place.statics.validatePlaces = function (ids, callback) {
	var conditions = { _id: { $in: ids} }
	, update = { status: 1 }
	, options = { multi: true };

	update["lastModifDate"] = Date.now();
	this.update(conditions, update, options, callback);
}

Place.statics.rejectPlaces = function (ids, callback) {

	var conditions = { _id: { $in: ids } }
	, update = { status: 3 }
	, options = { multi: true };


	update["lastModifDate"] = Date.now();
	this.update(conditions, update, options, callback);
}

Place.statics.deletePlaces = function (ids, callback) {

	var conditions = { _id: { $in: ids } }
		, update = { status: 3 }
		, options = { multi: true };

	update["lastModifDate"] = Date.now();

	this.update(conditions, update, options, callback);
}

Place.statics.waitPlaces = function (ids, callback) {

	var conditions = { _id: { $in: ids } }
		, update = { status: 2 }
		, options = { multi: true };

	update["lastModifDate"] = Date.now();
	this.update(conditions, update, options, callback);
}

Place.statics.findGridPlaces = function (pageIndex, pageSize, searchTerm, sortProperties, sortDirections, status, yakcats, users, callback) {

	var conditions = {
		"title" : new RegExp(searchTerm, 'i')
	};

	var sortBy = {};

	for (index in sortProperties) {
		var desc = 1;
		if (sortDirections[index] == "desc")
			desc = -1;
		sortBy[sortProperties[index]] = desc;
	}

	if (status == 2) {
		conditions["status"] = { $in: [2,10] };
	}
	else if (status != 4) {
		conditions["status"] = status;
	}

	if (users.length > 0)
		conditions["user"] = { $in: users };

	if (yakcats.length > 0)
		conditions["yakCat"] = { $all: yakcats };

	return this.find(
		conditions,
		'title content outGoingLink origin status formatted_address yakCat freeTag creationDate',
		{
			skip:
			(pageIndex -1)*pageSize,
			limit:
			pageSize,
			sort:
			sortBy
		},
		callback);
}

Place.statics.countUnvalidated = function (callback) {
	return this.count( {status: { $in: [2, 10]}}, callback );
}

Place.statics.findByTitle = function (title, callback) {
	return this.find({ title: title }, callback);
}

Place.statics.findByIds = function (ids,callback) {
  return this.find({'_id': { $in: ids}}, callback);
}
Place.statics.findByName = function (title,callback) {
  return this.findOne({'title': title}, callback);
}
Place.statics.findByNameNear = function (title,location,maxd,callback) {
  return this.findOne({'title': title,'location' : {  "$near" : location, $maxDistance : maxd }}, callback);
}

mongoose.model('Place', Place);
