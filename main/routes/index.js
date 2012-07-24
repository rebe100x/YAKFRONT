
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
  res.render('actu/map',{title:'La YakwaCarte'});
};
exports.actu_new = function(req, res){
  res.render('actu/new',{title:'Poster une actu'});
};
exports.actu_fils = function(req, res){
  res.render('actu/fils',{title:'Le fils actu'});
};


exports.user_login = function(req, res){
  res.render('user/login',{title:'Login',locals: {redir : req.query.redir}});
};


exports.user = function(req, res){

	var mongoose = require('mongoose'), Schema = mongoose.Schema;
	var db = mongoose.connect('mongodb://localhost/yakwala');
	var User = db.model('User');
	
	
	User.Authenticate(req.body.login,req.body.password,function(err,user){
		if(user.length > 0){
			req.session.user = user
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
	var yakcat = eval('('+req.body.yakcatInput+')');
	for(i=0;i<yakcat.length;i++){
		data.yakCat.push(yakcat[i]);
	}
	
	data.title = req.body.title;
	data.content = req.body.content;
	console.log(data);
	
	data.save();
	
	res.render('actu/new',{title:'Poster une actu'});
};