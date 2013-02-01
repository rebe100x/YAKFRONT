/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  api = require('./routes/api'),
  users = require('./routes/users'),
  auth = require('./mylib/basicAuth'),
  db = require('./models/mongooseModel'),
  config = require('./confs.js'),
  fs = require('fs'),
  S = require('string'),
  crypto = require('crypto'),
  nodemailer = require("nodemailer")
  ;
  
  
var app = express();

// Configuration




app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser({keepExtensions: true,uploadDir:__dirname + '/public/uploads/originals'}));
  app.use(express.static(__dirname + '/public'));
  app.use(express.cookieParser('SAfuBUZ2'));
  // Session management
  app.use(express.session({
    "secret": "bb352fece6f80a5cff2d6088a376eddf",
    "stringifyore":  new express.session.MemoryStore({ reapInterval: 60000 * 10 })
  }));
  app.use(function(req, res, next){
    res.locals.session = req.session.user;
	res.locals.redir = req.query.redir;
	res.locals.message = req.session.message;
	res.locals.type = req.session.type;
	var pjson = require('./package.json');
	app.locals.version = pjson.version;
	next();
  });
  
  app.use(express.methodOverride());
  app.use(app.router);
  
});

app.configure('development', function(){
	conf = config.confs.devrenaud;
	app.locals.conf = JSON.stringify(config.confs.devrenaud);
	mainConf = config.confs.main;
	app.locals.mainConf = JSON.stringify(config.confs.main);
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});


app.configure('production', function(){
	conf = config.confs.prod;
	app.locals.conf = JSON.stringify(config.confs.prod);
	mainConf = config.confs.main;
	app.locals.mainConf = JSON.stringify(config.confs.main);
	app.use(express.errorHandler());
});

var db = routes.db(conf);	


	
// Routes


// OPEN ACCES ROUTES :
app.get('/user/login', routes.user_login);
app.get('/user/logout', routes.user_logout);
app.get('/user/new', routes.user_new);
app.get('/user/validate/:token/:password', routes.user_validate);
app.get('/pictures/:size/:picture', routes.picture);
app.get('/static/images/:name', routes.static_image);

app.post('/user',routes.user);
//app.post('/validate',routes.validate);
app.post('/session',routes.session);

// SECURED BY LOGIN ROUTES:

//map
app.get('/', routes.requiresLogin, routes.front_default);
app.get('/news/map', routes.requiresLogin, routes.news_map);
app.get('/news/map/search/:str', routes.requiresLogin, routes.news_map_search);
app.get('/news/feed/search/:str', routes.requiresLogin, routes.news_feed_search);
app.get('/news/feed', routes.requiresLogin, routes.news_feed);
app.get('/news/feed/:id', routes.requiresLogin, routes.news_feed);
app.get('/news/afeed', routes.requiresLogin, routes.news_afeed);
app.get('/news/loadingModal', routes.loadingModal);
app.post('/news',routes.requiresLogin, routes.news);

// settings
app.get('/settings', routes.requiresLogin, routes.settings_profil);

app.get('/settings/profile', routes.requiresLogin, routes.settings_profile);
app.post('/profile',routes.requiresLogin, routes.profile);

app.get('/settings/privateprofile', routes.requiresLogin, routes.settings_privateprofile);
app.post('/privateprofile',routes.requiresLogin, routes.privateprofile);

app.get('/settings/alerts', routes.requiresLogin, routes.settings_alerts);
app.post('/alerts',routes.requiresLogin,routes.alerts);

app.get('/settings/password', routes.requiresLogin, routes.settings_password);
app.post('/password',routes.requiresLogin, routes.password);

app.get('/settings/firstvisit', routes.requiresLogin, routes.settings_firstvisit);
app.post('/firstvisit',routes.requiresLogin, routes.firstvisit);

app.post('/favplace', routes.requiresLogin, routes.addfavplace); 
app.post('/delfavplace', routes.requiresLogin, routes.delfavplace); 

app.post('/favplacerange', routes.requiresLogin, routes.updatefavplacerange);

app.post('/setLikes', routes.requiresLogin, routes.setLikes);
app.post('/setComment', routes.requiresLogin, routes.setComment);

// OPEN ACCESS API
app.get('/api/infos', api.infos);
app.get('/api/feeds', api.feeds);
app.get('/api/afeed', api.afeed);

app.get('/api/geoinfos/:x1/:y1/:x2/:y2/:ago/:now/:type/:str', api.geoinfos);
app.get('/api/geoinfos/:x1/:y1/:x2/:y2/:ago/:now/:type/:str/:limit', api.geoinfos);
app.get('/api/geoinfos/:x1/:y1/:x2/:y2/:ago/:now/:type/:str/:limit/:skip', api.geoinfos);
app.get('/api/geoalerts/:x1/:y1/:x2/:y2/:ago/:now/:str', routes.requiresLogin, api.geoalerts);
app.get('/api/geoalerts/:x1/:y1/:x2/:y2/:ago/:now/:str/:limit', routes.requiresLogin, api.geoalerts);
app.get('/api/geoalerts/:x1/:y1/:x2/:y2/:ago/:now/:str/:limit/:skip', routes.requiresLogin, api.geoalerts);


app.get('/api/zones/:x/:y', api.zones);
app.get('/api/cats', api.cats);
app.get('/api/catsandtags', api.catsandtags);
app.get('/api/places', api.places);
app.get('/api/searchplaces/:str', api.searchplaces);
app.get('/api/usersearch/:string', api.user_search);
app.get('/api/feedusersearch/:string', api.feeduser_search);
app.get('/api/feedsearch/:string', api.feed_search);
app.get('/api/getUsers', api.getUsers);
app.get('/api/getContentTitles', api.getContentTitles);

// DOCS
app.get('/docs/api', routes.docs_api);
app.get('/docs/opendata', routes.docs_opendata);
app.get('/docs/cgu', routes.docs_cgu);
app.get('/docs/faq', routes.docs_faq);
app.get('/docs/log', routes.docs_log);


// redirect all others to the index (HTML5 history)
app.get('*', routes.front_default);



//io = require('socket.io');
//sio = io.listen(app);
/*		
function requiresLogin(req,res,next){
	if(req.session.user){
		next();
	}else{
		req.session.message = 'Please login to access this section:';
		res.redirect('/user/login?redir='+req.url);
	}
}*/

function requiresPosition(req,res,next){
	delete req.session.position;
	
	if(!req.session.position){
		sio.sockets.on('connection', function (socket) {
		  //socket.emit('news', { hello: 'world' });
		  socket.on('position', function (data) {
			req.session.position = data.x;
			//console.log(data);
			next();
		  });
		});
	}else{
		next();
	}
		
	next();
	
}

// Start server
app.listen(conf.frontport, function(){
 console.log("Express server %s listening on port %d in %s mode", conf.frontdns, conf.frontport, app.settings.env);
});

