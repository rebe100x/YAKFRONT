
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , S = require('string');

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
	
/**
 * Schema definition
 */
var Info = new Schema({
    title     : { type: String}
  , content	: {type: String}		
  , thumb	: {type: String}		
  , origin	: {type: String}		
  , access	: {type: Number}
  , licence	: {type: String}		
  , outGoingLink       : { type: String }  
  , heat	: {type: Number}		
  , print	: {type: Number}		
  , yakCat	: {type: [Yakcat],index:1}		
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
	[],
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

Info.statics.findAllGeo = function (x1,y1,x2,y2,heat,type,str,usersubs,tagsubs,callback) {
	var now = new Date();
	var D = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
	var DTS = D.getTime() / 1000 - (heat * 60 * 60 * 24);
	D.setTime(DTS*1000); 
	var box = [[parseFloat(x1),parseFloat(y1)],[parseFloat(x2),parseFloat(y2)]];

	
	if(str != 'null' && str.length > 0){  // STRING SEARCH
		//str=str.replace(/\'/g,'\x27');
		//str=str.replace(/\'/g,'\\\'');
		//str='\x27';
		encodeURIComponent(str);
		var searchStr = new RegExp(str.replace(/@/g,''),'i');
		
		var Yakcat = db.model('Yakcat');
		
		
		
		var strClean = str.replace(/@/g,'');
		console.log(strClean);
		Yakcat.findOne({'title': strClean},function(err,theyakcat){
		
		
		console.log(str);
		console.log(theyakcat);
		var firstChar = str.substr(0,1);
		
			if(theyakcat == null || theyakcat == 'null'){ // NO YAKCAT MATCHING
				console.log('NULL');
				if(firstChar=='#'){
					// all types
					var cond = {
						"print":1,
						"status":1,
						"location" : {$within:{"$box":box}},
						"pubDate":{$gte:D},
						"yakType" : {$in:type},
						$or:[ {"freeTag": str.substr(1,str.length)} , {"yakTag": str.substr(1,str.length)}],	
					};

					//alerts : type = 5				
					if(type == 5){
						cond = {
							"print":1,
							"status":1,
							"location" : {$within:{"$box":box}},
							"pubDate":{$gte:D},
							$or:[ {"user":{$in:usersubs}}, {"freeTag": {$in:tagsubs}}],
							$or:[ {"freeTag": str.substr(1,str.length)} , {"yakTag": str.substr(1,str.length)} ],	
						};
					}
				
				}else if(firstChar=='@'){
					// all types
					var cond = {
						"print":1,
						"status":1,
						"location" : {$within:{"$box":box}},
						"pubDate":{$gte:D},
						"yakType" : {$in:type},
						$or:[ {"user":str.substr(1,str.length)} ],	
					};

					//alerts : type = 5				
					if(type == 5){
						cond = {
							"print":1,
							"status":1,
							"location" : {$within:{"$box":box}},
							"pubDate":{$gte:D},
							$or:[ {"user":str.substr(1,str.length)} ],	
							$or:[ {"user":{$in:usersubs}}, {"freeTag": {$in:tagsubs}}],
						};
					}
				
				}else{
				
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
				
			
			
			var Info = db.model('Info');
			return Info.find(
		cond,
		[],
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
		[],
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


/*USERS*/
var crypto = require('crypto');


var User = new Schema({
	name	: { type: String, index: true}
	, bio	: { type: String}
    , mail	: { type: String, index: true}
	, web	: { type: String}
	, tag	: { type: [String], index: true}
	, thumb	: { type: String}
	, type	: { type: Number, index: true}
	, login     : { type: String, index: true}
	, password       : { type: String , index: true}
	, usersubs	: { type: [Schema.ObjectId], index: true}
	, tagsubs	: { type: [String], index: true}
	, placesubs	: { type: [Schema.ObjectId], index: true}
	, location	: { type : { lat: Number, lng: Number }, index : '2d'}	
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
	, status	: {type: Number}		
  
  
}, { collection: 'user' });


User.statics.findByLogin = function (login,callback) {
  return this.find({login:login}, callback);
}

User.statics.findByIds = function (ids,callback) {
  return this.find({'_id': { $in: ids}}, callback);
}
User.statics.findById = function (id,callback) {
  return this.findOne({'_id': id}, callback);
}

User.setters = function(password) {
		  this._password = password;
		  this.salt = this.makeSalt();
		  this.hashed_password = this.encryptPassword(password);
		}
		
User.methods.encryptPassword = function(password) {
		  return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
	}
	
User.statics.Authenticate = function(lg,pwd,callback) {
      return this.findOne({login:lg,password:pwd},callback);
    }
User.makeSalt =  function() {
      return Math.round((new Date().valueOf() * Math.random())) + '';
    }
	
User.statics.findAll = function (callback) {
  return this.find({},[],{sort:{name:1}}, callback);
}
	
User.statics.search = function(string,callback){
	var input = new RegExp(string,'i');
	return this.find(
	{	$or:[ {'login': {$regex:input}}, {'name': {$regex:input}} , {"tag": {$regex:input}} ],
		
	"status":1,
	},
	['_id','tag','name'],
	{
		
		skip:0, // Starting Row
		limit:100, // Ending Row
		sort:{
			lastLoginDate: -1 //Sort by Date Added DESC
		}
	},
	callback);
}
//.or([{ 'firstName': { $regex: re }}, { 'lastName': { $regex: re }}])
mongoose.model('User', User);




/*ZONE*/
var Zone = new Schema({
    name     : { type: String}
  , location       : { lat: {type: Number},lng:{type:Number} }
}, { collection: 'zone' });


Zone.statics.findNear = function (x,y,callback) {
	var center = [parseFloat(x), parseFloat(y)];
	z = 3;

	  //return this.find( {limit:1, "location" : { "$within" : { "$center" : [center, radius] }}},callback );
	  return this.find({"location" : {  "$near" : [parseFloat(x),parseFloat(y)], $maxDistance : z }},[],{limit:1},callback );
  //return this.find( { "location" : { "$within" : {,"$box": [[x-1, y-1], [x+1, y+1]]}}},callback );
}



Zone.statics.findAll = function (callback) {
  return this.find({}, callback);
}
mongoose.model('Zone', Zone);





/*YAKCAT*/
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
  return this.find({},[],{sort:{title:1}}, callback);
}
Yakcat.statics.searchOne = function (str,callback) {
	searchStr = new RegExp(str,'i');
	return this.find({'title': {$regex:searchStr}},[],{limit:1}, callback);
}

mongoose.model('Yakcat', Yakcat);


/***************PLACE*/
var Place = new Schema({
	title	: { type: String, index:true}
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
  return this.find({},[],{sort:{title:1}}, callback);
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
  return this.find(cond,[],{limit:1}, callback);
}


mongoose.model('Place', Place);
