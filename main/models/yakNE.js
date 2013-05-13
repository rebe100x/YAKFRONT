// The feed model



var mongoose = require('mongoose')
, Schema = mongoose.Schema;


var YakNE = new Schema({
	title	: String
	,match	: { type : [{ title: String, level: String }] }
	,yakCatName : [String]
	,yakCatId : [String]
	,creationDate : {type: Date, required: true, default: Date.now}
	,lastModifDate: {type: Date, required: true, default: Date.now}
	,status : Number
},{ collection: 'yakNE' });


YakNE.statics.findByTitle = function (str,callback) {
  searchStr = new RegExp(str,'i');
  var cond = {'title': {$regex:searchStr},"status":1};
  return this.find( cond,{title:1}, callback );
}


  
YakNE.statics.findAll = function (callback) {
  return this.find({"status":1},{},{sort:{title:1}}, callback);
}

YakNE.statics.searchOne = function (str,exact,callback) {
  if(!exact)
	searchStr = new RegExp(str,'i');
  else
	searchStr = new RegExp('^'+str+'$','i');
  
  var cond = { "status":1,'title': {$regex:searchStr}	};
  return this.find(cond,{},{limit:1}, callback);
}


YakNE.statics.findById = function (id, callback) {
	return this.findOne({'_id': id}, callback);
}


mongoose.model('YakNE', YakNE);
