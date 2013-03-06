
/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  api = require('./routes/api'),
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


app.get('/', routes.requiresLogin, routes.index);


app.get('/partials/:name', routes.partials);
//app.get('/news/map', requiresPosition, routes.news_map);
app.get('/news/map', routes.news_map);
app.get('/news/map_test', routes.news_map_test);
app.get('/news/feed', routes.news_feed);
app.get('/news/post', routes.news_post);
//app.get('/news/post', requiresLogin, routes.news_post);

app.get('/user/login', routes.user_login);
app.get('/user/logout', routes.user_logout);
app.post('/session',routes.session);

app.get('/settings', routes.requiresLogin, routes.settings_profil);
app.get('/settings/profile', routes.requiresLogin, routes.settings_profile);
app.get('/settings/alerts', routes.requiresLogin, routes.settings_alerts);
app.get('/settings/password', routes.requiresLogin, routes.settings_password);

app.get('/place/list', routes.requiresLogin, routes.place_map);


app.post('/place', routes.requiresLogin, routes.place);
app.post('/user', routes.requiresLogin, routes.user);
app.post('/news', routes.requiresLogin, routes.news);
app.post('/alerts', routes.requiresLogin, routes.alerts);
app.post('/profile', routes.requiresLogin, routes.profile);
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

app.get('/api/posts', api.posts);
app.get('/api/post/:id', api.post);
app.post('/api/post', api.addPost);
app.put('/api/post/:id', api.editPost);
app.delete('/api/post/:id', api.deletePost);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);



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

//exports.app = app;


// Start server
app.listen(conf.backport,conf.backdns, function(){
 console.log("Express server %s listening on port %d in %s mode", conf.backdns, conf.backport, app.settings.env);
});

