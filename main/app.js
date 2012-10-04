
/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  api = require('./routes/api'),
  users = require('./routes/users'),
  db = require('./models/mongooseModel'),
  config = require('./confs.js'),
  fs = require('fs');
  
var app = express();

// Configuration

	

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  //app.set('view options', {layout: true});
  app.use(express.bodyParser({keepExtensions: true,uploadDir:__dirname + '/public/uploads/originals'}));
  app.use(express.static(__dirname + '/public'));
  app.use(express.cookieParser('SAfuBUZ2'));
  // Session management
  app.use(express.session({
    "secret": "yakwala2012 info hyper locale",
    "store":  new express.session.MemoryStore({ reapInterval: 60000 * 10 })
  }));
  app.use(function(req, res, next){
    res.locals.session = req.session.user;
	res.locals.user = JSON.stringify(req.session.user);
	res.locals.redir = req.query.redir;
	res.locals.message = req.session.message;
	//res.locals.conf = JSON.stringify(config.confs.dev);
    next();
  });
  
  app.use(express.methodOverride());
  app.use(app.router);
  
});

app.configure('development', function(){
	conf = config.confs.dev;
	app.locals.conf = JSON.stringify(config.confs.dev);
	
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});


app.configure('production', function(){
	conf = config.confs.prod;
	app.locals.conf = JSON.stringify(config.confs.prod);
	app.use(express.errorHandler());
});

var db = routes.db(conf);	


	
// Routes

app.get('/', routes.index);


app.get('/partials/:name', routes.partials);
//app.get('/news/map', requiresPosition, routes.news_map);
app.get('/news/map', routes.news_map);
app.get('/news/map_test', routes.news_map_test);
app.get('/news/feed', routes.news_feed);
app.get('/news/post', routes.news_post);
//app.get('/news/post', requiresLogin, routes.news_post);

app.get('/user/login', routes.user_login);
app.get('/user/logout', routes.user_logout);

app.get('/settings', routes.settings_profil);
app.get('/settings/profile', routes.settings_profile);
app.get('/settings/alerts', routes.settings_alerts);
app.get('/settings/password', routes.settings_password);



app.post('/user',routes.user);
app.post('/news',routes.news);
app.post('/alerts',routes.alerts);
app.post('/profile',routes.profile);
// JSON API



app.get('/api/infos', api.infos);
app.get('/api/geoinfos/:x1/:y1/:x2/:y2/:heat/:type', api.geoinfos);
app.get('/api/zones/:x/:y', api.zones);
app.post('/api/users', api.users);
app.get('/api/cats', api.cats);
app.get('/api/places', api.places);
app.get('/api/usersearch/:string', api.usersearch);

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
		
function requiresLogin(req,res,next){
	if(req.session.user){
		next();
	}else{
		req.session.message = 'Please login to access this section:';
		res.redirect('/user/login?redir='+req.url);
	}
}
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

app.listen(conf.port, function(){
  console.log("Express server listening on port %d in %s mode", conf.port, app.settings.env);
});
