
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
//var util = require('util');
//res.send(util.inspect(res));
//var mongoose = require('mongoose'), Schema = mongoose.Schema;
//var db = mongoose.connect('mongodb://localhost/yakwala');
//var Info = db.model('Info');
//Info.findAll(function (err, docs){
//	res.render('actu/map',{locals:{infos:docs,title:'testelo'}});
//});
	
	res.render('actu/map',{conf: JSON.stringify(conf)});  
};
exports.actu_new = function(req, res){
  res.render('actu/new',{locals:{title:{'test':'Poster une actu'}}});
};
exports.actu_fil = function(req, res){
	var Info = db.model('Info');
	Info.findAll(function (err, docs){
		res.render('actu/fil',{locals:{infos:docs}});
	}); 
};


exports.user_login = function(req, res){
  res.render('user/login',{title:'Login',locals: {redir : req.query.redir}});
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
			req.flash('warn','Login failed');
			res.render('user/login',{title:'login',locals:{redir:req.body.redir}});
		}
	});
};


exports.actu = function(req, res){

	var Info = db.model('Info');
	var Place = db.model('Place');
	
	var place = new Place();
	mongoose.set('debug', true);
	// NOTE : in the query below, order is important : in DB we have lat, lng but need to insert in reverse order : lng,lat  (=> bug mongoose ???)
	//info.location = {lng:parseFloat(req.body.longitude),lat:parseFloat(req.body.latitude)};
	
	//var locTmp = [];
	//var locTmp =  eval('{' + req.body.placeInput + '}');
	//eval('var locTmp='+req.body.placeInput);
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
		
		info.location = {lng:parseFloat(item.location.lng),lat:parseFloat(item.location.lat)};
		// if no id, it means the location comes from gmap => we store it
		console.log('item_id'+item._id);
		if(item._id == "" || typeof item._id === "undefined"){
		console.log(item);
		//[{"_id":"","title":"Place du Carrousel, 75001 Paris, France","content":"","thumb":"","origin":"yakwala","access":2,"licence":"Yakwala","outGoingLink":"","yakCat":["504d89f4fa9a958808000001"],
		//	"creationDate":"2012-09-17T09:30:05.980Z","lastModifDate":"2012-09-17T09:30:05.980Z","location":{"lng":2.3348863999999594,"lat":48.862492},"status":2,"address":{"street":"Place du Carrousel","arr":"","city":"Paris","state":"Paris","area":"Île-de-France","country":"France","zip":"75001"}}]
			/*place.title = item.title;
			place.content = item.content;
			place.thumb = item.thumb;
			place.origin = item.origin;
			place.thumb = item.thumb;
			place.access = item.access;
			place.licence = item.licence;
			place.outGoingLink = item.outGoingLink;
			place.thumb = item.thumb;
			place.thumb = item.thumb;
			place.save();*/
			//var itemObj = JSON.parse(item);
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
		info.outGoingLink = req.body.link;
		//console.log(info);
		info.print = 1;
		info.status = 1;
		info.yakType = 4; // UGC
		
		
		info.save(function (err) {
			if (!err) console.log('Success!');
			else console.log(err);
		});
		
	});
	
	
	res.render('actu/new',{title:'Poster une actu'});
};