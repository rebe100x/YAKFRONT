
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

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
  , outGoingLink       : { type: String, index: true }  
  , heat	: {type: Number}		
  , print	: {type: Number}		
  , yakCat	: {type: [Yakcat]}		
  , yakTag	: {type: [String]}		
  , freeTag	: {type: [String]}		
  , creationDate	: {type: Date}		
  , lastModifDate	: {type: Date}		
  , dateEndPrint	: {type: Date}		
  , address	: {type: String}		
  , location	: { type : Schema.Types.Mixed, index : '2d'}	
  , status	: {type: Number}		
  , user	: {type: Schema.ObjectId}		
  , zone	: {type: Schema.ObjectId}		
}, { collection: 'info' });


Info.statics.findByTitle = function (title, callback) {
  return this.find({ title: title }, callback);
}
Info.statics.findByLink = function (link, callback) {
  return this.find({ outGoingLink: link }, callback);
}
Info.statics.findAll = function (callback) {
  //return this.find({}, callback);
  
  
  return this.find({},
[],
{
    skip:0, // Starting Row
    limit:40, // Ending Row
    sort:{
        creationDate: -1 //Sort by Date Added DESC
    }
},
callback);

}

mongoose.model('Info', Info);


/*USERS*/
var crypto = require('crypto');

var User = new Schema({
    login     : { type: String, index: true}
  , password       : { type: String , index: true}
}, { collection: 'user' });


User.statics.findByLogin = function (login,callback) {
  return this.find({login:login}, callback);
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
mongoose.set('debug', true);
      return this.find({login:lg,password:pwd},[],{limit:1},callback);
    }
User.makeSalt =  function() {
      return Math.round((new Date().valueOf() * Math.random())) + '';
    }

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
mongoose.model('Yakcat', Yakcat);
