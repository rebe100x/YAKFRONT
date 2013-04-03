/*
 * GET home page.
 */



exports.db = function(conf){
	mongoose = require('mongoose'), Schema = mongoose.Schema;
	//mongoose.set('debug', true);
	db = mongoose.connect('mongodb://localhost/'+conf.dbname);
	
};
	
exports.front_default = function(req, res){
  res.redirect('news/map');
};
exports.api_default = function(req, res){
  res.redirect('docs/api');
};

exports.picture = function(req,res){
	var fs = require('fs');
	var thepath = __dirname+'/../public/uploads/pictures/'+req.params.size+'/'+req.params.picture;
	var defaultpath = __dirname+'/../public/images/default/'+req.params.size+'/no-user.png';
	var path = require('path');
	if (path.existsSync(thepath)) {
		var img = fs.readFileSync(thepath);
		res.writeHead(200, {'Content-Type': 'image/jpeg' });
		res.end(img, 'binary');
	}else if(path.existsSync(defaultpath)){
		var img = fs.readFileSync(defaultpath);
		res.writeHead(200, {'Content-Type': 'image/jpeg' });
		res.end(img, 'binary');
	}else
		res.json({error:'file does not exist'});
}

exports.static_image = function(req,res){
	var fs = require('fs');
	var thepath = __dirname+'/../public/images/'+req.params.name;
	var defaultpath = __dirname+'/../public/images/noImageAvailable.png';
	var path = require('path');
	if (path.existsSync(thepath)) {	
		var img = fs.readFileSync(__dirname+'/../public/images/'+req.params.name);
		res.writeHead(200, {'Content-Type': 'image/jpeg' });
		res.end(img, 'binary');
	}else if(path.existsSync(defaultpath)){
		var img = fs.readFileSync(defaultpath);
		res.writeHead(200, {'Content-Type': 'image/jpeg' });
		res.end(img, 'binary');
	}else
		res.json({error:'file does not exist'});
}

exports.requiresLogin = function(req,res,next){
	
	if(req.session.user){
		var User = db.model('User');
		User.findById(req.session.user,function (err, theuser){
			if(theuser != undefined && theuser != null ){
				res.locals.user = User.format(theuser);
				//console.log(res.locals.user);
				//console.log(theuser);
				console.log('LOGGED IN');
				next();
			}else{
				console.log('NOT LOGGED IN');
				req.session.message = 'Please login to access this section:';
				res.redirect('/user/login?redir='+req.url);
			}
		});
	}else{
		console.log('NOT LOGGED IN');
		req.session.message = 'Please login to access this section:';
		res.redirect('/user/login?redir='+req.url);
	}	
};




/**NEWS */
exports.news_map = function(req, res){
	delete req.session.message;
	res.render('news/map',{str:null});  
};
exports.news_map_search = function(req, res){	
	res.render('news/map',{str:req.params.str});  
};

/*
exports.news_map_test = function(req, res){
	res.render('news/map_test');  
};
*/
exports.news_post = function(req, res){
	delete req.session.message;
	if(req.session.user){
		res.render('news/post');
	}else{
		res.redirect('/user/login?redir=news/post');
	}
  
};
exports.news_feed = function(req, res){
	delete req.session.message;
	res.render('news/feed',{str:null});  	
	 
};
exports.news_feed_search = function(req, res){
	res.render('news/feed',{str:req.params.str});  
};

exports.news_afeed = function(req, res){
	var Info = db.model('Info');
	Info.findAllByID(function (err, docs){
		res.render('news/afeed',{infos:docs});
	}); 
};

exports.loadingModal = function(req, res){
		res.render('news/loadingModal');
};

exports.news = function(req, res){

	var formMessage = new Array();
	delete req.session.message;
	var Info = db.model('Info');
	var Place = db.model('Place');
	var Tag = db.model('Tag');
	var Yakcat = db.model('Yakcat');
	var theYakType = 4; // UGC
	var place = new Place();
	var tag = new Tag();
	
	//mongoose.set('debug', true);

	//console.log(req.files);
	// we need a title, a location and a user
	if(req.body.placeInput && req.body.title && req.session.user){
		var userType = res.locals.user.type;
		if(userType == 1){
			theYakType = 4;
		}else{
			if(req.body.yakType > 0 && req.body.yakType < 5 )
				theYakType = req.body.yakType; 
			else
				theYakType = 4;			
		}

		var thumbFlag = 2;
		var msg = '';
		var infoThumb = new Object();
		if(req.files.picture.size && req.files.picture.size > 0 && req.files.picture.size < 1048576*5){
			var drawTool = require('../mylib/drawlib.js');
			var size = mainConf.imgSizeInfo;
			
			for(i=0;i<size.length;i++){
				infoThumb = drawTool.StoreImg(req.files.picture,{w:size[i].width,h:size[i].height},conf);
			}
			
			formMessage.push(msg);
		
		}
		else
			infoThumb.err = 0;

		if(infoThumb.err == 0 ){
			
			var locTmp = JSON.parse(req.body.placeInput);
			
			locTmp.forEach(function(item) {
				var info = new Info();
				var yakCat = new Array();
				var yakCatName = new Array();
				// we introduce a redondancy between types and yakcat to be able to forget the type in the future
				if(theYakType == 4){ // if type =4 ( discussion : by default push it in YAKCAT discussion )
					yakCat.push(mongoose.Types.ObjectId("5092390bfa9a95f40c000000")); 
					yakCatName.push('Discussion');
				}
				if(theYakType == 2){ // if type =2 ( agenda : by default push it in YAKCAT agenda )
					yakCat.push(mongoose.Types.ObjectId("50923b9afa9a95d409000000")); 
					yakCatName.push('Agenda');
				}
				if(theYakType == 3){ // if type =3 ( infos pratiques : by default push it in YAKCAT infos pratiques )
					yakCat.push(mongoose.Types.ObjectId("50923b9afa9a95d409000001")); 
					yakCatName.push('InfosPratiques');
				}
				

				if(!(req.body.yakcatInput == "" || typeof req.body.yakcatInput === "undefined")){					
					var yaccatstemp = JSON.parse(req.body.yakcatInput);
					yaccatstemp.forEach(function(item) {
						yakCat.push(mongoose.Types.ObjectId(item._id)); 
						yakCatName.push(item.title);
					})
				}	
				
				
				info.yakCatName = yakCatName;
				info.yakCat = yakCat;
				info.title = req.body.title;
				info.content = req.body.content;
				
				// NOTE : in the query below, order is important : in DB we have lat, lng but need to insert in reverse order : lng,lat  (=> bug mongoose ???)
				info.location = {lng:parseFloat(item.location.lng),lat:parseFloat(item.location.lat)};
				//info.location = {lat:parseFloat(item.location.lat),lng:parseFloat(item.location.lng)};
				info.address = item.title;
				// if no id, it means the location comes from gmap => we store it
				
				

				
				if(item._id == "" || typeof item._id === "undefined"){
					item.status=2;
					place = new Place(item);
					place.heat = 80;
					place.user = mongoose.Types.ObjectId(req.session.user);
					place.save();
					//info.placeId = mongoose.Types.ObjectId(place._id);
					info.placeId = place._id;
				}else{
					info.placeId = item._id;
					//info.placeId = mongoose.Types.ObjectId(item._id);
				}
					
				
				var now = new Date();
				info.creationDate = now;
				info.lastModifDate = now;
				info.pubDate = now;
				
				// event date for agenda
				if(Math.floor(theYakType) == 2){
					info.eventDate = {dateTimeFrom : new Date(req.body.eventDateFrom), dateTimeEnd : new Date(req.body.eventDateEnd)};
					var dateEnd = new Date(req.body.eventDateEnd);
					var D = new Date(dateEnd.getFullYear(), dateEnd.getMonth(), dateEnd.getDate());
					var DTS = D.getTime() / 1000 + (1 * 60 * 60 * 24);
					D.setTime(DTS*1000); 
					info.dateEndPrint = D;

				}else{
					var D = new Date(now.getFullYear(), now.getMonth(), now.getDate());
					var DTS = D.getTime() / 1000 + (1 * 60 * 60 * 24);
					D.setTime(DTS*1000); 
					info.dateEndPrint = D;
				}

				
				
				info.print = 1;
				info.status = 1;
				info.yakType = Math.floor(theYakType);
				info.thumb = infoThumb.name;
				info.thumbFlag = thumbFlag;
				info.licence = 'Yakwala';
				info.heat = 80;
				var freeTags = req.body.freetag.split(',');
				info.freeTag = freeTags;
				
				var startOfDay = new Date();
				startOfDay.setHours(0,0,0,0);
				var endOfDay = new Date();
				endOfDay.setHours(23,59,59,999);

				var range = parseFloat(0.035);
				if(typeof req.body.postFormRange != 'undefined' && req.body.postFormRange != 0)
					range = parseFloat(req.body.postFormRange);
				if(req.body.freetag.length > 0){
					freeTags.forEach(function(freeTag){
						Tag.findOne({'title':freeTag,"location" : {  "$near" : [parseFloat(info.location.lat),parseFloat(info.location.lng)], $maxDistance : range },usageDate:{$gte:startOfDay,$lte:endOfDay}},function(err,thetag){
							if(thetag == null){
								tag.title=freeTag;
								tag.numUsed = 1;
								tag.location = info.location;
								tag.print = 1;
								tag.save();
							}
							else{
								Tag.update({_id: thetag._id}, {usageDate:now,$inc:{numUsed:1}}, {upsert: false}, function(err){if (err) console.log(err);});						
							}
						});
					});
				}
				
				// security against unidentified users	
				if(req.session.user){
					//console.log(req.session.user);
					info.user = mongoose.Types.ObjectId(req.session.user);
					info.origin = "@"+req.body.username;
					
					info.save(function (err) {
						if (!err) 
							{
								console.log('Success!');
								var trackParams = {"infoid": info._id};
								trackUser(req.session.user, 10,  trackParams);
							}
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
	
	res.redirect('news/map');
};
/******* USER ******/


exports.user_login = function(req, res){
	delete req.session.message;
	res.render('user/login',{redir:req.query.redir});
};


	

exports.user_validate = function(req, res){
	var User = db.model('User');	
	
	User.authenticateByToken(req.params.token,req.params.password, function(err, model) {
	if(!(typeof(model) == 'undefined' || model === null || model === '')){
			req.session.user = model._id;
			trackUser(req.session.user._id, 2,{});
			User.update({_id: model._id}, {status:4}, {upsert: false}, function(err){if (err) console.log(err);});						
			res.render('settings/firstvisit',{user:model});
			res.redirect('/user/validate');

		}else{
			req.session.message = "Votre clé d'activation est incorrecte.";
			res.redirect('/user/validate');
			
		}
	
	});
	
};

exports.user_resetpassword = function(req, res){
	var User = db.model('User');	
	
	User.authenticateByToken(req.params.token,req.params.password, function(err, model) {
	if(!(typeof(model) == 'undefined' || model === null || model === '')){
			req.session.user = model._id;
			res.render('settings/resetpassword',{user:model});
		}else{
			req.session.message = "Votre clé d'activation est incorrecte.";
			res.redirect('/user/forgotpassword');
		}
	
	});
	
};

exports.user_logout = function(req, res){
	
	trackUser(req.session.user, 4, {});
	delete req.session.user;
	res.redirect('/news/map');
	
};



exports.session = function(req, res){

	var User = db.model('User');
	if (req.body.rememberme == "true") {
		 res.cookie('loginid', req.body.login, { expires: new Date(Date.now() + 90000000000) , httpOnly: false, path: '/'});
	}
	else
	{
		res.cookie('loginid', '', { expires: new Date(Date.now() + 90000000000) , httpOnly: false, path: '/'});
	}
	User.authenticate(req.body.login,req.body.password, req.body.token, function(err, user) {
		if(!(typeof(user) == 'undefined' || user === null || user === '')){
			if(user.status == 1 || user.status == 4){
				if (req.body.rememberme == "true") {res.cookie('token', user.token, { expires: new Date(Date.now() + 90000000000) , httpOnly: false, path: '/'});}
				else {res.cookie('token', null);}
				
				req.session.user = user._id;
				User.update({"_id":user._id},{$set:{"lastLoginDate":new Date()}}, function(err){if (err) console.log(err);});
				res.redirect(req.body.redir || '/news/map');

				//track user
				var trackParams = {"loginFrom": 0};
				trackUser(user._id, 3, trackParams);

			}else if(user.status == 2){
				req.session.message = 'Compte non validé.';
				res.redirect('user/login?redir='+req.body.redir);
			}
		}else{
			req.session.message = 'Identifiants incorrects.';	
			res.redirect('user/login?redir='+req.body.redir);
		}
	});
	
};

exports.user = function(req, res){

	var crypto = require('crypto')
	var themail = req.body.mail;
	var User = db.model('User');
	var Point = db.model('Point');
	var user = new User();
	
	/*check if the mail is valid*/
	
	
	/*check if user exists*/
	User.findOne({'mail': themail},{_ids:1,status:1,mail:1}, function(err,theuser){
		if(theuser){
			//console.log(theuser);
			if(theuser.status == 1){
				//console.log('STATUS1');
				req.session.message = 'Cet utilisateur est déjà enregistré.';
				res.redirect('user/new');
			
			}
			if(theuser.status == 2){
				//console.log('STATUS2');
				
				var salt = Math.round(new Date().valueOf() * Math.random());
				var token = crypto.createHash('sha1').update("yakwala@secure"+salt).digest("hex");
				var password = user.generatePassword(5);
				var link = conf.validationUrl+token+"/"+password;
				var hash = crypto.createHash('sha1').update(password+"yakwala@secure"+salt).digest("hex");
				var logo = conf.fronturl+"/static/images/yakwala-logo_petit.png";
				var templateMail = "link";
				User.update({_id: theuser._id}, {hash : hash,token:token,salt:salt,password:password}, {upsert: false}, function(err){
					
				
					User.sendValidationMail(link,themail,templateMail,logo,function(err){
						if(!err)
							console.log(err);				
					});
				
					
				});
				req.session.message = "Cet utilisateur est en attente de validation. Un nouveau mail vient de lui être renvoyé avec une nouvelle clé d'activation. Veuillez vérifier qu'il n'est pas dans les spams.";
				res.redirect('user/new');
			}
			
		}else{
				//console.log('NEW');
				/*create user*/
				var tmp = req.body.mail.split('@');
				var login = tmp[0];
				var salt = Math.round(new Date().valueOf() * Math.random());
				var token = crypto.createHash('sha1').update("yakwala@secure"+salt).digest("hex");
				var password = user.generatePassword(5);
				var logo = conf.fronturl+"/static/images/yakwala-logo_petit.png";
				var templateMail = "link";
				
				
				user.mail=themail;
				user.token=token;
				user.status=2;
				user.hash= password;
				user.password= password;
				user.salt="1";
				user.type=1;
				//user.favplace = [{'name':'Paris, France','location':{'lat':48.851875,'lng':2.356374}},{'name':'Eghézée, Belgique','location':{'lat':50.583346,'lng':4.900031}},{'name':'Montpellier, France','location':{'lat':43.610787,'lng':3.876715}}];
				user.favplace = [{'name':'Nice, France','location':{'lat':43.681343,'lng':7.232094},'range':100},{'name':'Marseille, France','location':{'lat':43.298198,'lng':5.370255},'range':100},{'name':'Paris, France','location':{'lat':48.851875,'lng':2.356374},'range':100}];
				var link = conf.validationUrl+token+"/"+password;
				
				user.name=login;
				user.login=login;

				User.findByLoginDuplicate(login, function(err, theuser){
					if(theuser != undefined && theuser != null )
					{
						user.name= login + "_yakwala";
						user.login= login + "_yakwala";
					}
						user.save(function (err) {
							if (!err){
								User.sendValidationMail(link,themail,templateMail,logo,function(err){
								if(!err)
									console.log(err);
							});
						} 
						else console.log(err);
					});
				});

				
				
				req.session.message = 'Un email vous a été envoyé contenant un lien et une clé de validation de votre compte.';
				res.redirect('user/new');
		}
	});
	
	
};

exports.forgotpassword = function(req, res){

	var crypto = require('crypto')
	var themail = req.body.mail;
	var User = db.model('User');
	var Point = db.model('Point');
	var user = new User();
	
	/*check if the mail is valid*/
	
	
	/*check if user exists*/
	User.findOne({'mail': themail},{_ids:1,status:1,mail:1}, function(err,theuser){
		if(theuser){
			//console.log(theuser);
				var salt = Math.round(new Date().valueOf() * Math.random());
				var token = crypto.createHash('sha1').update("yakwala@secure"+salt).digest("hex");
				var password = user.generatePassword(5);
				var link = conf.resetpassUrl+token+"/"+password;
				var hash = crypto.createHash('sha1').update(password+"yakwala@secure"+salt).digest("hex");
				var logo = conf.fronturl+"/static/images/yakwala-logo_petit.png";
				var templateMail = "forgetpass";
				User.update({_id: theuser._id}, {hash : hash,token:token,salt:salt,password:password}, {upsert: false}, function(err){
					
				
					User.sendValidationMail(link,themail,templateMail,logo,function(err){
						if(!err)
							console.log(err);				
					});
				
					
				});
				req.session.message = "Un nouveau mail a été renvoyé avec une nouvelle clé d'activation. Veuillez vérifier qu'il n'est pas dans les spams.";
				res.redirect('user/forgotpassword');
			}else{
				req.session.message = "Ce mail ne correspond à aucun compte Yakwala !";
				res.redirect('user/forgotpassword');
			}
	});
	
	
};

exports.user_new = function(req, res){
	delete req.session.message;
	res.render('user/new');
	
};


exports.user_forgotpassword = function(req, res){
	delete req.session.message;
	res.render('user/forgotpassword');
	
};







/******SETTINGS********/





exports.settings_password = function(req,res){
	delete req.session.message;
	res.render('settings/password');

}

exports.settings_resetpassword = function(req,res){
	delete req.session.message;
	res.render('settings/resetpassword');

}	

exports.settings_firstvisit = function(req,res){
	delete req.session.message;
	res.render('settings/firstvisit');

}	

exports.settings_profile = function(req, res){
	delete req.session.message;
	//var User = db.model('User');
	
	if(req.session.user){
		res.render('settings/profile');
	}else{
		req.session.message = "Erreur : vous devez être connecté pour voir votre profil";
		res.redirect('/user/login?redir=settings/profile');
	}
};

exports.settings_privateprofile = function(req, res){
	delete req.session.message;
	if(req.session.user){
		res.render('settings/privateprofile');
	}else{
		req.session.message = "Erreur : vous devez être connecté pour voir votre profil";
		res.redirect('/user/login?redir=settings/privateprofile');
	}
};

exports.settings_alerts = function(req, res){
	delete req.session.message;
	var User = db.model('User');
	
	if(req.session.user){
		
		var usersubs = res.locals.user.usersubs;
		usersubs.token="xxx";
		usersubs.hash="xxx";
		usersubs.salt="xxx";
		usersubs.token="xxx";
		usersubs.apiData=[];
		res.render('settings/alerts',{usersubs:usersubs,tagsubs:res.locals.user.tagsubs, feedsubs: res.locals.user.feedsubs});
		
	}else{
		req.session.message = "Erreur : vous devez être connecté pour gérer vos alertes";
		res.redirect('/user/login?redir=settings/alerts');
	}
	
	
};



exports.firstvisit = function(req,res){
	
	formMessage = "";
	var User = db.model('User');
	if(req.session.user){	
		console.log("Entered Here" + req.session.user);
		User.findById(req.session.user,function (err, docs){
			var crypto = require('crypto');
			var newcryptedPass = crypto.createHash('sha1').update(req.body.password+"yakwala@secure"+docs.salt).digest("hex");	
			var login = req.body.username;

			if(req.body.password.length >= 8){
				if(req.body.location){
					var location = JSON.parse(req.body.location);
					var address = JSON.parse(req.body.address);
					var formatted_address = JSON.parse(req.body.formatted_address);
					
				}
				else{
					var formatted_address = "Paris, France";
					var location = {'lat':48.856614,'lng':2.3522219000000177}; // PARIS BY DEFAULT*
					var address = {
						'street_number' : '', 
						'street' : '',
						'arr' : '',
						'city' : 'Paris',
						'state' : 'Paris',
						'area' : 'Île-de-France',
						'country' : 'France',
						'zip' : '75000'
					};
				}
				
				
				User.update({_id: req.session.user}, {hash : newcryptedPass,location:location, address: address, formatted_address: formatted_address, login: req.body.username, name: req.body.username, mail: req.body.email, status: 1}, {upsert: false}, function(err){
				
					if (err) console.log(err);
					else{
						formMessage = "Votre nouveau mot de passe est enregistré";
						//delete req.session.user;
						User.authenticate(login,req.body.password, "", function(err, user) {
							if(!(typeof(user) == 'undefined' || user === null || user === '') && user.status == 1){
									req.session.user = user._id;
									res.locals.user = user;
									req.session.message = formMessage;
									res.redirect('news/map');
								}else{
									if(user.status == 2)
										req.session.message = 'Compte non validé.';
									else
										req.session.message = 'Identifiants incorrects.';
									res.redirect('user/login?redir='+req.body.redir);
								}
						});
					}
				});
			}
			else
				formMessage = "Votre mot de passe doit au moins 8 caractères";
				
			
		});
		
		
	}else{
		formMessage= "Erreur : vous n'êtes pas connecté !";
		req.session.message = formMessage;
		res.redirect('/user/login?redir=settings/firstvisit');
	}
	
	

}	



exports.resetpassword = function(req,res){
	
	formMessage = "";
	var User = db.model('User');
	if(req.session.user){	
		User.findById(req.session.user,function (err, docs){
			var crypto = require('crypto');
			var newcryptedPass = crypto.createHash('sha1').update(req.body.password+"yakwala@secure"+docs.salt).digest("hex");	
			var login = docs.login;
			if(req.body.password.length >= 8){
				
				User.update({_id: req.session.user}, {hash : newcryptedPass}, {upsert: false}, function(err){
				
					if (err) console.log(err);
					else{
						formMessage = "Votre nouveau mot de passe est enregistré";
						//delete req.session.user;
						User.authenticate(login,req.body.password, "", function(err, user) {
							if(!(typeof(user) == 'undefined' || user === null || user === '') && user.status == 1){
									req.session.user = user._id;
									res.locals.user = user;
									req.session.message = formMessage;
									res.redirect('news/map');
								}else{
									if(user.status == 2)
										req.session.message = 'Compte non validé.';
									else
										req.session.message = 'Identifiants incorrects.';
									res.redirect('user/login?redir='+req.body.redir);
								}
						});
					}
				});
			}
			else
				formMessage = "Votre mot de passe doit au moins 8 caractères";
				
			
		});
		
		
	}else{
		formMessage= "Erreur : vous n'êtes pas connecté !";
		req.session.message = formMessage;
		res.redirect('/user/login?redir=settings/firstvisit');
	}
	
	

}	


exports.password = function(req,res){
	formMessage = "";
	var User = db.model('User');
	if(req.session.user){	
		User.findById(req.session.user,function (err, docs){
			var crypto = require('crypto');
			var cryptedPass = crypto.createHash('sha1').update(req.body.oldpass+"yakwala@secure"+docs.salt).digest("hex");
			var newcryptedPass = crypto.createHash('sha1').update(req.body.newpass1+"yakwala@secure"+docs.salt).digest("hex");	
			var login = docs.login;
			if( cryptedPass == docs.hash){
					if(req.body.newpass1 != '' && req.body.newpass1 == req.body.newpass2 ){
						if(req.body.newpass1.length >= 8){
							User.update({_id: req.session.user}, {hash : newcryptedPass}, {upsert: false}, function(err){
								if (err) console.log(err);
								else{
									var trackParams = {};
									trackUser(req.session.user, 13, trackParams);
									formMessage = "Votre nouveau mot de passe est enregistré";
									//delete req.session.user;
									User.authenticate(login,req.body.newpass1,  "",function(err, user) {
										if(!(typeof(user) == 'undefined' || user === null || user === '') && user.status == 1 ){
												req.session.user = user._id;
												res.locals.user = user;
												req.session.message = formMessage;
												res.redirect('settings/password');
										}else{			
											if(user.status == 2)
												req.session.message = 'Compte non validé.';
											else
												req.session.message = 'Identifiants incorrects.';

											res.redirect('user/login?redir=settings/password');
										}
									});
								}
							});
						}
						else{
							formMessage = "Votre mot de passe doit au moins 8 caractères";
							req.session.message = formMessage;
							res.redirect('settings/password');
						}
				}else{
					formMessage = "Attention, vos 2 nouveaux mots de passe ne sont pas identiques.";
					req.session.message = formMessage;
					res.redirect('settings/password');
				}
			}else{
				formMessage = "Votre ancien mot de passe est incorrect";
				req.session.message = formMessage;
				res.redirect('settings/password');
			}	
		});
	}else{
		formMessage= "Erreur : vous n'êtes pas connecté !";
		req.session.message = formMessage;
		res.redirect('/user/login?redir=settings/password');
	}
	
	
}
exports.alerts = function(req, res){

	var formMessage = new Array();
	//delete req.session.message;
	var User = db.model('User');
	var user = new User();
	var usersubsArray = Array();
	var tagsubsArray = [];
	var feedsubsArray = [];
	// user subscribtions
	
	
	//console.log(req.body.usersubsInput.length);
	if(req.body.usersubsInput.length > 0){
		var usersubs = JSON.parse(req.body.usersubsInput);
		for(i=0;i<usersubs.length;i++){
			usersubsArray.push(usersubs[i]);
		
		}
	}
	// tag subscribtions
	if(req.body.tagsubsInput.length > 0){
		var tagsubs = eval('('+req.body.tagsubsInput+')');
		for(i=0;i<tagsubs.length;i++){
			tagsubsArray.push(tagsubs[i]);
		}

		
	}

	if(req.body.feedsubsInput.length > 0){
		var feedsubs = eval('('+req.body.feedsubsInput+')');
		for(i=0;i<feedsubs.length;i++){
			feedsubsArray.push(feedsubs[i]);
		}

		
	}
				
	if(req.session.user){
		User.update({_id: req.session.user}, {$set:{usersubs : usersubsArray}, tagsubs : tagsubsArray, feedsubs: feedsubsArray}, {upsert: true}, function(err){
			if (err) console.log(err);
			else{
				//console.log('Vos alertes sont enregistrées ');
				formMessage.push("Vos alertes sont enregistrées");
				trackUser(req.session.user, 12,  {users:usersubsArray,tags:tagsubsArray,feeds:feedsubsArray});
				res.json("1");
			}
				
		});
	}else
		formMessage.push("Erreur : vous n'êtes pas connecté !");
	
	req.session.message = formMessage;
	//res.redirect('settings/alerts');
}

exports.profile = function(req, res){
		
	var formMessage = new Array();
	delete req.session.message;
	var User = db.model('User');
	var user = new User();
				
	if(req.session.user){
		var avatar = req.body.avatar;
		var drawTool = require('../mylib/drawlib.js');
		var size = mainConf.imgSizeAvatar;

		for(i=0;i<size.length;i++){
				infoThumb = drawTool.StoreImg(req.files.avatar,{w:size[i].width,h:size[i].height},conf);
			}
		
		if(infoThumb.msg)
			formMessage.push(infoThumb.msg);
		
		
		
			var cond = {
				name : req.body.username,
				web:req.body.web,
//				thumb:infoThumb.name,
				bio:req.body.bio,
//				location :{lng:parseFloat(location.lng),lat:parseFloat(location.lat)},
//				address :JSON.parse(req.body.address),								
				};
		
		if(infoThumb.name){
			cond.thumb = infoThumb.name;
		}
		if(req.body.location){
			var location = JSON.parse(req.body.location);
			cond.location = location;
		}
		if(req.body.address){
			cond.address = JSON.parse(req.body.address);
		}
		if(req.body.formatted_address){
			cond.formatted_address = req.body.formatted_address;
		}

		if(req.body.defaultCityZoom){
			cond.addressZoom = req.body.defaultCityZoom;
		}

		if(req.body.defaultCityZoomText){
			cond.addressZoomText = req.body.defaultCityZoomText;
		}

		if(req.body.tag != null && req.body.tag != ""){
			cond.tagsubs = req.body.tag.split(',');
		}
			
		
		//req.session.user.location = location;
		
		User.update({_id: req.session.user}, 
		cond
		, {upsert: true}, function(err){
			if (err)
				console.log(err);
			else
				trackUser(req.session.user, 11,  {tags:req.body.tag});
		});
		formMessage.push("Votre profil est enregistré");
	}else
		formMessage.push("Erreur : vous n'êtes pas connecté !");
	
	req.session.message = formMessage;
	
	res.redirect('settings/profile');
}

exports.privateprofile = function(req, res){
		
	var formMessage = new Array();
	delete req.session.message;
	var User = db.model('User');
	var user = new User();
				
	if(req.session.user){
		User.findbyMail(req.body.mail, function(err, theuser){
			if(!err)
			{
				if(theuser == "")
				{
					User.update({_id: req.session.user}, 
					{mail:req.body.mail}
					, {upsert: true}, function(err){
						if (err)
							console.log(err);
					});
					formMessage.push("Votre profil privé est enregistré");
					req.session.message = formMessage;
					res.redirect('settings/privateprofile');
				}
				else
				{
					formMessage.push("Ce mail est déjà enregistré");	
					req.session.message = formMessage;
					res.redirect('settings/privateprofile');
				}
				
			}
			else
			{
				formMessage.push("Erreur : Essayez de nouveau !");
				req.session.message = formMessage;
				res.redirect('settings/privateprofile');
			}
		});
	}else
	{
		formMessage.push("Erreur : vous n'êtes pas connecté !");
		req.session.message = formMessage;
		res.redirect('settings/privateprofile');
	}
		
	
	
}


exports.addfavplace = function (req, res) {
	var User = db.model('User');
	var Point = db.model('Point');
	
	if(req.session.user){
		var point = new Point(req.body.place);	
		User.update({_id:req.session.user},{$push:{"favplace":point}}, function(err,docs){			
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
			User.update({_id:req.session.user},{$pull:{favplace:{_id:pointId}}}, function(err){
				console.log(err);
				res.json('del');
				
			});
			
			
		
	}else{
		req.session.message = "Erreur : vous devez être connecté pour sauver vos favoris";
		res.redirect('/user/login');x
	}
	
	
};


exports.updatefavplacerange = function(req, res){

	if(req.session.user){
			var pointId = req.body.pointId;
			res.json(pointId);
	}else{
		req.session.message = "Erreur : vous devez être connecté pour sauver vos favoris";
		res.redirect('/user/login');
	}
}

/**
DOCS
*/
exports.docs_api = function(req, res){
	res.render('docs/api');
}
exports.docs_faq = function(req, res){
	res.render('docs/faq');
}
exports.docs_cgu = function(req, res){
	res.render('docs/cgu');
}
exports.docs_opendata = function(req, res){
	res.render('docs/opendata');
}
exports.docs_log = function(req, res){
	res.render('docs/log');
}
/* Like System */

exports.setLikes = function(req, res){
	//console.log(req.session.user);
	var Info = db.model('Info');
	
	if(req.session.user){
			var infoId = req.body.infoId;
			var islike = req.body.islike;
			if (islike == 'like') { 
				Info.update({_id:infoId},{$inc:{likes : 1}, $push:{yaklikeUsersIds: req.session.user}, new:true}, function(err, result){
					res.json("updated");
					trackUser(req.session.user, 7, {infoId:infoId});
				})
			}
			else
			{
				Info.update({_id:infoId},{$inc:{unlikes : 1}, $push:{yakunlikeUsersIds: req.session.user}, new:true}, function(err, result){
					res.json("updated")
				})	
			}

			
			
		
	}else{
		req.session.message = "Erreur : vous devez être connecté pour sauver vos favoris";
		res.redirect('/user/login');
	}
	
};

exports.setSpams = function(req, res){
	//console.log(req.session.user);
	var contenuIllicite = db.model('contenuIllicite');
	var aspamAlert = new contenuIllicite();
	if(req.session.user){
			contenuIllicite.findById(req.params.infoid, function (err, thealert){
				//log
				trackUser(req.session.user, 14,  {infoId:req.params.infoid});
				if(thealert != undefined && thealert != null ){
					infoAlert.update({"_id":thealert._id},{$push:{user_id: req.session.user}},{$inc:{count : 1}},{$set:{"last_date_mark":new Date()}}, function(err){
						if (err) 
						{
							console.log(err);
							res.send("0");
						}
						else
						{
							res.send("1");	
						}
							
					});	
				}
				else
				{
					aspamAlert.content_id = req.body.infoId;
					aspamAlert.user_id = req.session.user;
					aspamAlert.content_type = 1;

					aspamAlert.save(function(err){
						if(!err)
							res.send("1");
						else
						{
							console.log(err);
							res.send("0");
						}
					});
				}
		
			});
		}
		else{
		req.session.message = "Erreur : vous devez être connecté pour sauver vos favoris";
		res.redirect('/user/login');
	}
	
};

exports.getSpams = function(req, res){
	//console.log(req.session.user);
	var contenuIllicite = db.model('contenuIllicite');
	
	contenuIllicite.findByUser(req.params.userid, req.params.infoid, function (err, thealert){
		if(!err)
		{
			if(thealert != undefined && thealert != null ){
			res.send(thealert._id);
			}
			else
				res.send("");	
		}
		else
		{
			console.log(err);
			res.send("");
		}
		
	}); 
	
};


exports.auth_twitter = function(req, res){
	/**
	* OAuth dependencies
	*/
	var config_secret = require('../confs_secret.js');
	var secretConf = config_secret.confs_secret;

	var OAuth= require('oauth').OAuth;
	var oa = new OAuth(
		"https://api.twitter.com/oauth/request_token",
		"https://api.twitter.com/oauth/access_token",
		secretConf.TWITTER.accessKeyId,
		secretConf.TWITTER.secretAccessKey,
		"1.0",
		conf.twitter_callbackurl,
		"HMAC-SHA1"
	);

	
	oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
			if (error) {
				console.log(error);
				res.send(error)
			}
			else {

				req.session.oauth = {};
				req.session.oauth.token = oauth_token;
				console.log('oauth.token: ' + req.session.oauth.token);
				req.session.oauth.token_secret = oauth_token_secret;
				//console.log('oauth.token_secret: ' + req.session.oauth.token_secret);
				
				res.redirect('https://twitter.com/oauth/authenticate?oauth_token='+oauth_token);

	}
	});
};

exports.auth_twitter_callback = function(req, res){
	if (req.session.oauth) {

		/**
		* OAuth dependencies
		*/
		var config_secret = require('../confs_secret.js');
		var secretConf = config_secret.confs_secret;

		var OAuth= require('oauth').OAuth;
		var oa = new OAuth(
			"https://api.twitter.com/oauth/request_token",
			"https://api.twitter.com/oauth/access_token",
			secretConf.TWITTER.accessKeyId,
			secretConf.TWITTER.secretAccessKey,
			"1.0",
			conf.twitter_callbackurl,
			"HMAC-SHA1"
		);

		req.session.oauth.verifier = req.query.oauth_verifier;
		var oauth = req.session.oauth;

		oa.getOAuthAccessToken(oauth.token,oauth.token_secret,oauth.verifier, 
		function(error, oauth_access_token, oauth_access_token_secret, results){
			if (error){
				console.log(error);
				res.send("Authentication Failure!");
			} else {
				req.session.oauth.access_token = oauth_access_token;
				req.session.oauth.access_token_secret = oauth_access_token_secret;
				//console.log(results, req.session.oauth);
				oa.get("https://api.twitter.com/1/account/verify_credentials.json", req.session.oauth.access_token, req.session.oauth.access_token_secret, function (error, data, response) {
		        if (error) {
		          console.log(error);
		          res.send("Error getting twitter screen name : " + error, 500);
		        } else {

		       	  data = JSON.parse(data);
		          
		        var crypto = require('crypto')
		        var User = db.model('User');
			    var user = new User();
				var login = data.screen_name;
				var twitter_id = data.id;
				var salt = Math.round(new Date().valueOf() * Math.random());
				var token = crypto.createHash('sha1').update("yakwala@secure"+salt).digest("hex");
				var password = user.generatePassword(5);
				var logo = conf.fronturl+"/static/images/yakwala-logo_petit.png";
				
				user.name=data.name;
				user.login=login;
				user.mail='yak_not_set@yakwala.fr';
				user.token=token;
				user.status=1;
				user.hash= password;
				user.password= password;
				user.salt="1";
				user.type=1;
				user.twitter_id = twitter_id;
				
				var Twitter = db.model('Twitter');
				var aTwitter = new Twitter();	

				if(typeof(data.name) != 'undefined')
					aTwitter.name = data.name;

				if(typeof(data.profile_image_url) != 'undefined')
					aTwitter.profile_image_url = data.profile_image_url;

				if(typeof(data.url) != 'undefined')
					aTwitter.url = data.url;

				if(typeof(data.description) != 'undefined')
					aTwitter.description = data.description;

				if(typeof(data.screen_name) != 'undefined')
					aTwitter.screen_name = data.screen_name;

				if(typeof(data.twitter_id) != 'undefined')
					aTwitter.twitter_id = data.twitter_id;

				if(typeof(data.geo) != 'undefined')
					aTwitter.geo = data.geo.coordinates;

				if(typeof(data.followers_count) != 'undefined')
					aTwitter.followers_count = data.followers_count;

				if(typeof(data.time_zone) != 'undefined')
					aTwitter.time_zone = data.time_zone;

				if(typeof(data.statuses_count) != 'undefined')
					aTwitter.statuses_count = data.statuses_count;

				if(typeof(data.lang) != 'undefined')
					aTwitter.lang = data.lang;

				if(typeof(data.friends_count) != 'undefined')
					aTwitter.friends_count = data.friends_count;

				if(typeof(data.created_at) != 'undefined')
					aTwitter.created_at = data.created_at;

				user.social.twitter = aTwitter;

				user.createfrom_social = 1;

				if(!(typeof data.description  === 'undefined') && data.description  != null && data.description  != '')
					user.bio = data.description;
				if(!(typeof data.url  === 'undefined') && data.url  != null && data.url  != '')
					user.web = data.url;
				//user.favplace = [{'name':'Paris, France','location':{'lat':48.851875,'lng':2.356374}},{'name':'Eghézée, Belgique','location':{'lat':50.583346,'lng':4.900031}},{'name':'Montpellier, France','location':{'lat':43.610787,'lng':3.876715}}];
				user.favplace = [{'name':'Nice, France','location':{'lat':43.681343,'lng':7.232094},'range':100},{'name':'Marseille, France','location':{'lat':43.298198,'lng':5.370255},'range':100},{'name':'Paris, France','location':{'lat':48.851875,'lng':2.356374},'range':100}];
				
				User.findByTwitterId(twitter_id,function (err, theuser){
					if(theuser != undefined && theuser != null ){
						console.log('LOGGED IN');
						req.session.user = theuser._id;
						User.update({"_id":theuser._id},{$set:{"lastLoginDate":new Date()}}, function(err){if (err) console.log(err);});
						res.redirect('news/map');
						var trackParams = {"loginFrom": 1};
						trackUser(user._id, 3,  trackParams);
					}else{
						var trackParams = {"createdFrom": 1};
						trackUser(user._id, 1,  trackParams);
						var trackParams = {"loginFrom": 1};
						trackUser(user._id, 3,  trackParams);	
						User.findByLoginDuplicate(login, function(err, theuser){
							if(theuser != undefined && theuser != null )
							{
								user.name=login+"_twitter";
								user.login=login+"_twitter";
								user.save(function (err) {
									if (!err){
										req.session.user = user._id;
										User.update({"_id":user._id},{$set:{"lastLoginDate":new Date(), "status":4}}, function(err){if (err) console.log(err);});
										res.redirect('/settings/firstvisit');
									} 
									else console.log(err);
								});	
								
							}
							else
							{
								user.save(function (err) {
								if (!err){
									req.session.user = user._id;
									User.update({"_id":user._id},{$set:{"lastLoginDate":new Date(), "status":4}}, function(err){if (err) console.log(err);});
									res.redirect('/settings/firstvisit');
								} 
								else console.log(err);
								});	
							}
						})
					}
				});
		        }  
		      });

			}
		}
		);
	} else
	{
		res.send('youre not supposed to be here');
	}
};



/*exports.auth_facebook = function(req, res){
	req.Facebook.api('/me', function(err, user) {
		res.writeHead(200, {'Content-Type': 'text/plain'});
	    res.end('Hello, ' + user.name + '!');
	});
	
}


exports.auth_google = function(req, res){
	res.send("google pulus");
	
}*/

exports.auth_facebook = function(req, res){
	var data = req.body.user;
	var crypto = require('crypto')
    var User = db.model('User');
    var user = new User();
	var login = data.username;
	var facebook_id = data.id;
	var salt = Math.round(new Date().valueOf() * Math.random());
	var token = crypto.createHash('sha1').update("yakwala@secure"+salt).digest("hex");
	var password = user.generatePassword(5);
	var logo = conf.fronturl+"/static/images/yakwala-logo_petit.png";
	
	user.name=req.body.user.name;
	user.login=login;
	user.mail='yak_not_set@yakwala.fr';
	user.token=token;
	user.status=1;
	user.hash= password;
	user.password= password;
	user.salt="1";
	user.type=1;
	user.facebook_id = facebook_id;
	
	var Facebook = db.model('Facebook');
	var aFacebook = new Facebook();	

	if(typeof(data.id) != 'undefined')
		aFacebook.facebook_id = data.id;

	if(typeof(data.username) != 'undefined')
		aFacebook.screen_name = data.username;

	if(typeof(data.name) != 'undefined')
		aFacebook.name = data.name;

	if(typeof(data.id) != 'undefined')
		aFacebook.profile_image_url = 'https:/graph.facebook.com/'+data.id+'/picture/';

	if(typeof(data.link) != 'undefined')
		aFacebook.url = data.link;

	if(typeof(data.bio) != 'undefined')
		aFacebook.description = data.bio;

	user.social.facebook = aFacebook;

	user.createfrom_social = 2;
	user.bio = data.bio;
	user.web = data.link;
	//user.favplace = [{'name':'Paris, France','location':{'lat':48.851875,'lng':2.356374}},{'name':'Eghézée, Belgique','location':{'lat':50.583346,'lng':4.900031}},{'name':'Montpellier, France','location':{'lat':43.610787,'lng':3.876715}}];
	user.favplace = [{'name':'Nice, France','location':{'lat':43.681343,'lng':7.232094},'range':100},{'name':'Marseille, France','location':{'lat':43.298198,'lng':5.370255},'range':100},{'name':'Paris, France','location':{'lat':48.851875,'lng':2.356374},'range':100}];
	
	User.findByFacebookId(facebook_id,function (err, theuser){
		if(theuser != undefined && theuser != null ){
			console.log('LOGGED IN');
			req.session.user = theuser._id;
			User.update({"_id":theuser._id},{$set:{"lastLoginDate":new Date()}}, function(err){if (err) console.log(err);});
			res.json({response: "1"});
			var trackParams = {"loginFrom": 2};
			trackUser(user._id, 3,  trackParams);
		}else{
			
			User.findByLoginDuplicate(login, function(err, theuser){
				var trackParams = {"createdFrom": 2};
				trackUser(user._id, 1,  trackParams);
				var trackParams ={"loginFrom": 2};
				trackUser(user._id, 3,  trackParams);
				if(theuser != undefined && theuser != null )
				{
					user.name=login+"_facebook";
					user.login=login+"_facebook";
					user.save(function (err) {
						if (!err){
							req.session.user = user._id;
							User.update({"_id":user._id},{$set:{"lastLoginDate":new Date(), "status":4}}, function(err){if (err) console.log(err);});
							res.json({response: "1"});
						} 
						else 
						{
							console.log(err);
							res.json({response: "0"});
						}
					});	
					
				}
				else
				{
					user.save(function (err) {
					if (!err){
						req.session.user = user._id;
						User.update({"_id":user._id},{$set:{"lastLoginDate":new Date(), "status":4}}, function(err){if (err) console.log(err);});
						res.json({response: "4"});
					} 
					else 
						{
							res.json({response: "0"});
							console.log(err);
						}
					});	
				}
			})
		}
	});
	
}

exports.auth_google = function(req, res){
	var data = req.body.user;
	var crypto = require('crypto')
    var User = db.model('User');
    var user = new User();
	var login = data.name.givenName + "." + data.name.familyName;
	var google_id = data.id;
	var salt = Math.round(new Date().valueOf() * Math.random());
	var token = crypto.createHash('sha1').update("yakwala@secure"+salt).digest("hex");
	var password = user.generatePassword(5);
	var logo = conf.fronturl+"/static/images/yakwala-logo_petit.png";
	
	user.name=req.body.user.name;
	user.login=login;
	user.mail='yak_not_set@yakwala.fr';
	user.token=token;
	user.status=1;
	user.hash= password;
	user.password= password;
	user.salt="1";
	user.type=1;
	user.google_id = google_id;
	
	
	var Google = db.model('Google');
	var aGoogle = new Google();	

	if(typeof(data.id) != 'undefined')
		aGoogle.google_id = data.id;

	if(typeof(data.name) != 'undefined')
		aGoogle.screen_name = login;

	if(typeof(data.name) != 'undefined')
		aGoogle.name = data.name.givenName + "." + data.name.familyName;

	if(typeof(data.image) != 'undefined')
		aGoogle.profile_image_url = data.image.url;

	if(typeof(data.url) != 'undefined')
		aGoogle.url = data.url;

	if(typeof(data.aboutMe) != 'undefined')
		aGoogle.description = data.aboutMe;

	if(typeof(data.ageRange) != 'undefined')
		aGoogle.ageRange = data.ageRange;	

	if(typeof(data.gender) != 'undefined')
		aGoogle.gender = data.gender;		

	if(typeof(data.language) != 'undefined')
		aGoogle.language = data.language;			


	user.social.google = aGoogle;

	user.createfrom_social = 3;
	user.bio = data.bio;
	user.web = data.link;
	//user.favplace = [{'name':'Paris, France','location':{'lat':48.851875,'lng':2.356374}},{'name':'Eghézée, Belgique','location':{'lat':50.583346,'lng':4.900031}},{'name':'Montpellier, France','location':{'lat':43.610787,'lng':3.876715}}];
	user.favplace = [{'name':'Nice, France','location':{'lat':43.681343,'lng':7.232094},'range':100},{'name':'Marseille, France','location':{'lat':43.298198,'lng':5.370255},'range':100},{'name':'Paris, France','location':{'lat':48.851875,'lng':2.356374},'range':100}];
	
	User.findByGoogleId(google_id,function (err, theuser){
		if(theuser != undefined && theuser != null ){
			console.log('LOGGED IN');
			req.session.user = theuser._id;
			User.update({"_id":theuser._id},{$set:{"lastLoginDate":new Date()}}, function(err){if (err) console.log(err);});
			res.json({response: "1"});
			var trackParams ={"loginFrom": 3};
			trackUser(user._id, 3,  trackParams);
		}else{
			
			User.findByLoginDuplicate(login, function(err, theuser){
				var trackParams = {"createdFrom": 3};
				trackUser(user._id, 1,  trackParams);
				var trackParams = {"loginFrom": 3};
				trackUser(user._id, 3,  trackParams);
				
				if(theuser != undefined && theuser != null )
				{
					user.name=login+"_google";
					user.login=login+"_google";
					user.save(function (err) {
						if (!err){
							req.session.user = user._id;
							User.update({"_id":user._id},{$set:{"lastLoginDate":new Date(), "status":4}}, function(err){if (err) console.log(err);});
							res.json({response: "1"});
						} 
						else 
						{
							console.log(err);
							res.json({response: "0"});
						}
					});	
					
				}
				else
				{
					user.save(function (err) {
					if (!err){
						req.session.user = user._id;
						User.update({"_id":user._id},{$set:{"lastLoginDate":new Date(), "status":4}}, function(err){if (err) console.log(err);});
						res.json({response: "4"});
					} 
					else 
						{
							res.json({response: "0"});
							console.log(err);
						}
					});	
				}
			})
		}
	});
	
}

exports.track_user = function(req, res)
{
	//trackUser(req.params.userid, req.params.actionid, req.params.logparams);
	res.send("dont use this function, trigger the trackserver instead");
}

function trackUser(userid, actionid, logparams)
{
	var request = require('request');
	var url = conf.trackurl + '/track/user/'+userid+'/'+actionid+'/'+encodeURIComponent(JSON.stringify(logparams));
	console.log('---log:'+url);
	request.get({url:url, json:true}, function (err) {if (err) console.log(err);})
}