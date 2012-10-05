﻿/*
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
	if(typeof(req.session.type) == 'undefined' || req.session.type === null ){
		var type = new Array();
		type.push(1);
		req.session.type = type;
		
	}	
	
	res.render('news/map',{type:req.session.type});  
};
exports.news_map_test = function(req, res){
	res.render('news/map_test');  
};
exports.news_post = function(req, res){
	delete req.session.message;
	if(req.session.user){
		res.render('news/post');
	}else{
		res.redirect('/user/login?redir=news/post');
	}
  
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
	var theYakType = 4; // UGC
	var place = new Place();
	//mongoose.set('debug', true);

	//console.log(req.files);
	// we need a title, a location and a user
	if(req.body.placeInput && req.body.title && req.session.user){
	
		if(req.body.yakType > 0 )
			theYakType = req.body.yakType; 
		
			
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
				info.address = item.title;
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
				info.yakType = theYakType;
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
	for(i=0;i<req.session.type.length;i++)
		if(theYakType==req.session.type[i]) 
			req.session.type.splice(i, 1);
	req.session.type.push(theYakType);
	res.redirect('news/map');
};


/******SETTINGS********/
exports.settings_profile = function(req, res){
	delete req.session.message;
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
	delete req.session.message;
	var User = db.model('User');
	if(req.session.user){
		User.findByIds(req.session.user.usersubs,function (err, docs){
			var users = JSON.stringify(docs);
			
			var tags = JSON.stringify(req.session.user.tagsubs);
			res.render('settings/alerts',{users:users,tags:tags});
		});	
		
	}else{
		req.session.message = "Erreur : vous devez être connecté pour gérer vos alertes";
		res.redirect('/user/login?redir=settings/alerts');
	}
	
	
};
exports.alerts = function(req, res){

	var formMessage = new Array();
	//delete req.session.message;
	var User = db.model('User');
	var user = new User();
	var usersubsArray = [];
	var tagsubsArray = [];
	// user subscribtions
	if(req.body.usersubsInput.length > 0){
		var usersubs = eval('('+req.body.usersubsInput+')');
		for(i=0;i<usersubs.length;i++){
			usersubsArray.push(mongoose.Types.ObjectId(usersubs[i]._id));
		}
		req.session.user.usersubs = usersubsArray;
	}
	
	// tag subscribtions
	if(req.body.tagsubsInput.length > 0){
		var tagsubs = eval('('+req.body.tagsubsInput+')');
		for(i=0;i<tagsubs.length;i++){
			tagsubsArray.push(tagsubs[i]);
		}

		req.session.user.tagsubs = tagsubsArray;
	}
				
	if(req.session.user){
		console.log('Vos alertes sont enregistrées ');
		formMessage.push("Vos alertes sont enregistrées");
		
				
		User.update({_id: req.session.user._id}, {usersubs : usersubsArray, tagsubs : tagsubsArray}, {upsert: true}, function(err){
			if (err) console.log(err);
		});
	}else
		formMessage.push("Erreur : vous n'êtes pas connecté !");
	
	req.session.message = formMessage;
	res.redirect('settings/alerts');
}

exports.profile = function(req, res){
		
	var formMessage = new Array();
	delete req.session.message;
	var User = db.model('User');
	var user = new User();
				
	if(req.session.user){
		var avatar = req.body.avatar;
		var drawTool = require('../mylib/drawlib.js');
		var size = [{"width":128,"height":128},{"width":48,"height":48}];
		var infoThumb = drawTool.StoreImg(req.files.avatar,size,conf);
		
		if(infoThumb.msg)
			formMessage.push(infoThumb.msg);
		
		var location = JSON.parse(req.body.location);
		if(infoThumb.name){
			var cond = {
				name : req.body.username,
				web:req.body.web,
				thumb:infoThumb.name,
				bio:req.body.bio,
				tag:req.body.tag.split(','),
				location :{lng:parseFloat(location.lng),lat:parseFloat(location.lat)},
				address :req.body.address,				
				};
		}else
			var cond = {
				name : req.body.username,
				web:req.body.web,
				bio:req.body.bio,
				tag:req.body.tag.split(',')	,
				location :{lng:parseFloat(location.lng),lat:parseFloat(location.lat)},
				address :req.body.address,				
				};
		
		req.session.user.location = location;
		
		User.update({_id: req.session.user._id}, 
		cond
		, {upsert: true}, function(err){
			if (!err){
				console.log('Success!');
			}
			else console.log(err);
		});
		formMessage.push("Votre profil est enregistré");
	}else
		formMessage.push("Erreur : vous n'êtes pas connecté !");
	
	req.session.message = formMessage;
	
	res.redirect('settings/profile');
}

