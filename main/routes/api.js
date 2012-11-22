/*
 * Serve JSON to our AngularJS client
 */

exports.requiresToken = function(req,res,next){
	
	var access_token =  (req.query.access_token)?req.query.access_token:req.body.access_token;
	if(access_token && req.params.userid){
		var User = db.model('User');
		
		User.identifyByToken(access_token,req.params.userid,function (err, theuser){
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
		Tag.find({},{title:1,_id:1},function (err, tags){
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


/*********************************************
*FAVPLACE
*ADD, DELETE and LIST user's favorite places
**********************************************/
exports.list_favplace = function (req, res) {
	var User = db.model('User');
	User.findOne({'_id': res.locals.user._id},{favplace:1}, function(err,docs){
		if(!err)
				res.json({meta:{code:200},data:docs});
			else
				res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
	});
	
}

exports.add_favplace = function (req, res) {
	var User = db.model('User');
	var Point = db.model('Point');
	if(req.body.place){
		var point = new Point(JSON.parse(req.body.place));	
		User.update({_id:res.locals.user._id},{$push:{"favplace":point}}, function(err,docs){			
			if(!err)
				res.json({meta:{code:200},data:point});
			else
				res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
		});
	}else
		res.json({meta:{code:404,error_type:'missing parameter',error_description:'place not set'}});
	
	
};

exports.del_favplace = function (req, res) {
	var User = db.model('User');
	if(req.body.place){
		var placeId = JSON.parse(req.body.place)._id;
		User.update({_id:res.locals.user._id},{$pull:{favplace:{_id:placeId}}}, function(err,docs){
			if(!err)
				res.json({meta:{code:200},data:{_id:placeId}});
			else
				res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
		});
	}else{
		res.json({meta:{code:404,error_type:'missing parameter',error_description:'place not set'}});
	}		
};


/*********************************************
*SUBSCRIBE TO USER'S FEED
*ADD, DELETE and LIST user's subscribtions to user's feed
**********************************************/
exports.list_subs_user = function (req, res) {
	var User = db.model('User');
	User.findOne({'_id': res.locals.user._id},{usersubs:1}, function(err,docs){
		if(!err)
				res.json({meta:{code:200},data:docs});
			else
				res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
	});
	
}

exports.add_subs_user = function (req, res) {
	var User = db.model('User');
	var usersubs = JSON.parse(req.body.usersubs)._id;
	if(usersubs){
		User.findById(usersubs,function(err,theuser){
			if(theuser){
				User.update({_id:res.locals.user._id},{$push:{"usersubs":{_id:theuser._id,name:theuser.name,login:theuser.login,userdetails:theuser.name+' ( @'+theuser.login+' )'}}}, function(err,docs){			
					if(!err)
						res.json({meta:{code:200},data:docs});
					else
						res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
				});
			}else
				res.json({meta:{code:404,error_type:'missing parameter',error_description:' not user with this id !'}});
		});	
	}else
		res.json({meta:{code:404,error_type:'missing parameter',error_description:'usersubsid not set: {usersubs:{_id:XXXX}}'}});
};

exports.del_subs_user = function (req, res) {
	var User = db.model('User');
	var usersubs = JSON.parse(req.body.usersubs)._id;
	console.log(usersubs);
	if(usersubs){
		User.update({_id:res.locals.user._id},{$pull:{usersubs:{_id:usersubs}}}, function(err,docs){
			if(!err)
				res.json({meta:{code:200},data:{_id:usersubs}});
			else
				res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
		});
	}else{
		res.json({meta:{code:404,error_type:'missing parameter',error_description:'usersubsid not set : {usersubs:{_id:XXXX}}'}});
	}		
};


/*********************************************
*SUBSCRIBE TO A TAG (or YAKCAT)
*ADD, DELETE and LIST user's subscribtions to user's feed
**********************************************/
exports.list_subs_tag = function (req, res) {
	var User = db.model('User');
	User.findOne({'_id': res.locals.user._id},{tagsubs:1}, function(err,docs){
		if(!err)
				res.json({meta:{code:200},data:docs});
			else
				res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
	});
	
}

// need to support multi tag 
exports.add_subs_tag = function (req, res) {
	var User = db.model('User');
	var tagsubs = req.body.tagsubs;
	if(tagsubs){		
		User.update({_id:res.locals.user._id},{$push:{"tagsubs":tagsubs}}, function(err,docs){			
			if(!err)
				res.json({meta:{code:200},data:docs});
			else
				res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
		});
	}else
		res.json({meta:{code:404,error_type:'missing parameter',error_description:'tagsubs not set: tagsubs=string'}});
};

exports.del_subs_tag = function (req, res) {
	var User = db.model('User');
	var usersubs = JSON.parse(req.body.usersubs)._id;
	console.log(usersubs);
	if(usersubs){
		User.update({_id:res.locals.user._id},{$pull:{usersubs:{_id:usersubs}}}, function(err,docs){
			if(!err)
				res.json({meta:{code:200},data:{_id:usersubs}});
			else
				res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
		});
	}else{
		res.json({meta:{code:404,error_type:'missing parameter',error_description:'usersubsid not set : {usersubs:{_id:XXXX}}'}});
	}		
};

/*******
* USER *
********/
exports.get_users_details = function (req, res) {
	var User = db.model('User');
	User.apiFindById(res.locals.user._id,function(err, docs){
		if(!err){
			if(typeof(docs.thumb)== 'undefined')
				docs.thumb = "/static/images/no-user.png";
			res.json({meta:{code:200},data:docs});
		}
		else
			res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
	});
}
exports.get_users_feed = function (req, res) {
	var Info = db.model('Info');
	
	Info.findByUser(req.params.userid,req.params.count,function(err, docs){
		if(err)
			throw err;
		else{
			res.json(docs);
		}
	
	});
}

exports.usersearch = function (req, res) {
	var User = db.model('User');
	User.search(req.params.string,100,function (err, docs){
	var docsConcat = new Array();
	docs.forEach(function(o){
		var tmp = new Object();
		//tmp.userdetails="<img width=\"24\" height=\"24\" class=\"size100 img-rounded\" src=\"/uploads/pictures/24_24/"+o['thumb']+"\"  />"+o['name']+" <span class=\"autocompleteScreenName\"> @"+o['login']+"</span>";
		tmp.userdetails=o['name']+" (@"+o['login']+")";
		tmp.name =o['name'];
		tmp.login =o['login'];
		tmp._id =o['_id'];
		tmp.thumb =o['thumb'];
		docsConcat.push(tmp);
	});
	res.json({
		users: docsConcat
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
		res.render('api/login',{redirect_uri:params.redirect_uri,client_name:docs.name,client_id:docs._id,response_type:params.response_type});
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
		//console.log(docs);
		if(req.body.redirect_uri.substring(0,6) == 'http://')
			var uri = req.body.redirect_uri.substring(7,req.body.redirect_uri.length);
		else
			var uri = req.body.redirect_uri;
		var url_tmp = req.body.redirect_uri.split('/');	
		//console.log(url_tmp[0]+"/" +"!="+ docs.link);
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
						User.update({_id:user._id},{$set:{apiCode:code,apiCodeCreationDate:now}}, function(err,docs){
							if(err)
								throw err;
							else{
								if(req.body.redirect_uri.substring(0,6)=='http://')
									var redir = req.body.redirect_uri.substring(7,req.body.redirect_uri.length);
								else
									var redir = req.body.redirect_uri;
								
								if(req.body.response_type == 'token'){
									var tokenObject = User.createApiToken(code,req.body.redirect_uri,conf,function(tokenObject){
										if(tokenObject.access_token)
											res.redirect('http://'+redir+"?access_token="+tokenObject.access_token+"&id="+tokenObject.user.id);
										else
											res.redirect('http://'+redir+"?error="+JSON.parms(tokenObject));
									});
								}else if(req.body.response_type == 'code'){
									res.redirect('http://'+redir+"?code="+code);
								}else{
									var error = {error:'response_type must be either code or token'};
									res.redirect('http://'+redir+"?error="+JSON.parms(error));
								}
									

							}
						});
						
					}else{
						var error = {"error":"access_denied","error_reason": "Login failed","error_description":"Wrong login or password"};
						res.redirect('http://'+redir+"?error="+JSON.parms(error));
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
	
	
	if(params.client_id && params.client_secret && params.grant_type && params.redirect_uri && params.code ){
		var Client = db.model('Client');
		Client.findOne({_id:params.client_id,secret:params.client_secret,status:1},{},function (err, docs){
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
					
					var tokenObject = User.createApiToken(params.code,params.redirect_uri,conf,function(tokenObject){
						if(tokenObject.access_token)
							res.json(tokenObject)
						else
							res.redirect('http://'+params.redirect_uri+"?error="+JSON.parms(tokenObject));
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