
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , S = require('string')
  , crypto = require('crypto')
  ObjectId = Schema.ObjectId;
  

mongoose.set('debug', true);

/*
var Address = new Schema({
	street_number : String
	, street     : String
	, arr     : String
	, city      : String
	, state      : String
	, country      : String
	, area      : String
	, zip      : String
});
mongoose.model('Address', Address);	
*/
var UserLight = new Schema({
	  name : String
	, location	: { type : { lat: Number, lng: Number }}
	, formatted_address : String
});
mongoose.model('UserLight', UserLight);
/******************************USERS*/
//#USER
var User = new Schema({
	name	: { type: String, index: true}
	, bio	: { type: String}
    , mail	: { type: String, required: false, index: true}
	, web	: { type: String}
	, tag	: { type: [String], index: true}
	, thumb	: { type: String, default:'no-user.png'}
	, type	: { type: Number, required: true, index: true}
	, login     : { type: String, lowercase: true, required: true, index: { unique: true }}
	, hash      : { type: String ,required: true, index: true}
	, salt      : { type: String ,required: true, index: true}
	, token     : { type: String ,required: true, index: true}
	, usersubs	: { type: [User],ref: 'User',  index: true}
	, feedsubs	: { type: [],ref: 'Feed',  index: true}
	, tagsubs	: { type: [String], index: true}
	, placesubs	: { type: [Schema.Types.ObjectId], index: true}
	, location	: { type : { lat: Number, lng: Number }, index : '2d'}	
	, formatted_address : { type: String }
	, addressZoom: { type: Number, default:80}
	, addressZoomText: { type: String, default:'Très Local'}
	, address	: { type : { 
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
	, favplace : [Point]
	, creationDate	: {type: Date, required: true, default: Date.now}		
	, lastModifDate	: {type: Date, required: true, default: Date.now}		
	, lastLoginDate	: {type: Date, required: true, default: Date.now}	
	, alertsLastCheck : {type: Date, required: true, default: Date.now}	
	, gravatarStatus : { type : Number, default: 2} // 0 don't use, 1 use gravatar, 2 never use gravatar
	, status	: {type: Number,required: true, default: 2,index: true}	
	, social: { 
		twitter : {type: [Twitter],required: false},
		facebook : {type: [Facebook],required: false},
		google : {type: [Google],required: false}
	 },
	 illicite : {type: [contenuIllicite],required: false}
	, stats: { 
		cats: {type : Schema.Types.Mixed},
		tags: {type : Schema.Types.Mixed},
	}
	,listeNoire : {
		user: {type : [Schema.Types.Mixed]},
		feed: {type : [Schema.Types.Mixed]},
		info: {type : [Schema.Types.Mixed]},
	}
	, createfrom_social  :{ type : Number, default:0} // 0 yakwala, 1 twitter, 2 facebook, 3 google
	, apiData	: { type: [{
							apiClientId : {type: Schema.ObjectId,index: true}  
							, apiStatus	: {type: Number, required: true, default: 2,index: true}
							, apiCode       : { type: String ,index: true}
							, apiCodeCreationDate     :  {type: Date,index: true}		
							, apiToken     :  {type: String , index: true}		
							, apiTokenCreationDate     :  {type: Date,index: true}	
						}]
					}
}, { collection: 'user' });

User.index({"social.twitter.twitter_id":1});
User.index({"social.facebook.facebook_id":1});
User.index({"social.google.google_id":1});

User.statics.countUserSubscribers = function (usersubs, callback) {
  return this.find({ 'usersubs._id':usersubs},{}).count().exec(callback);
}

User.statics.countFeedSubscribers = function (feedsubs, callback) {
	return this.find({ 'feedsubs._id':feedsubs},{}).count().exec(callback);
}
User.statics.findGridUsers = function (pageIndex, pageSize, searchTerm, sortProperties, sortDirections, status, type, currUser, callback) {

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

	conditions["_id"] = { $ne: currUser };

	if(status >=0)
		conditions["status"] = status;

	if(type != 0)
		conditions["type"] = type;

	return this.find(
		conditions,
		'thumb thumbverysmall name login type status creationDate',
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

User.statics.countSearch = function (searchTerm, status, callback) {
	var search = new RegExp(searchTerm, 'i');

	var conditions = {
		"name" : search
	};

	if(status >=0)
		conditions["status"] = status;
	
	return this.count(conditions, callback)-1;
}

User.statics.format = function (theuser) {
	if(theuser.thumb && theuser.thumb!= 'no-user.png'){
		var thethumb = 	"https://s3-eu-west-1.amazonaws.com/"+conf.bucket+'/128_128/'+theuser.thumb;
		var thethumbsmall = 	"https://s3-eu-west-1.amazonaws.com/"+conf.bucket+'/48_48/'+theuser.thumb;
		var thethumbverysmall = 	"https://s3-eu-west-1.amazonaws.com/"+conf.bucket+'/24_24/'+theuser.thumb;
		//var thethumb = 	conf.fronturl+'/pictures/128_128/'+theuser.thumb;
		//var thethumbsmall = 	conf.fronturl+'/pictures/48_48/'+theuser.thumb;
	}
	else{
		var thethumb = 	"https://s3-eu-west-1.amazonaws.com/"+conf.bucketstatic+'/128_128/no-user.png';
		var thethumbsmall = 	"https://s3-eu-west-1.amazonaws.com/"+conf.bucketstatic+'/48_48/no-user.png';
		var thethumbverysmall = 	"https://s3-eu-west-1.amazonaws.com/"+conf.bucketstatic+'/24_24/no-user.png';
	}
		

	var formattedUser = {
		_id:theuser._id,
		name:theuser.name,
		login:theuser.login,
		bio:theuser.bio,
		thumb:thethumb,
		creationDate:theuser.creationDate,
		thumbsmall:thethumbsmall,
		thumbverysmall:thethumbverysmall,
		web:theuser.web,
		type:theuser.type,
		mail:theuser.mail,
		lastLoginDate:theuser.lastLoginDate,
		location:theuser.location,
		address:theuser.address,
		formatted_address:theuser.formatted_address,
		addressZoom: theuser.addressZoom,
		addressZoomText: theuser.addressZoomText,
		favplace:theuser.favplace,
		usersubs:theuser.usersubs,
		feedsubs:theuser.feedsubs,
		tagsubs:theuser.tagsubs,
		tag:theuser.tag,
		social: theuser.social,
		stats: theuser.stats,
		createfrom_social: theuser.createfrom_social,
		status: theuser.status,
		illicite: theuser.illicite,
		alertsLastCheck : theuser.alertsLastCheck,
		listeNoire: theuser.listeNoire,
		gravatarStatus: theuser.gravatarStatus
	};
  return formattedUser;
}

User.statics.formatLight = function (theuser) {
	if(theuser.thumb && theuser.thumb!= 'no-user.png'){
		var thethumb = 	"https://s3-eu-west-1.amazonaws.com/"+conf.bucket+'/128_128/'+theuser.thumb;
		var thethumbsmall = 	"https://s3-eu-west-1.amazonaws.com/"+conf.bucket+'/48_48/'+theuser.thumb;
	}else{
		var thethumb = 	"https://s3-eu-west-1.amazonaws.com/"+conf.bucketstatic+'/128_128/no-user.png';
		var thethumbsmall = 	"https://s3-eu-west-1.amazonaws.com/"+conf.bucketstatic+'/48_48/no-user.png';
	}

	var formattedUser = {
		_id:theuser._id,
		name:theuser.name,
		login:theuser.login,
		userdetails:theuser.name+'(@'+theuser.login+')',
		thumb:thethumb,
		thumbsmall:thethumbsmall,
	};
  return formattedUser;
}



User.statics.formatLight2 = function (theuser) {
	
	var formattedUser = {
		_id:theuser._id,
		title:theuser.name+'(@'+theuser.login+')',
		name: theuser.name,
	};
  return formattedUser;
}

User.statics.FormatProfile = function (theuser) {


	if(theuser.thumb && theuser.thumb!= 'no-user.png'){
		var thethumb = 	"https://s3-eu-west-1.amazonaws.com/"+conf.bucket+'/128_128/'+theuser.thumb;
		var thethumbsmall = 	"https://s3-eu-west-1.amazonaws.com/"+conf.bucket+'/48_48/'+theuser.thumb;
	}else{
		var thethumb = 	"https://s3-eu-west-1.amazonaws.com/"+conf.bucketstatic+'/128_128/no-user.png';
		var thethumbsmall = 	"https://s3-eu-west-1.amazonaws.com/"+conf.bucketstatic+'/48_48/no-user.png';
	}


	var formattedUser = {
		_id:theuser._id,
		name: theuser.name,
		login: theuser.login,
		formatted_address : theuser.formatted_address,
		bio: theuser.bio,
		creationDate : theuser.creationDate,
		thumb:thethumb,
		thumbsmall:thethumbsmall,
		web: theuser.web,

	};
  return formattedUser;
}

User.statics.countUnvalidated = function (callback) {
	return this.count( {'status': 2}, callback );
}

User.statics.findByLogin = function (login,callback) {
  return this.find({login:login,status:1}, callback);
}

User.statics.findbyMail = function (mail,callback) {
  return this.find({'mail':mail}, callback);
}

User.statics.findByLoginDuplicate = function (login,callback) {
  return this.findOne({'login': login}, callback);
}

User.statics.findByIds = function (ids,callback) {
  return this.find({'_id': { $in: ids}}, callback);
}
User.statics.identifyByToken = function (token,userid,callback) {
  return this.findOne({'_id':userid,'apiData.apiToken': token,'status':1}, callback);
}
User.statics.findById = function (id,callback) {
  return this.findOne({'_id': id}, callback);
}
User.statics.findById2 = function (id,callback) {
  return this.find({'_id': id}, callback);
}
User.statics.PublicProfileFindById = function (id,callback) {
  return this.findOne({'_id': id},{_id:1,address:1,bio:1,location:1,login:1,mail:1,name:1,thumb:1,type:1,web:1,lastLoginDate:1,favplace:1,placesubs:1,tagsubs:1,usersubs:1, feedsubs:1,tags:1}, callback);
}
User.statics.findByToken = function (token,callback) {
  return this.findOne({'token': token,'status':2}, callback);
}
User.statics.findByTwitterId = function (twitter_id,callback) {
  return this.findOne({'social.twitter.twitter_id': twitter_id,'status':1}, callback);
}

User.statics.findByFacebookId = function (facebook_id,callback) {
  return this.findOne({'social.facebook.facebook_id': facebook_id}, callback);
}

User.statics.findByGoogleId = function (google_id,callback) {
  return this.findOne({'social.google.google_id': google_id}, callback);
}

User.statics.findAll = function (callback) {
  return this.find({},{},{sort:{name:1}}, callback);
}
User.statics.search = function(string,count,from,sensitive,callback){
	var limit = (typeof(count) != 'undefined' && count > 0) ? count : 100;		
	var skip = (typeof(from) != 'undefined' && from > 0) ? from : 0;	
	var case_sensitive = (typeof(sensitive) != 'undefined' && sensitive > 0) ? 'g' : 'gi';	
	var input = new RegExp(string,case_sensitive);
	return this.find(
	{	$or:[ {'login': {$regex:input}}, {'name': {$regex:input}} , {"tag": {$regex:input}} ],
		
	"status":1,
	},
	{_id:1,address:1,bio:1,location:1,login:1,mail:1,name:1,thumb:1,type:1,web:1,lastLoginDate:1,favplace:1,placesubs:1,tagsubs:1,usersubs:1, feedsubs:1 ,tags:1},
	{
		
		skip:skip, // Starting Row
		limit:limit, // Ending Row
		sort:{
			lastLoginDate: -1 //Sort by Date Added DESC
		}
	}).exec(callback);
}



User.statics.findByNameorLogin = function(string,callback){
	
	return this.findOne(
	{	$or:[ {'login': string}, {'name': string}], "status":1 },
	'_id,name,login',
	{},
	callback);
}



User.statics.searchByNameorLogin = function(str,callback){
	return this.find( {  $or : [{'name': new RegExp(str, 'i')},{'login': new RegExp(str, 'i')}]  ,'status':1}, callback);
}




var auth = require('../mylib/basicAuth');
User.plugin(auth);

mongoose.model('User', User);


var Point = new Schema({
	  name : String
	, location	: { type : { lat: Number, lng: Number }}	
	, range : { type: Number, default:80}
});
mongoose.model('Point', Point);


/*
#CONTENU ILLICTE
*/

var contenuIllicite = new Schema({
	content_id : { type : Schema.ObjectId }
	,user_id : { type : [Schema.ObjectId] }
	,info_id : { type : Schema.ObjectId }
	,poster_id : { type : Schema.ObjectId }
	,last_date_mark : {type: Date, default: Date.now , index : true}
	,content_type : { type : Number, default: 1 , index : true} // 1 info, 2 comments , 3 users
	,count : { type : Number, default : 1 , index : true}
	,content : {type : String}
	,status : { type : Number, default : 1 , index : true}
});

contenuIllicite.statics.countUnvalidated = function (callback) {
	var last10Days = new Date() - 10*24*60*60*1000;	
	return this.count( {'status': 1,'last_date_mark':{$gte:last10Days} }, callback );
}

contenuIllicite.statics.findByUser = function (userid, infoid, callback) {
 	return this.findOne({'content_id': infoid,'user_id':userid}, callback);
}

contenuIllicite.statics.findById = function (id, callback) {
 	return this.findOne({'_id': id}, callback);
}

contenuIllicite.statics.findByUserInfoType = function (content_id, content_type, callback) {
 	return this.findOne({'content_id': content_id, 'content_type' : content_type}, callback);
}

contenuIllicite.statics.findGridIllicites = function (pageIndex, pageSize, searchTerm, sortProperties, sortDirections, type, status, limit, callback) {

	var conditions = {
		"content" : new RegExp(searchTerm, 'i')
	};

	var sortBy = {};

	for (index in sortProperties) {
		var desc = 1;
		if (sortDirections[index] == "desc")
			desc = -1;
		sortBy[sortProperties[index]] = desc;
	}
	
	conditions["status"] = status;

	if(type != 0)
		conditions["content_type"] = type;

	if(limit == 'true'){
		var last10Days = new Date() - 10*24*60*60*1000;	
		conditions["last_date_mark"] = {$gte: last10Days};	
	}

	return this.find(
		conditions,
		'',
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

contenuIllicite.statics.countSearch = function (searchTerm, type, status, limit, callback) {
	var search = new RegExp(searchTerm, 'i');

	var conditions = {
		"content" : search
	};

	if(type > 0)
		conditions["content_type"] = type;		

	conditions["status"] = status;
	
	if(limit == 'true'){
		var last10Days = new Date() - 10*24*60*60*1000;	
		conditions["last_date_mark"] = {$gte: last10Days};	
	}

	return this.count(conditions, callback)-1;
}

mongoose.model('contenuIllicite', contenuIllicite);


var Twitter = new Schema({
	name : { type : String }
	,profile_image_url : { type : String }
	,url : { type : String }
	,description : { type : String }
	,screen_name : { type : String }
	,twitter_id : { type : String}
	, geo : {type : String }
	, followers_count : { type : Number}
	, time_zone : { type : String }
	, statuses_count : { type : Number}
	, lang : { type : String}
	, friends_count : { type : Number }
	, created_at : { type : Date }
	, friendsList : {type : Schema.Types.Mixed}
});
mongoose.model('Twitter', Twitter);

var Facebook = new Schema({
	name : { type : String }
	,profile_image_url : { type : String }
	,url : { type : String }
	,description : { type : String }
	,screen_name : { type : String }
	,facebook_id : { type : String}
	, screen_name	: { type : String }
	, geo : {type : String }
	, friendsList : {type : Schema.Types.Mixed}
});
mongoose.model('Facebook', Facebook);

var Google = new Schema({
	name : { type : String }
	,profile_image_url : { type : String }
	,url : { type : String }
	,description : { type : String }
	,screen_name : { type : String }
	,google_id : { type : String}
	, screen_name	: { type : String }
	, geo : {type : String }
	,ageRange : {type : Schema.Types.Mixed}
	,gender : { type : String }
	,language : { type : String }
	, friendsList : {type : Schema.Types.Mixed}
});
mongoose.model('Google', Google);

/**
 * Schema InfoTitles
*/

var infoTitles = new Schema({
    title     : { type: String,required: true,}
}, { collection: 'infoTitles' });
mongoose.model('infoTitles', infoTitles);


/**
 * Schema definition
 */
var Info = new Schema({
    title     : { type: String,required: true,index:1}
  , slug     : { type: String,required: true,index:1}
  , content	: {type: String}		
  , thumb	: {type: String}
  , thumbFlag :{type:Number,default:0}		
  , origin	: {type: String}	
  , access	: {type: Number}
  , licence	: {type: String, default : "Licence Ouverte"}		
  , outGoingLink       : { type: String }  
  , heat	: {type: Number}		
  , print	: {type: Number}		
  , yakCat	: {type: [Schema.ObjectId],index:1}
  , yakCatName	: {type: [String],index:1}	
  , yakType	: {type: Number,index:1}  
  , freeTag	: {type: [String],index:1}	
  , pubDate	: {type: Date, required: true, default: Date.now,index:1}		  
  , creationDate	: {type: Date, required: true, default: Date.now}		
  , lastModifDate	: {type: Date, required: true, default: Date.now}		
  , dateEndPrint	: {type: Date,index:1}		
  , eventDate	: {type: [{dateTimeFrom: Date,dateTimeEnd:Date}]}		
  , address	: {type : String}	
  , location	: { type : { lat: Number, lng: Number }, index : '2d'}	
  , status	: {type: Number,index:1}		
  , user	: {type: Schema.ObjectId}	
  , feed :	{type: Schema.ObjectId}	
  , userName	: {type: String}		
  , zone	: Number
  , zoneName	: String
  ,	placeId	: {type: Schema.ObjectId} 
  , likes	: {type: Number, default: 0,index:1}
  , unlikes	: {type: Number, default: 0}
  , commentsCount	: {type: Number, default: 0,index:1}
  , yaklikeUsersIds : {type: [String]}
  , yakunlikeUsersIds : {type: [String]}
  , yakComments : {type : [Schema.Types.Comment]}
  , socialThumbs : { type : [String]}
  ,debugCallGmap :{type : String}
}, { collection: 'info' });

Info.index({location : '2d',pubDate:-1,creationDate:-1,dateEndPrint:-1,yakType:1,print:1,status:1});
Info.index({location : '2d',pubDate:-1,dateEndPrint:-1,yakType:1,print:1,status:1});
Info.index({location : '2d',pubDate:-1,creationDate:-1,dateEndPrint:-1,yakType:1,print:1,status:1,title:1,content:1,freeTag:1,yakCat:1});
Info.index({location : '2d',pubDate:-1,dateEndPrint:-1,yakType:1,print:1,status:1,origin:1,user:1,freeTag:1,yakCat:1});


//Info.index({location : '2d',pubDate:-1,yakType:1,print:1,status:1});
//Info.index({location : '2d'});



Info.statics.format = function (theinfo) {
	if(typeof theinfo != 'undefined' && theinfo != null){
		if(theinfo.thumb != undefined && theinfo.thumb != '')
			var thethumb = 	"https://s3-eu-west-1.amazonaws.com/"+conf.bucket+'/120_90/'+theinfo.thumb;
		else
			var thethumb = 	'';


		var formattedInfo = {
			_id:theinfo._id,
			title:theinfo.title,
			slug:theinfo.slug,
			content:theinfo.content,
			thumbName:theinfo.thumb,
			thumb:thethumb,
			thumbFlag: theinfo.thumbFlag,
			yakType:theinfo.yakType,
			print:theinfo.print,
			dateEndPrint:theinfo.dateEndPrint,
			address:theinfo.address,
			location:theinfo.location,
			lastModifDate:theinfo.lastModifDate,
			creationDate:theinfo.creationDate,
			eventDate:theinfo.eventDate,
			pubDate:theinfo.pubDate,
			freeTag:theinfo.freeTag,
			debugCallGmap:theinfo.debugCallGmap,
			yakCatName:theinfo.yakCatName,
			yakCat:theinfo.yakCat,
			placeId:theinfo.placeId,
			origin:theinfo.origin,
			licence:theinfo.licence,
			likes:theinfo.likes,
			commentsCount:theinfo.commentsCount,
			unlikes:theinfo.unlikes,
			yaklikeUsersIds:theinfo.yaklikeUsersIds,
			yakunlikeUsersIds:theinfo.yakunlikeUsersIds,
			yakComments:theinfo.yakComments,
			outGoingLink:theinfo.outGoingLink,
			user: theinfo.user,
			feed: theinfo.feed,
			status: theinfo.status,
			heat: theinfo.heat,
			socialThumbs : theinfo.socialThumbs,
			zone : theinfo.zone,
			zoneName : theinfo.zoneName
		};
	  return formattedInfo;
	}else
		return {};
	
}

Info.statics.countUnvalidated = function (callback) {
	var last10Days = new Date() - 10*24*60*60*1000;	
	return this.count( {'status': { $in: [2, 10, 11, 12, 13]},creationDate : {$gte:last10Days}}, callback );
}

Info.statics.findByTitle = function (title, callback) {
  return this.find({ title: title }, callback);
}

Info.statics.findById = function (id, callback) {
  return this.findOne({ _id: id }, callback);
}

Info.statics.findByPlace = function (id, callback) {
  return this.find({ placeId: id }, callback);
}


Info.statics.findByLink = function (link, callback) {
  return this.find({ outGoingLink: link }, callback);
}
Info.statics.findAll = function (callback) {
  return this.find(
	{"status":1},
	{},
	{
		skip:0, // Starting Row
		limit:50, // Ending Row
		"yakType" : 1,
		sort:{
			pubDate: -1 //Sort by Date Added DESC
		}
	},
	callback);

}


Info.statics.findAllByPage = function (callback, skip, limit, yakType, _id, what, where, dateInterval, yakCat, next, dimension) {
	
	var mydateUtils = require('../mylib/dateUtils.js');
	var now = mydateUtils.substractDays(new Date(), parseInt(0));
	var from = mydateUtils.substractDays(new Date(), parseInt(dateInterval.split(',')[1]));
	var till = mydateUtils.substractDays(new Date(), parseInt(dateInterval.split(',')[0]));
	var daterange = dateInterval.split(',');
	var types = new Array();
	var cats = new Array();
	cats[0] = what;
	types = yakType.split(',');
    var location = new Array();
    location = where.split('-');

    var geopoint = new Object();

    for (var i = 0; i < location.length; i++) {
    	geopoint[i] = { "lat" : location[i].split(',')[0], "lng": location[i].split(',')[1]};
    };

    var infos = this.find();

    infos.where('status').equals(1);

	if (dateInterval.split(',')[1] == dateInterval.split(',')[0]){
		infos.where('pubDate').gt(from).lt(now);
	}
	else
	{
		infos.where('pubDate').gt(from).lt(till);
	}

	if (yakType != ""){
		infos.where('yakType').in(types);
	};

	if (what != "") {
			infos.or([{ 'content': { $regex: what }}, { 'title': { $regex: what }}, { 'yakCatName': { $regex: what }},  { 'origin': { $regex: what,$options: 'i' }},  { 'freeTag': { $regex: what }} ])
	};


	if (where != "") {
		 infos.where('location').near( [parseFloat(geopoint[0].lat),parseFloat(geopoint[0].lng)] ).maxDistance(dimension);
	};
		
	
	infos.sort({'pubDate': 1}).skip(skip).limit(limit);

	res = infos.exec(callback)

}

Info.statics.findAllByID = function (callback, id) {
  return this.find(
	{
		"_id":id
	},	
	callback);
}

Info.statics.findByCommentID = function (callback, id) {
  var ObjectId = require('mongoose').Types.ObjectId; 
  var theid = new ObjectId(id);
  return this.findOne(
  	{
		commentsCount:{$gt:0}, 
		'yakComments._id': theid
	},	
	callback);
}

Info.statics.findTopLiked = function(x1, y1, x2, from, type, limit, callback){
	//if(from > 0)
	//	from = 0;
	var DPUB = new Date();
	var DEND = new Date();
	var offset = 1000;
	DPUB.setTime(DPUB.getTime()+from*24*60*60*1000-offset);
	DEND.setTime(DEND.getTime()+from*24*60*60*1000);

	var cond = {
				"status":1,
				"pubDate":{$lte:DPUB},
				"dateEndPrint":{$gte:DEND},
				"yakType" : {$in:type}
			};

	if (!isNaN(x1)) {
		cond["location"] = {$near:[parseFloat(x1),parseFloat(y1)],$maxDistance:parseFloat(x2)};
	}	

	cond['likes'] = {$gt:0};

	return this.find(cond).sort({likes: -1}).limit(limit).exec(callback);
}

Info.statics.findTopCommented = function(x1, y1, x2, from, type, limit, callback){
	//if(from > 0)
	//	from = 0;
	var DPUB = new Date();
	var DEND = new Date();
	var offset = 1000;
	DPUB.setTime(DPUB.getTime()+from*24*60*60*1000-offset);
	DEND.setTime(DEND.getTime()+from*24*60*60*1000);

	var cond = {
				"status":1,
				"pubDate":{$lte:DPUB},
				"dateEndPrint":{$gte:DEND},
				"yakType" : {$in:type}
			};

	if (!isNaN(x1)) {
		cond["location"] = {$near:[parseFloat(x1),parseFloat(y1)],$maxDistance:parseFloat(x2)};
	}	

	cond['commentsCount'] = {$gt:0};

	return this.find(cond).sort({commentsCount: -1}).limit(limit).exec(callback);
}

Info.statics.findTopHots = function(x1, y1, x2, from, type, limit, callback){
	//if(from > 0)
	//	from = 0;
	var DPUB = new Date();
	var DEND = new Date();
	var offset = 1000;
	DPUB.setTime(DPUB.getTime()+from*24*60*60*1000-offset);
	DEND.setTime(DEND.getTime()+from*24*60*60*1000);

	var cond = {
				"status":1,
				"pubDate":{$lte:DPUB},
				"dateEndPrint":{$gte:DEND},
				"yakType" : {$in:type}
			};

	if (!isNaN(x1)) {
		cond["location"] = {$near:[parseFloat(x1),parseFloat(y1)],$maxDistance:parseFloat(x2)};
	}	

	return this.find(cond).sort({pubDate: -1}).limit(limit).exec(callback);
}

Info.statics.findByUser = function (userid, count, from, callback) {
	var limit = (typeof(count) != 'undefined' && count > 0) ? count : 100;		
	var skip = (typeof(from) != 'undefined' && from > 0) ? from : 0;	
  return this.find({ user: userid,status :1 }).sort({pudDate:-1}).limit(limit).skip(skip).exec(callback);
}

Info.statics.findByFeed = function (feedid, count, from, callback) {
	var limit = (typeof(count) != 'undefined' && count > 0) ? count : 100;		
	var skip = (typeof(from) != 'undefined' && from > 0) ? from : 0;	
  return this.find({ feed: feedid,status :1 }).sort({pubDate: -1}).limit(limit).skip(skip).exec(callback);
}

Info.statics.countUserInfo = function (userid, callback) {
	var last7Days = new Date() - 7*24*60*60*1000;	
  return this.find({ user: mongoose.Types.ObjectId(userid),status :1, pubDate:{$gte:last7Days}},{}).count().exec(callback);
}

Info.statics.countFeedInfo = function (feedid, callback) {
	var last7Days = new Date() - 7*24*60*60*1000;
  return this.find({ feed: mongoose.Types.ObjectId(feedid),status :1, pubDate:{$gte:last7Days} },{}).count().exec(callback);
}

Info.statics.findByUserIds = function (useridArray, count, from, callback) {
	var limit = (typeof(count) != 'undefined' && count > 0) ? count : 100;		
	var skip = (typeof(from) != 'undefined' && from > 0) ? from : 0;	
  return this.aggregate({ $group: {user: {$in:useridArray}}},{},{limit:limit,skip:skip,sort:{pudDate:-1}}, callback);
}



Info.statics.findAllGeo = function (x1,y1,x2,y2,from,now,type,str,thecount,theskip,callback) {
	var limit = (typeof(thecount) != 'undefined' && thecount > 0) ? thecount : 100;		
	var skip = (typeof(theskip) != 'undefined' && theskip > 0) ? theskip : 0;	
	
	var DPUB = new Date();
	var DEND = new Date();
	var offset = 1000;
	DPUB.setTime(DPUB.getTime()+from*24*60*60*1000-offset);
	DEND.setTime(DEND.getTime()+from*24*60*60*1000);


	if(y2 == 'null'){		
		var locationQuery = {$near:[parseFloat(x1),parseFloat(y1)],$maxDistance:parseFloat(x2)};
		var cond = {
				"status":1,
				"pubDate":{$lte:DPUB},
				"dateEndPrint":{$gte:DEND},
				"yakType" : {$in:type}
			};
	}else{
		var box = [[parseFloat(x1),parseFloat(y1)],[parseFloat(x2),parseFloat(y2)]];
		var locationQuery = {$within:{"$box":box}};
		var cond = {
				"print":1,
				"status":1,
				"pubDate":{$lte:DPUB},
				"dateEndPrint":{$gte:DEND},
				"yakType" : {$in:type}
			};
	}
	
	var Yakcat = db.model('Yakcat');
	var User = db.model('User');
	var Tag = db.model('Tag');
	var res = null;

	
	
	if (!isNaN(x1)) {
		cond["location"] = locationQuery;
	}

	var qInfo = this.find(cond).sort({'pubDate':-1}).limit(limit).skip(skip);
	
	/*mode update*/
	if(now != 0){
		var DCRE = new Date();
		DCRE.setTime( now - 60000); // now minus one minute
		qInfo.where('creationDate').gt(DCRE);
	}
		

	if(str != 'null' && str.length > 0){  // STRING SEARCH
		var S = require('string');
		str = decodeURIComponent(str);
		str = S(str).trim();
				
		var firstChar = str.substr(0,1);
		var thirdChar = str.substr(0,3);
		var strClean = str.replace(/@/g,'').replace(/#/g,'').replace(/%23/g,'').replace(/%40/g,'');
		var searchStr = new RegExp(strClean,'gi');
		//var searchExactStr = new RegExp("^"+strClean+"$",'gi');
		var searchExactStr = new RegExp("(?:^| )(" + strClean + ")",'gi');

		if(firstChar=='#' || thirdChar == '%23'){
			Yakcat.findOne({'title': {$regex:searchStr}}).exec(function(err,theyakcat){
				if(theyakcat == null){
					qInfo.or([{"freeTag": {$regex:searchExactStr}}]);
				}else{
					qInfo.or([{"freeTag": {$regex:searchExactStr}},{"yakCat": {$in:[theyakcat._id]}}]);
				}
				res = qInfo.exec(callback);
			});
		}else if(firstChar=='@' || thirdChar == '%40' ){
			User.findOne({'login':{$regex:searchExactStr}}).exec(function(err,theuser){			
				if(theuser != null){
					qInfo.or([  {'user':theuser._id} ]);
					qInfo.or([{"origin": {$regex:strClean}}]);
					res = qInfo.exec(callback);	
				}else{
					var Feed = db.model('Feed');
					var cond = {
						$or:[ {'humanName': {$regex:strClean}}, {'name': {$regex:strClean}} ]
					};
					Feed.findOne( cond, function(err,thefeed){
						if(thefeed != null){
							qInfo.or([  {'feed':thefeed._id} ]);
							qInfo.or([{"origin": {$regex:strClean}}]);
							res = qInfo.exec(callback);	
						}
					});
				}
				
			});
		}else{
			Yakcat.findOne({'title': {$regex:searchExactStr}}).exec(function(err,theyakcat){
				if(theyakcat == null){
					User.findOne({'login':{$regex:searchExactStr}}).exec(function(err,theuser){
						if(theuser == null){ // NO TAG, NO YAKCAT, NO USER
							qInfo.or([ {'title': {$regex:searchExactStr}}, {'content': {$regex:searchExactStr}} , {"freeTag": {$regex:searchExactStr}}]);
						}else{
							qInfo.or([ {'title': {$regex:searchExactStr}}, {'content': {$regex:searchExactStr}} , {"freeTag": {$regex:searchExactStr}}, {'user':theuser._id}]);
						}
						res = qInfo.exec(callback);
					});
				}else{
					qInfo.or([ {'title': {$regex:searchExactStr}}, {'content': {$regex:searchExactStr}} , {"freeTag": {$regex:searchExactStr}} , {"yakTag": {$regex:searchExactStr}},{"yakCat": {$in:[theyakcat._id]}}]);
					res = qInfo.exec(callback);
				}
			});
		}
	}else{  // NO STRING SEARCH
		res = qInfo.exec(callback);
	}
	return res;
}

Info.statics.findAllGeoAlert = function (x1,y1,x2,y2,from,now,type,str,usersubs,tagsubs,feedsubs,count,skip,callback) {
	var limit = (typeof(count) != 'undefined' && count > 0) ? count : 100;		
	var skip = (typeof(skip) != 'undefined' && skip > 0) ? skip : 0;	
	
	var DPUB = new Date();
	var DEND = new Date();
	var offset = 1000;
	DPUB.setTime(DPUB.getTime()+from*1000-offset);
	DEND.setTime(DEND.getTime()+from*1000);


	
	var Yakcat = db.model('Yakcat');
	var User = db.model('User');
	var Tag = db.model('Tag');
	var res = null;

	var cond = {
				"status":1,
				"pubDate":{$lte:DPUB},
				"dateEndPrint":{$gte:DEND},
				"yakType" : {$in:type}
			};
	if(y2 == 'null'){
		cond["location"] = {$near:[parseFloat(x1),parseFloat(y1)],$maxDistance:parseFloat(x2)};
	}else{
		cond["print"]=1;
		var box = [[parseFloat(x1),parseFloat(y1)],[parseFloat(x2),parseFloat(y2)]];
		cond["location"] = {$within:{"$box":box}};
	}

				
	var qInfo = this.find(cond).sort({'pubDate':-1}).limit(limit).skip(skip);
	
	/*mode update*/
	if(now != 0){
		var DCRE = new Date();
		DCRE.setTime( now - 60000); // now minus one minute
		qInfo.where('creationDate').gt(DCRE);
	}
	
	if( (typeof(usersubs) != 'undefined' && usersubs != 'null') || (typeof(tagsubs) != 'undefined' && tagsubs != 'null' ) || (typeof(feedsubs) != 'undefined' && feedsubs != 'null' )){
		if(typeof(usersubs) != 'undefined' && usersubs != 'null' ){
			var usersubsId =  usersubs.map(function(item){return item._id});
			qInfo.or([ {"user":{$in:usersubsId}}]);
		}
		if(typeof(feedsubs) != 'undefined' && feedsubs != 'null' ){
			var feedName =  feedsubs.map(function(item){return item.humanName});
			qInfo.or([ {"origin":{$in:feedName}}]);
		}
		if(typeof(tagsubs) != 'undefined' && tagsubs != 'null' )
			qInfo.or([{"freeTag": {$in:tagsubs}}]);
	}



	if(str != 'null' && str.length > 0){  // STRING SEARCH
		var firstChar = str.substr(0,1);
		var strClean = str.replace(/@/g,'').replace(/#/g,'').replace(/%23/g,'').replace(/%40/g,'');
		var searchStr = new RegExp(strClean,'gi');
		var searchExactStr = new RegExp("^"+strClean+"$",'gi');
		if(firstChar=='#'){
			Yakcat.findOne({'title': {$regex:searchStr}}).exec(function(err,theyakcat){
				if(theyakcat == null){
					qInfo.or([{"freeTag": {$regex:searchExactStr}}]);
				}else{
					qInfo.or([{"freeTag": {$regex:searchExactStr}},{"yakCat": {$in:[theyakcat._id]}}]);
				}
				res = qInfo.exec(callback);
			});
		}else if(firstChar=='@'){
			User.findOne({'login':{$regex:searchExactStr}}).exec(function(err,theuser){
				if(theuser != null){
					qInfo.or([  {'user':theuser._id} ]);
				}
				res = qInfo.exec(callback);
			});
		}else{
			Yakcat.findOne({'title': {$regex:searchExactStr}}).exec(function(err,theyakcat){
				if(theyakcat == null){
					User.findOne({'login':{$regex:searchExactStr}}).exec(function(err,theuser){
						if(theuser == null){ // NO TAG, NO YAKCAT, NO USER
							qInfo.or([ {'title': {$regex:searchStr}}, {'content': {$regex:searchStr}} , {"freeTag": {$regex:searchExactStr}} ]);
						}else{
							qInfo.or([ {'title': {$regex:searchStr}}, {'content': {$regex:searchStr}} , {"freeTag": {$regex:searchExactStr}} , {'user':theuser._id}]);
						}
						res = qInfo.exec(callback);
					});
				}else{
					qInfo.or([ {'title': {$regex:searchStr}}, {'content': {$regex:searchStr}} , {"freeTag": {$regex:searchExactStr}} ,{"yakCat": {$in:[theyakcat._id]}}]);
					res = qInfo.exec(callback);
				}
			});
		}
	}else{  // NO STRING SEARCH
		res = qInfo.exec(callback);
	}
	return res;
}


Info.statics.findAllGeoAlertNumber = function (x1,y1,x2,y2,from,lastcheck,type,str,usersubs,tagsubs,feedsubs,callback) {
	
	
	var DPUB = new Date();
	var DEND = new Date();
	var DLC = new Date();
	var Yakcat = db.model('Yakcat');
	var User = db.model('User');

	var offset = 1000;
	DPUB.setTime(DPUB.getTime()+from*1000-offset);
	DEND.setTime(DEND.getTime()+from*1000);
	var dateLastCheck = DLC.setTime(lastcheck);

	var location;
	var res = null;

	var cond = {
		"status":1,
		"pubDate":{$gte:dateLastCheck},
		"dateEndPrint":{$gte:DEND},
		"yakType" : {$in:type}
	};


	// request from the feed page
	if(y2 == 'null'){		
		var locationQuery = {$near:[parseFloat(x1),parseFloat(y1)],$maxDistance:parseFloat(x2)};
	}else{ // from the map
		var box = [[parseFloat(x1),parseFloat(y1)],[parseFloat(x2),parseFloat(y2)]];
		var locationQuery = {$within:{"$box":box}};
		cond["print"]=1;
	}
	
	if (!isNaN(x1)) {
		cond["location"] = locationQuery;
	}		


	var qInfo = this.find(cond);


	if( (typeof(usersubs) != 'undefined' && usersubs != 'null') || (typeof(tagsubs) != 'undefined' && tagsubs != 'null' ) || (typeof(feedsubs) != 'undefined' && feedsubs != 'null' )){
		if(typeof(usersubs) != 'undefined' && usersubs != 'null' ){
			var usersubsId =  usersubs.map(function(item){return item._id});
			qInfo.or([ {"user":{$in:usersubsId}}]);
		}
		if(typeof(feedsubs) != 'undefined' && feedsubs != 'null' ){
			var feedName =  feedsubs.map(function(item){return item.humanName});
			qInfo.or([ {"origin":{$in:feedName}}]);
		}
		if(typeof(tagsubs) != 'undefined' && tagsubs != 'null' )
			qInfo.or([{"freeTag": {$in:tagsubs}}]);
	}


	if(str != 'null' && str.length > 0){  // STRING SEARCH
		var firstChar = str.substr(0,1);
		var strClean = str.replace(/@/g,'').replace(/#/g,'').replace(/%23/g,'').replace(/%40/g,'');
		var searchStr = new RegExp(strClean,'gi');
		var searchExactStr = new RegExp("^"+strClean+"$",'gi');
		if(firstChar=='#'){
			Yakcat.findOne({'title': {$regex:searchStr}}).exec(function(err,theyakcat){
				if(theyakcat == null){
					qInfo.or([{"freeTag": {$regex:searchExactStr}}]);
				}else{
					qInfo.or([{"freeTag": {$regex:searchExactStr}},{"yakCat": {$in:[theyakcat._id]}}]);
				}
				res = qInfo.count().exec(callback);
			});
		}else if(firstChar=='@'){
			User.findOne({'login':{$regex:searchExactStr}}).exec(function(err,theuser){
				if(theuser != null){
					qInfo.or([  {'user':theuser._id} ]);
				}
				res = qInfo.count().exec(callback);
			});
		}else{
			Yakcat.findOne({'title': {$regex:searchExactStr}}).exec(function(err,theyakcat){
				if(theyakcat == null){
					User.findOne({'login':{$regex:searchExactStr}}).exec(function(err,theuser){
						if(theuser == null){ // NO TAG, NO YAKCAT, NO USER
							qInfo.or([ {'title': {$regex:searchStr}}, {'content': {$regex:searchStr}} , {"freeTag": {$regex:searchExactStr}} ]);
						}else{
							qInfo.or([ {'title': {$regex:searchStr}}, {'content': {$regex:searchStr}} , {"freeTag": {$regex:searchExactStr}} , {'user':theuser._id}]);
						}
						res = qInfo.count().exec(callback);
					});
				}else{
					qInfo.or([ {'title': {$regex:searchStr}}, {'content': {$regex:searchStr}} , {"freeTag": {$regex:searchExactStr}} ,{"yakCat": {$in:[theyakcat._id]}}]);
					res = qInfo.count().exec(callback);
				}
			});
		}
	}else{  // NO STRING SEARCH
		res = qInfo.count().exec(callback);
	}

	
	
	return res;
}


Info.statics.findGridInfos = function (pageIndex, pageSize, searchTerm, sortProperties, sortDirections, status, type, limit, callback) {

	var conditions = {'title': new RegExp(searchTerm, 'i')};

	var sortBy = {};

	for (index in sortProperties) {
		var desc = 1;
		if (sortDirections[index] == "desc")
			desc = -1;
		sortBy[sortProperties[index]] = desc;
	}

	if (status != 'all') {
		if (status == 'alert') 
			conditions["status"] = {$in:[2,10,11,12,13]};
		else
			conditions["status"] = status;
	}
	console.log(status);

	

	if (type != 'all') {
			conditions["yakType"] = type;
	}

	if(limit == 'true'){
		var last10Days = new Date() - 10*24*60*60*1000;	
		conditions["creationDate"] = {$gte: last10Days};	
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

Info.statics.countSearch = function (searchTerm, status, type, limit, callback) {

	var conditions = {'title': new RegExp(searchTerm, 'i')};

	if (status != 'all') {
		if (status == 'alert') 
			conditions["status"] = {$in:[2,10,11,12,13]};
		else
			conditions["status"] = status;
	}

	if (type != 'all') {
			conditions["yakType"] = type;
	}
	
	if(limit == 'true'){
		var last10Days = new Date() - 10*24*60*60*1000;	
		conditions["creationDate"] = {$gte: last10Days};	
	}

	return this.count(conditions, callback);
}

mongoose.model('Info', Info);















//#YAKCAT
var Yakcat = new Schema({
    title     : { type: String, index:true, required: true}
  , path       : { type:String }
  , pathN       : { type:String, uppercase: true}
  , tag       : { type:[String] }
  , level       : { type:Number }
  , thumb       : { type:String }
  , creationDate       : { type:Date }
  , lastModifDate       : { type:Date }
  , status       : { type : Number , index : true }
  
}, { collection: 'yakcat' });

Yakcat.statics.countUnvalidated = function (callback) {
	return this.count( {'status': {$in:[2,10,11,12,13]}}, callback );
}

Yakcat.statics.findAll = function (callback) {
  return this.find({status:1},{},{sort:{title:1}}, callback);
}

Yakcat.statics.searchOne = function (str,callback) {
	searchStr = new RegExp(str,'i');
	return this.find({'title': {$regex:searchStr}},{},{limit:1}, callback);
}
Yakcat.statics.findByIds = function (ids,callback) {
  return this.find({'_id': { $in: ids}}, callback);
}
Yakcat.statics.search = function(string,count,from,sensitive,callback){
	var limit = (typeof(count) != 'undefined' && count > 0) ? count : 100;		
	var skip = (typeof(from) != 'undefined' && from > 0) ? from : 0;	
	var case_sensitive = (typeof(sensitive) != 'undefined' && sensitive > 0) ? 'g' : 'gi';	
	var input = new RegExp(string,case_sensitive);
	return this.find(
	{
		'title': {$regex:input},
		"status":1,
	},
	{},
	{
		skip:skip, // Starting Row
		limit:limit, // Ending Row
		sort:{
			title: 1
		}
	}).exec(callback);
}

Yakcat.statics.findGridYakcats = function (pageIndex, pageSize, searchTerm, sortProperties, sortDirections, status, callback) {

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

	if(status != -1)
		conditions["status"] = status;

	return this.find(
		conditions,
		'',
		{
			skip:(pageIndex -1)*pageSize,
			limit:pageSize,
			sort:sortBy
		},
		callback);
}

Yakcat.statics.countSearch = function (searchTerm, status, callback) {
	var search = new RegExp(searchTerm, 'i');

	var conditions = {
		"title" : search
	};

	if(status >= 0)
		conditions["status"] = status;
	
	
	return this.count(conditions, callback)-1;
}
mongoose.model('Yakcat', Yakcat);



/******************************YAKTAG*/
var Tag = new Schema({
    title     : { type: String, required: true, index : true}
  , usageDate       : { type: Date , default: Date.now , index : true}
  , creationDate       : { type: Date , index : true}
  , numUsed : { type : Number , index : true}
  , location	: { type : { lat: Number, lng: Number }, index : '2d'}
  , print :{type:Number,require: true, index: true, default: 0}	
  
}, { collection: 'tag' });

Tag.statics.findAll = function (callback) {
  return this.find({},{},{sort:{numUsed:-1,usageDate:-1,title:1}}, callback);
}

/*
	Get Hot tags geolocalized
	if y2 == 0 : it comes form the feedpage => x1,y1 is the center and x2 is radius
	else it comes from the map get the box (x1,y1), (x2,y2)
*/
Tag.statics.getHotTags = function (x1,y1,x2,y2,d,limit,callback) {
	var now = new Date();
	var DUSED = new Date();
	var DUSEDMAX = new Date();
	var offset = 24*60*60*1000; // 1 day
	DUSED.setTime((now.getTime()+d*24*60*60*1000)-offset);
	DUSEDMAX.setTime(now.getTime()+d*24*60*60*1000);
	if(y2 == 'null')
		return this.find({numUsed:{$gt:0}, usageDate:{$gte:DUSED,$lte:DUSEDMAX}, location:{$near:[parseFloat(x1),parseFloat(y1)],$maxDistance:parseFloat(x2)}},{},{sort:{numUsed:-1},limit:limit}, callback);
	else{
		var box = [[parseFloat(x1),parseFloat(y1)],[parseFloat(x2),parseFloat(y2)]];
		return this.find({numUsed:{$gt:0}, usageDate:{$gte:DUSED,$lte:DUSEDMAX}, location:{$within:{"$box":box}},print:1},{},{sort:{numUsed:-1},limit:limit}, callback);
	}
		
}



Tag.statics.searchOne = function (str,callback) {
	searchStr = new RegExp(str,'i');
	return this.find({'title': {$regex:searchStr}},{},{limit:1}, callback);
}
Tag.statics.search = function(string,count,from,sensitive,order,callback){
	var limit = (typeof(count) != 'undefined' && count > 0) ? count : 100;		
	var case_sensitive = (typeof(sensitive) != 'undefined' && sensitive > 0) ? 'g' : 'gi';	
	var skip = (typeof(from) != 'undefined' && from > 0) ? from : 0;		
	var thesort = (typeof(order) != 'undefined' && order == 'lastUsed') ? {sort:{usageDate:-1}} : {sort:{numUsed:-1}};		
	var input = new RegExp(string,case_sensitive);
	
	var cond = {
		"title": {$regex:input},	
	};
	return this.find(
	cond,
	{},
	{	
		skip:skip, // Starting Row
		limit:limit, // Ending Row
		sort:thesort
		
	},callback);
}
mongoose.model('Tag', Tag);

/*****************************Comments *******///

var Comment = new Schema({
		userid : {type: Schema.ObjectId}
	,	username : {type: String}
	,	userthumb : {type: String}
	,	comment : {type: String}
	, 	date : {type: Date,index:true}
	, 	status : {type: Number,default:1,index:true}
},{ collection: 'comment' });
mongoose.model('Comment', Comment);

/******************************PLACE*/



/***************CLIENT*/
var Client = new Schema({
	name	: { type: String, required: true, index:'unique'}
,	link	: { type: String, required: true}
,	secret	: { type: String, required: true, index:'unique'}
,	status	: {type: Number, required: true, index:true}		
},{ collection: 'client' });

Client.statics.identify = function(key,secret,callback){
	return this.findOne({'_id': key,'secret':secret,'status':1}, callback);
}
Client.statics.findById = function(key,callback){
	return this.findOne({'_id': key,'status':1}, callback);
}
mongoose.model('Client', Client);


require('./place.js');
require('./feed.js');
require('./yakNE.js');
require('./yakBL.js');
require('./zone.js');
require('./stat.js');
