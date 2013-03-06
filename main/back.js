
/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  api = require('./routes/api'),
  back = require('./routes/back'),
  auth = require('./mylib/basicAuth'),
  db = require('./models/mongooseModel'),
  config = require('./confs.js'),  
  fs = require('fs'),
  S = require('string'),
  crypto = require('crypto'),
  nodemailer = require("nodemailer"),
  AWS = require('aws-sdk')
  config_secret = require('./confs_secret.js');
  ;
  
  
var app = express();

// Configuration




app.configure(function(){
  app.set('views', __dirname + '/views/back');
  app.set('view engine', 'jade');
  app.use(express.bodyParser({keepExtensions: true,uploadDir:__dirname + '/public/uploads/originals'}));
  app.use(express.static(__dirname + '/public'));
  app.use(express.cookieParser(config_secret.confs_secret.COOKIE.cookieParser));
  app.use(express.session({
    "secret": config_secret.confs_secret.SESSION.secret,
    "stringifyore":  new express.session.MemoryStore({ reapInterval: 60000 * 10 })
  }));
   app.use(function(req, res, next){
    res.locals.session = req.session.user;
	res.locals.redir = req.query.redir;
	res.locals.message = req.session.message;
	res.locals.type = req.session.type;
    next();
  });
  
  app.use(express.methodOverride());
  app.use(app.router);
  
});

app.configure('development', function(){
	conf = config.confs.devrenaud;
	app.locals.conf = JSON.stringify(conf);
	mainConf = config.confs.main;
	app.locals.mainConf = JSON.stringify(mainConf);
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});


app.configure('production', function(){
	conf = config.confs.prod;
	app.locals.conf = JSON.stringify(conf);
	mainConf = config.confs.main;
	app.locals.mainConf = JSON.stringify(mainConf);
	app.use(express.errorHandler());
});

var db = routes.db(conf);	
	
// Routes


app.get('/', back.requiresLogin, back.back_default);

app.get('/news/map', back.news_map);
app.get('/news/map_test', back.news_map_test);
app.get('/news/feed', back.news_feed);
app.get('/news/post', back.news_post);
//app.get('/news/post', requiresLogin, back.news_post);

app.get('/user/login', back.user_login);
app.get('/user/logout', back.user_logout);
app.post('/session',back.session);

app.get('/settings', back.requiresLogin, back.settings_profil);
app.get('/settings/profile', back.requiresLogin, back.settings_profile);
app.get('/settings/alerts', back.requiresLogin, back.settings_alerts);
app.get('/settings/password', back.requiresLogin, back.settings_password);

app.get('/place/list', back.requiresLogin, back.place_map);


app.post('/place', back.requiresLogin, back.place);
app.post('/user', back.requiresLogin, back.user);
app.post('/news', back.requiresLogin, back.news);
app.post('/alerts', back.requiresLogin, back.alerts);
app.post('/profile', back.requiresLogin, back.profile);
// JSON API

app.get('/api/infos', api.infos);
app.get('/api/validinfos', api.countUnvalidatedInfos);
app.get('/api/geoinfos/:x1/:y1/:x2/:y2/:heat/:type', api.geoinfos);
app.get('/api/zones/:x/:y', api.zones);
app.get('/api/zones/:id', api.findZoneById);
app.post('/api/users', api.users);
app.get('/api/users', api.users);
app.get('/api/cats', api.cats);
app.get('/api/cats/:id', api.findCatById);
app.get('/api/places', api.places);
app.get('/api/places/:pageIndex/:pageSize/:searchTerm/:sortBy/:sortDirection/:status', api.gridPlaces);
app.get('/api/places/:id', api.findPlaceById);
app.get('/api/usersearch/:string', api.usersearch);
app.get('/api/findCatById', api.findCatById);
app.get('/api/user/:id', api.findUserById);

app.get('/api/validusers', api.countUnvalidatedUsers);
app.get('/api/validcats', api.countUnvalidatedCats);
app.get('/api/validplaces', api.countUnvalidatedPlaces);

app.get('/api/places/validate/:ids', api.validatePlaces);
app.get('/api/places/delete/:ids', api.deletePlaces);
app.get('/api/places/wait/:ids', api.waitPlaces);

app.post('/api/favplace', api.addfavplace);
app.post('/api/delfavplace', api.delfavplace);

// redirect all others to the index (HTML5 history)
app.get('*', back.index);




// Start server
app.listen(conf.backport,conf.backdns, function(){
 console.log("Express server %s listening on port %d in %s mode", conf.backdns, conf.backport, app.settings.env);
});

