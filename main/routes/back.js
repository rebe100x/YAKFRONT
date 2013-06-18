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
			var line = 1;
			if(req.body.isLink == 1 ){
				var request = require('request');
				var thepath = req.body.file;
				var data = request(thepath,function(err){
					if(err)
						res.json({code:400,error:'Erreur '+err});
				}).pipe(csvStream);
			}else{
				var thepath = conf.uploadsDir+'files/'+req.body.file;
				var data = fs.createReadStream(thepath).pipe(csvStream);
			}
			data.on('error',function(err){
				res.json({code:400,error:'Erreur '+err});
			})
			.on('data',function(data){
				if(line >= req.body.param)
					output.push(data);
				line ++;
				
			})
			.on('end',function(){
				res.json({code:200,fileSample:JSON.stringify(output.slice(0,4))});	
			});
		break;
		case 'XML':
			var itemKey = '';
			var oldItemKey = '';
			var itemVal = '';
			var line = {};
			var item = new Object();
			var output = [];
			var attribute = [];
			var htmlparser = require("htmlparser2");
			var parser = new htmlparser.Parser({
				onopentag: function(name, attribs){
					if(name === "item")
						item = new Object();
					else{
						oldItemKey = itemKey;
						itemKey = name;
					}
				},
				ontext: function(text){
				var S = require('string');	
				itemVal = S(text).stripTags().s;
				},
				onattribute: function(attr,val){
				//console.log(oldItemKey+' '+itemKey+' '+attr+' '+val);
					if(val != ''){
						attribute.push({attr:attr,val:val});
					}
						
				},
				onclosetag: function(tagname){
					var itemToLoopOnArray = req.body.param.split('/');
					var itemToLoopOn = itemToLoopOnArray[itemToLoopOnArray.length-1];
					if(tagname == itemToLoopOn){
						output.push(item);
					}else{
						if(oldItemKey == itemKey)
							item[itemKey] += '#'+itemVal;
						else
							item[itemKey] = itemVal;
						if(attribute.length>0){
							attribute.forEach(function(obj){
								item[itemKey+'->'+obj['attr']] = obj['val'];
							});
							attribute = [];
						}
							
					}
				}
			});

			if(req.body.isLink == 1 ){
				var request = require('request');
				var thepath = req.body.file;
				var data = request(thepath,function(err, response, data){
					if(err)
						res.json({code:400,error:'Erreur '+err});
					else{
						parser.write(data.toString('utf8'));
						parser.end();
						res.json({code:200,fileSample:JSON.stringify(output.slice(0,4))});	
					}
				});
			}else{
				var thepath = conf.uploadsDir+'files/'+req.body.file;
				var data = fs.createReadStream(thepath);
				data.setEncoding('utf8');
				data.on('data',function(data){
					parser.write(data.toString('utf8'));
					parser.end();
					res.json({code:200,fileSample:JSON.stringify(output.slice(0,4))});
				});	
			}

	
			
		break;
		case 'JSON':
			if(req.body.isLink == 1 ){
				var request = require('request');
				var thepath = req.body.file;
				var data = request(thepath,function(err, response, data){
					if(err)
						res.json({code:400,error:'Erreur '+err});
					else{
						var dataObj = JSON.parse(data.toString('utf8'));
						dataObj[req.body.param].forEach(function(item){
							output.push(item);
						});
						res.json({code:200,fileSample:JSON.stringify(output.slice(0,4))});
					}
				});
			}else{
				var thepath = conf.uploadsDir+'files/'+req.body.file;
				var data = fs.createReadStream(thepath);
				data.setEncoding('utf8');
				data.on('data',function(data){
					var dataObj = JSON.parse(data.toString('utf8'));
					dataObj[req.body.param].forEach(function(item){
						output.push(item);
					});
					res.json({code:200,fileSample:JSON.stringify(output.slice(0,4))});
				});	
			}

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
exports.countUnvalidatedIllicites = function (req, res) {
	var contenuIllicite = db.model('contenuIllicite');
	contenuIllicite.countUnvalidated(function (err, docs){
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

exports.findAllFeed = function (req, res) {
	var Feed = db.model('Feed');
   	Feed.findAll(function (err, feeds){
   		var data = {};
		var feedFormated = feeds.map(function(item){
			return Feed.format(item);
		});
		res.json({
			feeds: feedFormated
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
			data['feed'] = feedFormated;
			data['pageIndex'] = req.params.pageIndex;
			data['pageSize'] = req.params.pageSize;
			Feed.countSearch(req.params.searchTerm, req.params.status, req.params.type, function (err, count){
				data['count'] = count;
				res.json(data);
			});	
		});
	};

exports.feed = function(req, res){

	var formMessage = new Array();
	delete req.session.message;
	var Feed = db.model('Feed');
	var Place = db.model('Place');
	var Yakcat = db.model('Yakcat');
	var obj_id = req.body.objid;
	var place_id = req.body.placeid;
	//console.log(req.body);
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
	else
		feed.tag = [];

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
	feed.zone = req.body.zone;
	feed.status = parseInt(req.body.status);
	feed.lastModifDate = now;

	feed.rootElement = req.body.rootElement;
	//console.log(req.body.lineToBegin);
	if(req.body.lineToBegin != '' && typeof req.body.lineToBegin != 'undefined' )
		feed.lineToBegin = parseInt(req.body.lineToBegin);
	else
		feed.lineToBegin = 1;

	feed.parsingFreq = req.body.parsingFreq;

	feed.parsingTemplate = {
		title: req.body.infoTitle,
		content: req.body.infoContent,
		address: req.body.infoAddress,
		geolocation: req.body.infoGeolocation,
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
		
	
	
	if(typeof obj_id != 'undefined' && obj_id != ''){
		var cond = {_id:obj_id};
	}else{
		feed.creationDate = now;
		feed.lastExecDate = now;
		var cond = {name:"anameimpossibletochoose007"};
	}
		

		// if placeid is set
		console.log(req.body);
	if(typeof place_id != 'undefined' && place_id != ''){
		feed.defaultPlaceId = place_id;
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
	}else{ // if no place id we match against db
		Place.findOne({title:feed.defaultPlaceName},function(err,theplace){
			if(err)
				throw err;
			else{	
				if(theplace){
					feed.defaultPlaceId = theplace._id;
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
				}else{ // if nothing in db we create it 
					var place = new Place();
					place.title = feed.defaultPlaceName;
					place.origin = "Yakwala";
					place.access = 1;
					place.licence = "Yakwala";
					place.location = feed.defaultPlaceLocation;
					place.status = 1;
					place.user = req.session.user;
					place.zone = parseInt(feed.zone);
					place.creationDate = new Date();
					place.lastModifDate = new Date();
					place.formatted_address = req.body.formatted_address;
					place.address = JSON.parse(req.body.address);
					place.yakCat = [mongoose.Types.ObjectId("504d89f4fa9a958808000001"),mongoose.Types.ObjectId("51c00669fa9a95b40b000036")];
					place.yakCatName = ["Géolocalisation","Feed"];
					place.save(function(err){console.log(err);});
					feed.defaultPlaceId = place._id;
					
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
				}
			}
			

		});

 

	}

	

	

	
	
};


/********
#YAKNE
*******	*/
exports.yakNE_list = function(req, res){
	delete req.session.message;
	res.render('yakNE/index');
};

exports.findYakNEByTitle = function (req, res) {
	var YakNE = db.model('YakNE');
   	YakNE.findByTitle(req.params.title, function (err, theYakNE){
   		res.json({
			yakNE: theYakNE
		});
	});
};

exports.findYakNEById = function (req, res) {
	var YakNE = db.model('YakNE');
   	YakNE.findById(req.params.id, function (err, theYakNE){
		res.json({
			yakNE: theYakNE
		});
	});
};


exports.gridYakNE = function (req, res) {
	var YakNE = db.model('YakNE');
    
    var sortProperties = [];
    if (req.params.sortBy) {
        sortProperties = req.params.sortBy.split(',');
    }

    var sortDirections = [];
    if (req.params.sortDirection) {
        sortDirections = req.params.sortDirection.split(',');
    }

   

	YakNE.findGridYakNE(req.params.pageIndex,req.params.pageSize,
		req.params.searchTerm,sortProperties,sortDirections,
        req.params.status, function (err, yakNEs){

			var data = {};
			data['yakNE'] = yakNEs;
			data['pageIndex'] = req.params.pageIndex;
			data['pageSize'] = req.params.pageSize;
			YakNE.countSearch(req.params.searchTerm, req.params.status, function (err, count){
				data['count'] = count;
				res.json(data);
			});	
		});
	};

exports.yakNE = function(req, res){

	var formMessage = new Array();
	delete req.session.message;
	var YakNE = db.model('YakNE');
	var Yakcat = db.model('Yakcat');
	var obj_id = req.body.objid;
	//console.log(req.body);
	var yakNE = new Object();
	var now = new Date();
	var match = new Array();

	var TNH = req.body.titleNormalizedHidden;
	if(TNH.indexOf('"')==0)
		yakNE.title = TNH.slice(1,TNH.length);
	else
		yakNE.title = TNH;
	yakNE.yakCatId = req.body.yakCatIdsHidden.split(',');
	yakNE.yakCatName = req.body.yakCatNamesHidden.split(',');
	if(req.body.normalizedTagsHidden != ''){
		req.body.normalizedTagsHidden.split(',').forEach(function(item){
			match.push({title:item,level:'normalized'});
		});
	}

	if(req.body.exactTagsHidden != ''){
		req.body.exactTagsHidden.split(',').forEach(function(item){
			match.push({title:item,level:'exact'});
		});
	}	

	yakNE.match = match;
	yakNE.description = req.body.description;
	yakNE.status = parseInt(req.body.status);
	yakNE.lastModifDate = now;
	
	if(typeof obj_id != 'undefined' && obj_id != ''){
		var cond = {_id:obj_id};
	}else{
		yakNE.creationDate = now;
		yakNE.lastModif = now;
		var cond = {title:"anameimpossibletochoose007"};
	}
		
	YakNE.update(cond,yakNE,{upsert:true},function (err){
		if (!err)
			formMessage.push("Mot clé sauvegardé.");
		else{
			formMessage.push("Erreur pendant la sauvegarde du mot clé !"+err);
			//console.log(err);
		}
		req.session.message = formMessage;
		res.redirect('yakNE/list')
	});	
};

/*******
#DASHBOARD
********/

exports.dashboard_list = function(req, res){
	delete req.session.message;
	res.render('dashboard/index');
};

exports.dashboard_statsByDate= function(req,res){
	var Stat = db.model('Stat');
	var type = req.params.type;
	Stat.findFromDate(req.params.msts,function(err,stats){
		//console.log(stats);
		if(!err){
			var rows = {};
			switch(type){
				case 'user':
					var statFormated = stats.map(function(item){
						return Stat.formatByUser(item);
					});
				break;
				case 'info':
					var statFormated = stats.map(function(item){
						return Stat.formatByInfo(item);
					});
				break;
				case 'place':
					var statFormated = stats.map(function(item){
						return Stat.formatByPlace(item);
					});
				break;
			}			
			
			rows = statFormated;
			res.json(rows);
		}
	});
};

exports.dashboard_statsByZone= function(req,res){
	var Stat = db.model('Stat');
	Stat.findToday(req.params.msts,function(err,stats){
		if(!err && stats != null && typeof stats != 'undefined'){
			var rows = {};			
			var statFormated = stats.zone.map(function(item){
				return Stat.formatByZone(item);
			});
			rows = statFormated;
			res.json(rows);
		}else
			res.json({});
			
	});
};


/*******
#INFOS
********/
exports.findInfoById = function (req, res) {
    var Info = db.model('Info');
    Info.findById(req.params.id, function (err, docs){	
      var infoFormatted = Info.format(docs);
      res.json({
        info: infoFormatted
      });
    });
};

/*******
#ZONE
********/

exports.zone = function(req, res){

	var formMessage = new Array();
	delete req.session.message;
	var Zone = db.model('Zone');
	var obj_id = req.body.objid;
	var zone = new Object();
	var now = new Date();
	
	zone.name = req.body.name;
	Zone.findOne({},{},{sort:{num:-1}},function (err, docs){
 		
 		zone.location = {lng:parseFloat(req.body.lngCT),lat : parseFloat(req.body.latCT)};
		var box = new Object();
		box.tr = {lng:parseFloat(req.body.lngTR),lat : parseFloat(req.body.latTR)};
		box.bl = {lng:parseFloat(req.body.lngBL),lat : parseFloat(req.body.latBL)};

		zone.box = box;
		zone.status = parseInt(req.body.status);
		zone.lastModifDate = now;

		if(typeof obj_id != 'undefined' && obj_id != ''){
			var cond = {_id:obj_id};
		}else{
			zone.creationDate = now;
			var cond = {name:"anameimpossibletochoose007"};
			zone.num = docs.num+1;
		}
			

		Zone.update(cond,zone,{upsert:true},function (err){
			if (!err)
				formMessage.push("Zone sauvegardée.");
			else{
				formMessage.push("Erreur pendant la sauvegarde de la zone !");
				console.log(err);
			}
			req.session.message = formMessage;
			res.redirect('zone/list')
		});
    });
};
	
exports.findZoneMaxnum = function(req, res){
	var Zone = db.model('Zone');
    Zone.findOne({},{},{sort:{num:-1}},function (err, docs){
      res.json({
        num: docs.num
      });
    });
};

exports.findZoneById = function (req, res) {
    var Zone = db.model('Zone');
    Zone.findById(req.params.id, function (err, docs){
      res.json({
        zone: docs
      });
    });
};

exports.zone_list = function(req, res){
	delete req.session.message;
	res.render('zone/index');
};



exports.zones = function(req, res){
	var Zone = db.model('Zone');
    Zone.find({},{},{sort:{name:1}},function (err, docs){
      res.json({
        zone: docs
      });
    });
};

exports.findAllZoneNear = function (req, res) {
	var Zone = db.model('Zone');
	Zone.findAllNear(req.params.x,req.params.y,function (err, docs){
		res.json({zones:docs});
	}); 
};

exports.gridZones = function (req, res) {
    var Zone = db.model('Zone');

    var sortProperties = [];
    if (req.params.sortBy) {
        sortProperties = req.params.sortBy.split(',');
    }

    var sortDirections = [];
    if (req.params.sortDirection) {
        sortDirections = req.params.sortDirection.split(',');
    }

	Zone.findGridZones(req.params.pageIndex,req.params.pageSize,
		req.params.searchTerm,sortProperties,sortDirections,
        req.params.status, function (err, zones){
			var data = {};
			data['zone'] = zones;
			data['pageIndex'] = req.params.pageIndex;
			data['pageSize'] = req.params.pageSize;
			Zone.countSearch(req.params.searchTerm, req.params.status,function (err, count){
				data['count'] = count;
				res.json(data);
			});	
 		
	});
};

exports.zone_setstatus = function (req, res){
	var Zone = db.model('Zone');
	Zone.update({"_id":req.body._id},{$set:{"status":req.body.status}}, function(err){
		if(!err)
			res.json({meta:{code:200}});
		else
			res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
	});
}





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


/******* 
#USER 
******/

exports.user_reminder = function(req, res){

	var crypto = require('crypto')
	var userid = req.params.id;
	var User = db.model('User');
	var Point = db.model('Point');
	var user = new User();
	
	/*check if user exists*/
	User.findOne({_id: userid},{_ids:1,status:1,mail:1}, function(err,theuser){
		if(theuser){
			//console.log(theuser);
				var salt = Math.round(new Date().valueOf() * Math.random());
				var token = crypto.createHash('sha1').update("yakwala@secure"+salt).digest("hex");
				var password = user.generatePassword(5);
				var link = conf.validationUrl+token+"/"+password;
				var hash = crypto.createHash('sha1').update(password+"yakwala@secure"+salt).digest("hex");
				var logo = conf.fronturl+"/static/images/yakwala-logo_petit.png";
				var templateMail = "link";
				var themail = theuser.mail;
				//console.log(theuser);
				User.update({_id: theuser._id}, {hash : hash,token:token,salt:salt,password:password}, {upsert: false}, function(err){
					User.sendValidationMail(link,themail,templateMail,logo,function(err){
						if(!err)
							console.log(err);				
					});
				});
				res.json({meta:{code:200}});
			}else{
				res.json({meta:{code:404,error_type:'operation failed',error_description:'No user'}});
			}
	});
	
	
};

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
			return User.format(item);
		});

        data['user'] = usersFormated;
		data['pageIndex'] = req.params.pageIndex;
		data['pageSize'] = req.params.pageSize;
		User.countSearch(req.params.searchTerm, req.params.status, function (err, count){
			data['count'] = count;
			res.json(data);
		});
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

exports.findUserById = function (req, res) {
    var User = db.model('User');
    User.findById(req.params.id, function (err, docs){	
      var userFormatted = User.format(docs);
      res.json({
        user: userFormatted
      });
    });
};

/*******
# ILLICITE
********/
exports.illicites = function(req, res){
	delete req.session.message;
	res.render('illicites/index');
};

/* Change illicite status and content status as well :
if it is a news : disable the news
if it is a comment : disable the comment
if it is a user : disable user, disable his news, disable his comments*/
exports.changeStatusIllicite = function(req, res){
	var content_type = req.body.content_type;
	var content_id = req.body.content_id;
	var poster_id = req.body.poster_id;
	var _id = req.body._id;
	var info_id = req.body.info_id;
	var status = req.body.status; // 1 is undelete, 2 is delete

	var User = db.model("User");
	var Info = db.model("Info");
	var Illicite = db.model("contenuIllicite");

	Illicite.findOne({_id:_id},function(err,il){

		if(status == 2){ // delete
			var userStatus = 3;
			var infoStatus = 3;
			var illiciteStatus = 2;
			var commentStatus = 2;
			var commentInc = -1;
		}
		else{ // undelete
			var userStatus = 1;
			var infoStatus = 1;
			var illiciteStatus = 1;
			var commentStatus = 1;
			var commentInc = 1;
		}

		switch(content_type){
			case "1":
				Info.update({_id:content_id},{$set:{status:infoStatus}},function(err){
					if(!err){
						Illicite.update({_id : _id},{$set:{status:illiciteStatus,dateProcessed:new Date()}},function(err){
							if(err)
								res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});	
							else{
								// send email if moderate
								if(status == 2){
									if(typeof poster_id != 'undefined'){
										User.findOne({_id:poster_id},function(err,theuser){
											if(theuser != null && typeof theuser != 'undefined' && typeof theuser.mail != 'undefined'){
												User.sendIlliciteMail(theuser.mail,il.content,function(err){
													if(err)
														console.log(err);
													else
														res.json({meta:{code:200,mail:1}});			
												});
											}
										});	
									}else
										res.json({meta:{code:200,mail:0}});	
								}else
									res.json({meta:{code:200,mail:0}});	
							}		
						});
					}else
						res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
				});
			break;
			
			case "2":  // comments 
				Info.update({_id:mongoose.Types.ObjectId(info_id)},{$inc:{commentsCount : commentInc}}, function(err,docs){
					if(!err){
						Info.findOne({_id:mongoose.Types.ObjectId(info_id)},function(err,theinfo){
							if(!err){
								var comments = [];
								theinfo.yakComments.forEach(function(item){
									if(item._id == content_id){
										item.status = commentStatus;
									}
									comments.push(item);	
								});
								Info.update({_id:mongoose.Types.ObjectId(info_id)},{$set:{yakComments : comments}}, function(err,docs){
									if(!err){
										Illicite.update({_id : _id},{$set:{status:illiciteStatus,dateProcessed:new Date()}},function(err){
											if(err)
												res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});	
											else{
												// send email if moderate
												if(status == 2){
													if(typeof poster_id != 'undefined'){
														User.findOne({_id:poster_id},function(err,theuser){
															if(theuser != null && typeof theuser != 'undefined' && typeof theuser.mail != 'undefined'){
																User.sendIlliciteMail(theuser.mail,il.content,function(err){
																	if(err)
																		console.log(err);
																	else
																		res.json({meta:{code:200,mail:1}});				
																});
															}
															
														});	
													}else
														res.json({meta:{code:200,mail:0}});	
													
												}else
													res.json({meta:{code:200,mail:0}});	
											}		
										});
									}else
										res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});			
								});
							}else
								res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});										
						});
					}else
						res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
				});
			break;
			
			case "3":  // user => disable user, his news and his comments
				User.update({_id: content_id},{$set:{'status':userStatus}}, function(err){
					if(!err){
						var Info = db.model("Info");
						Info.update({user:mongoose.Types.ObjectId(content_id)},{$set:{status:infoStatus}}, function(err,docs){
							if(!err){
								Illicite.update({_id : _id},{$set:{status:illiciteStatus,dateProcessed:new Date()}},function(err){
									if(err)
										res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});	
									else{
										// send email if moderate
										if(status == 2){
											if(typeof poster_id != 'undefined'){
												User.findOne({_id:poster_id},function(err,theuser){
													if(theuser != null && typeof theuser != 'undefined' && typeof theuser.mail != 'undefined'){
														User.sendIlliciteMail(theuser.mail,il.content,function(err){
															if(err)
																console.log(err);
															else
																res.json({meta:{code:200,mail:1}});				
														});
													}
													
												});	
											}else
												res.json({meta:{code:200,mail:0}});	
											
										}else
											res.json({meta:{code:200,mail:0}});	
									}		
								});
							}else
								res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
						});
					}else
						res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
				});
				break;
			
			default:{
				res.json({meta:{code:404,error_type:'operation failed',error_description:'type of content is not set'}});
				break;
			}
		}
	});
	
}

exports.gridIllicites = function (req, res) {
    var contenuIllicite = db.model('contenuIllicite');

    var sortProperties = [];
    if (req.params.sortBy) {
        sortProperties = req.params.sortBy.split(',');
    }

    var sortDirections = [];
    if (req.params.sortDirection) {
        sortDirections = req.params.sortDirection.split(',');
    }

	contenuIllicite.findGridIllicites(req.params.pageIndex,req.params.pageSize,
		req.params.searchTerm,sortProperties,sortDirections, req.params.type, req.params.status, req.params.limit, function (err, illicites){
			var data = {};
			data['illicites'] = illicites;
			data['pageIndex'] = req.params.pageIndex;
			data['pageSize'] = req.params.pageSize;
			contenuIllicite.countSearch(req.params.searchTerm, req.params.type, req.params.status, req.params.limit, function (err, count){
				data['count'] = count;
				res.json(data);
			});		
	});
};


/******* 
#YAKCAT 
******/

exports.categories = function(req, res){
	delete req.session.message;
	res.render('categories/index');
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

exports.gridYakcats = function (req, res) {
    var Yakcat = db.model('Yakcat');

    var sortProperties = [];
    if (req.params.sortBy) {
        sortProperties = req.params.sortBy.split(',');
    }

    var sortDirections = [];
    if (req.params.sortDirection) {
        sortDirections = req.params.sortDirection.split(',');
    }

	Yakcat.findGridYakcats(req.params.pageIndex,req.params.pageSize,
		req.params.searchTerm,sortProperties,sortDirections, req.params.status, function (err, yakcats){

		var data = {};
		
        data['yakcats'] = yakcats;
		data['pageIndex'] = req.params.pageIndex;
		data['pageSize'] = req.params.pageSize;
		Yakcat.countSearch(req.params.searchTerm, req.params.status, function (err, count){
				data['count'] = count;
				res.json(data);
			});	
	});
};

exports.yakcat_setstatus = function (req, res){
	var Yakcat = db.model('Yakcat');
	Yakcat.update({"_id":req.body._id},{$set:{"status":req.body.status}}, function(err){
		if(!err)
			res.json({meta:{code:200}});
		else
			res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
	});
}
