
/*
 * GET home page.
 */

 exports.db = function(conf){
	mongoose = require('mongoose'), Schema = mongoose.Schema;
	//mongoose.set('debug', true);
	db = mongoose.connect('mongodb://localhost/'+conf.dbname);
	
 };
	
exports.index = function(req, res){
  res.render('index',{title:'Actu'});
};

exports.partials = function (req, res) {
  var name = req.params.name;
  res.render('partials/' + name);
};

exports.actu_map = function(req, res){
	res.render('actu/map');  
};
exports.actu_map_test = function(req, res){
	res.render('actu/map_test');  
};
exports.actu_new = function(req, res){
	delete req.session.message;
  res.render('actu/new');
};
exports.actu_fil = function(req, res){
	var Info = db.model('Info');
	Info.findAll(function (err, docs){
		res.render('actu/fil',{locals:{infos:docs}});
	}); 
};


exports.user_login = function(req, res){
	delete req.session.message;
	res.render('user/login',{locals:{redir:req.query.redir}});
};

exports.user_logout = function(req, res){
	delete req.session.user;
	res.redirect('/user/login');
};

exports.user = function(req, res){

	var User = db.model('User');
	
	
	User.Authenticate(req.body.login,req.body.password,function(err,user){
		if(!(typeof(user) == 'undefined' || user === null || user === '')){
			req.session.user = user;
			res.redirect(req.body.redir || '/');
		}else{
			req.session.message = 'Wrong login or password:';
			res.redirect('user/login?redir='+req.body.redir);
		}
	});
};


exports.actu = function(req, res){

	var formMessage = new Array();
	delete req.session.message;
	var Info = db.model('Info');
	var Place = db.model('Place');
	
	var place = new Place();
	//mongoose.set('debug', true);
	
	
	console.log(req.files);
	// we need a title, a location and a user
	if(req.body.placeInput && req.body.title && req.session.user){
	
	
		console.log(req.files);
		/**UPLOAD IMAGE*/
		if(req.files.picture.size){
			var im = require('imagemagick');

			// get the size
			im.identify(['-format', '%w', req.files.picture.path], function(err, output){
			  if (err) throw err
			  if(output > 512){
				im.resize({
					srcPath: req.files.picture.path,
					dstPath: conf.uploadsDir+'pictures/512_0/'+req.files.picture.name,
					strip : false,
					width : 512,
				}, function(err, stdout, stderr){
					if (err) throw err
				});
			  }else{
				fs = require('fs');
				srcFile = fs.createWriteStream(req.files.picture.path);     
				dstFile = fs.createReadStream(conf.uploadsDir+'/pictures/512_0/'+req.files.picture.name);
				fs.renameSync(req.files.picture.path,conf.uploadsDir+'/pictures/512_0/'+req.files.picture.name);
			  }
			  
			  
			})
			
			// create thumbnail
			im.resize({
				srcPath: req.files.picture.path,
				dstPath: conf.uploadsDir+'pictures/120_90/'+req.files.picture.name,
				strip : false,
				width : 120,
				height : "90^",
				customArgs: [
					 "-gravity", "center"
					,"-extent", "120x90"
					]
				
			}, function(err, stdout, stderr){
			if (err) throw err
			});
			
			var infoThumb = req.files.picture.name;
		}	
		

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
		if(!req.session.user)
			formMessage.push("Veuillez vous identifier pour poster une info");
		if(!req.body.title)
			formMessage.push("Erreur: définissez le titre de l'info");
		if(!req.body.placeInput)
			formMessage.push("Erreur: définissez une géolocalisation de l'info");
		
		
		
		
	}
		
	
	req.session.message = formMessage;
	
	res.redirect('actu/new');
};