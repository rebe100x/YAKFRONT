/******************************STAT*/
var mongoose = require('mongoose')
, Schema = mongoose.Schema;

var Stat = new Schema({
	creationDate	: {type: Date, required: true, default: Date.now, index:true}	
	, info : {type:  Schema.Types.Mixed}				
	, user : {type:  Schema.Types.Mixed}
	, place : {type:  Schema.Types.Mixed}
	, zone : {type:  Schema.Types.Mixed}
}, { collection: 'stat' });


Stat.statics.findAll = function (callback) {
  return this.find({}, callback);
}
Stat.statics.findFromDate = function (msts,callback) {
  return this.find({creationDate:{$gte:msts}},{},{sort:{creationDate:1}}, callback);
}

Stat.statics.findToday = function (msts,callback) {
  return this.findOne({creationDate:{$gte:(msts-24*60*60*1000),$lte:msts}},{},{}, callback);
}

Stat.statics.formatByInfo = function (stats) {
	var creationDateHR = stats.creationDate.getDate()+'/'+(stats.creationDate.getMonth()+1);
	var formattedStat = {
			c:[
				{v: creationDateHR},
				{v: stats.info.totalToday}, {v: stats.info.yassala}, {v: stats.info.tovalidate}
			]};	
  return formattedStat;
}
Stat.statics.formatByUser = function (stats) {
	var creationDateHR = stats.creationDate.getDate()+'/'+(stats.creationDate.getMonth()+1);
	var formattedStat = {
			c:[
				{v: creationDateHR},
				{v: stats.user.totalToday}, {v: stats.user.tovalidate},
			]};	
  return formattedStat;
}
Stat.statics.formatByPlace = function (stats) {
	var creationDateHR = stats.creationDate.getDate()+'/'+(stats.creationDate.getMonth()+1);
	var formattedStat = {
			c:[
				{v: creationDateHR},
				{v: stats.place.totalToday}, {v: stats.place.tovalidate},
			]};	
  return formattedStat;
}
Stat.statics.formatByZone = function (stats) {
	var formattedStat = {
			c:[
				{v: stats.name},{v: stats.total},
			]};	
  return formattedStat;
}


mongoose.model('Stat', Stat);

