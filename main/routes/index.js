
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Home' })
};

exports.map = function(req, res){
  res.render('map', { title: 'Yakwala - La carte' })
};

exports.actu = function(req, res){
  res.render('actu', { title: 'Yakwala - Le fils info' })
};

exports.partials = function (req, res) {
  var name = req.params.name;
  res.render('partials/' + name,{ title: 'infos' });
};