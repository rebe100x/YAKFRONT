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
				
				res.locals.user = theuser;
				res.locals.user.token ='xxx';
				res.locals.user.salt = 'xxx';
				res.locals.user.hash='xxx';
				res.locals.user.apiData=[];
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
	if(typeof(req.session.type) == 'undefined' || req.session.type === null ){
		var type = new Array();
		type.push(1);
		req.session.type = type;
	}	
	res.render('news/map',{type:req.session.type,str:null});  
};
exports.news_map_search = function(req, res){
	if(typeof(req.session.type) == 'undefined' || req.session.type === null ){
		var type = new Array();
		type.push(1);
		req.session.type = type;
	}	
	
	res.render('news/map',{type:req.session.type,str:req.params.str});  
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
	var Info = db.model('Info');
	Info.findAll(function (err, docs){
		res.render('news/feed',{infos:docs});
	}); 
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
	
		if(req.body.yakType > 0 )
			theYakType = req.body.yakType; 
		
		//console.log(req.files);
		var infoThumb = new Object();
		if(req.files.picture.size && req.files.picture.size > 0 && req.files.picture.size < 1048576*5){
			var drawTool = require('../mylib/drawlib.js');
			var size = mainConf.imgSizeInfo;
			infoThumb = drawTool.StoreImg(req.files.picture,size,conf);
			formMessage.push(infoThumb.msg);	
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
					info.placeId = place._id;
				}else
					info.placeId = item._id;
				
				var now = new Date();
				info.creationDate = now;
				info.lastModifDate = now;
				info.pubDate = now;
				
				var D = new Date(now.getFullYear(), now.getMonth(), now.getDate());
				var DTS = D.getTime() / 1000 + (3 * 60 * 60 * 24);
				D.setTime(DTS*1000); 
				info.dateEndPrint = D;
				info.print = 1;
				info.status = 1;
				info.yakType = Math.floor(theYakType);
				info.thumb = infoThumb.name;
				info.licence = 'Yakwala';
				info.heat = 80;
				var freeTags = req.body.freetag.split(',');
				info.freeTag = freeTags;
				
				if(req.body.freetag.length > 0){
					freeTags.forEach(function(freeTag){
						Tag.findOne({'title':freeTag},function(err,thetag){
							if(thetag == null){
								tag.title=freeTag;
								tag.numUsed = 1;
								tag.save();
							}
							else{
								Tag.update({_id: thetag._id}, {lastUsageDate:now,$inc:{numUsed:1}}, {upsert: false}, function(err){if (err) console.log(err);});						
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
/******* USER ******/


exports.user_login = function(req, res){
	delete req.session.message;
	
	
	res.render('user/login',{locals:{redir:req.query.redir}});
};


	

exports.user_validate = function(req, res){
	var User = db.model('User');	
	
	User.authenticateByToken(req.params.token,req.params.password, function(err, model) {
	if(!(typeof(model) == 'undefined' || model === null || model === '')){
			req.session.user = model._id;
			User.update({_id: model._id}, {status:1}, {upsert: false}, function(err){if (err) console.log(err);});						
			res.render('settings/firstvisit',{user:model});
		}else{
			req.session.message = "Votre clé d'activation est incorrecte.";
			res.redirect('/user/validate');
		}
	
	});
	
};

exports.user_logout = function(req, res){
	delete req.session.user;
	res.redirect('/news/map');
};





exports.session = function(req, res){

	var User = db.model('User');
	
	User.authenticate(req.body.login,req.body.password, function(err, user) {
	if(!(typeof(user) == 'undefined' || user === null || user === '')){
			req.session.user = user._id;
			res.redirect(req.body.redir || '/news/map');
		}else{
			req.session.message = 'Identifiants incorrects.';
			res.redirect('user/login?redir='+req.body.redir);
		}
	
	});
	
};

exports.user = function(req, res){

	var nodemailer = require("nodemailer");
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
				
				/*
				var smtpTransport = nodemailer.createTransport("SMTP",{
					service: "Gmail",
					auth: {
						//user: "bessieres.biz@gmail.com",
						//pass: "/m.gmail"
						user: "labs.yakwala@gmail.com",
						pass: "/m.yakwala"
					}
				});*/
				
				
				var salt = Math.round(new Date().valueOf() * Math.random());
				var token = crypto.createHash('sha1').update("yakwala@secure"+salt).digest("hex");
				var password = user.generatePassword(5);
				var link = conf.validationUrl+token+"/"+password;
				var hash = crypto.createHash('sha1').update(password+"yakwala@secure"+salt).digest("hex");
				User.update({_id: theuser._id}, {hash : hash,token:token,salt:salt}, {upsert: false}, function(err){
					
				
					var fs    = require('fs');
					fs.readFile(__dirname+'/../views/mails/account_validation3.html', 'utf8', function(err, data) {
						data = data.replace("*|MC:SUBJECT|*","Votre inscription");
						data = data.replace("*|MC:HEADERIMG|*",conf.fronturl+"/static/images/yakwala-logo_petit.png");
						data = data.replace("*|MC:VALIDATIONLINK|*",link);
						data = data.replace("*|CURRENT_YEAR|*",new Date().getFullYear());
						
						
						var smtpTransport = nodemailer.createTransport("SES", {
							AWSAccessKeyID: "AKIAJ6EBI6LCECLYVM5Q",
							AWSSecretKey: "8JOXCmPulbB65oERV1rqLxhkl2ur/H7QeYDpMTEB",
							//ServiceUrl: "https://email.us-east-1.amazonaws.com" // optional
						});
					
						var mailOptions = {
							from: "Labs Yakwala <labs.yakwala@gmail.com>", // sender address
							to: theuser.mail, // list of receivers
							subject: "Votre inscription à Yakwala", // Subject line
							text: "Bonjour, \r\n Pour valider votre compte Yakwala, entrez ce lien dans votre navigateur : "+link+" et validez votre compte avec cette clé de validation : "+password, // plaintext bod
							html: data
						}	
							
						
						smtpTransport.sendMail(mailOptions, function(error, response){
							if(error)
								console.log(error);
							else
								console.log(response);
							smtpTransport.close(); // shut down the connection pool, no more messages
						});
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
				
				user.name=login;
				user.login=login;
				user.mail=themail;
				user.token=token;
				user.status=2;
				user.hash= password;
				user.password= password;
				user.salt="1";
				user.type=1;
				
				
				
			
				user.favplace = [{'name':'Paris, France','location':{'lat':48.851875,'lng':2.356374}},{'name':'Eghézée, Belgique','location':{'lat':50.583346,'lng':4.900031}},{'name':'Montpellier, France','location':{'lat':43.610787,'lng':3.876715}}];
				
				
				user.save(function (err) {
					if (!err){
						var fs    = require('fs');
						fs.readFile(__dirname+'/../views/mails/account_validation.html', 'utf8', function(err, data) {
							var link = conf.validationUrl+user.token+'/'+password;
							data = data.replace("*|MC:SUBJECT|*","Votre inscription");
							data = data.replace("*|MC:HEADERIMG|*",conf.fronturl+"/static/images/yakwala-logo_petit.png");
							data = data.replace("*|MC:VALIDATIONLINK|*",link);
							data = data.replace("*|CURRENT_YEAR|*",new Date().getFullYear());
							
							
							var smtpTransport = nodemailer.createTransport("SES", {
								AWSAccessKeyID: "AKIAJ6EBI6LCECLYVM5Q",
								AWSSecretKey: "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",
								//ServiceUrl: "https://email.us-east-1.amazonaws.com" // optional
							});
						
							var mailOptions = {
								from: "Labs Yakwala <labs.yakwala@gmail.com>", // sender address
								to: user.mail, // list of receivers
								subject: "Votre inscription à Yakwala", // Subject line
								text: "Bonjour, \r\n Pour valider votre compte Yakwala, entrez ce lien dans votre navigateur : "+link+" et validez votre compte avec cette clé de validation : "+password, // plaintext bod
								html: data
							}	
								
							
							smtpTransport.sendMail(mailOptions, function(error, response){
								if(error)
									console.log(error);
								else
									console.log(response);
								smtpTransport.close(); // shut down the connection pool, no more messages
							});
						});
					
					} 
					else console.log(err);
				});
				/*send mail*/
				
				/*
				var smtpTransport = nodemailer.createTransport("SMTP",{
					service: "Gmail",
					auth: {
						//user: "bessieres.biz@gmail.com",
						//pass: "/m.gmail"
						user: "labs.yakwala@gmail.com",
						pass: "/m.yakwala"
					}
				});
				var mailOptions = {
					from: "Yakwala <noreply@yakwala.fr>", // sender address
					to: themail, // list of receivers
					subject: "Votre inscription à Yakwala", // Subject line
					text: "Bonjour, \r\n Pour valider votre compte Yakwala, entrez ce lien dans votre navigateur : "+link+" et validez votre compte avec cette clé de validation : "+password, // plaintext bod
					html: "Bonjour,<br><br>Pour valider votre compte Yakwala, clickez sur ce <a href=\""+link+"\">lien</a> et entrer la clé de validation suivante : <b>"+password+"</b>" // html body
				}

				smtpTransport.sendMail(mailOptions, function(error, response){
					smtpTransport.close(); // shut down the connection pool, no more messages
				});*/

				req.session.message = 'Un email vous a été envoyé contenant un lien et une clé de validation de votre compte.';
				res.redirect('user/new');
		}
	});
	
	
};

exports.user_new = function(req, res){
	delete req.session.message;
	res.render('user/new');
	
};







/******SETTINGS********/





exports.settings_password = function(req,res){
	delete req.session.message;
	res.render('settings/password');

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
		res.render('settings/alerts',{usersubs:usersubs,tagsubs:res.locals.user.tagsubs});
		
	}else{
		req.session.message = "Erreur : vous devez être connecté pour gérer vos alertes";
		res.redirect('/user/login?redir=settings/alerts');
	}
	
	
};



exports.firstvisit = function(req,res){
	
	formMessage = "";
	var User = db.model('User');
	if(req.session.user){	
		User.findById(req.session.user,function (err, docs){
			var crypto = require('crypto');
			var newcryptedPass = crypto.createHash('sha1').update(req.body.password+"yakwala@secure"+docs.salt).digest("hex");	
			var login = docs.login;
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
				
				
				User.update({_id: req.session.user}, {hash : newcryptedPass,location:location, address: address, formatted_address: formatted_address}, {upsert: false}, function(err){
				
					if (err) console.log(err);
					else{
						formMessage = "Votre nouveau mot de passe est enregistré";
						//delete req.session.user;
						User.authenticate(login,req.body.password, function(err, user) {
							if(!(typeof(user) == 'undefined' || user === null || user === '')){
									req.session.user = user._id;
									res.locals.user = user;
									req.session.message = formMessage;
									res.redirect('news/map');
								}else{
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
									formMessage = "Votre nouveau mot de passe est enregistré";
									//delete req.session.user;
									User.authenticate(login,req.body.newpass1, function(err, user) {
										if(!(typeof(user) == 'undefined' || user === null || user === '')){
												req.session.user = user._id;
												res.locals.user = user;
												req.session.message = formMessage;
												res.redirect('settings/password');
										}else{
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
							res.render('settings/password');
						}
				}else{
					formMessage = "Attention, vos 2 nouveaux mots de passe ne sont pas identiques.";
					req.session.message = formMessage;
					res.render('settings/password');
				}
			}else{
				formMessage = "Votre ancien mot de passe est incorrect";
				req.session.message = formMessage;
				res.render('settings/password');
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
				
	if(req.session.user){
		User.update({_id: req.session.user}, {$set:{usersubs : usersubsArray}, tagsubs : tagsubsArray}, {upsert: true}, function(err){
			if (err) console.log(err);
			else{
				console.log('Vos alertes sont enregistrées ');
				formMessage.push("Vos alertes sont enregistrées");
			}
				
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
		var size = mainConf.imgSizeAvatar;
		var infoThumb = drawTool.StoreImg(req.files.avatar,size,conf);
		
		if(infoThumb.msg)
			formMessage.push(infoThumb.msg);
		
		
		
			var cond = {
				name : req.body.username,
				web:req.body.web,
//				thumb:infoThumb.name,
				bio:req.body.bio,
				tag:req.body.tag.split(','),
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
			
		//req.session.user.location = location;
		
		User.update({_id: req.session.user}, 
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

exports.privateprofile = function(req, res){
		
	var formMessage = new Array();
	delete req.session.message;
	var User = db.model('User');
	var user = new User();
				
	if(req.session.user){
		
		User.update({_id: req.session.user}, 
		{mail:req.body.mail}
		, {upsert: true}, function(err){
			if (!err){
				console.log('Success!');
			}
			else console.log(err);
		});
		formMessage.push("Votre profil privé est enregistré");
	}else
		formMessage.push("Erreur : vous n'êtes pas connecté !");
	
	req.session.message = formMessage;
	
	res.redirect('settings/privateprofile');
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
		res.redirect('/user/login');
	}
	
	
};

/**
DOCS
*/
exports.docs_api = function(req, res){
	res.render('docs/api');
}