
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



var Point = new Schema({
	  name : String
	, location	: { type : { lat: Number, lng: Number }}	
	, range : { type: Number, default:80}
});
mongoose.model('Point', Point);

var contenuIllicite = new Schema({
	content_id : { type : Schema.ObjectId }
	,user_id : { type : [Schema.ObjectId] }
	,last_date_mark : {type: Date, default: Date.now }
	,content_type : { type : Number, default: 1 } // 1 info, 2 comments , 3 users
	,count : { type : Number, default : 1}
});

contenuIllicite.statics.findByUser = function (userid, infoid, callback) {
 	return this.findOne({'content_id': infoid,'user_id':userid}, callback);
}

contenuIllicite.statics.findById = function (id, callback) {
 	return this.findOne({'_id': id}, callback);
}

contenuIllicite.statics.findByUserInfoType = function (content_id, content_type, callback) {
 	return this.findOne({'content_id': content_id, 'content_type' : content_type}, callback);
}

mongoose.model('contenuIllicite', contenuIllicite);


var Twitter = new Schema({
	name : { type : String }
	,profile_image_url : { type : String }
	,url : { type : String }
	,description : { type : String }
	,screen_name : { type : String }
	,twitter_id : { type : Number}
	, geo : {type : String }
	, followers_count : { type : Number}
	, time_zone : { type : String }
	, statuses_count : { type : Number}
	, lang : { type : String}
	, friends_count : { type : Number }
	, created_at : { type : Date }
});
mongoose.model('Twitter', Twitter);

var Facebook = new Schema({
	name : { type : String }
	,profile_image_url : { type : String }
	,url : { type : String }
	,description : { type : String }
	,screen_name : { type : String }
	,facebook_id : { type : Number}
	, screen_name	: { type : String }
	, geo : {type : String }
});
mongoose.model('Facebook', Facebook);

var Google = new Schema({
	name : { type : String }
	,profile_image_url : { type : String }
	,url : { type : String }
	,description : { type : String }
	,screen_name : { type : String }
	,google_id : { type : Number}
	, screen_name	: { type : String }
	, geo : {type : String }
	,ageRange : {type : Schema.Types.Mixed}
	,gender : { type : String }
	,language : { type : String }
});
mongoose.model('Google', Google);

var UserLight = new Schema({
	  name : String
	, location	: { type : { lat: Number, lng: Number }}
	, formatted_address : String
});
mongoose.model('UserLight', UserLight);

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
    title     : { type: String,required: true,}
  , content	: {type: String}		
  , thumb	: {type: String}
  , thumbFlag :{type:Number,default:0}		
  , origin	: {type: String}	
  , access	: {type: Number}
  , licence	: {type: String}		
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
  , zone	: {type: Schema.ObjectId}
  ,	placeId	: {type: Schema.ObjectId} 
  , likes	: {type: Number, default: 0}
  , unlikes	: {type: Number, default: 0}
  , yaklikeUsersIds : {type: [String]}
  , yakunlikeUsersIds : {type: [String]}
  , yakComments : {type : [Schema.Types.Comment]}
}, { collection: 'info' });

//Info.index({location : '2d',pubDate:-1,yakType:1,print:1,status:1});
//Info.index({location : '2d'});

Info.statics.format = function (theinfo) {
	if(theinfo.thumb != undefined && theinfo.thumb != '')
		var thethumb = 	"https://s3-eu-west-1.amazonaws.com/"+conf.bucket+'/120_90/'+theinfo.thumb;
		/*
		if(theinfo.user != undefined)
			var thethumb = 	conf.fronturl+'/pictures/120_90/'+theinfo.thumb;
		else
			var thethumb = 	conf.batchurl+theinfo.thumb;
		*/
	else
		var thethumb = 	'';


	var formattedInfo = {
		_id:theinfo._id,
		title:theinfo.title,
		content:theinfo.content,
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
		yakTag:theinfo.yakTag,
		yakCatName:theinfo.yakCatName,
		yakCat:theinfo.yakCat,
		placeId:theinfo.placeId,
		origin:theinfo.origin,
		likes:theinfo.likes,
		unlikes:theinfo.unlikes,
		yaklikeUsersIds:theinfo.yaklikeUsersIds,
		yakunlikeUsersIds:theinfo.yakunlikeUsersIds,
		yakComments:theinfo.yakComments,
		outGoingLink:theinfo.outGoingLink,
		user: theinfo.user,
		feed: theinfo.feed
	};
  return formattedInfo;
}

Info.statics.countUnvalidated = function (callback) {
	return this.count( {'status': { $in: [2, 10]}}, callback );
}

Info.statics.findByTitle = function (title, callback) {
  return this.find({ title: title }, callback);
}

Info.statics.findByID = function (id, callback) {
  return this.findOne({ _id: id }, callback);
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

Info.statics.findByUser = function (userid, count, from, callback) {
	var limit = (typeof(count) != 'undefined' && count > 0) ? count : 100;		
	var skip = (typeof(from) != 'undefined' && from > 0) ? from : 0;	
  return this.find({ user: userid,status :1 },{},{limit:limit,skip:skip,sort:{pudDate:-1}}, callback);
}

Info.statics.countUserInfo = function (userid, callback) {
  return this.find({ user: userid,status :1 },{},{sort:{pudDate:-1}}).count().exec(callback);
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
		DCRE.setTime( now );
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


	var box = [[parseFloat(x1),parseFloat(y1)],[parseFloat(x2),parseFloat(y2)]];
	var Yakcat = db.model('Yakcat');
	var User = db.model('User');
	var Tag = db.model('Tag');
	var res = null;

	var cond = {
				"print":1,
				"status":1,
				"location" : {$within:{"$box":box}},
				"pubDate":{$lte:DPUB},
				"dateEndPrint":{$gte:DEND},
				"yakType" : {$in:type}
			};

	var qInfo = this.find(cond).sort({'pubDate':-1}).limit(limit).skip(skip);
	
	/*mode update*/
	if(now != 0){
		var DCRE = new Date();
		DCRE.setTime( now*1000 );
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




mongoose.model('Info', Info);








/******************************USERS*/

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
  return this.find({ usersubs: { $in : usersubs } },{},{sort:{pudDate:-1}}).count().exec(callback);
}


User.statics.format = function (theuser) {
	if(theuser.thumb && theuser.thumb!= 'no-user.png'){
		var thethumb = 	"https://s3-eu-west-1.amazonaws.com/"+conf.bucket+'/128_128/'+theuser.thumb;
		var thethumbsmall = 	"https://s3-eu-west-1.amazonaws.com/"+conf.bucket+'/48_48/'+theuser.thumb;
		//var thethumb = 	conf.fronturl+'/pictures/128_128/'+theuser.thumb;
		//var thethumbsmall = 	conf.fronturl+'/pictures/48_48/'+theuser.thumb;
	}
	else{
		var thethumb = 	"https://s3-eu-west-1.amazonaws.com/"+conf.bucketstatic+'/128_128/no-user.png';
		var thethumbsmall = 	"https://s3-eu-west-1.amazonaws.com/"+conf.bucketstatic+'/48_48/no-user.png';
	}
		

	var formattedUser = {
		_id:theuser._id,
		name:theuser.name,
		bio:theuser.bio,
		thumb:thethumb,
		thumbsmall:thethumbsmall,
		web:theuser.web,
		login:theuser.login,
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
		illicite: theuser.illicite
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
	return this.count( {'status': { $in: [2, 10]}}, callback );
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



var auth = require('../mylib/basicAuth');
User.plugin(auth);

mongoose.model('User', User);




/******************************ZONE*/
var Zone = new Schema({
    name     : { type: String}
  , location       : { lat: {type: Number},lng:{type:Number} }
}, { collection: 'zone' });


Zone.statics.findNear = function (x,y,callback) {
	var center = [parseFloat(x), parseFloat(y)];
	z = 3;

	  //return this.find( {limit:1, "location" : { "$within" : { "$center" : [center, radius] }}},callback );
	  return this.find({"location" : {  "$near" : [parseFloat(x),parseFloat(y)], $maxDistance : z }},{},{'limit':1},callback );
  //return this.find( { "location" : { "$within" : {,"$box": [[x-1, y-1], [x+1, y+1]]}}},callback );
}



Zone.statics.findAll = function (callback) {
  return this.find({}, callback);
}
mongoose.model('Zone', Zone);

/******************************YAKCAT*/
var Yakcat = new Schema({
    title     : { type: String, index:true, required: true}
  , path       : { type:String }
  , pathN       : { type:String, uppercase: true, index:true }
  , tag       : { type:[String] }
  , level       : { type:Number }
  , thumb       : { type:String }
  , creationDate       : { type:Date }
  , lastModifDate       : { type:Date }
  , status       : { type:Number }
  
}, { collection: 'yakcat' });

Yakcat.statics.countUnvalidated = function (callback) {
	return this.count( {'status': { $in: [2, 10]}}, callback );
}

Yakcat.statics.findAll = function (callback) {
  return this.find({},{},{sort:{title:1}}, callback);
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

mongoose.model('Yakcat', Yakcat);


/******************************YAKTAG*/
var Tag = new Schema({
    title     : { type: String, required: true, index:true}
  , usageDate       : { type:Date , default: Date.now, index:true}
  , numUsed :{type:Number}
  , location	: { type : { lat: Number, lng: Number }, index : '2d'}
  , print :{type:Number,require: true, index: true, default: 0}	
  
}, { collection: 'tag' });

Tag.statics.findAll = function (callback) {
  return this.find({},{},{sort:{numUsed:-1,usageDate:-1,title:1}}, callback);
}

Tag.statics.getHotTags = function (x,y,z,d,print,limit,callback) {
	var now = new Date();
	var DUSED = new Date();
	var DUSEDMAX = new Date();
	var offset = 24*60*60*1000; // 1 day
	DUSED.setTime((now.getTime()+d*24*60*60*1000)-offset);
	DUSEDMAX.setTime(now.getTime()+d*24*60*60*1000);
	return this.find({usageDate:{$gte:DUSED,$lte:DUSEDMAX}, location:{$near:[parseFloat(x),parseFloat(y)],$maxDistance:parseFloat(z)},print:print},{},{sort:{numUsed:-1},limit:limit}, callback);
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
	, 	date : {type: Date}
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
