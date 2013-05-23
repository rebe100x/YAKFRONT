// The feed model



var mongoose = require('mongoose')
, Schema = mongoose.Schema;


var Feed = new Schema({
	XLconnector	: String
	,humanName	: String
	,name	: {type:String,required:true,unique:true}
	,linkSource	:[String]
	,link	: String 
	,feedType	: String 
	,fileSource	: [String] 
	,rootElement	: String 
	,lineToBegin	: Number
	,parsingTemplate : {type:{
		title : String,
		content : String,
		address : String,
		outGoingLink : String,
		latitude : String,
		longitude : String,
		geolocation : String,
		thumb : String,
		yakCats : String,
		freeTag : String,
		place : String,
		eventDate : String,
		pubDate : String,
		telephone : String,
		web : String,
		mobile : String,
		mail : String,
		transportation : String,
		opening : String,
		}
	}
	,description : String
	,thumb : String
	,thumbSmall : String
	,thumbMedium : String
	,thumbBig : String
	,licence : String
	,yakCatName : [String]
	,yakCatId : [String]
	,tag : [String]
	,persistDays : Number
	,defaultPlaceId : Schema.ObjectId
	,defaultPlaceLocation	: { type : { lat: Number, lng: Number }, index : '2d',required: true}
	,defaultPlaceSearchName : String
	,defaultPlaceName : String
	,yakType : Number
	,defaultPrintFlag : Number
	,creationDate : {type: Date, required: true, default: Date.now}
	,lastModifDate: {type: Date, required: true, default: Date.now}
	,status : Number
	,daysBack : Number
	,zone : Number
},{ collection: 'feed' });


Feed.statics.searchByName = function (str,callback) {
  searchStr = new RegExp(str,'i');
  var cond = {
	$or:[ {'humanName': {$regex:searchStr}}, {'name': {$regex:searchStr}} ]
};
  return this.find( cond,{humanName:1, _id: 1, name: 1}, callback );
}

Feed.statics.findByName = function (str,callback) {
  var cond = {'name': str};
  return this.findOne( cond, callback );
}

Feed.statics.formatLight2 = function (thefeed) {
	var formattedFeed = {
		_id:thefeed._id,
		title: thefeed.humanName+'(@'+thefeed.name+')',
		name: thefeed.humanName,
	};
  return formattedFeed;
}  


Feed.statics.format = function (thefeed) {
	var formattedFeed = thefeed;

	if(thefeed.thumb && typeof thefeed.thumb!= 'undefined'){
		var thethumbbig = 	"https://s3-eu-west-1.amazonaws.com/"+conf.bucket+'/128_128/'+thefeed.thumb;
		var thethumbmedium = 	"https://s3-eu-west-1.amazonaws.com/"+conf.bucket+'/48_48/'+thefeed.thumb;
		var thethumbsmall = 	"https://s3-eu-west-1.amazonaws.com/"+conf.bucket+'/24_24/'+thefeed.thumb;
	}else{
		var thethumbbig = 	"https://s3-eu-west-1.amazonaws.com/"+conf.bucketstatic+'/128_128/no-user.png';
		var thethumbmedium = 	"https://s3-eu-west-1.amazonaws.com/"+conf.bucketstatic+'/48_48/no-user.png';
		var thethumbsmall = 	"https://s3-eu-west-1.amazonaws.com/"+conf.bucketstatic+'/24_24/no-user.png';
	}
	thefeed.thumbBig = thethumbbig;
	thefeed.thumbMedium = thethumbmedium;
	thefeed.thumbSmall = thethumbsmall;


  return thefeed;
}  

  
Feed.statics.findAll = function (callback) {
  return this.find({},{},{sort:{humanName:1}}, callback);
}

Feed.statics.searchOne = function (str,exact,callback) {
  if(!exact)
	searchStr = new RegExp(str,'i');
  else
	searchStr = new RegExp('^'+str+'$','i');
  
  var cond = {
	"status":1,
	$or:[ {'name': {$regex:searchStr}}, {'humanName': {$regex:searchStr}}],	
};
  return this.find(cond,{},{limit:1}, callback);
}


Feed.statics.findById = function (id, callback) {
	return this.findOne({'_id': id}, callback);
}

Feed.statics.findAll = function (callback) {
	return this.find({},[],{sort:{humanName:1}}, callback);
}



Feed.statics.countSearch = function (searchTerm, status, type, callback) {
	var search = new RegExp(searchTerm, 'i');

	var conditions = {
		$or:[ {'name': search}, {'humanName': search}]	
	};

	if (status != 'all') {
			conditions["status"] = status;
	}

	if (type != 'all') {
			conditions["feedType"] = type;
	}
	
	return this.count(conditions, callback);
}

Feed.statics.disableFeed = function (ids, callback) {

	var conditions = { _id: { $in: ids } }
		, update = { status: 0 }
		, options = { multi: true };

	update["lastModifDate"] = Date.now();

	this.update(conditions, update, options, callback);
}



Feed.statics.findGridFeeds = function (pageIndex, pageSize, searchTerm, sortProperties, sortDirections, status, type, callback) {

	var conditions = {
		$or:[ {'name': new RegExp(searchTerm, 'i')}, {'humanName': new RegExp(searchTerm, 'i')}]	
	};

	var sortBy = {};

	for (index in sortProperties) {
		var desc = 1;
		if (sortDirections[index] == "desc")
			desc = -1;
		sortBy[sortProperties[index]] = desc;
	}

	if (status != 'all') {
			conditions["status"] = status;
	}

	if (type != 'all') {
			conditions["feedType"] = type;
	}
	
	return this.find(
		conditions,
		{},
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

Feed.statics.countUnvalidated = function (callback) {
	return this.count( {status: { $in: [2, 10]}}, callback );
}

Feed.statics.findByTitle = function (title, callback) {
	return this.find({ title: title }, callback);
}

Feed.statics.findByIds = function (ids,callback) {
  return this.find({'_id': { $in: ids}}, callback);
}

Feed.statics.findByNameNear = function (title,location,maxd,callback) {
  return this.findOne({'name': title,'location' : {  "$near" : location, $maxDistance : maxd }}, callback);
}

mongoose.model('Feed', Feed);
