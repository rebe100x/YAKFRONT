
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index',{title:'Actu'});
};

exports.partials = function (req, res) {
  var name = req.params.name;
  res.render('partials/' + name);
};

exports.actu_map = function(req, res){
var util = require('util');
//res.send(util.inspect(res));
//var mongoose = require('mongoose'), Schema = mongoose.Schema;
//var db = mongoose.connect('mongodb://localhost/yakwala');
//var Info = db.model('Info');
//Info.findAll(function (err, docs){
//	res.render('actu/map',{locals:{infos:docs,title:'testelo'}});
//});
	res.render('actu/map');  
};
exports.actu_new = function(req, res){
  res.render('actu/new',{locals:{title:{'test':'Poster une actu'}}});
};
exports.actu_fil = function(req, res){

	var mongoose = require('mongoose'), Schema = mongoose.Schema;
	var db = mongoose.connect('mongodb://localhost/yakwala');
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

	var mongoose = require('mongoose'), Schema = mongoose.Schema;
	var db = mongoose.connect('mongodb://localhost/yakwala');
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

	var mongoose = require('mongoose'), Schema = mongoose.Schema;
	var db = mongoose.connect('mongodb://localhost/yakwala');
	var Info = db.model('Info');
	var data = new Info();
	if(req.body.yakcatInput.length > 0){
		var yakcat = eval('('+req.body.yakcatInput+')');
		for(i=0;i<yakcat.length;i++){
		
			data.yakCat.push(mongoose.Types.ObjectId(yakcat[i]._id));
		}
	}
	//console.log(req.body);
	data.title = req.body.title;
	data.content = req.body.content;
	// NOTE : in the query below, order is important : in DB we have lat, lng but need to insert in reverse order : lng,lat  (=> bug mongoose ???)
	data.location = {lng:parseFloat(req.body.longitude),lat:parseFloat(req.body.latitude)};
	data.creationDate = new Date();
	data.lastModifDate = new Date();
	data.pubDate = new Date();
	var now = new Date();
	var D = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
	var DTS = D.getTime() / 1000 + (3 * 60 * 60 * 24);
	D.setTime(DTS*1000); 
	data.dateEndPrint = D;
	data.outGoingLink = req.body.link;
	//console.log(data);
	data.print = 1;
	data.status = 1;
	data.yakType = 4; // UGC
	data.save();
	
	res.render('actu/new',{title:'Poster une actu'});
};