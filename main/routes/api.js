/*
 * Serve JSON to our AngularJS client
 */



exports.infos = function (req, res) {
	var mongoose = require('mongoose'), Schema = mongoose.Schema;
	var db = mongoose.connect('mongodb://localhost/yakwala');
	var Info = db.model('Info');
	Info.findAll(function (err, docs){
	  res.json({
		info: docs
	  });
	}); 
};

exports.geoinfos = function (req, res) {
	var mongoose = require('mongoose'), Schema = mongoose.Schema;
	var db = mongoose.connect('mongodb://localhost/yakwala');
	var Info = db.model('Info');
	Info.findAllGeo(req.params.x1,req.params.y1,req.params.x2,req.params.y2,function (err, docs){
	  res.json({
		info: docs
	  });
	}); 
};

exports.zones = function (req, res) {
	var mongoose = require('mongoose'), Schema = mongoose.Schema;
	//mongoose.set('debug', true);
	var db = mongoose.connect('mongodb://localhost/yakwala');
	var Zone = db.model('Zone');
	Zone.findNear(req.params.x,req.params.y,function (err, docs){
	  res.json({
		zone: docs
	  });
	}); 
};

exports.cats = function (req, res) {
	var mongoose = require('mongoose'), Schema = mongoose.Schema;
	//mongoose.set('debug', true);
	var db = mongoose.connect('mongodb://localhost/yakwala');
	var Yakcat = db.model('Yakcat');
	Yakcat.findAll(function (err, docs){
	  res.json({
		cats: docs
	  });
	});
};

exports.posts = function (req, res) {
  var posts = [];
  data.posts.forEach(function (post, i) {
    posts.push({
      id: i,
      title: post.title,
      text: post.text.substr(0, 50) + '...'
    });
  });
  res.json({
    posts: posts
  });
};

exports.post = function (req, res) {
  var id = req.params.id;
  if (id >= 0 && id < data.posts.length) {
    res.json({
      post: data.posts[id]
    });
  } else {
    res.json(false);
  }
};

// POST

exports.addPost = function (req, res) {
  data.posts.push(req.body);
  res.json(req.body);
};

// PUT

exports.editPost = function (req, res) {
  var id = req.params.id;

  if (id >= 0 && id < data.posts.length) {
    data.posts[id] = req.body;
    res.json(true);
  } else {
    res.json(false);
  }
};

// DELETE

exports.deletePost = function (req, res) {
  var id = req.params.id;

  if (id >= 0 && id < data.posts.length) {
    data.posts.splice(id, 1);
    res.json(true);
  } else {
    res.json(false);
  }
};