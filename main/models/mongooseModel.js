
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
});
mongoose.model('Point', Point);


var UserLight = new Schema({
	  name : String
	, location	: { type : { lat: Number, lng: Number }}
	, formatted_address : String
});
mongoose.model('UserLight', UserLight);


/**
 * Schema definition
 */
var Info = new Schema({
    title     : { type: String,required: true,}
  , content	: {type: String}		
  , thumb	: {type: String}		
  , origin	: {type: String}		
  , access	: {type: Number}
  , licence	: {type: String}		
  , outGoingLink       : { type: String }  
  , heat	: {type: Number}		
  , print	: {type: Number}		
  , yakCat	: {type: [Yakcat],index:1}
  , yakCatName	: {type: [String],index:1}	
  , yakTag	: {type: [String],index:1}
  , yakType	: {type: Number,index:1}  
  , freeTag	: {type: [String]}	
  , pubDate	: {type: Date, required: true, default: Date.now,index:1}		  
  , creationDate	: {type: Date, required: true, default: Date.now}		
  , lastModifDate	: {type: Date, required: true, default: Date.now}		
  , dateEndPrint	: {type: Date,index:1}		
  , eventDate	: {type: {dateFrom: Date,dateEnd:Date,hreventdate:String}}		
  , address	: {type : String}	
  , location	: { type : { lat: Number, lng: Number }, index : '2d'}	
  , status	: {type: Number,index:1}		
  , user	: {type: Schema.ObjectId}		
  , userName	: {type: String}		
  , zone	: {type: Schema.ObjectId}
  ,	placeId	: {type: Schema.ObjectId}  
}, { collection: 'info' });

//Info.index({location : '2d',pubDate:-1,yakType:1,print:1,status:1});
//Info.index({location : '2d'});

Info.statics.format = function (theinfo) {
	if(theinfo.thumb != undefined)
		if(theinfo.user != undefined)
			var thethumb = 	conf.fronturl+'/pictures/120_90/'+theinfo.thumb;
		else
			var thethumb = 	conf.batchurl+theinfo.thumb;
	else
		var thethumb = 	'';


	var formattedInfo = {
		_id:theinfo._id,
		title:theinfo.title,
		content:theinfo.content,
		thumb:thethumb,
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
	};
  return formattedInfo;
}


Info.statics.findByTitle = function (title, callback) {
  return this.find({ title: title }, callback);
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

/*Info.statics.findAllByPage = function (callback, skip, limit, yakType, _id, what, where, dateInterval, yakCat, next) {
	
	var mydateUtils = require('../mylib/dateUtils.js');

	var now = mydateUtils.substractDays(new Date(), parseInt(0));
	var from = mydateUtils.substractDays(new Date(), parseInt(dateInterval.split(',')[1]));
	var till = mydateUtils.substractDays(new Date(), parseInt(dateInterval.split(',')[0]));

	var daterange = dateInterval.split(',');

	var cond = new Object();

	 var types = new Array();
	 types = yakType.split(',');

     var location = new Array();
     location = where.split(',');

	cond["status"] = 1;

	if (dateInterval.split(',')[1] == dateInterval.split(',')[0]){
		cond["pubDate"] = {$gte: from, $lte: now};
	}
	else
	{
		cond["pubDate"] = {$gte: from, $lte: till};
	}

	if (yakType != ""){
		cond["yakType"] =  {$in:types};
	};

	if (what != "") {
			//cond["$or"] = { 'content': {$regex:what}, 'title': {$regex:what} };
			cond["content"] = {$regex:what};
	};


	if (where != "") {
		 cond["location"] = {$near : [parseFloat(location[0]),parseFloat(location[1])], $maxDistance: 1};
	};
	
	var infos = this.find(cond).sort({'pubDate':1}).skip(skip).limit(limit);

	res = infos.exec(callback)

}
*/

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


Info.statics.findByUserIds = function (useridArray, count, from, callback) {
	var limit = (typeof(count) != 'undefined' && count > 0) ? count : 100;		
	var skip = (typeof(from) != 'undefined' && from > 0) ? from : 0;	
  return this.aggregate({ $group: {user: {$in:useridArray}}},{},{limit:limit,skip:skip,sort:{pudDate:-1}}, callback);
}

Info.statics.findAllGeo = function (x1,y1,x2,y2,from,type,str,callback) {
	// we create the date rounded to the last day, except if from = 0, we take the last few hours
	var DPUB = new Date();
	var DEND = new Date();
	var now = new Date();
	var D = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
	var DTS = D.getTime() / 1000 - (from * 60 * 60 * 24);
	DPUB .setTime(DTS*1000);
	DEND .setTime(DTS*1000);
	if(from == 0){ // from this morning to now
		DPUB.setTime(now.getTime()+3*60*60*1000);
		DEND = D; // this morning
	}
		
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
			
	var qInfo = this.find(cond).sort({'pubDate':-1}).limit(100);
	
	if(str != 'null' && str.length > 0){  // STRING SEARCH
		var S = require('string');
		str = decodeURIComponent(str);
		str = S(str).trim();
				
		var firstChar = str.substr(0,1);
		var thirdChar = str.substr(0,3);
		var strClean = str.replace(/@/g,'').replace(/#/g,'').replace(/%23/g,'').replace(/%40/g,'');
		var searchStr = new RegExp(strClean,'gi');
		var searchExactStr = new RegExp("^"+strClean+"$",'gi');
		if(firstChar=='#' || thirdChar == '%23'){
			Yakcat.findOne({'title': {$regex:searchStr}}).exec(function(err,theyakcat){
				if(theyakcat == null){
					qInfo.or([{"freeTag": {$regex:searchExactStr}} , {"yakTag": {$regex:searchExactStr}}]);
				}else{
					qInfo.or([{"freeTag": {$regex:searchExactStr}} , {"yakTag": {$regex:searchExactStr}},{"yakCat": {$in:[theyakcat._id]}}]);
				}
				res = qInfo.exec(callback);
			});
		}else if(firstChar=='@' || thirdChar == '%40' ){
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
							qInfo.or([ {'title': {$regex:searchStr}}, {'content': {$regex:searchStr}} , {"freeTag": {$regex:searchExactStr}} , {"yakTag": {$regex:searchExactStr}}]);
						}else{
							qInfo.or([ {'title': {$regex:searchStr}}, {'content': {$regex:searchStr}} , {"freeTag": {$regex:searchExactStr}} , {"yakTag": {$regex:searchExactStr}}, {'user':theuser._id}]);
						}
						res = qInfo.exec(callback);
					});
				}else{
					qInfo.or([ {'title': {$regex:searchStr}}, {'content': {$regex:searchStr}} , {"freeTag": {$regex:searchExactStr}} , {"yakTag": {$regex:searchExactStr}},{"yakCat": {$in:[theyakcat._id]}}]);
					res = qInfo.exec(callback);
				}
			});
		}
	}else{  // NO STRING SEARCH
		res = qInfo.exec(callback);
	}
	return res;
}

Info.statics.findAllGeoAlert = function (x1,y1,x2,y2,from,str,usersubs,tagsubs,callback) {
	var now = new Date();
	var D = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
	var DTS = D.getTime() / 1000 - (from * 60 * 60 * 24);
	D.setTime(DTS*1000); 
	console.log(from);
	var box = [[parseFloat(x1),parseFloat(y1)],[parseFloat(x2),parseFloat(y2)]];
	var Yakcat = db.model('Yakcat');
	var User = db.model('User');
	var Tag = db.model('Tag');
	var res = null;

	var cond = {
				"print":1,
				"status":1,
				"location" : {$within:{"$box":box}},
				"pubDate":{$lte:D},
				"dateEndPrint":{$gte:D},

			};

	var qInfo = this.find(cond).sort({'pubDate':-1}).limit(100);
	
	
	if( (typeof(usersubs) != 'undefined' && usersubs != 'null') || (typeof(tagsubs) != 'undefined' && tagsubs != 'null' ) ){
		if(typeof(usersubs) != 'undefined' && usersubs != 'null' ){
			var usersubsId =  usersubs.map(function(item){return item._id});
			qInfo.or([ {"user":{$in:usersubsId}}]);
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
					qInfo.or([{"freeTag": {$regex:searchExactStr}} , {"yakTag": {$regex:searchExactStr}}]);
				}else{
					qInfo.or([{"freeTag": {$regex:searchExactStr}} , {"yakTag": {$regex:searchExactStr}},{"yakCat": {$in:[theyakcat._id]}}]);
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
							qInfo.or([ {'title': {$regex:searchStr}}, {'content': {$regex:searchStr}} , {"freeTag": {$regex:searchExactStr}} , {"yakTag": {$regex:searchExactStr}}]);
						}else{
							qInfo.or([ {'title': {$regex:searchStr}}, {'content': {$regex:searchStr}} , {"freeTag": {$regex:searchExactStr}} , {"yakTag": {$regex:searchExactStr}}, {'user':theuser._id}]);
						}
						res = qInfo.exec(callback);
					});
				}else{
					qInfo.or([ {'title': {$regex:searchStr}}, {'content': {$regex:searchStr}} , {"freeTag": {$regex:searchExactStr}} , {"yakTag": {$regex:searchExactStr}},{"yakCat": {$in:[theyakcat._id]}}]);
					res = qInfo.exec(callback);
				}
			});
		}
	}else{  // NO STRING SEARCH
		res = qInfo.exec(callback);
	}
	return res;
}

Info.statics.findAllGeoOLD = function (x1,y1,x2,y2,heat,type,str,usersubs,tagsubs,callback) {
	var now = new Date();
	var D = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
	var DTS = D.getTime() / 1000 - (heat * 60 * 60 * 24);
	D.setTime(DTS*1000); 
	var box = [[parseFloat(x1),parseFloat(y1)],[parseFloat(x2),parseFloat(y2)]];

	
	if(str != 'null' && str.length > 0){  // STRING SEARCH
		
		//encodeURIComponent(str);
		
		
		var Yakcat = db.model('Yakcat');
		var User = db.model('User');
		
		var firstChar = str.substr(0,1);
		var strClean = str.replace(/@/g,'').replace(/#/g,'');
		var searchStr = new RegExp(strClean,'i');
		console.log('str'+str);
		console.log('strClean'+strClean);
		console.log('searchStr'+searchStr);
		
		Yakcat.findOne({'title': strClean},function(err,theyakcat){
		
		
		console.log('YAKCAT');
		console.log(theyakcat);
		
		
			if(theyakcat == null || theyakcat == 'null'){ // NO YAKCAT MATCHING
				console.log('NO YAKCAT');
				if(firstChar=='#'){
					console.log('TAG');
					// all types
					var cond = {
						"print":1,
						"status":1,
						"location" : {$within:{"$box":box}},
						"pubDate":{$gte:D},
						"yakType" : {$in:type},
						$or:[ {"freeTag": strClean} , {"yakTag": strClean}],	
					};

					//alerts : type = 5				
					if(type == 5){
						cond = {
							"print":1,
							"status":1,
							"location" : {$within:{"$box":box}},
							"pubDate":{$gte:D},
							$or:[ {"user":{$in:usersubs}}, {"freeTag": {$in:tagsubs}}],
							$or:[ {"freeTag": strClean} , {"yakTag": strClean} ],	
						};
					}
				
				}else if(firstChar=='@'){
					// all types
					console.log('USER');
					//User.findByNameorLogin(strClean,function(err,userMatched){
					User.findOne({'login':strClean},function(err,userMatched){
						console.log(userMatched);
						if(userMatched != null){
							console.log(userMatched._id);
							var cond = {
								"print":1,
								"status":1,
								"location" : {$within:{"$box":box}},
								"pubDate":{$gte:D},
								"yakType" : {$in:type},
								"user":mongoose.Types.ObjectId(new String(userMatched._id)),	
							};

							//alerts : type = 5				
							if(type == 5){
								cond = {
									"print":1,
									"status":1,
									"location" : {$within:{"$box":box}},
									"pubDate":{$gte:D},
									"user":mongoose.Types.ObjectId(userMatched._id),
									$or:[ {"user":{$in:usersubs}}, {"freeTag": {$in:tagsubs}}],
								};
							}
							
							
							
							
						}
						console.log('USER FOUND');
						console.log(cond);
						var Info = db.model('Info');
						return Info.find(
							cond,
							{},
							{
								skip:0, // Starting Row
								limit:100, // Ending Row
								sort:{
									pubDate: -1 //Sort by Date Added DESC
								}
							},
						callback);
					});
					
					
				
				}else{
					console.log('STRING');
					// all types
					var cond = {
						"print":1,
						"status":1,
						"location" : {$within:{"$box":box}},
						"pubDate":{$gte:D},
						"yakType" : {$in:type},
						$or:[ {'title': {$regex:searchStr}}, {'content': {$regex:searchStr}} , {"freeTag": {$regex:searchStr}} , {"yakTag": {$regex:searchStr}}],	
					};

					//alerts : type = 5				
					if(type == 5){
						cond = {
							"print":1,
							"status":1,
							"location" : {$within:{"$box":box}},
							"pubDate":{$gte:D},
							$or:[ {"user":{$in:usersubs}}, {"freeTag": {$in:tagsubs}}],
							$or:[ {'title': {$regex:searchStr}}, {'content': {$regex:searchStr}} , {"freeTag": {$regex:searchStr}} , {"yakTag": {$regex:searchStr}}],	
						};
					}
					
				}
				
				
				
			}else{
				console.log('YAKCAT FOUND !!');
				// all types
				var cond = {
					"print":1,
					"status":1,
					"location" : {$within:{"$box":box}},
					"pubDate":{$gte:D},
					"yakType" : {$in:type},
					"yakCat": {$in:[mongoose.Types.ObjectId(new String(theyakcat._id))]},
				};

			//alerts				
			if(type == 5){
				cond = {
					"print":1,
					"status":1,
					"location" : {$within:{"$box":box}},
					"pubDate":{$gte:D},
					$or:[ {"user":{$in:usersubs}}, {"freeTag": {$in:tagsubs}} ],
					"yakCat": {$in:mongoose.Types.ObjectId(new String(theyakcat._id))},
				};
			}
			
			}
				
			
			console.log('CALL HERE');
			var Info = db.model('Info');
			return Info.find(
				cond,
				{},
				{
					skip:0, // Starting Row
					limit:100, // Ending Row
					sort:{
						pubDate: -1 //Sort by Date Added DESC
					}
				},
			callback);
		});
		
		
	}else{  // NO STRING SEARCH
		var cond = {
			"print":1,
			"status":1,
			"location" : {$within:{"$box":box}},
			"pubDate":{$gte:D},
			"yakType" : {$in:type}
		};

		//alerts				
		if(type == 5)
			cond = {
				"print":1,
				"status":1,
				"location" : {$within:{"$box":box}},
				"pubDate":{$gte:D},
				$or:[ {"user":{$in:usersubs}}, {"freeTag": {$in:tagsubs}} ],
			};
	
	return this.find(
		cond,
		{},
		{
			skip:0, // Starting Row
			limit:100, // Ending Row
			sort:{
				pubDate: -1 //Sort by Date Added DESC
			}
		},
	callback);
	
	}
	
	
	
	

}
mongoose.model('Info', Info);








/******************************USERS*/

var User = new Schema({
	name	: { type: String, index: true}
	, bio	: { type: String}
    , mail	: { type: String, required: true, index: true}
	, web	: { type: String}
	, tag	: { type: [String], index: true}
	, thumb	: { type: String, default:'no-user.png'}
	, type	: { type: Number, required: true, index: true}
	, login     : { type: String, lowercase: true, required: true, index: { unique: true }}
	, hash       : { type: String ,required: true, index: true}
	, salt       : { type: String ,required: true, index: true}
	, token       : { type: String ,required: true, index: true}
	, validationKey       : { type: String ,required: true, index: true}
	, usersubs	: { type: [User],ref: 'User',  index: true}
	, tagsubs	: { type: [String], index: true}
	, placesubs	: { type: [Schema.Types.ObjectId], index: true}
	, location	: { type : { lat: Number, lng: Number }, index : '2d'}	
	, formatted_address : { type: String }
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


User.statics.format = function (theuser) {
	if(theuser.thumb)
		var thethumb = 	conf.fronturl+'/pictures/128_128/'+theuser.thumb;
	else
		var thethumb = 	'';

	var formattedUser = {
		_id:theuser._id,
		name:theuser.name,
		bio:theuser.bio,
		thumb:thethumb,
		web:theuser.web,
		login:theuser.login,
		mail:theuser.mail,
		lastLoginDate:theuser.lastLoginDate,
		location:theuser.location,
		address:theuser.address,
		favplace:theuser.favplace,
		usersubs:theuser.usersubs,
		tagsubs:theuser.tagsubs,
	};
  return formattedUser;
}

User.statics.formatLight = function (theuser) {
	if(theuser.thumb)
		var thethumb = 	conf.fronturl+'/pictures/128_128/'+theuser.thumb;
	else
		var thethumb = 	'';

	var formattedUser = {
		_id:theuser._id,
		name:theuser.name,
		login:theuser.login,
		userdetails:theuser.name+'(@'+theuser.login+')',
		thumb:thethumb
	};
  return formattedUser;
}

User.statics.findByLogin = function (login,callback) {
  return this.find({login:login,status:1}, callback);
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
User.statics.PublicProfileFindById = function (id,callback) {
  return this.findOne({'_id': id},{_id:1,address:1,bio:1,location:1,login:1,mail:1,name:1,thumb:1,type:1,web:1,lastLoginDate:1,favplace:1,placesubs:1,tagsubs:1,usersubs:1,tags:1}, callback);
}
User.statics.findByToken = function (token,callback) {
  return this.findOne({'token': token,'status':2}, callback);
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
	{_id:1,address:1,bio:1,location:1,login:1,mail:1,name:1,thumb:1,type:1,web:1,lastLoginDate:1,favplace:1,placesubs:1,tagsubs:1,usersubs:1,tags:1},
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
  , lastUsageDate       : { type:Date , default: Date.now, index:true}
  , numUsed :{type:Number}
  
}, { collection: 'tag' });

Tag.statics.findAll = function (callback) {
  return this.find({},{},{sort:{lastUsageDate:1}}, callback);
}
Tag.statics.searchOne = function (str,callback) {
	searchStr = new RegExp(str,'i');
	return this.find({'title': {$regex:searchStr}},{},{limit:1}, callback);
}
Tag.statics.search = function(string,count,from,sensitive,order,callback){
	var limit = (typeof(count) != 'undefined' && count > 0) ? count : 100;		
	var case_sensitive = (typeof(sensitive) != 'undefined' && sensitive > 0) ? 'g' : 'gi';	
	var skip = (typeof(from) != 'undefined' && from > 0) ? from : 0;		
	var thesort = (typeof(order) != 'undefined' && order == 'lastUsed') ? {sort:{lastUsageDate:-1}} : {sort:{numUsed:1}};		
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



/******************************PLACE*/
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

Place.statics.findById = function (id,callback) {
  return this.findOne({'_id': id}, callback);
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



/***************CLIENT*/
var Client = new Schema({
	name	: { type: String, required: true, index:'unique'}
,	link	: { type: String, required: true}
,	secret	: { type: String, required: true, index:'unique'}
,	status	: {type: Number, required: true, index:true}		
},{ collection: 'client' });


mongoose.model('Client', Client);
