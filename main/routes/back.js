/*
 * GET home page.
 */

exports.db = function(conf){
	mongoose = require('mongoose'), Schema = mongoose.Schema;
	//mongoose.set('debug', true);
	db = mongoose.connect('mongodb://localhost/'+conf.dbname);
	
};

exports.back_default = function(req, res){
  	res.render('dashboard/index');
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


exports.getFileSample = function(req,res){
	var output = new Array();
	var fs = require('fs');
	switch(req.body.type){
		case 'CSV':
			var csv = require('csv-stream');
			var options = {delimiter : ';', endLine : '\n', escapeChar : '"', enclosedChar : '"',encoding:'utf8'}
			var csvStream = csv.createStream(options);
			if(req.body.isLink == 1 ){
				var request = require('request');
				var thepath = req.body.file;
				var data = request(thepath).pipe(csvStream);
			}else{
				var thepath = conf.uploadsDir+'files/'+req.body.file;
				var data = fs.createReadStream(thepath).pipe(csvStream);
			}
			data.on('error',function(err){
				res.json({code:400,error:'Erreur '+err});
			})
			.on('data',function(data){
				//console.log(data);
				output.push(data);
			})
			.on('end',function(){
				res.json({code:200,fileSample:JSON.stringify(output.slice(0,9))});	
			});
		break;
		case 'RSS':
			// var sax = require("sax");
			// var strict = true; // set to false for html-mode
			// var options = {};
			// //var parser = sax.parser(strict);
			// var xmlKey = '';
			// var xmlVal = '';
			// var line = {};
			// var xmlStream = sax.createStream(strict,options);
			// if(req.body.isLink == 1 ){
			// 	var request = require('request');
			// 	var thepath = req.body.file;
			// 	var data = request(thepath).pipe(xmlStream);
			// }else{
			// 	var thepath = conf.uploadsDir+'files/'+req.body.file;
			// 	var data = fs.createReadStream(thepath).pipe(xmlStream);
			// }
			// data.on("error", function (e) {
			// 	// unhandled errors will throw, since this is a proper node
			// 	// event emitter.
			// 	console.error("error!", e)
			// 	// clear the error
			// 	this._parser.error = null
			// 	this._parser.resume()
			// })
			// .on("opentag", function (node) {
				
			// 	console.log('OPEN'+node.name);
			// 	if(node.name == 'item'){
			// 		output.push(line);
			// 		line = new Array();
			// 	}else
			// 		xmlKey = node.name
			// })
			// .on("text",function (t) {
			// 	xmlVal = t;
			// })
			// .on("closetag",function(tag){
			// 	console.log('CLOSE'+xmlKey);
			// 	if(xmlKey != 'item'){
			// 		line[xmlKey]=xmlVal;
			// 	}
					
			// })
			// .on('end',function(){
			// 	res.json({code:200,fileSample:JSON.stringify(output.slice(0,9))});	
			// });
			
			var itemKey = '';
			var itemVal = '';
			var line = {};
			var item = new Object();
			var output = [];
			var htmlparser = require("htmlparser2");
			var parser = new htmlparser.Parser({
				onopentag: function(name, attribs){
					console.log(name);
					if(name === "item")
						item = new Object();
					else
						itemKey = name;
				
				},
				ontext: function(text){
				//var S = require('string');	
				//itemVal = S(text).stripTags();
				itemVal = text;
				console.log("-->", text);
				},
				onclosetag: function(tagname){
					if(tagname == "item"){
						output.push(item);
						console.log("---------------");
					}else
						item[itemKey] = itemVal;
				}
			});

			if(req.body.isLink == 1 ){
				var request = require('request');
				var thepath = req.body.file;
				var data = request(thepath,function(error, response, data){
					parser.write(data.toString('utf8'));
					parser.end();
					res.json({code:200,fileSample:JSON.stringify(output.slice(0,9))});
				});
			}else{
				var thepath = conf.uploadsDir+'files/'+req.body.file;
				var data = fs.createReadStream(thepath);
				data.setEncoding('utf8');
				data.on('data',function(data){
					parser.write(data.toString('utf8'));
					parser.end();
					res.json({code:200,fileSample:JSON.stringify(output.slice(0,9))});
				});	
			}


			//parser.write(data.toString('utf8'));
			//parser.end();
			
					
				
			
		break;
		case 'JSON':
		break;
	}
	
	
}
exports.requiresLogin = function(req,res,next){
	
	if(req.session.user){
		var User = db.model('User');
		User.findById(req.session.user,function (err, theuser){
			if(theuser != undefined && theuser != null && theuser.type >= 10){
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



exports.countUnvalidatedInfos = function (req, res) {
	var Info = db.model('Info');
	Info.countUnvalidated(function (err, docs){
	  res.json({
		info: docs
	  });
	});
};

exports.countUnvalidatedUsers = function (req, res) {
	var User = db.model('User');
	User.countUnvalidated(function (err, docs){
	  res.json({
		info: docs
	  });
	});
};

exports.countUnvalidatedPlaces = function (req, res) {
	var Place = db.model('Place');
	Place.countUnvalidated(function (err, docs){
	  res.json({
		info: docs
	  });
	});
};
exports.countUnvalidatedCats = function (req, res) {
	var Yakcat = db.model('Yakcat');
	Yakcat.countUnvalidated(function (err, docs){
	  res.json({
		info: docs
	  });
	});
};


/******* 
#FEED
*******/
exports.feed_list = function(req, res){
	delete req.session.message;
	res.render('feed/index');
};

exports.feed_add = function(req, res){
	res.render('feed/add');
};

exports.findFeedByName = function (req, res) {
	var Feed = db.model('Feed');
   	Feed.findByName(req.params.name, function (err, thefeed){
   		res.json({
			feed: thefeed
		});
	});
};

exports.findFeedById = function (req, res) {
	var Feed = db.model('Feed');
   	Feed.findById(req.params.id, function (err, thefeed){
		res.json({
			feed: Feed.format(thefeed)
		});
	});
};

exports.gridFeeds = function (req, res) {
	var Feed = db.model('Feed');
    
    var sortProperties = [];
    if (req.params.sortBy) {
        sortProperties = req.params.sortBy.split(',');
    }

    var sortDirections = [];
    if (req.params.sortDirection) {
        sortDirections = req.params.sortDirection.split(',');
    }

   

	Feed.findGridFeeds(req.params.pageIndex,req.params.pageSize,
		req.params.searchTerm,sortProperties,sortDirections,
        req.params.status,req.params.type, function (err, feed){

			var data = {};
			var feedFormated = feed.map(function(item){
				return Feed.format(item);
			});
			console.log(feedFormated[0].thumb);
			console.log(feedFormated[0].thumbSmall);
			data['feed'] = feedFormated;
			data['pageIndex'] = req.params.pageIndex;
			data['pageSize'] = req.params.pageSize;
			data['count'] = feed.length;
			res.json(data);
			
		});
	};

exports.feed = function(req, res){

	var formMessage = new Array();
	delete req.session.message;
	var Feed = db.model('Feed');
	var Yakcat = db.model('Yakcat');
	var obj_id = req.body.objid;
	console.log(req.body);
	var feed = new Object();
	var now = new Date();
	feed.XLconnector = 'parser';

	feed.humanName = req.body.humanName;
	var strLib = require("string");
	feed.name = strLib(feed.humanName).slugify().s;
	if(req.body.linkSource == '' && req.body.source != '')
		feed.linkSource = req.body.source;
	else if(req.body.linkSource != '')
		feed.linkSource = req.body.linkSource;
	feed.yakCatId = req.body.yakCatIdsHidden.split(',');
	feed.yakCatName = req.body.yakCatNamesHidden.split(',');
	if(req.body.tagsHidden == '' && req.body.freetag != '')
		feed.tag = req.body.freetag.split(',');
	else if(req.body.tagsHidden != '')		
		feed.tag = req.body.tagsHidden.split(',');
	feed.defaultPlaceLocation = {lng:parseFloat(req.body.longitude),lat : parseFloat(req.body.latitude)};
	feed.defaultPlaceName = req.body.defaultPlaceName;
	feed.defaultPlaceSearchName = req.body.defaultPlaceSearchName;
	feed.defaultPrintFlag = req.body.defaultPrintFlag;
	feed.link = req.body.link;
	feed.licence = req.body.licence;
	feed.yakType = req.body.yakType;
	
	feed.feedType = req.body.feedType;
	feed.fileSource = req.body.fileSource.split(',');
	feed.linkSource = req.body.linkSource.split(',');
	feed.persistDays = req.body.persistDays;
	feed.description = req.body.description;
	feed.status = parseInt(req.body.status);
	feed.lastModifDate = now;

	feed.rootElement = req.body.rootElement;
	feed.lineToBegin = parseInt(req.body.lineToBegin);

	feed.parsingTemplate = {
		title: req.body.infoTitle,
		content: req.body.infoContent,
		address: req.body.infoAddress,
		latitude: req.body.infoLatitude,
		longitude: req.body.infoLongitude,
		outGoingLink: req.body.infoLink,
		thumb: req.body.infoThumb,
		yakCats: req.body.infoCat,
		freeTag: req.body.infoTag,
		place: req.body.infoPlace,
		eventDate: req.body.infoEventDate,
		pubDate: req.body.infoPubDate,
		telephone: req.body.infoTel,
		transportation: req.body.infoTransportation,
		opening: req.body.infoOpening,
		web: req.body.infoWeb,
		mail: req.body.infoMail
	};

	var feedThumb = new Object();
	if(req.files.picture.size && req.files.picture.size > 0 && req.files.picture.size < 1048576*5){
		var drawTool = require('../mylib/drawlib.js');
		var size = mainConf.imgSizeAvatar;
		var crypto = require('crypto');
		var destFile = crypto.createHash('md5').update(req.files.picture.name).digest("hex")+'.jpeg';
				
		for(i=0;i<size.length;i++){
			feedThumb = drawTool.StoreImg(req.files.picture,destFile,{w:size[i].width,h:size[i].height},conf);
		}
		feed.thumb = feedThumb.name;
	}
	else{
		feedThumb.err = 0;
	}
		
	
	

	console.log(feed);
	

	if(typeof obj_id != 'undefined' && obj_id != ''){
		var cond = {_id:obj_id};
	}else{
		feed.creationDate = now;
		var cond = {name:"anameimpossibletochoose007"};
	}
		

	Feed.update(cond,feed,{upsert:true},function (err){
		if (!err)
			formMessage.push("Flux sauvegardé.");
		else{
			formMessage.push("Erreur pendant la sauvegarde du flux !");
			console.log(err);
		}
		req.session.message = formMessage;
		res.redirect('feed/list')
	});

	

	
	
};

/******* 
#PLACE 
*******/
exports.place_add = function(req, res){
	res.render('place/add');
};

exports.place_list = function(req, res){
	delete req.session.message;
	res.render('place/index');
};

exports.place = function(req, res){

	var formMessage = new Array();
	delete req.session.message;
	var Place = db.model('Place');
	var Zone = db.model('Zone');
	var Yakcat = db.model('Yakcat');
	//mongoose.set('debug', true);
	var obj_id = req.body.objid;
	var edit = false;
	
	// we need a title, a location and a user
	if(req.body.placeInput && req.body.title && req.session.user)
	{
		Place.findById(obj_id, function (err, place)
		{
			if (err || place == null)
			{
				console.log("Place not found by id: creating a new place");
				edit = false;
				place = new Place();
			}
			else
			{
				console.log("Place found by id: updating");
				edit = true;
			}

			var placeThumb = new Object();
			if (req.files.picture) {
				if(req.files.picture.size && req.files.picture.size > 0 && req.files.picture.size < 1048576*5)
				{
					var drawTool = require('../mylib/drawlib.js');
					var size = [{"width":120,"height":90},{"width":512,"height":0}];
					placeThumb = drawTool.StoreImg(req.files.picture,size,conf);
					place.thumb = placeThumb.name;
				}
			}
			else
				placeThumb.err = 0;


			if(placeThumb.err == 0)
			{
				if(req.body.yakcatInput.length > 0)
				{
					var yak = eval('('+req.body.yakcatInput+')');
					var yakN = eval('('+req.body.yakcatNames+')');
					place.yakCat = yak;
					place.yakcatName = yakN;
				}
				place.title = req.body.title;
				place.content = req.body.content;

				// NOTE : in the query below, order is important : in DB we have lat, lng but need to insert in reverse order : lng,lat  (=> bug mongoose ???)
				place.formatted_address = JSON.parse(req.body.placeInput).title;
				place.location = {lng:parseFloat(req.body.longitude),lat:parseFloat(req.body.latitude)};

				if (!edit)
					place.creationDate = new Date();
				place.lastModifDate = new Date();
				place.origin = req.body.hiddenOrigin;
				place.outGoingLink = req.body.outgoinglink;

				place.status = req.body.status;

				place.access = 1;
				place.licence = req.body.licence;
				place.freeTag = req.body.freetag.split(',');

				var contact = {
						'tel' : req.body.tel,
						'mobile' : req.body.mobile,
						'mail' : req.body.mail,
						'transportation' : req.body.transportation,
						'web' : req.body.web,
						'opening' : req.body.opening,
						'closing' : req.body.closing,
						'special_opening' : req.body.special
					};

				place.contact = contact;

				Zone.findNear(place.location.lat, place.location.lng, function(err, zone)
				{
					if (!err)
					{
						//place.zone = zone[0]._id;
						place.zone = zone[0].num;
						// security against unidentified users
						if(req.session.user)
						{
							if (!edit)
								place.user = req.session.user._id;
							place.save(function (err)
							{
								if (!err)
								{
									if (place.status == 1)
										formMessage.push("Le lieu a été validé.");
									else if (place.status == 3)
										formMessage.push("Le lieu a été rejeté.");
									else
									{
										if (edit)
											formMessage.push("Le lieu a été modifié et est en attente de validation.");
										else
											formMessage.push("Le lieu a été ajouté et est en attente de validation.");
									}
									console.log('Success!');
								}
								else
								{
									formMessage.push("Une erreur est survenue lors de l'ajout du lieu (Doublon...etc).");
									console.log(err);
								}
								req.session.message = formMessage;


								res.redirect('place/list');

							});
						}
					}
					else
					{
						console.log(err);
					}
				});
			}
			else
			{
				formMessage.push("Erreur dans l'image uploadée: Le lieu n'est pas sauvegardé.");
				console.log("Erreur dans l'image uploadée: Le lieu n'est pas sauvegardé.");
				req.session.message = formMessage;
				res.redirect('place/list');
			}
		});
	}
	else
	{
		if(!req.session.user)
			formMessage.push("Veuillez vous identifier pour ajouter un lieu");
		if(!req.body.title)
			formMessage.push("Erreur: définissez le titre du lieu");
		if(!req.body.placeInput)
			formMessage.push("Erreur: définissez une géolocalisation du lieu");
		req.session.message = formMessage;
		res.redirect('place/list');
	}
};

exports.findPlaceById = function (req, res) {
	var Place = db.model('Place');
   	Place.findById(req.params.id, function (err, docs){
  	  res.json({
  		place: docs
	  });
	});
};

exports.validatePlaces = function (req, res) {
	var Place = db.model('Place');
	var ids = [];
	ids = req.params.ids.split(',');

	Place.validatePlaces(ids, function (err, numAffected){
  	  res.json({
  		result: numAffected
	  });
	});
};

exports.deletePlaces = function (req, res) {
	var Place = db.model('Place');
	var ids = [];
	ids = req.params.ids.split(',');

	Place.deletePlaces(ids, function (err, numAffected){
  	  res.json({
  		result: numAffected
	  });
	});
};

exports.waitPlaces = function (req, res) {
	var Place = db.model('Place');
	var ids = [];
	ids = req.params.ids.split(',');

	Place.waitPlaces(ids, function (err, numAffected){
  	  res.json({
  		result: numAffected
	  });
	});
};

exports.gridPlaces = function (req, res) {
	var Place = db.model('Place');
    var User = db.model('User');

    var yakcats = [];
    if (req.query.yakcats) {
        yakcats = req.query.yakcats.split(',');
    }

    var users = [];
    if (req.query.users) {
        users = req.query.users.split(',');
    }

    var sortProperties = [];
    if (req.params.sortBy) {
        sortProperties = req.params.sortBy.split(',');
    }

    var sortDirections = [];
    if (req.params.sortDirection) {
        sortDirections = req.params.sortDirection.split(',');
    }

	Place.findGridPlaces(req.params.pageIndex,req.params.pageSize,
		req.params.searchTerm,sortProperties,sortDirections,
        req.params.status, yakcats, users, function (err, place){

		var data = {};

        data['place'] = place;
		data['pageIndex'] = req.params.pageIndex;
		data['pageSize'] = req.params.pageSize;

		Place.countSearch(req.params.searchTerm, req.params.status, yakcats, users, function (err, count){
			data['count'] = count;
			res.json(data);
		});
	});
};


/******
#COMMENT
******/
exports.comment_list = function(req, res){
	delete req.session.message;
	res.render('comment/index');
};

/******* 
#USER 
******/

exports.user_list = function(req, res){
	delete req.session.message;
	res.render('user/index');
};

exports.user_login = function(req, res){
	delete req.session.message;
	res.render('user/login',{locals:{redir:req.query.redir}});
};
exports.user_logout = function(req, res){
	delete req.session.user;
	res.redirect('/place/list');
};

exports.session = function(req, res){
	var User = db.model('User');	
	if (req.body.rememberme == "true") {
		 res.cookie('loginid', req.body.login, { expires: new Date(Date.now() + 90000000000) , httpOnly: false, path: '/'});
	}else{		
		res.cookie('loginid', '', { expires: new Date(Date.now() + 90000000000) , httpOnly: false, path: '/'});
	}
	User.authenticate(req.body.login,req.body.password, req.body.token, function(err, user) {
		if( (!(typeof(user) == 'undefined' || user === null || user === ''))){
			if(user.type >= 10){
				if(user.status == 1){ 
					if (req.body.rememberme == "true") {res.cookie('token', user.token, { expires: new Date(Date.now() + 90000000000) , httpOnly: false, path: '/'});}
					else {res.cookie('token', null);}
					
					req.session.user = user._id;
					User.update({"_id":user._id},{$set:{"lastLoginDate":new Date()}}, function(err){if (err) console.log(err);});
					res.redirect(req.body.redir || '/news/map');
				}else if(user.status == 2){
					req.session.message = 'Compte non validé.';
				}	
			}else{
				req.session.message = "Ce compte n'est pas autorisé à accéder à cette interface.";	
				res.redirect('user/login?redir='+req.body.redir);
			}
			
		}else{
			req.session.message = 'Identifiants incorrects.';	
			res.redirect('user/login?redir='+req.body.redir);
		}
	});
};

exports.user_setname = function (req, res){
	var User = db.model('User');
	User.update({"_id":req.body._id},{$set:{"name":req.body.name}}, function(err){
		if(!err)
			res.json({meta:{code:200}});
		else
			res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
	});
}

exports.user_setstatus = function (req, res){
	var User = db.model('User');
	User.update({"_id":req.body._id},{$set:{"status":req.body.status}}, function(err){
		if(!err)
			res.json({meta:{code:200}});
		else
			res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
	});
}

exports.user_settype = function (req, res){
	var User = db.model('User');
	User.update({"_id":req.body._id},{$set:{"type":req.body.type}}, function(err){
		if(!err)
			res.json({meta:{code:200}});
		else
			res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
	});
}


exports.gridUsers = function (req, res) {
    var User = db.model('User');

    var sortProperties = [];
    if (req.params.sortBy) {
        sortProperties = req.params.sortBy.split(',');
    }

    var sortDirections = [];
    if (req.params.sortDirection) {
        sortDirections = req.params.sortDirection.split(',');
    }

	User.findGridUsers(req.params.pageIndex,req.params.pageSize,
		req.params.searchTerm,sortProperties,sortDirections,
        req.params.status, req.params.type, req.session.user, function (err, user){

		var data = {};
		var usersFormated = user.map(function(item){
			return User.formatLightBack(item);
		});

        data['user'] = usersFormated;
		data['pageIndex'] = req.params.pageIndex;
		data['pageSize'] = req.params.pageSize;
		data['count'] = user.length;
		res.json(data);
 		
	});
};

exports.gridComments = function (req, res) {
    var Info = db.model('Info');

    var sortProperties = [];
    if (req.params.sortBy) {
        sortProperties = req.params.sortBy.split(',');
    }

    var sortDirections = [];
    if (req.params.sortDirection) {
        sortDirections = req.params.sortDirection.split(',');
    }

	Info.findGridComments(req.params.pageIndex,req.params.pageSize,
		req.params.searchTerm,sortProperties,sortDirections,
        req.params.status, function (err, comment){

        var allComments = [];
        var k = 0;
        for (var i = 0; i < comment.length; i++) {
        	var acomment = {};
        	acomment = comment[i].yakComments;
        	for (var j = 0; j < acomment.length; j++) {
        		allComments[k] = acomment[j];
        		allComments[k].info_id = comment[i]._id;
        		allComments[k].info_title = comment[i].title;
        		allComments[k].delete = "";
        		k++;
        	};
        	
        };

		var data = {};
        data['comment'] = allComments;
		data['pageIndex'] = req.params.pageIndex;
		data['pageSize'] = req.params.pageSize;
		data['count'] = allComments.length;
		res.json(data);
 		
	});
};



exports.user = function(req, res){

	var User = db.model('User');


	User.Authenticate(req.body.login, req.body.password, function(err,user){
		if(!(typeof(user) == 'undefined' || user === null || user === '')){
			req.session.user = user;
			res.redirect(req.body.redir || '/place/list');
		}else{
			req.session.message = 'Wrong login or password:';
			res.redirect('user/login?redir='+req.body.redir);
		}
	});
};

exports.cats = function (req, res) {
	var Yakcat = db.model('Yakcat');
	Yakcat.findAll(function (err, docs){
	  if(!err)
	  	res.json({meta:{code:200},data:{cats:docs}});
	  else
	  	res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
	});
};

exports.catsById = function (req, res) {
	var Yakcat = db.model('Yakcat');
	Yakcat.findOne({_id:req.params.id},function (err, docs){
	  if(!err)
	  	res.json({meta:{code:200},cats:docs});
	  else
	  	res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
	});
};