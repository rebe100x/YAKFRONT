
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
  , outGoingLink       : { type: String, index: true }
  , content   : { type: String}
}, { collection: 'info' });



Info.statics.findByTitle = function (title, callback) {
  return this.find({ title: title }, callback);
}
Info.statics.findByLink = function (link, callback) {
  return this.find({ outGoingLink: link }, callback);
}
Info.statics.findAll = function (callback) {
  return this.find({}, callback);
}
/**
 * Define model.
 */

mongoose.model('Info', Info);

