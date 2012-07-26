
/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  api = require('./routes/api'),
  users = require('./routes/users'),
  db = require('./models/mongooseModel'),
  config = require('./confs.js');

var app = module.exports = express.createServer();

// Configuration


app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {layout: true});
  app.use(express.bodyParser());
  app.use(express.static(__dirname + '/public'));
  app.use(express.cookieParser());
  // Session management
  app.use(express.session({
    "secret": "yakwala2012 info hyper locale",
    "store":  new express.session.MemoryStore({ reapInterval: 60000 * 10 })
  }));
  app.use(express.methodOverride());
  app.use(app.router);
});

app.configure('development', function(){
	conf = config.confs.dev;
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
	conf = config.confs.prod;
	app.use(express.errorHandler());
});




	
// Routes

app.get('/', routes.index);


app.get('/partials/:name', routes.partials);
app.get('/actu/map', routes.actu_map);
app.get('/actu/fils', routes.actu_fils);
app.get('/actu/new', requiresLogin, routes.actu_new);


app.get('/user/login', routes.user_login);
app.get('/user/logout', routes.user_logout);

app.post('/user',routes.user);
app.post('/actu',routes.actu);
// JSON API



app.get('/api/infos', api.infos);
app.get('/api/zones/:x/:y', api.zones);
app.post('/api/users', api.users);
app.get('/api/cats', api.cats);

app.get('/api/posts', api.posts);
app.get('/api/post/:id', api.post);
app.post('/api/post', api.addPost);
app.put('/api/post/:id', api.editPost);
app.delete('/api/post/:id', api.deletePost);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);


app.dynamicHelpers({
	session:function(req,res){
		return req.session;
	},
	flash:function(req,res){
	
		return req.flash();
	}

});


//io = require('socket.io');
//sio = io.listen(app);
		
function requiresLogin(req,res,next){
	if(req.session.user){
		next();
	}else{
		res.redirect('/user/login?redir='+req.url);
	}
}
function requiresPosition(req,res,next){
	//delete req.session.position;
	if(!req.session.position){
		sio.sockets.on('connection', function (socket) {
		  //socket.emit('news', { hello: 'world' });
		  socket.on('position', function (data) {
			req.session.position = data.x;
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
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
