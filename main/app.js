
/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  api = require('./routes/api'),
  users = require('./routes/users'),
  db = require('./models/mongooseModel');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {
    layout: true
  });
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));
  app.use(express.cookieParser());
  // Session management
  app.use(express.session({
    // Private crypting key
    "secret": "some private string",
    // Internal session data storage engine, this is the default engine embedded with connect.
    // Much more can be found as external modules (Redis, Mongo, Mysql, file...). look at "npm search connect session store"
    "store":  new express.session.MemoryStore({ reapInterval: 60000 * 10 })
  }));
  app.use(app.router);
});


app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);


app.get('/partials/:name', routes.partials);
app.get('/actu/map', routes.actu_map);
app.get('/actu/fils', routes.actu_fils);
//app.get('/actu/new', requiresLogin, routes.actu_new);
app.get('/actu/new', routes.actu_new);

app.get('/user/login', routes.user_login);

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
function requiresLogin(req,res,next){
	if(req.session.user){
		next();
	}else{
		res.redirect('/user/login?redir='+req.url);
	}
}

// Start server

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
