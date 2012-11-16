/*
 * Serve JSON to our AngularJS client
 */

exports.requiresToken = function(req,res,next){
	if(req.query.access_token && req.params.userid){
		var User = db.model('User');
		
		User.identifyByToken(req.query.access_token,req.params.userid,function (err, theuser){
			if(theuser != undefined && theuser != null){
				console.log('IDENTIFIED BY TOKEN');
				res.locals.user = theuser;
				next();
			}else{
				console.log('NOT IDENTIFIED BY TOKEN');
				req.session.message = 'Please login to access this section:';
				res.redirect('/user/login?redir='+req.url);
			}
		});
	}else{
		req.session.message = 'Please provide a valid token.';
		res.redirect('/user/login?redir='+req.url);
	}	
};

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


/*******
* USER *
********/
exports.users_details = function (req, res) {
	var User = db.model('User');
	User.apiFindById(res.locals.user._id,function(err, docs){
		if(err)
			throw err;
		else{
			res.json(docs);
		}
	
	});
}
exports.users_feed = function (req, res) {
	var Info = db.model('Info');
	
	Info.findByUser(req.params.userid,req.params.count,function(err, docs){
		if(err)
			throw err;
		else{
			res.json(docs);
		}
	
	});
}

exports.users_search = function (req, res) {
	var User = db.model('User');
	
	User.search(req.params.string,function(err, docs){
		if(err)
			throw err;
		else{
			res.json(docs);
		}
	
	});
}
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

/*****************************
API OAUTH
******************************/
exports.oauth_authorize = function(req,res){

	var params = (req.query.client_id)?req.query:req.params;	
	var JSON = {parms : function(a1){t=[];for(x in a1)t.push(x+"="+encodeURI(a1[x]));return t.join("&");}};
	var Client = db.model('Client');
	Client.findOne({_id:params.client_id,status:1},{},function (err, docs){
	  if(docs){
		console.log('ELO'+params.redirect_uri);
		res.render('api/login',{redirect_uri:params.redirect_uri,client_name:docs.name,client_id:docs._id});
	  }else{
		var error = {"error":"access_denied","error_reason": "Client Id does not match anything in database","error_description":"Client id is not active"};
		if(params.redirect_uri == '' || params.redirect_uri == "undefined"){
			res.json({error:error});
		}else{
			res.redirect(req.body.redirect_uri+"?error="+JSON.parms(error));
		}
	  }
		
	});
	
}
/*
exports.oauth_login = function(req, res){
	res.render('api/login',{redirect_uri:redirect_uri});
};*/

exports.oauth_session = function(req, res){

	var JSON = {parms : function(a1){t=[];for(x in a1)t.push(x+"="+encodeURI(a1[x]));return t.join("&");}};
	var Client = db.model('Client');
	Client.findOne({_id:req.body.client_id,status:1},{},function (err, docs){
	if(docs){
		if(req.body.redirect_uri.substring(0,6) == 'http://')
			var uri = req.body.redirect_uri.substring(7,req.body.redirect_uri.length);
		else
			var uri = req.body.redirect_uri;
		var url_tmp = req.body.redirect_uri.split('/');	
		console.log(url_tmp[0]+"/" +"!="+ docs.link);
		if(docs.link.substring(0,6) == 'http://')
			var link = docs.link.substring(7,docs.link.length);
		else
			var link = docs.link;
		if(docs.link.substring(docs.link.length-1,docs.link.length) != '/')
			link = link + '/';
		
		if(req.body.redirect_uri == '' || req.body.redirect_uri == "undefined" || url_tmp[0]+"/" != link){
			var error = {"error":"access_denied","error_reason": "Redirect uri does not match","error_description":"Redirection uri was not provided or is not matching the client redirect url"};			
			res.json({error:error});
		}else{
			if(req.body.appauth == 1){
			
				var User = db.model('User');
				User.authenticate(req.body.login,req.body.password, function(err, user) {
				if(!(typeof(user) == 'undefined' || user === null || user === '')){
						req.session.user = user._id;
						var crypto = require('crypto');
						var now = new Date();
						var salt = Math.round(now.valueOf() * Math.random());
						var code = crypto.createHash('sha1').update("yakwala@secure"+salt).digest("hex");
						User.update({_id:user._id},{$set:{apicode:code,apiCodeCreationDate:now}}, function(err,docs){
							if(err)
								throw err;
							else{
								if(req.body.redirect_uri.substring(0,6)=='http://')
									var redir = req.body.redirect_uri.substring(7,req.body.redirect_uri.length);
								else
									var redir = req.body.redirect_uri;
								console.log("redir"+redir);
								res.redirect('http://'+redir+"?code="+code);
								}
						});
						
					}else{
						var error = {"error":"access_denied","error_reason": "Login failed","error_description":"Wrong login or password"};
						res.redirect('http://'+req.body.redirect_uri+"?error="+JSON.parms(error));
					}
				
				});
			}else{
				var error = {"error":"access_denied","error_reason": "Acces not granted","error_description":"User did not grant acces to the application"};
				res.redirect('http://'+req.body.redirect_uri+"?error="+JSON.parms(error));
			}
		}
	}else{
		var error = {"error":"access_denied","error_reason": "Client id is not active","error_description":"Check your client ID"};
		res.redirect('http://'+req.body.redirect_uri+"?error="+JSON.parms(error));
	  }
	});
		
};

exports.oauth_access_token = function(req, res){
	var JSON = {parms : function(a1){t=[];for(x in a1)t.push(x+"="+encodeURI(a1[x]));return t.join("&");}};
	var params = (req.query.client_id)?req.query:req.params;	
	var Client = db.model('Client');
	var User = db.model('User');
	
	console.log(params);
	if(params.client_id && params.client_secret && params.grant_type && params.redirect_uri && params.code ){
		var Client = db.model('Client');
		Client.findOne({_id:params.client_id,secret:params.client_secret,status:1},{},function (err, docs){
		console.log(docs);
			if(docs){
				
				if(params.redirect_uri.substring(0,6) == 'http://')
					var uri = params.redirect_uri.substring(7,params.redirect_uri.length);
				else
					var uri = params.redirect_uri;
				var url_tmp = params.redirect_uri.split('/');	
				console.log(url_tmp[0]+"/" +"!="+ docs.link);
				if(docs.link.substring(0,6) == 'http://')
					var link = docs.link.substring(7,docs.link.length);
				else
					var link = docs.link;
				if(docs.link.substring(docs.link.length-1,docs.link.length) != '/')
					link = link + '/';
				
				if(params.redirect_uri == '' || params.redirect_uri == "undefined" || url_tmp[0]+"/" != link){
					var error = {"error":"access_denied","error_reason": "Redirect uri does not match","error_description":"Redirection uri was not provided or is not matching the client redirect url"};			
					res.json({error:error});
				}else{
					var now = new Date();
					var tmp = now.getTime() + 1000*60*60*2;
					
					var maxApiCodeCreationDate = new Date();
					maxApiCodeCreationDate.setTime(tmp);
					//User.findOne({apicode:params.code,apiCodeCreationDate:{$le:maxApiCodeCreationDate}},{}, function(err, user) {
					User.findOne({apicode:params.code},{}, function(err, user) {
					console.log(user);
						if(!(typeof(user) == 'undefined' || user === null || user === '')){
							var crypto = require('crypto');
							//var now = new Date();
							var salt = Math.round(now.valueOf() * Math.random());
							var token = crypto.createHash('sha1').update("yakwala@secure"+salt).digest("hex");
							User.update({_id:user._id},{$set:{apiToken:token,apiTokenCreationDate:now}}, function(err,docs){
								if(err)
									throw err;
								else{
									var tokenObject = {
										"access_token": token,
										"user": {
											"id": user._id,
											"username": user.login,
											"full_name": user.name,
											"profile_picture": conf.fronturl+"/pictures/128_128/"+user.thumb
										}
									};
									res.json(tokenObject);
								}
							});
						
						}else{
							var error = {"error":"access_denied","error_reason": "Login failed","error_description":"Wrong login or password"};
							res.redirect('http://'+params.redirect_uri+"?error="+JSON.parms(error));
						}
					});
				}
			}
			else{
				var error = {"error":"access_denied","error_reason": "Client id is not active","error_description":"Check your client ID"};
				res.redirect('http://'+params.redirect_uri+"?error="+JSON.parms(error));
			}
		});	
		
	}else{
		var error = {"error":"access_denied","error_reason": "One or more parameter is empty","error_description":"Please use the following parameters : client_id=CLIENT-ID, client_secret=CLIENT-SECRET, grant_type=authorization_code, redirect_uri=YOUR-REDIRECT-URI, code=CODE"};
		res.redirect('http://'+params.redirect_uri+"?error="+JSON.parms(error)+JSON.parms(params));
	}
}
/*****END OAUTH******/