/******************************STAT*/
var mongoose = require('mongoose')
, Schema = mongoose.Schema;

var Stat = new Schema({
	creationDate	: {type: Date, required: true, default: Date.now}	
	, info : {type:  Schema.Types.Mixed}				
	, user : {type:  Schema.Types.Mixed}
	, place : {type:  Schema.Types.Mixed}
}, { collection: 'stat' });


Stat.statics.findAll = function (callback) {
  return this.find({}, callback);
}
Stat.statics.findFromDate = function (msts,callback) {
  return this.find({creationDate:{$gte:msts}},{creationDate:1,infoTotal:1,infoYassala:1},{sort:{creationDate:1}}, callback);
}

mongoose.model('Stat', Stat);

