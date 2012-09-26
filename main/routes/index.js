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
	var flagError = 0;
	var srcPath = '';
	var srcName = '';
	var im = require('imagemagick');

	//console.log(req.files);
	// we need a title, a location and a user
	if(req.body.placeInput && req.body.title && req.session.user){
	
		var infoThumb = '';
			
		/**UPLOAD IMAGE*/
		if(req.files.picture.size){
			
			
		
			var srcPathTmp = req.files.picture.path;
			var srcNameTmp = req.files.picture.name;
			srcPath = srcPathTmp.replace('.gif', '.jpeg');
			srcPath = srcPathTmp.replace('.png', '.jpeg');
			srcPath = srcPathTmp.replace('.jpg', '.jpeg');
			srcName = srcNameTmp.replace('.gif', '.jpeg');
			srcName = srcNameTmp.replace('.png', '.jpeg');
			srcName = srcNameTmp.replace('.jpg', '.jpeg');
			
			console.log(srcPathTmp,srcPath);
			
			// convert to jpeg
			im.convert([srcPathTmp,srcPath],function(err,stdout){
				if(!err){
					// create thumbnail
					im.resize({
						srcPath: srcPath,
						dstPath: conf.uploadsDir+'pictures/120_90/'+srcName,
						strip : false,
						width : 120,
						height : "90^",
						customArgs: [
							 "-gravity", "center"
							,"-extent", "120x90"
							]
						
					}, function(err, stdout, stderr){
						if (err) {
							console.log('error creating thumbnail');
							flagError = 1;
							formMessage.push("L'image n'est pas reconnue, essayer avec une autre image !");
						}else
							console.log('thumbnail created successfully');
					});
					
					// create the image, up to 512 px width
					im.identify(['-format', '%w', srcPath], function(err, output){
					  if (!err){
						  if(output > 512){
							im.resize({
								srcPath: srcPath,
								dstPath: conf.uploadsDir+'pictures/512_0/'+srcName,
								strip : false,
								width : 512,
							}, function(err, stdout, stderr){
								if (err){
									console.log('im.resize du < 512px failed');
									flagError = 1;
									formMessage.push("L'image n'est pas reconnue, essayer avec une autre image !");
									throw err;
								}else
									console.log('resize > 512 ok');
									
							});
						  }else{
							//fs = require('fs');
							//srcFile = fs.createWriteStream(srcPath);     
							//dstFile = fs.createReadStream(conf.uploadsDir+'/pictures/512_0/'+req.files.picture.name);
							//fs.renameSync(srcPath,conf.uploadsDir+'/pictures/512_0/'+req.files.picture.name);
							
							im.resize({
								srcPath: srcPath,
								dstPath: conf.uploadsDir+'pictures/512_0/'+srcName,
								strip : false,
								height : '100%',
								width : '100%',
							}, function(err, stdout, stderr){
								if (err){
									console.log('im.resize to same size failed');
									flagError = 1;
									formMessage.push("L'image n'est pas reconnue, essayer avec une autre image !");
								}else
									console.log('resize < 512 ok');
									
							});
						  }
					  }else{
						console.log('im.identity failed'+srcPath);
						flagError = 1;
						formMessage.push("L'image n'est pas reconnue, essayer avec une autre image !");
						throw err;
					  }
						 
					})
				}else{
					console.log('convert to jpeg failed');
					flagError = 1;
					formMessage.push("L'image n'est pas reconnue, essayer avec une autre image !");
					throw err;
				}
					
			});
		
			if(flagError==0)
				var infoThumb = srcName;
		}	
		

		if(flagError == 0 ){
			
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
				info.thumb = infoThumb;
				info.licence = 'Yakwala';
				info.heat = 80;
				
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
	res.render('settings/profile');
};
exports.settings_profile = function(req, res){
	res.render('settings/profile');
};
exports.settings_alerts = function(req, res){
	var User = db.model('User');
	
	if(req.session.user){
		var users = User.findByIds(req.session.user.usersubsc,function (err, docs){
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