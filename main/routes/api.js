/*
 * Serve JSON
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

exports.feeds = function (req, res) {
	var Info = db.model('Info');
	Info.findAllByPage(function (err, docs){
	  res.json({
		info: docs
	  });
	}, req.query["skip"], req.query["limit"], req.query["yaktype"], req.query["_id"], req.query["loadmore"], req.query["what"], req.query["where"], req.query["depuis"], req.query["cattype"]); 
};

exports.afeed = function (req, res) {
	var Info = db.model('Info');
	Info.findAllByID(function (err, docs){
	  res.json({
		info: docs
	  });
	}, req.query["id"]); 
};

exports.geoalerts = function (req, res) {
	var Info = db.model('Info');
	var usersubs= res.locals.user.usersubs;
	var tagsubs= res.locals.user.tagsubs;
	
	Info.findAllGeoAlert(req.params.x1,req.params.y1,req.params.x2,req.params.y2,req.params.heat,req.params.str,usersubs,tagsubs,function (err, docs){
		res.json({info: docs});
	}); 
};
exports.geoinfos = function (req, res) {
	var Info = db.model('Info');
	var type = [];
	//console.log(req.params);
	type = req.params.type.split(',');
	
	Info.findAllGeo(req.params.x1,req.params.y1,req.params.x2,req.params.y2,req.params.from,type,req.params.str,function (err, docs){
	  
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
	var favplaceArray = eval(req.body.place);
	if(favplaceArray.length > 0){
		var pointArray = favplaceArray.map(function(item){ return new Point(item);});		
		User.update({_id:res.locals.user._id},{$pushAll:{"favplace":pointArray}}, function(err,docs){			
			if(!err)
				res.json({meta:{code:200},data:pointArray});
			else
				res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
		});
	}else
		res.json({meta:{code:404,error_type:'missing parameter',error_description:'place not set'}});
};

exports.put_favplace = function (req, res) {
	var User = db.model('User');
	var Point = db.model('Point');
	var favplaceArray = eval(req.body.place);
	if(favplaceArray.length > 0){
		var pointArray = favplaceArray.map(function(item){ return new Point(item);});		
		User.update({_id:res.locals.user._id},{$set:{"favplace":pointArray}}, function(err,docs){			
			if(!err)
				res.json({meta:{code:200},data:pointArray});
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
	var usersubsIdArrayStr = eval(req.body.usersubs);
	var usersubsIdArray = usersubsIdArrayStr.map(function(item) { return item['_id'] });
	if(usersubsIdArrayStr){
		var usersubsArray = new Array();
		User.findByIds(usersubsIdArray,function(err,users){
			if(users.length>0){
				users.map(function(item){return {_id:item._id,name:item.name,login:item.login,userdetails:item.name+' ( @'+item.login+' )'}});
				User.update({_id:res.locals.user._id},{$pushAll:{"usersubs":users}}, function(err,docs){			
					if(!err)
						res.json({meta:{code:200},data:docs});
					else
						res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
				});
			}else
				res.json({meta:{code:404,error_type:'missing parameter',error_description:' not user with this id !'}});
		});	
	}else
		res.json({meta:{code:404,error_type:'missing parameter',error_description:'usersubsid not set: {usersubs:[{_id:string}{_id:string}{_id:string}]}'}});
};


exports.put_subs_user = function (req, res) {
	var User = db.model('User');
	var usersubsIdArrayStr = eval(req.body.usersubs);
	var usersubsIdArray = usersubsIdArrayStr.map(function(item) { return item['_id'] });
	if(usersubsIdArrayStr){
		User.findByIds(usersubsIdArray,function(err,users){
			if(users.length>0){
				users.map(function(item){return {_id:item._id,name:item.name,login:item.login,userdetails:item.name+' ( @'+item.login+' )'}});
				User.update({_id:res.locals.user._id},{$set:{"usersubs":users}}, function(err,docs){			
					if(!err)
						res.json({meta:{code:200},data:docs});
					else
						res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
				});
			}else
				res.json({meta:{code:404,error_type:'missing parameter',error_description:' not user with this id !'}});
		});	
	}else
		res.json({meta:{code:404,error_type:'missing parameter',error_description:'usersubsid not set: {usersubs:[{_id:string}{_id:string}{_id:string}]}'}});
};
exports.del_subs_user = function (req, res) {
	var User = db.model('User');
	var usersubs = JSON.parse(req.body.usersubs)._id;
	//console.log(usersubs);
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
	
	if(req.body.tagsubs){
		var tagsubs = eval(req.body.tagsubs).map(function(item){return item.replace(/[^\wàáâãäåçèéêëìíîïðòóôõöùúûüýÿ]/gi, '');});
		User.update({_id:res.locals.user._id},{$pushAll:{"tagsubs":tagsubs}}, function(err,docs){			
			if(!err)
				res.json({meta:{code:200},data:docs});
			else
				res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
		});
	}else
		res.json({meta:{code:404,error_type:'missing parameter',error_description:'tagsubs not set: tagsubs=string'}});
};


exports.put_subs_tag = function (req, res) {
	var User = db.model('User');
	
	if(req.body.tagsubs){
		var tagsubs = eval(req.body.tagsubs).map(function(item){return item.replace(/[^\wàáâãäåçèéêëìíîïðòóôõöùúûüýÿ]/gi, '');});
		User.update({_id:res.locals.user._id},{$set:{"tagsubs":tagsubs}}, function(err,docs){			
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
	var tagsubs = req.body.tagsubs;
	//console.log(tagsubs);
	if(tagsubs){
		User.update({_id:res.locals.user._id},{$pull:{tagsubs:tagsubs}}, function(err,docs){
			if(!err)
				res.json({meta:{code:200},data:tagsubs});
			else
				res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
		});
	}else{
		res.json({meta:{code:404,error_type:'missing parameter',error_description:'tagsubs not set. tagsubs=string }'}});
	}		
};

/*******
* USER *
********/

exports.put_user_details = function (req, res) {
	var User = db.model('User');
	if(typeof(req.body.user) != 'undefined'){
		var theuser = JSON.parse(req.body.user);	
	
		if( typeof(theuser._id) != 'undefined' )
			theuserid = theuser._id;
		
		if(theuserid){
		
			var now = new Date();
			
			// NAME
			if(typeof(theuser.name) != 'undefined' && theuser.name != ''){
			
				User.update({_id:theuserid},{$set:{name:theuser.name,lastModifDate:now}}, function(err,docs){
					if(err)
						res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
				});
			}
			// MAIL	
			if(typeof(theuser.mail) != 'undefined' && theuser.mail != ''){
				User.update({_id:theuserid},{$set:{mail:theuser.mail,lastModifDate:now}}, function(err,docs){
					if(err)
						res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
				});
			}
			
			// THUMB
			var userThumb = new Object();
			if(typeof(req.files.picture) != 'undefined' && req.files.picture.size > 0 && req.files.picture.size < 1048576*5){
				var drawTool = require('../mylib/drawlib.js');
				var size = [{"width":128,"height":128}];
				userThumb = drawTool.StoreImg(req.files.picture,size,conf);
				
				if(userThumb.err == 0 ){
					User.update({_id:theuserid},{$set:{thumb:userThumb.name,lastModifDate:now}}, function(err,docs){
						if(err)
							res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
					});
				}else{
					error = {"error":"Post failed","error_reason": "Image upload failed","error_description":"image should be jpeg and less than 5M"};
					res.json({error:error});
				}
			}
			
			// TAGS
			if(typeof(theuser.tag) != 'undefined' && theuser.tag.length > 0){
				User.update({_id:theuserid},{$set:{tag:theuser.tag,lastModifDate:now}}, function(err,docs){
					if(err)
						res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
				});
			}
			
			// LOCATION @todo : do it for each prop of the object
			if(typeof(theuser.location) != 'undefined' && typeof(theuser.location.lat) != 'undefined' && typeof(theuser.location.lng) != 'undefined'){
				User.update({_id:theuserid},{$set:{location:theuser.location,lastModifDate:now}}, function(err,docs){
					if(err)
						res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
				});
			}
			
			// FORMATTED_ADDRESS
			if(typeof(theuser.formatted_address) != 'undefined' && theuser.formatted_address != ''){
				User.update({_id:theuserid},{$set:{formatted_address:theuser.formatted_address,lastModifDate:now}}, function(err,docs){
					if(err)
						res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
				});
			}
			
			// ADDRESS
			if(typeof(theuser.address) != 'undefined' ){
				User.update({_id:theuserid},{$set:{address:theuser.address,lastModifDate:now}}, function(err,docs){
					if(err)
						res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
				});
			}
			
			// WEBSITE
			if(typeof(theuser.web) != 'undefined' ){
				User.update({_id:theuserid},{$set:{web:theuser.web,lastModifDate:now}}, function(err,docs){
					if(err)
						res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
				});
			}
			
			// BIO
			if(typeof(theuser.bio) != 'undefined' ){
				User.update({_id:theuserid},{$set:{bio:theuser.bio,lastModifDate:now}}, function(err,docs){
					if(err)
						res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
				});
			}
			
		}else{
			error = {"error":"Update failed","error_reason": "Missing paramater","error_description":"user._id is empty"};
			res.json({error:error});
		}
		
	res.json({user:{_id:theuserid}});
	
	}else{
		error = {"error":"Update failed","error_reason": "Missing paramater","error_description":"user is not set, should be user = {title:string, content:string, yakcat:['id1xxxx','id2xxxx'], yaktype:int, freetag:[string,string], pubdate:int, userid:{_id:string}} "};
		res.json({error:error});
	}

}

exports.get_user_details = function (req, res) {
	var User = db.model('User');
	User.PublicProfileFindById(req.params.userid,function(err, docs){
		if(!err){
			docs.thumb = conf.fronturl+"/pictures/128_128/"+docs.thumb;
			res.json({meta:{code:200},data:docs});
		}
		else
			res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
	});
}

/*****************************
USER FEED : POST , PUT DELETE, GET infos
******************************/

exports.get_user_feed = function (req, res) {
	var Info = db.model('Info');
	var count =(typeof(req.query.count) != 'undefined') ? req.query.count : 10;
	Info.findByUser(req.params.userid,count,function(err, docs){
		if(!err){
			res.json({meta:{code:200},data:docs});
		}
		else
			res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
	
	});
}

exports.del_user_feed = function (req, res) {
	var Info = db.model('Info');
	
		
		if(typeof(req.body.info) != 'undefined'){
			var info = JSON.parse(req.body.info);
			var theinfoid = info._id;
			Info.update({_id:theinfoid,user:res.locals.user._id},{$set:{status:3}}, function(err,docs){
				if(!err)
					if(docs)
						res.json({meta:{code:200},data:docs});
					else
						res.json({meta:{code:404,error_type:'operation failed',error_description:"you don't own any info with this id"}});
				else
					res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
			});
		}else{
			res.json({meta:{code:404,error_type:'missing parameter',error_description:'info not set. info = {_id:string} }'}});
		}
}

exports.add_user_feed = function (req, res) {
	var Info = db.model('Info');
	var Place = db.model('Place');
	var Tag = db.model('Tag');
	var Yakcat = db.model('Yakcat');
	var info = new Info();
	var place = new Place();
	var tag = new Tag();
	var error = {};
	
	// var logger = require("../mylib/logger");
	// logger.logthis(req.body,'log.txt',4);
	
	// we need a title, a placeid
	if(typeof(req.body.info) != 'undefined'){
		var theinfo = JSON.parse(req.body.info);	
		var theplaceid = '';
		
		if( typeof(theinfo.placeid) != 'undefined' )
			if(typeof(theinfo.placeid._id) != 'undefined')
				theplaceid = theinfo.placeid._id;
		
		if(theplaceid && typeof(theinfo.title) != 'undefined' && theinfo.title != ''){
			var yaktypeAccepted = [1,2,3,4];
			if(yaktypeAccepted.indexOf(theinfo.yaktype)>0)
				theYakType = theinfo.yaktype; 
			else
				theYakType = 4; // by default : DISCUSSION
			
			var infoThumb = new Object();
			if(typeof(req.files.picture) != 'undefined' && req.files.picture.size && req.files.picture.size < 1048576*5){
				var drawTool = require('../mylib/drawlib.js');
				var size = [{"width":120,"height":90},{"width":512,"height":0}];
				infoThumb = drawTool.StoreImg(req.files.picture,size,conf);
			}else
				infoThumb.err = 0;

			if(infoThumb.err == 0 ){
				Place.findById(theplaceid,function(err,theplace){
					if(theplace){
						var yakCatIds = new Array();
						var yakCatNames = new Array(); 
						// we introduce a redondancy between types and yakcat to be able to forget the type in the future
						if(theYakType == 4){ // if type =4 ( discussion : by default push it in YAKCAT discussion )
							yakCatIds.push(mongoose.Types.ObjectId("5092390bfa9a95f40c000000")); 
							yakCatNames.push('Discussion');
						}
						if(theYakType == 2){ // if type =2 ( agenda : by default push it in yakCat agenda )
							yakCatIds.push(mongoose.Types.ObjectId("50923b9afa9a95d409000000")); 
							yakCatNames.push('Agenda');
						}
						if(theYakType == 3){ // if type =3 ( infos pratiques : by default push it in yakCat infos pratiques )
							yakCatIds.push(mongoose.Types.ObjectId("50923b9afa9a95d409000001")); 
							yakCatNames.push('InfosPratiques');
						}
						Yakcat.findByIds(theinfo.yakcat,function(err,theyakcats){
							if(theyakcats){
								theyakcats.forEach(function(theyakcat){
									if(yakCatNames.indexOf(theyakcat.title)){
										yakCatIds.push(mongoose.Types.ObjectId(theyakcat._id.toString()));
										yakCatNames.push(theyakcat.title);
									}
									info.yakCat = yakCatIds;
									info.yakCatName = yakCatNames;
								});
							}else{
								info.yakCat = yakCatIds;
								info.yakCatName = yakCatNames;
							}
						});	
							
							info.title = theinfo.title;
							info.content = theinfo.content;
							
							// NOTE : in the query below, order is important : in DB we have lat, lng but need to insert in reverse order : lng,lat  (=> bug mongoose ???)
							info.location = {lng:parseFloat(theplace.location.lng),lat:parseFloat(theplace.location.lat)};
							info.address = theplace.formatted_address;
							
							info.user = mongoose.Types.ObjectId(res.locals.user._id.toString());
							
							info.origin = "@"+res.locals.user.name;
							
							var now = new Date();
							info.creationDate = now;
							info.lastModifDate = now;
							if(typeof(theinfo.pubdate) != 'undefined'){
								info.pubDate = new Date(theinfo.pubdate*1000);
							}else
								info.pubDate = now;
							
							var D = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
							var DTS = D.getTime() / 1000 + (3 * 60 * 60 * 24);
							D.setTime(DTS*1000); 
							info.dateEndPrint = D;
							//console.log(info);
							info.print = 1;
							info.status = 1;
							info.access = 1;
							info.yakType = Math.floor(theYakType);
							info.thumb = infoThumb.name;
							info.licence = 'Yakwala';
							info.heat = 80;
							info.freeTag = theinfo.freetag;
							info.placeId = theplaceid;
							info.save(function (err,thenewwinfo) {
							
								if (!err){ 
									console.log('Success!');
									res.json({info:thenewwinfo});
								}else{
									console.log(err);
									error = {"error":"Post failed","error_reason": "Save in db failled","error_description":err.toString()};
									res.json({error:error});
								} 
							});
							
							// update the tag collection
							if(theinfo.freetag.length > 0){
								theinfo.freetag.forEach(function(freeTag){
									Tag.findOne({'title':freeTag},function(err,thetag){
										if(thetag == null){
											tag.title=freeTag;
											tag.save();
										}
										else{
											Tag.update({_id: thetag._id}, {lastUsageDate:now}, {upsert: false}, function(err){if (err) console.log(err);});						
										}
									});
								
								});
							}
					}else{
						error = {"error":"Post failed","error_reason": "Place not found","error_description":"placeid does not correspond to anything"};
						res.json({error:error});
					}				
				});
			}else{
				error = {"error":"Post failed","error_reason": "Image upload failed","error_description":"image should be jpeg and less than 5M"};
				res.json({error:error});
			}	
			
		}else{
			if(!theinfo.title)
				error = {"error":"Post failed","error_reason": "Missing paramater","error_description":"title is empty"};
			if(!theplaceid)
				error = {"error":"Post failed","error_reason": "Missing paramater","error_description":"placeid is empty should be {_id:'XXXX'}"};
			res.json({error:error});
		}
	}else{
		error = {"error":"Post failed","error_reason": "Missing paramater","error_description":"info is not set, should be info = {title:string, content:string, yakcat:['id1xxxx','id2xxxx'], yaktype:int, freetag:[string,string], pubdate:int, placeid:{_id:string}} "};
		res.json({error:error});
	}

	
	
}

exports.put_user_feed = function (req, res) {
	var Info = db.model('Info');
	var Place = db.model('Place');
	var Tag = db.model('Tag');
	var Yakcat = db.model('Yakcat');
	var info = new Info();
	var place = new Place();
	var tag = new Tag();
	var error = {};
	var theYakType = 4;
	
	if(typeof(req.body.info) != 'undefined'){
		var theinfo = JSON.parse(req.body.info);	
	
		if( typeof(theinfo._id) != 'undefined' )
			theinfoid = theinfo._id;
		
		if(theinfoid){
		
			var now = new Date();
			
			// TITLE
			if(typeof(theinfo.title) != 'undefined' && theinfo.title != ''){
				Info.update({_id:theinfoid,user:res.locals.user._id},{$set:{title:theinfo.title,lastModifDate:now}}, function(err,docs){
					if(err)
						res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
				});
			}
			// CONTENT	
			if(typeof(theinfo.content) != 'undefined' && theinfo.content != ''){
				Info.update({_id:theinfoid,user:res.locals.user._id},{$set:{content:theinfo.content,lastModifDate:now}}, function(err,docs){
					if(err)
						res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
				});
			}
			// YAKTYPE
			var yaktypeAccepted = [1,2,3,4];
			if(yaktypeAccepted.indexOf(theinfo.yaktype)>0){
				Info.update({_id:theinfoid,user:res.locals.user._id},{$set:{yaktype:Math.floor(theinfo.yaktype),lastModifDate:now}}, function(err,docs){
					if(err)
						res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
				});
			}else
				theYakType = 4; // by default : DISCUSSION
				
			// THUMB
			var infoThumb = new Object();
			
			if(typeof(req.files.picture) != 'undefined' && req.files.picture.size > 0 && req.files.picture.size < 1048576*5){
				var drawTool = require('../mylib/drawlib.js');
				var size = [{"width":120,"height":90},{"width":512,"height":0}];
				infoThumb = drawTool.StoreImg(req.files.picture,size,conf);
				
				if(infoThumb.err == 0 ){
					Info.update({_id:theinfoid,user:res.locals.user._id},{$set:{thumb:infoThumb.name,lastModifDate:now}}, function(err,docs){
						if(err)
							res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
					});
				}else{
					error = {"error":"Post failed","error_reason": "Image upload failed","error_description":"image should be jpeg and less than 5M"};
					res.json({error:error});
				}
			}
			// DATES 
			
			if(typeof(theinfo.pubdate) != 'undefined' && theinfo.pubdate > 0){
				Info.update({_id:theinfoid,user:res.locals.user._id},{$set:{dateEndPrint:new Date(theinfo.pubdate*1000),lastModifDate:now}}, function(err,docs){
					if(err)
						res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
				});
			}
			// TAGS
			if(typeof(theinfo.freetag) != 'undefined' && theinfo.freetag.length > 0){
				Info.update({_id:theinfoid,user:res.locals.user._id},{$set:{freeTag:theinfo.freetag,lastModifDate:now}}, function(err,docs){
					if(err)
						res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
				});
				
				theinfo.freetag.forEach(function(freeTag){
					Tag.findOne({'title':freeTag},function(err,thetag){
						if(thetag == null){
							tag.title=freeTag;
							tag.save();
						}
						else{
							Tag.update({_id: thetag._id}, {lastUsageDate:now}, {upsert: false}, function(err){if (err) console.log(err);});						
						}
					});				
				});
			}
			
			
			
			
			
			if(typeof(theinfo.yakcat) != 'undefined' && theinfo.yakcat.length > 0){
				var yakCatIds = new Array();
				var yakCatNames = new Array(); 
			
				// we introduce a redondancy between types and yakcat to be able to forget the type in the future
				if(theYakType == 4){ // if type =4 ( discussion : by default push it in YAKCAT discussion )
					yakCatIds.push(mongoose.Types.ObjectId("5092390bfa9a95f40c000000")); 
					yakCatNames.push('Discussion');
				}
				if(theYakType == 2){ // if type =2 ( agenda : by default push it in yakCat agenda )
					yakCatIds.push(mongoose.Types.ObjectId("50923b9afa9a95d409000000")); 
					yakCatNames.push('Agenda');
				}
				if(theYakType == 3){ // if type =3 ( infos pratiques : by default push it in yakCat infos pratiques )
					yakCatIds.push(mongoose.Types.ObjectId("50923b9afa9a95d409000001")); 
					yakCatNames.push('InfosPratiques');
				}
				
			
				Yakcat.findByIds(theinfo.yakcat,function(err,theyakcats){
					if(theyakcats){
						theyakcats.forEach(function(theyakcat){
							if(yakCatNames.indexOf(theyakcat.title)){
								yakCatIds.push(mongoose.Types.ObjectId(theyakcat._id.toString()));
								yakCatNames.push(theyakcat.title);
							}
						});
					}else{
						info.yakCat = yakCatIds;
						info.yakCatName = yakCatNames;
					}
					
					Info.update({_id:theinfoid,user:res.locals.user._id},{$set:{yakCat:yakCatIds,yakCatName:yakCatNames,lastModifDate:now}}, function(err,docs){
						if(err)
							res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
					});
				});	
			}
			
				

			
			// PLACE
			var theplaceid = '';	
			if( typeof(theinfo.placeid) != 'undefined' )
				if(typeof(theinfo.placeid._id) != 'undefined')
					theplaceid = theinfo.placeid._id;
					
			if(theplaceid){
				Place.findById(theplaceid,function(err,theplace){
					if(theplace){
						// NOTE : in the query below, order is important : in DB we have lat, lng but need to insert in reverse order : lng,lat  (=> bug mongoose ???)
						Info.update({_id:theinfoid,user:res.locals.user._id},{$set:{placeId:theplaceid,address:theplace.formatted_address,location:{lat:parseFloat(theplace.location.lat),lng:parseFloat(theplace.location.lng)},lastModifDate:now}}, function(err,docs){
						if(err)
							res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
					});	
						
						
					}else{
						error = {"error":"Update failed","error_reason": "Place not found","error_description":"placeid does not correspond to anything"};
						res.json({error:error});
					}				
				});
			}
		}else{
			error = {"error":"Update failed","error_reason": "Missing paramater","error_description":"info._id is empty"};
			res.json({error:error});
		}
		
	res.json({info:{_id:theinfoid}});
	
	}else{
		error = {"error":"Update failed","error_reason": "Missing paramater","error_description":"info is not set, should be info = {title:string, content:string, yakcat:['id1xxxx','id2xxxx'], yaktype:int, freetag:[string,string], pubdate:int, placeid:{_id:string}} "};
		res.json({error:error});
	}

	
	
}



/*****************************
PLACES : GET, POST , DELETE and UPDATE PLACE
******************************/

exports.get_place = function (req, res) {
	var Place = db.model('Place');
	if(typeof(req.query.place) != 'undefined'){
		var placeids = JSON.parse(req.query.place).map(function(item){return item._id;});
		//var placeids = JSON.parse(req.query.place);
		Place.findByIds(placeids,function(err, docs){
			if(!err)
				res.json({meta:{code:200},data:docs});
			else
				res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});		
		});
	}else{
			res.json({meta:{code:404,error_type:'missing parameter',error_description:'place not set. place should be an array of objects = [{_id:string}] }'}});
		}
}


exports.del_place = function (req, res) {
	var Place = db.model('Place');
	if(typeof(req.body.place) != 'undefined'){
		var placeid = JSON.parse(req.body.place)._id;
		
		Place.update({_id:placeid,user:res.locals.user._id},{$set:{status:3}}, function(err,docs){
			if(!err)
				if(docs)
					res.json({meta:{code:200},data:docs});
				else
					res.json({meta:{code:404,error_type:'operation failed',error_description:"you don't own any place with this id"}});
			else
				res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
		});
	}else{
		res.json({meta:{code:404,error_type:'missing parameter',error_description:'Place not set. info = {_id:string} }'}});
	}
}

exports.add_place = function (req, res) {
	var Place = db.model('Place');
	var Yakcat = db.model('Yakcat');
	var place = new Place();
	var error = {};
	
	// we need a title, a location, a formatted_address
	if(typeof(req.body.place) != 'undefined'){
		var theplace = JSON.parse(req.body.place);	
		
		if(typeof(theplace.title) != 'undefined' && theplace.title != '' 
		&& typeof(theplace.location) != 'undefined' && theplace.location != '' 
		&& typeof(theplace.formatted_address) != 'undefined' && theplace.formatted_address != '' ){
			Place.findByNameNear(theplace.title,theplace.location,0.01,function(err,theplaceexisits){
				if(!theplaceexisits){
					var placeThumb = new Object();
					if(typeof(req.files.picture) != 'undefined' && req.files.picture.size && req.files.picture.size < 1048576*5){
						var drawTool = require('../mylib/drawlib.js');
						var size = [{"width":120,"height":90},{"width":512,"height":0}];
						placeThumb = drawTool.StoreImg(req.files.picture,size,conf);
					}else
						placeThumb.err = 0;

					if(placeThumb.err == 0 ){
						var yakCatIds = new Array();
						var yakCatNames = new Array(); 
						if(typeof(theplace.yakcat) != 'undefined'){
							Yakcat.findByIds(theplace.yakcat,function(err,theyakcats){
								if(theyakcats){
									theyakcats.forEach(function(theyakcat){
										if(yakCatNames.indexOf(theyakcat.title)){
											yakCatIds.push(mongoose.Types.ObjectId(theyakcat._id.toString()));
											yakCatNames.push(theyakcat.title);
										}
										place.yakCat = yakCatIds;
										place.yakCatName = yakCatNames;
									});
								}else{
									place.yakCat = yakCatIds;
									place.yakCatName = yakCatNames;
								}
							});	
						}	
						place.title = theplace.title;
						place.content = theplace.content;
						
						// NOTE : in the query below, order is important : in DB we have lat, lng but need to insert in reverse order : lng,lat  (=> bug mongoose ???)
						place.location = {lng:parseFloat(theplace.location.lng),lat:parseFloat(theplace.location.lat)};
						place.formatted_address = theplace.formatted_address;
						
						place.user = mongoose.Types.ObjectId(res.locals.user._id.toString());
						
						place.origin = res.locals.user.name;
						
						var now = new Date();
						place.creationDate = now;
						place.lastModifDate = now;
						
						place.print = 1;
						place.status = 1;
						place.access = 1;
						place.thumb = placeThumb.name;
						place.licence = 'Yakwala';
						place.heat = 80;
						place.freeTag = theplace.freetag;
						
						if(typeof(theplace.contact) != 'undefined')
							place.contact = theplace.contact;
						
						place.save(function (err,thenewplace) {
						
							if (!err){ 
								console.log('Success!');
								res.json({place:thenewplace});
							}else{
								console.log(err);
								error = {"error":"Post failed","error_reason": "Save in db failled","error_description":err.toString()};
								res.json({error:error});
							} 
						});
						
							
									
						
					}else{
						error = {"error":"Post failed","error_reason": "Image upload failed","error_description":"image should be jpeg and less than 5M"};
						res.json({error:error});
					}	
				}else{
					res.json({place:theplaceexisits});
				}
			});
		}else{
			if(!theplace.title)
				error = {"error":"Post failed","error_reason": "Missing paramater","error_description":"title is empty"};
			if(!theplace.location)
				error = {"error":"Post failed","error_reason": "Missing paramater","error_description":"location is empty should be {'lat':float,'lng':float}"};
			if(!theplace.formatted_address)
				error = {"error":"Post failed","error_reason": "Missing paramater","error_description":"formatted_address is empty should be a string"};
			
			res.json({error:error});
		}
	}else{
		error = {"error":"Post failed","error_reason": "Missing paramater","error_description":"place is not set, should be place = {title:string, location:{lat:float,lng:float}, formatted_address:string} "};
		res.json({error:error});
	}

	
	
}

exports.put_place = function (req, res) {
	var Place = db.model('Place');
	var Yakcat = db.model('Yakcat');
	var place = new Place();
	var error = {};
	
	if(typeof(req.body.place) != 'undefined'){
		var theplace = JSON.parse(req.body.place);	
	
		if( typeof(theplace._id) != 'undefined' )
			theplaceid = theplace._id;
		
		if(theplaceid){
		
			var now = new Date();
			
			// TITLE
			if(typeof(theplace.title) != 'undefined' && theplace.title != ''){
				Place.update({_id:theplaceid,user:res.locals.user._id},{$set:{title:theplace.title,lastModifDate:now}}, function(err,docs){
					if(err)
						res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
				});
			}
			// CONTENT	
			if(typeof(theplace.content) != 'undefined' && theplace.content != ''){
				Place.update({_id:theplaceid,user:res.locals.user._id},{$set:{content:theplace.content,lastModifDate:now}}, function(err,docs){
					if(err)
						res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
				});
			}
			
			// THUMB
			var placeThumb = new Object();
			if(typeof(req.files.picture) != 'undefined' && req.files.picture.size > 0 && req.files.picture.size < 1048576*5){
				var drawTool = require('../mylib/drawlib.js');
				var size = [{"width":120,"height":90},{"width":512,"height":0}];
				placeThumb = drawTool.StoreImg(req.files.picture,size,conf);
				
				if(placeThumb.err == 0 ){
					Place.update({_id:theplaceid,user:res.locals.user._id},{$set:{thumb:placeThumb.name,lastModifDate:now}}, function(err,docs){
						if(err)
							res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
					});
				}else{
					error = {"error":"Post failed","error_reason": "Image upload failed","error_description":"image should be jpeg and less than 5M"};
					res.json({error:error});
				}
			}
			
			// TAGS
			if(typeof(theplace.freetag) != 'undefined' && theplace.freetag.length > 0){
				Place.update({_id:theplaceid,user:res.locals.user._id},{$set:{freeTag:theplace.freetag,lastModifDate:now}}, function(err,docs){
					if(err)
						res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
				});
			}
			
			// YAKCAT
			if(typeof(theplace.yakcat) != 'undefined' && theplace.yakcat.length > 0){
				var yakcatidArray = theplace.yakcat.map(function(item){ return mongoose.Types.ObjectId(item);});
				Place.update({_id:theplaceid,user:res.locals.user._id},{$set:{yakCat:yakcatidArray,lastModifDate:now}}, function(err,docs){
					if(err)
						res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
				});
			}
			
			// OUTGOING LINK
			if(typeof(theplace.outgoinglink) != 'undefined' && theplace.outgoinglink != ''){
				Place.update({_id:theplaceid,user:res.locals.user._id},{$set:{outGoingLink:theplace.outgoinglink,lastModifDate:now}}, function(err,docs){
					if(err)
						res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
				});
			}
			// LOCATION @todo : do it for each prop of the object
			if(typeof(theplace.location) != 'undefined' && typeof(theplace.location.lat) != 'undefined' && typeof(theplace.location.lng) != 'undefined'){
				Place.update({_id:theplaceid,user:res.locals.user._id},{$set:{location:theplace.location,lastModifDate:now}}, function(err,docs){
					if(err)
						res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
				});
			}
			
			// FORMATTED_ADDRESS
			if(typeof(theplace.formatted_address) != 'undefined' && theplace.formatted_address != ''){
				Place.update({_id:theplaceid,user:res.locals.user._id},{$set:{formatted_address:theplace.formatted_address,lastModifDate:now}}, function(err,docs){
					if(err)
						res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
				});
			}
			
			// ADDRESS
			if(typeof(theplace.address) != 'undefined' ){
				Place.update({_id:theplaceid,user:res.locals.user._id},{$set:{address:theplace.address,lastModifDate:now}}, function(err,docs){
					if(err)
						res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
				});
			}
			// CONTACT @todo : do it for each prop of the object
			if(typeof(theplace.contact) != 'undefined' ){
				Place.update({_id:theplaceid,user:res.locals.user._id},{$set:{contact:theplace.contact,lastModifDate:now}}, function(err,docs){
					if(err)
						res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
				});
			}
			
		}else{
			error = {"error":"Update failed","error_reason": "Missing paramater","error_description":"place._id is empty"};
			res.json({error:error});
		}
		
	res.json({place:{_id:theplaceid}});
	
	}else{
		error = {"error":"Update failed","error_reason": "Missing paramater","error_description":"place is not set, should be place = {title:string, content:string, yakcat:['id1xxxx','id2xxxx'], yaktype:int, freetag:[string,string], pubdate:int, placeid:{_id:string}} "};
		res.json({error:error});
	}

	
	
}


/*****************************
SEARCH : users, infos, cats, places
******************************/
exports.user_search = function (req, res) {
	var User = db.model('User');
	var count = (typeof(req.query.count) != 'undefined' && req.query.count > 0) ? req.query.count : 100;		
	User.search(req.params.string,count,function (err, docs){
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

exports.place_search = function (req, res) {
	var Place = db.model('Place');
	var count = (typeof(req.query.count) != 'undefined' && req.query.count > 0) ? req.query.count : 100;		
	Place.search(req.params.string,count,null,null,function (err, docs){
		if(docs)
			docs.map(function(item){return {_id:item._id,title:item.title,formatted_address:item.formatted_address};});
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

/*****************************
LIST : users, infos, cats, places
******************************/

exports.places = function (req, res) {
	var Place = db.model('Place');
	
	Place.findAll(function (err, docs){
	  res.json({
		places: docs
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
				//console.log(url_tmp[0]+"/" +"!="+ docs.link);
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