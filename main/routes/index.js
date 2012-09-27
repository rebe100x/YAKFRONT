/*
 * GET home page.
 */

exports.db = function(conf){
	mongoose = require('mongoose'), Schema = mongoose.Schema;
	//mongoose.set('debug', true);
	db = mongoose.connect('mongodb://localhost/'+conf.dbname);
	
};
	
exports.index = function(req, res){
  res.render('news/map');
};

exports.partials = function (req, res) {
  var name = req.params.name;
  res.render('partials/' + name);
};

exports.news_map = function(req, res){
	res.render('news/map');  
};
exports.news_map_test = function(req, res){
	res.render('news/map_test');  
};
exports.news_post = function(req, res){
	delete req.session.message;
  res.render('news/post');
};
exports.news_feed = function(req, res){
	var Info = db.model('Info');
	Info.findAll(function (err, docs){
		res.render('news/feed',{locals:{infos:docs}});
	}); 
};

/******* USER ******/
exports.user_login = function(req, res){
	delete req.session.message;
	res.render('user/login',{locals:{redir:req.query.redir}});
};
exports.user_logout = function(req, res){
	delete req.session.user;
	res.redirect('/news/map');
};
exports.user = function(req, res){

	var User = db.model('User');
	
	
	User.Authenticate(req.body.login,req.body.password,function(err,user){
		if(!(typeof(user) == 'undefined' || user === null || user === '')){
			req.session.user = user;
			res.redirect(req.body.redir || '/news/map');
		}else{
			req.session.message = 'Wrong login or password:';
			res.redirect('user/login?redir='+req.body.redir);
		}
	});
};


exports.news = function(req, res){

	var formMessage = new Array();
	delete req.session.message;
	var Info = db.model('Info');
	var Place = db.model('Place');
	
	var place = new Place();
	//mongoose.set('debug', true);

	//console.log(req.files);
	// we need a title, a location and a user
	if(req.body.placeInput && req.body.title && req.session.user){
	
		var drawTool = require('../mylib/drawlib.js');
		var size = [{"width":120,"height":90},{"width":512,"height":0}];
		var infoThumb = drawTool.StoreImg(req.files.picture,size,conf);
		formMessage.push(infoThumb.msg);	
			

		if(infoThumb.err == 0 ){
			
			var locTmp = JSON.parse(req.body.placeInput);
			
			locTmp.forEach(function(item) {
				var info = new Info();
				
				if(req.body.yakcatInput.length > 0){
					var yakcat = eval('('+req.body.yakcatInput+')');
					for(i=0;i<yakcat.length;i++){
						info.yakCat.push(mongoose.Types.ObjectId(yakcat[i]._id));
					}
				}
				info.title = req.body.title;
				info.content = req.body.content;
				
				// NOTE : in the query below, order is important : in DB we have lat, lng but need to insert in reverse order : lng,lat  (=> bug mongoose ???)
				info.location = {lng:parseFloat(item.location.lng),lat:parseFloat(item.location.lat)};
				// if no id, it means the location comes from gmap => we store it
				if(item._id == "" || typeof item._id === "undefined"){
					place = new Place(item);
					place.save();
					info.placeId = place._id;
				}else
					info.placeId = item._id;
				
				info.creationDate = new Date();
				info.lastModifDate = new Date();
				info.pubDate = new Date();
				var now = new Date();
				var D = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
				var DTS = D.getTime() / 1000 + (3 * 60 * 60 * 24);
				D.setTime(DTS*1000); 
				info.dateEndPrint = D;
				//console.log(info);
				info.print = 1;
				info.status = 1;
				info.yakType = 4; // UGC
				info.thumb = infoThumb.name;
				info.licence = 'Yakwala';
				info.heat = 80;
				info.freeTag = req.body.freetag.split(',');
				
				// security against unidentified users	
				if(req.session.user){
					info.user = req.session.user._id;
					info.save(function (err) {
						if (!err) console.log('Success!');
						else console.log(err);
					});
				}
				
				
			});
			
			formMessage.push("L'info a été postée !");
			
		}else{
			formMessage.push("Erreur dans l'image uploadée: L'info n'est pas postée.");
		}	
		
	}else{
		if(!req.session.user)
			formMessage.push("Veuillez vous identifier pour poster une info");
		if(!req.body.title)
			formMessage.push("Erreur: définissez le titre de l'info");
		if(!req.body.placeInput)
			formMessage.push("Erreur: définissez une géolocalisation de l'info");
	}
	
	req.session.message = formMessage;
	
	res.redirect('news/post');
};


/******SETTINGS********/
exports.settings_profile = function(req, res){
	var User = db.model('User');
	
	if(req.session.user){
	
		User.findById(req.session.user._id,function (err, docs){
			var user = JSON.stringify(docs);
			res.render('settings/profile',{user:user});
		});	
	}else{
		req.session.message = "Erreur : vous devez être connecté pour voir votre profil";
		res.redirect('/user/login?redir=settings/profile');
	}
};


exports.settings_alerts = function(req, res){
	var User = db.model('User');
	
	if(req.session.user){
		User.findByIds(req.session.user.usersubsc,function (err, docs){
			var users = JSON.stringify(docs);
			res.render('settings/alerts',{users:users});
		});	
		
	}else
		res.redirect('/user/login?redir=settings/alerts');
	
	
	
};
exports.alerts = function(req, res){

	var formMessage = new Array();
	delete req.session.message;
	var User = db.model('User');
	var user = new User();
	var usersubscArray = [];
	// user subscribtions
	if(req.body.usersubscInput.length > 0){
		var usersubsc = eval('('+req.body.usersubscInput+')');
		for(i=0;i<usersubsc.length;i++){
			usersubscArray.push(mongoose.Types.ObjectId(usersubsc[i]._id));
		}
		req.session.user.usersubsc = usersubscArray;
	}
				
	if(req.session.user){
		User.update({_id: req.session.user._id}, {usersubsc : usersubscArray}, {upsert: true}, function(err){
			if (!err){
				console.log('Success!');
				formMessage = "Vos alertes sont enregistrées";
			}
			else console.log(err);
		});
		
	}else
		formMessage = "Erreur : vous n'êtes pas connecté !";
	
	req.session.message = formMessage;
	
	res.redirect('settings/alerts');
}

exports.profile = function(req, res){
		
	var formMessage = new Array();
	delete req.session.message;
	var User = db.model('User');
	var user = new User();
				
	if(req.session.user){
		console.log(req.body);
		var avatar = req.body.avatar;
		var drawTool = require('../mylib/drawlib.js');
		var size = [{"width":128,"height":128},{"width":48,"height":48}];
		var infoThumb = drawTool.StoreImg(req.files.avatar,size,conf);
		formMessage.push(infoThumb.msg);
		
		
		User.update({_id: req.session.user._id}, 
		{
			name : req.body.username,
			web:req.body.web,
			thumb:infoThumb.name,
			bio:req.body.bio,
			tag:req.body.tag.split(',')
			
		}, {upsert: true}, function(err){
			if (!err){
				console.log('Success!');
				formMessage.push("Votre profil est enregistré");
			}
			else console.log(err);
		});
		
	}else
		formMessage = "Erreur : vous n'êtes pas connecté !";
	
	req.session.message = formMessage;
	
	res.redirect('settings/profile');
}

