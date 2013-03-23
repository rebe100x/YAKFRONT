var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , S = require('string')
  , crypto = require('crypto')
  ObjectId = Schema.ObjectId;

mongoose.set('debug', true);


var Track = new Schema({
	  userid : {type: Schema.ObjectId}
	, actiondate	: { type: Date, default: Date.now }	
	, actionid : { type: Number }
	, params : { type : Schema.Types.Mixed}
});
mongoose.model('Track', Track);

