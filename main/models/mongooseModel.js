
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , S = require('string'),
  crypto = require('crypto');

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
  , dateEndPrint	: {type: Date}		
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

Info.statics.findByUser = function (userid,count, callback) {
  return this.find({ user: userid },{},{limit:count,sort:{pudDate:-1}}, callback);
}

Info.statics.findByUserIds = function (useridArray, count, callback) {
  return this.aggregate({ $group: {user: {$in:useridArray}}}, callback);
}

Info.statics.findAllGeo = function (x1,y1,x2,y2,heat,type,str,usersubs,tagsubs,callback) {
	var now = new Date();
	var D = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
	var DTS = D.getTime() / 1000 - (heat * 60 * 60 * 24);
	D.setTime(DTS*1000); 
	var box = [[parseFloat(x1),parseFloat(y1)],[parseFloat(x2),parseFloat(y2)]];
	var Yakcat = db.model('Yakcat');
	var User = db.model('User');
	var Tag = db.model('Tag');
	var res = null;
	var cond = {
				"print":1,
				"status":1,
				"location" : {$within:{"$box":box}},
				"pubDate":{$gte:D},
				"yakType" : {$in:type}
			};
	var qInfo = this.find(cond).sort({'pubDate':-1}).limit(100);
	
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
								zip: String}
							}
	, favplace : [Point]
	, creationDate	: {type: Date, required: true, default: Date.now}		
	, lastModifDate	: {type: Date, required: true, default: Date.now}		
	, lastLoginDate	: {type: Date, required: true, default: Date.now}		
	, status	: {type: Number,required: true, default: 2,index: true}	
	, apiStatus	: {type: Number, required: true, default: 2,index: true}
	, apiCode       : { type: String ,index: true}
	, apiCodeCreationDate     :  {type: Date,index: true}		
	, apiToken     :  {type: String , index: true}		
	, apiTokenCreationDate     :  {type: Date,index: true}		
  
  
}, { collection: 'user' });


User.statics.findByLogin = function (login,callback) {
  return this.find({login:login,status:1}, callback);
}

User.statics.findByIds = function (ids,callback) {
  return this.find({'_id': { $in: ids}}, callback);
}
User.statics.identifyByToken = function (token,userid,callback) {
  return this.findOne({'_id':userid,'apiToken': token,'status':1}, callback);
}
User.statics.findById = function (id,callback) {
  return this.findOne({'_id': id}, callback);
}
User.statics.apiFindById = function (id,callback) {
  return this.findOne({'_id': id},{_id:1,address:1,bio:1,location:1,login:1,mail:1,name:1,thumb:1,type:1,web:1,lastLoginDate:1,favplace:1,placesubs:1,tagsubs:1,usersubs:1,tags:1}, callback);
}
User.statics.findByToken = function (token,callback) {
  return this.findOne({'token': token,'status':2}, callback);
}
User.statics.findAll = function (callback) {
  return this.find({},{},{sort:{name:1}}, callback);
}
	
User.statics.search = function(string,limit,callback){
	var input = new RegExp(string,'gi');
	return this.find(
	{	$or:[ {'login': {$regex:input}}, {'name': {$regex:input}} , {"tag": {$regex:input}} ],
		
	"status":1,
	},
	{_id:1,address:1,bio:1,location:1,login:1,mail:1,name:1,thumb:1,type:1,web:1,lastLoginDate:1,favplace:1,placesubs:1,tagsubs:1,usersubs:1,tags:1},
	{
		
		skip:0, // Starting Row
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
    title     : { type: String, index:true}
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

mongoose.model('Yakcat', Yakcat);


/******************************YAKTAG*/
var Tag = new Schema({
    title     : { type: String, required: true, index:true}
  , lastUsageDate       : { type:Date , default: Date.now, index:-1}
  
}, { collection: 'tag' });

Tag.statics.findAll = function (callback) {
  return this.find({},{},{sort:{lastUsageDate:1}}, callback);
}
Tag.statics.searchOne = function (str,callback) {
	searchStr = new RegExp(str,'i');
	return this.find({'title': {$regex:searchStr}},{},{limit:1}, callback);
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
,	location	: { type : { lat: Number, lng: Number }, index : '2d'}
,	formatted_address : { type: String }
,	address		: { type : { 
								street_number: String,
								street: String,
								arr: String,
								city: String,
								state: String,
								area: String,
								country: String,
								zip: String}
							}
,	status	: {type: Number}		
,	user	: {type: Schema.ObjectId}		
,	zone	: {type: Schema.ObjectId}
},{ collection: 'place' });

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


mongoose.model('Place', Place);



/***************CLIENT*/
var Client = new Schema({
	name	: { type: String, required: true, index:'unique'}
,	link	: { type: String, required: true}
,	secret	: { type: String, required: true, index:'unique'}
,	status	: {type: Number, required: true, index:true}		
},{ collection: 'client' });


mongoose.model('Client', Client);
