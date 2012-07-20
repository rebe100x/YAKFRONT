
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
  res.render('user/login',{title:'Login',locals: {redir : req.query.redir}});
};
