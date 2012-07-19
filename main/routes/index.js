
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
  res.render('actu/map',{title:'La carte'});
};
exports.actu_fils = function(req, res){
  res.render('actu/fils',{title:'Le fils actu'});
};