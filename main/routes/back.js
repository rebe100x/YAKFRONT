/******************************************************************************************************************************************************************
 * UTILITIES
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
	var tagArray = new Array();
	var error = '';		
	var rootElement = '';
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
					//console.log('openTag:'+name);
					if(tagArray[name])
						tagArray[name] = tagArray[name] +1;
					else
						tagArray[name] = 1;

					if(name === "item")
						item = new Object();
					else{
						oldItemKey = itemKey;
						itemKey = name;
					}
				},
				ontext: function(text){
				var S = require('string');
				var itemValTmp = S(text.trim()).stripTags().s;	
				if(itemValTmp.length>0){
					itemVal = itemValTmp;
				}else	
					itemVal = "?";

				/*	
				console.log('onText:'+text);
				var S = require('string');	
				itemVal = S(text).stripTags().s;
				},
				onattribute: function(attr,val){
				console.log('onAttr:'+attr);	
				//console.log(oldItemKey+' '+itemKey+' '+attr+' '+val);
					if(val != ''){
						attribute.push({attr:attr,val:val});
					}
				*/		
				},
				onclosetag: function(tagname){
					//console.log('closeTag:'+tagname);
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
				},
				onend: function(){
					// Try to detect root element : the first tag that belongs to the most used tag group
					var mostUsed = 0;
					var mostUsedIndex = -1;
					var tagGroup = new Array();
					var values = Object.keys( tagArray ).map(function ( key ) { return tagArray[key]; });
					var keys = Object.keys( tagArray );
					for(var i=0;i<values.length;i++) {
						if(values[i] > 3){ // arbitrary 3 : we need a very recurrent tag
							if(tagGroup[values[i]]) 
								tagGroup[values[i]] = tagGroup[values[i]] +1;
							else
								tagGroup[values[i]] = 1;
						}
					}
					var valuesGroup = Object.keys( tagGroup ).map(function ( key ) { return tagGroup[key]; });
					for(var i=0;i<tagGroup.length;i++) {
						if(tagGroup[i] > mostUsed){
							mostUsed = tagGroup[i];
							mostUsedIndex = i;
						}
					}
					

					rootElement = '/';
					var flagDescending =0;
					for(var i=0;i<keys.length;i++) {
						if(values[i]  > 1)
							flagDescending = 1;

						if(values[i] == 1 && flagDescending == 0)
							rootElement += keys[i]+'/';
						
						if(values[i]  == mostUsedIndex){
							rootElement += keys[i];
							break;
						}
					}

					
					if(output.length == 0){
						error = 'No data from this feed, please try this rootElement: <code>'+rootElement+'</code>';
					}
						
						
					
				}
			});

			

			if(req.body.isLink == 1 ){
				var request = require('request');
				var thepath = req.body.file;
				var data = request(thepath,function(err, response, data){
					if(err)
						res.json({code:400,rootElement:'check feed url', error:'Erreur '+err});
					else{
						parser.write(data.toString('utf8'));
						parser.end();
						if(error == ''){
							res.json({code:200, rootElement:rootElement, fileSample:JSON.stringify(output.slice(0,4))});			
						}else{
							res.json({code:400,rootElement:rootElement, error:error});
						}
					
						
					}
				});
			}else{
				var thepath = conf.uploadsDir+'files/'+req.body.file;
				var data = fs.createReadStream(thepath);
				data.setEncoding('utf8');
				data.on('data',function(data){
					parser.write(data.toString('utf8'));
					parser.end();
					if(error == ''){
						res.json({code:200, rootElement:rootElement, fileSample:JSON.stringify(output.slice(0,4))});			
					}else{
						res.json({code:400,rootElement:rootElement, error:error});
					}
				});	
			}
			
		break;
		case 'JSON':
			console.log(req.body);
			if(req.body.isLink == 1 ){
				var request = require('request');
				var thepath = req.body.file;
				var data = request(thepath,function(err, response, data){
					if(err)
						res.json({code:400,rootElement:'Check feed url', error:'Erreur '+err});
					else{
						var dataObj = JSON.parse(data.toString('utf8'));
						
						// try to detect the loop element
						var values = Object.keys( dataObj ).map(function ( key ) { return dataObj[key]; });
						var keys = Object.keys( dataObj );
						var level = 0;
						for(var i=0;i<keys.length;i++) {
							if(values[i].length > 5) // searching for a big array
								rootElement = keys[i];
						}
						if(req.body.param && typeof dataObj[req.body.param] != 'undefined')
							var dataObjToLoop = dataObj[req.body.param];
						else
							var dataObjToLoop = dataObj;

						dataObjToLoop.forEach(function(item){
							output.push(item);
						});
						res.json({code:200, rootElement:rootElement, fileSample:JSON.stringify(output.slice(0,4))});
					}
				});
			}else{
				var thepath = conf.uploadsDir+'files/'+req.body.file;
				var data = fs.createReadStream(thepath);
				data.setEncoding('utf8');
				data.on('data',function(data){
					var dataObj = JSON.parse(data.toString('utf8'));
					if(req.body.param && typeof dataObj[req.body.param] != 'undefined')
						var dataObjToLoop = dataObj[req.body.param];
					else
						var dataObjToLoop = dataObj;

					dataObjToLoop.forEach(function(item){
						output.push(item);
					});
					res.json({code:200, rootElement:rootElement, fileSample:JSON.stringify(output.slice(0,4))});
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



/******************************************************************************************************************************************************************
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
	
	feed.yakCatId = [];
	if(req.body.yakCatIdsHidden)
		feed.yakCatId = req.body.yakCatIdsHidden.split(',');
	feed.yakCatName = [];
	if(req.body.yakCatNamesHidden)
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
	feed.zoneName = req.body.zoneName;
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
		//console.log(req.body);
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
					place.slug = strLib(feed.defaultPlaceName).slugify().s;					
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



/****************************************************************************************************************************************************************** 
#INFO
*******/
exports.info_list = function(req, res){
	delete req.session.message;
	res.render('info/index');
};



exports.findInfoByName = function (req, res) {
	var Info = db.model('Info');
   	Info.findByName(req.params.name, function (err, theinfo){
   		res.json({
			info: theinfo
		});
	});
};

exports.findInfoById = function (req, res) {
	var Info = db.model('Info');
   	Info.findById(req.params.id, function (err, theinfo){
		res.json({
			info: Info.format(theinfo)
		});
	});
};


exports.findAllInfo = function (req, res) {
	var Info = db.model('Info');
   	Info.findAll(function (err, infos){
   		var data = {};
		var infoFormated = infos.map(function(item){
			return Info.format(item);
		});
		res.json({
			infos: infoFormated
		});
	});

};

exports.gridInfos = function (req, res) {
	var Info = db.model('Info');
    
    var sortProperties = [];
    if (req.params.sortBy) {
        sortProperties = req.params.sortBy.split(',');
    }

    var sortDirections = [];
    if (req.params.sortDirection) {
        sortDirections = req.params.sortDirection.split(',');
    }

   

	Info.findGridInfos(req.params.pageIndex,req.params.pageSize,
		req.params.searchTerm,sortProperties,sortDirections,
        req.params.status,req.params.type, req.params.limit,  function (err, info){

			var infoFormated = new Array();
			if(info){
				var infoFormated = info.map(function(item){
					return Info.format(item);
				});	
			}
			
			var data = {};
			data['info'] = infoFormated;
			data['pageIndex'] = req.params.pageIndex;
			data['pageSize'] = req.params.pageSize;
			Info.countSearch(req.params.searchTerm, req.params.status, req.params.type, req.params.limit, function (err, count){
				data['count'] = count;
				res.json(data);
			});	
		});
	};

/* Note : when you create or modify an info, only the info is changed (if you change the status, only the info will be changed and not the plac elinked and the other infos
linked to the same place)
	
*/
exports.info = function(req, res){

	var formMessage = new Array();
	delete req.session.message;
	var Info = db.model('Info');
	var Place = db.model('Place');
	var Yakcat = db.model('Yakcat');
	var obj_id = req.body.objid;
	var place_id = req.body.placeid;
	
	console.log(req.body);
	
	var info = new Object();
	var now = new Date();
	var in3days = new Date();
	in3days.setDate(now.getDate() + 3);
	
	info.title = req.body.title;
	info.content = req.body.content;

	if(req.body.thumbFlag == 'on')
		info.thumbFlag = 2; // include img in info desc
	else
		info.thumbFlag = 1;// do not include img in info desc

	var strLib = require("string");
	info.slug = strLib(info.title).slugify().s;
	info.likes = req.body.likes;
	info.yakCat = [];
	if(req.body.yakCatIdsHidden)
		info.yakCat = req.body.yakCatIdsHidden.split(',');
	info.yakCatName = [];
	if(req.body.yakCatNamesHidden)
		info.yakCatName = req.body.yakCatNamesHidden.split(',');

	if(req.body.tagsHidden == '' && req.body.freetag != '')
		info.freeTag = req.body.freetag.split(',');
	else if(req.body.tagsHidden != '')		
		info.freeTag = req.body.tagsHidden.split(',');
	else
		info.freeTag = [];

	if( typeof req.body.printFlag != 'undefined' && req.body.printFlag == 'on')
		info.print = 0;
	else
		info.print = 1;

	info.user = req.session.user;
	if(req.body.dateEndPrint)
		info.dateEndPrint = req.body.dateEndPrint;
	else
		info.dateEndPrint = in3days;
	if(req.body.pubDate)
		info.pubDate = req.body.pubDate;
	else
		info.pubDate = now;
	info.origin = req.body.origin;
	info.outGoingLink = req.body.outGoingLink;
	info.licence = req.body.licence;
	info.yakType = req.body.yakType;
	info.access = 1;
	info.heat = 80;
	if(typeof req.body.zone != 'undefined' && req.body.zone != null)
		info.zone = req.body.zone;
	if(typeof req.body.zoneName != 'undefined' && req.body.zoneName != null)
		info.zoneName = req.body.zoneName;
	info.status = parseInt(req.body.status);
	info.lastModifDate = now;
	var infoThumb = new Object();
	if(req.body.thumbHidden != '')
		info.thumb = req.body.thumbHidden;

	if(req.files.picture.size && req.files.picture.size > 0 && req.files.picture.size < 1048576*5){
		var drawTool = require('../mylib/drawlib.js');
		var size = mainConf.imgSizeInfo;
		var crypto = require('crypto');
		var destFile = crypto.createHash('md5').update(req.files.picture.name).digest("hex")+'.jpeg';
				
		for(i=0;i<size.length;i++){
			infoThumb = drawTool.StoreImg(req.files.picture,destFile,{w:size[i].width,h:size[i].height},conf);
		}
		info.thumb = infoThumb.name;
	}else{
		infoThumb.err = 0;
	}
		
	// event date for agenda
	if(Math.floor(req.body.yakType) == 2){
		info.eventDate = {dateTimeFrom : new Date(req.body.eventDateFrom), dateTimeEnd : new Date(req.body.eventDateEnd)};
	}


	
	if(typeof obj_id != 'undefined' && obj_id != ''){
		var cond = {_id:obj_id};
	}else{
		info.creationDate = now;
		info.lastExecDate = now;
		var cond = {title:"anameimpossibletochoose007"};
	}
		

	var placeInput = JSON.parse(req.body.placeInput);
	var location = placeInput.location;

	// if placeid is set. 
	// Note : placeId is reset as soon as the location is changed
	
	if(typeof place_id != 'undefined' && place_id != ''){ // edit mode without changing the location of the info
		info.placeId = place_id;
		info.address = placeInput.title;
		info.location = {lat:parseFloat(location.lat),lng:parseFloat(location.lng)};	
		console.log(info);	
		Info.update(cond,info,{upsert:true},function (err){
			if (!err){
				formMessage.push("Info sauvegardée.");
			}else{
				formMessage.push("Erreur pendant la sauvegarde de l'info !");
				console.log(err);
			}
			req.session.message = formMessage;
			res.redirect('info/list')
		});
	}else{ // we changed the location of the news ( or insert a new one )
		/* NOTE : because place matching is done only on validated places ( status = 1 ), we do not need to 
		*  		
		*/
		info.location = {lat:parseFloat(location.lat),lng:parseFloat(location.lng)};	
					
		// search for a place like this one in db
		Place.findOne({title:placeInput.formatted_address,location:{$near:[parseFloat(location.lat),parseFloat(location.lng)],$maxDistance:0.1},status:1},function(err,theplace){
			if(err)
				throw err;
			else{	
				if(theplace){ // place is already in db, we match it
					info.placeId = theplace._id;
					info.address = theplace.title; 
					Info.update(cond,info,{upsert:true},function (err){
						if (!err)
							formMessage.push("Info sauvegardée.");
						else{
							formMessage.push("Erreur pendant la sauvegarde de l'info !");
							console.log(err);
						}
						req.session.message = formMessage;
						res.redirect('info/list')
					});
				}else{ // if nothing in db we create it 
					var place = new Place();
					place.title = placeInput.title;
					place.slug = strLib(placeInput.title).slugify().s;					
					place.origin = "Yakwala";
					place.access = 1;
					place.licence = "Yakwala";
					place.location = placeInput.location;
					place.status = 1;
					place.user = req.session.user;
					if(info.zone)
						place.zone = parseInt(info.zone);
					if(info.zoneName)
						place.zoneName = info.zoneName;
					place.creationDate = new Date();
					place.lastModifDate = new Date();
					place.formatted_address = placeInput.formatted_address;
					place.address = placeInput.address;
					place.yakCat = [mongoose.Types.ObjectId("504d89f4fa9a958808000001")];
					place.yakCatName = ["Géolocalisation"];
					place.save(function(err){console.log(err);});
					info.placeId = place._id;
					info.placeName = placeInput.title;
					info.address = placeInput.title; 
					Info.update(cond,info,{upsert:true},function (err){
						if (!err)
							formMessage.push("Info sauvegardée.");
						else{
							formMessage.push("Erreur pendant la sauvegarde de l'info !");
							console.log(err);
						}
						req.session.message = formMessage;
						res.redirect('info/list')
					});
				}
			}
			

		});
	}
};


exports.info_setstatus = function (req, res){
	var Info = db.model('Info');

	var status = req.body.status;
	var placeStatus = 0;

	if(status == 1)
		placeStatus = 0;// we don't validate the place
	else if(status == 2)
		placeStatus = 0;// we don't wait the place
	else if(status == 3)
		placeStatus = 0; // we don't disable the place
	else if(status == 4){
		placeStatus = 3;// we disable the place
		status = 3;
	}else if(status == 5){ // BL place and set in alert linked infos
		placeStatus = 3;// we disable the place
		status = 2;
	}
		

	Info.findOne({_id:req.body._id},function(err,theinfo){
		if(theinfo != null && typeof theinfo != 'undefined'){
			Info.update({_id: mongoose.Types.ObjectId(req.body._id)},{$set:{'status':status}}, function(err){
				if(!err){
					if(placeStatus >  0 && theinfo.placeId != '' && theinfo.placeId != null && theinfo.placeId != 'null' && typeof theinfo.placeId != 'undefined' ){
						// update all other info linked to this place
						Info.update({placeId: theinfo.placeId},{$set:{'status':status}},{ multi: true }, function(err){
							if(!err){
								// update the place linked
								var Place = db.model("Place");
								Place.update({_id:theinfo.placeId},{$set:{status:placeStatus}}, function(err,docs){
									if(!err){
										res.json({meta:{code:200,msg:'Info and Place updated'}});		
									}else
										res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
								});
							}else
								res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});	
						});
							
					}else
						res.json({meta:{code:200,msg:'Info updated'}});
				}else
					res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
			});

		}
	});		
};


/******************************************************************************************************************************************************************
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

/******************************************************************************************************************************************************************
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




/******************************************************************************************************************************************************************
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
 		
 		zone.location = {lat : parseFloat(req.body.latCT),lng:parseFloat(req.body.lngCT)};
		var box = new Object();
		box.tr = {lat : parseFloat(req.body.latTR),lng:parseFloat(req.body.lngTR)};
		box.bl = {lat : parseFloat(req.body.latBL),lng:parseFloat(req.body.lngBL)};

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
    Zone.findOne({_id:req.params.id}, function (err, docs){
      res.json({
        zone: docs
      });
    });
};

exports.findZoneByNum = function (req, res) {
    var Zone = db.model('Zone');
    Zone.findOne({num:req.params.num}, function (err, docs){
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

exports.findAllZoneContaining = function (req, res) {
	var Zone = db.model('Zone');
	Zone.findAllContaining(req.params.x,req.params.y,function (err, docs){
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





/******************************************************************************************************************************************************************
#PLACE 
*******/
exports.place_add = function(req, res){
	res.render('place/add');
};

exports.place_list = function(req, res){
	delete req.session.message;
	res.render('place/index',{idplace:req.params.id});
};

exports.place = function(req, res){

	var formMessage = new Array();
	delete req.session.message;
	var Place = db.model('Place');
	var Zone = db.model('Zone');
	var Yakcat = db.model('Yakcat');
	//mongoose.set('debug', true);
	var obj_id = req.body.objid;
	
	var place = new Object();
	var now = new Date();

	if(req.body.thumbHidden != '')
		place.thumb = req.body.thumbHidden;


	// we need a title, a location and a user
	if(req.body.placeInput && req.body.title && req.session.user){
		var placeThumb = new Object();
		if(req.files.picture.size && req.files.picture.size > 0 && req.files.picture.size < 1048576*5){
			var drawTool = require('../mylib/drawlib.js');
			var size = mainConf.imgSizePlace;
			var crypto = require('crypto');
			var destFile = crypto.createHash('md5').update(req.files.picture.name).digest("hex")+'.jpeg';
					
			for(i=0;i<size.length;i++){
				placeThumb = drawTool.StoreImg(req.files.picture,destFile,{w:size[i].width,h:size[i].height},conf);
			}
			place.thumb = placeThumb.name;
		}

		else{
			placeThumb.err = 0;
		}
			
		place.yakCat = [];
		if(req.body.yakCatIdsHidden)
			place.yakCat = req.body.yakCatIdsHidden.split(',');
		place.yakCatName = [];
		if(req.body.yakCatNamesHidden)
			place.yakCatName = req.body.yakCatNamesHidden.split(',');
		place.freeTag = [];
		if(req.body.tagsHidden == '' && req.body.freetag != '')
			place.freeTag = req.body.freetag.split(',');
		else if(req.body.tagsHidden != '')		
			place.freeTag = req.body.tagsHidden.split(',');
		else
			place.freeTag = [];	

		
		if(req.body.yakCatVille == "yakCatVille"){
			place.yakCat.push("507e5a9a1d22b30c44000068");
			place.yakCatName.push("Ville");	
		}

		if(req.body.yakCatYakdico == "yakCatYakdico"){
			place.yakCat.push("5056b7aafa9a95180b000000");
			place.yakCatName.push("Yakdico");
		}	
	
		

		place.title = req.body.title;
		var strLib = require("string");
		place.slug = strLib(place.title).slugify().s;
	
		place.content = req.body.content;

		// NOTE : in the query below, order is important : in DB we have lat, lng but need to insert in reverse order : lng,lat  (=> bug mongoose ???)
		
		var placeInput = JSON.parse(req.body.placeInput);
		place.formatted_address = placeInput.title;
		var location = placeInput.location;
		place.location = {lng:parseFloat(location.lng),lat:parseFloat(location.lat)};

		place.address = placeInput.address;
		place.origin = req.body.hiddenOrigin;
		place.outGoingLink = req.body.outgoinglink;

		place.status = parseInt(req.body.status);

		place.access = 1;
		place.licence = req.body.licence;
		

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

		place.zone = req.body.zone;
		place.zoneName = req.body.zoneName;
	
		if(typeof obj_id != 'undefined' && obj_id != ''){
			var cond = {_id:obj_id};
		}else{
			place.creationDate = now;
			place.lastExecDate = now;
			var cond = {title:"anameimpossibletochoose007"};
		}


		Place.update(cond,place,{upsert:true},function (err){
			if (!err)
				formMessage.push("Lieu sauvegardé.");
			else{
				formMessage.push("Erreur pendant la sauvegarde du lieu !");
				console.log(err);
			}
			req.session.message = formMessage;
			res.redirect('place/list')
		});
	
	
	}else{
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
   	Place.findById(req.params.id, function (err, doc){
  	  res.json({
  		place: Place.format(doc)
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
	console.log(ids);
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

    var feeds = [];
    if (req.query.feeds) {
        feeds = req.query.feeds.split(',');
    }

    var sortProperties = [];
    if (req.params.sortBy) {
        sortProperties = req.params.sortBy.split(',');
    }

    var sortDirections = [];
    if (req.params.sortDirection) {
        sortDirections = req.params.sortDirection.split(',');
    }

    var status = [];
	status = req.params.status.split(',');


	Place.findGridPlaces(req.params.pageIndex,req.params.pageSize,
		req.params.searchTerm,sortProperties,sortDirections,
        status, yakcats, users, feeds, req.params.limit, function (err, place){
        var placeFormated = new Array();
        if(place){
        	var placeFormated = place.map(function(item){
				return Place.format(item);
			});	
        }

		
        var data = {};
        data['place'] = placeFormated;
		data['pageIndex'] = req.params.pageIndex;
		data['pageSize'] = req.params.pageSize;

		Place.countSearch(req.params.searchTerm, status, yakcats, users, feeds, req.params.limit, function (err, count){
			data['count'] = count;
			res.json(data);
		});
	});
};


exports.findPlaceBySlug = function (req, res) {
	var Place = db.model('Place');
   	Place.findBySlug(req.params.title, function (err, theplace){
   		res.json({
			place: theplace
		});
	});
};


exports.searchByTitleAndStatus = function (req, res) {
	var Place = db.model('Place');
	var status = [];
	status = req.params.status.split(',');

	Place.searchByTitleAndStatus(req.params.str,status, function (err, places){
  	  res.json({
  		places: places
	  });
	});
};

exports.place_setstatus = function (req, res){
	var Place = db.model('Place');
	var Info = db.model('Info');

	var status = req.body.status;
	var infoStatus = 1;
	if(status == 1)
		infoStatus = 1;
	else if(status == 2)
		infoStatus = 2;
	else if(status == 3)
		infoStatus = 0; // we don't blacklist the infos linked to this place
	else if(status == 4){
		infoStatus = 3;
		status = 3;
	}
		
	Place.update({_id: mongoose.Types.ObjectId(req.body._id)},{$set:{'status':status}}, function(err){
		if(!err){
			if(infoStatus >  0){
				// update all other infos linked to this place
				Info.update({placeId: req.body._id},{$set:{'status':infoStatus}},{ multi: true }, function(err){
					if(!err){
						res.json({meta:{code:200,msg:'Le lieu et toutes les infos liées ont été modifiés'}});		
					}else
						res.json({meta:{code:404,error_type:'Operation failed',error_description:err.toString()}});	
				});
			}else
				res.json({meta:{code:200,msg:'Lieu modifié'}});
		}else
			res.json({meta:{code:404,error_type:'operation failed',error_description:err.toString()}});
	});

};

/******************************************************************************************************************************************************************
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

	var status = req.body.status;
	var infostatus = 1;
	if(status != 1){ // if we disactivate the user
		infoStatus = 3;
	}else{
		infoStatus = 1;
	}

	User.update({_id: mongoose.Types.ObjectId(req.body._id)},{$set:{'status':status}}, function(err){
		if(!err){
			var Info = db.model("Info");
			Info.update({user:mongoose.Types.ObjectId(req.body._id)},{$set:{status:infoStatus}}, function(err,docs){
				if(!err){
					// send email
					if(status != 1){
						User.findOne({_id:req.body._id},function(err,theuser){
							if(theuser != null && typeof theuser != 'undefined' && typeof theuser.mail != 'undefined'){
								User.sendBlacklistedMail(theuser.mail,function(err){
									if(err)
										console.log(err);
									else
										res.json({meta:{code:200,mail:1}});				
								});
							}
						});
					}
				}else
					res.json({meta:{code:404,mail:0,error_type:'operation failed',error_description:err.toString()}});
			});
		}else
			res.json({meta:{code:404,mail:0,error_type:'operation failed',error_description:err.toString()}});
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



exports.userSearchByNameorLogin = function (req, res) {
	var User = db.model('User');
	User.searchByNameorLogin(req.params.str,function (err, users){
  	  res.json({
  		users: users
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

/******************************************************************************************************************************************************************
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
						Info.update({user:mongoose.Types.ObjectId(content_id)},{$set:{status:infoStatus}}, { multi: true }, function(err,docs){
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


/******************************************************************************************************************************************************************
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
