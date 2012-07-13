
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  api = require('./routes/api'),
  db = require('./models/mongooseModel');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.disable('view cache');
});

app.configure('production', function(){
  app.use(express.static(__dirname + '/public', { maxAge: oneYear }));
  app.use(express.errorHandler());
});

//console.log(app.enabled('view cache'));
// Routes

app.get('/', routes.index);
app.get('/map', routes.map);
app.get('/actu', routes.actu);
app.get('/partials/:name', routes.partials);

// JSON API
 
app.get('/api/info', api.posts);
 

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
