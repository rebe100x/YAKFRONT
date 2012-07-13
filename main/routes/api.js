/*
 * Serve JSON to our AngularJS client
 */
var data = {
  "posts": [
    {
      "title": "elo nono2 !",
      "text": "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    },
    {
      "title": "Sed egestas",
      "text": "Sed egestas, ante et vulputate volutpat, eros pede semper est, vitae luctus metus libero eu augue. Morbi purus libero, faucibus adipiscing, commodo quis, gravida id, est. Sed lectus."
    }
  ]
};
 
 

// GET
 
exports.posts = function (req, res) {
var mongoose = require('mongoose'), Schema = mongoose.Schema;
var db = mongoose.connect('mongodb://localhost/yakwala');
var Info = db.model('Info');
var data2 = Info.findAll(function (err, docs){
  //console.log(docs);
  var posts = docs;

  res.json({
    info: docs
  });

}); 
  
};