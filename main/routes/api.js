/*
 * Serve JSON to our AngularJS client
 */



exports.infos = function (req, res) {
	var Info = db.model('Info');
	Info.findAll(function (err, docs){
	  res.json({
		info: docs
	  });
	}); 
};

exports.geoinfos = function (req, res) {
	var Info = db.model('Info');
	var type = [];
	type = req.params.type.split(',');
	if(req.session.user){
		var usersubs= req.session.user.usersubs;
		var tagsubs= req.session.user.tagsubs;
	}
	else{
		var usersubs = [];
		var tagsubs = [];
	}
	Info.findAllGeo(req.params.x1,req.params.y1,req.params.x2,req.params.y2,req.params.heat,type,req.params.str,usersubs,tagsubs,function (err, docs){
	  res.json({
		info: docs
	  });
	}); 
};


exports.zones = function (req, res) {
	var Zone = db.model('Zone');
	Zone.findNear(req.params.x,req.params.y,function (err, docs){
	  res.json({
		zone: docs
	  });
	}); 
};

exports.cats = function (req, res) {
	var Yakcat = db.model('Yakcat');
	Yakcat.findAll(function (err, docs){
	  res.json({
		cats: docs
	  });
	});
};
exports.catsandtags = function (req, res) {
	var Yakcat = db.model('Yakcat');
	var Tag = db.model('Tag');
	var results =  new Array();
	Yakcat.find({},'title',function (err, cats){
		Tag.find({},'title',function (err, tags){
		results = tags.concat(cats);		
			res.json({
				catsandtags: results
			  });	
		});
	});
};

exports.places = function (req, res) {
	var Place = db.model('Place');
	
	Place.findAll(function (err, docs){
	  res.json({
		places: docs
	  });
	});
};

exports.searchplaces = function (req, res) {
	var Place = db.model('Place');
	
	Place.searchOne(req.params.str,1,function (err, docs){
	  res.json({
		places: docs
	  });
	});
};

exports.addfavplace = function (req, res) {
	var User = db.model('User');
	var Point = db.model('Point');
	
	if(req.session.user){
		var point = new Point(req.body.place);	
		console.log(point);
		req.session.user.favplace.push(point);
		
		User.update({_id:req.session.user._id},{$push:{"favplace":point}}, function(err,docs){			
			res.json(point._id);
		});
	}else{
		req.session.message = "Erreur : vous devez être connecté pour sauver vos favoris";
		res.redirect('/user/login');
	}
	
	
};

exports.delfavplace = function (req, res) {
	var User = db.model('User');
	
	if(req.session.user){
			var pointId = req.body.pointId;
			for(i=0;i<req.session.user.favplace.length;i++)
				if(pointId==req.session.user.favplace[i]._id) 
					req.session.user.favplace.splice(i, 1);
					 //{$pull: {attendees: {_id: ObjectId( "4f8dfb06ee21783d7134503a" )}}})
			User.update({_id:req.session.user._id},{$pull:{favplace:{_id:pointId}}}, function(err){
				console.log(err);
				res.json('del');
				
			});
			
			
		
	}else{
		req.session.message = "Erreur : vous devez être connecté pour sauver vos favoris";
		res.redirect('/user/login');
	}
	
	
};

exports.usersearch = function (req, res) {
	var User = db.model('User');
	User.search(req.params.string,function (err, docs){
	var docsConcat = new Array();
	docs.forEach(function(o){
		var tmp = new Object();
		//tmp.userdetails="<img width=\"24\" height=\"24\" class=\"size100 img-rounded\" src=\"/uploads/pictures/24_24/"+o['thumb']+"\"  />"+o['name']+" <span class=\"autocompleteScreenName\"> @"+o['login']+"</span>";
		tmp.userdetails=o['name']+" (@"+o['login']+")";
		tmp.name =o['name'];
		tmp.login =o['login'];
		tmp._id =o['_id'];
		docsConcat.push(tmp);
	});
	res.json({
		users: docsConcat
	  });
	});
};
exports.usersearchOLD = function (req, res) {
	var User = db.model('User');
	User.search(req.params.string,function (err, docs){
	  res.json({
		users: docs
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