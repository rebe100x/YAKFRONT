var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , S = require('string')
  , crypto = require('crypto')
  ObjectId = Schema.ObjectId;

//mongoose.set('debug', true);


var Track = new Schema({
	  userid : {type: Schema.ObjectId, index:true}
	, actiondate	: { type: Date, default: Date.now, index:true }	
	, actionid : { type: Number, index:true }
	, params : { type : Schema.Types.Mixed}
});
mongoose.model('Track', Track);
Track.index({"params.location":"2d"});
