var express = require('express'),
  routes = require('./routes'),
  track = require('./routes/track'),
  auth = require('./mylib/basicAuth'),
  db = require('./models/yakTrackModel'),
  config = require('./confs.js')
  ;
    
var app = express();


// Configuration

app.configure(function(){
  app.use(express.methodOverride());
  app.use(app.router);
  
});

app.configure('development', function(){
	conf = config.confs.devrenaud;
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});


app.configure('production', function(){
	conf = config.confs.prod;
	app.use(express.errorHandler());
});

app.options('/track/user/:userid/:actionid/:params', function(req, res){
  res.header("Access-Control-Allow-Origin", "*");
  res.end('');
});

var db = track.db(conf);	

app.get('/track/user/:userid/:actionid/:params', track.trak_user);

// Start server
app.listen(conf.trakport, function(){
 console.log("Express server %s listening on port %d in %s mode", conf.frontdns, conf.trakport, app.settings.env);
});

