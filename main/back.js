
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
  AWS = require('aws-sdk'),
  config_secret = require('./confs_secret.js'),
  compressor = require('node-minify')
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

app.get('/user/login', back.user_login);
app.get('/user/logout', back.user_logout);
app.post('/session',back.session);

app.get('/place/list', back.requiresLogin, back.place_list);
app.get('/feed/list', back.requiresLogin, back.feed_list);


app.post('/feed', back.requiresLogin, back.feed);
app.post('/place', back.requiresLogin, back.place);
app.post('/user', back.requiresLogin, back.user);
app.post('/news', back.requiresLogin, back.news);
app.post('/alerts', back.requiresLogin, back.alerts);
app.post('/profile', back.requiresLogin, back.profile);

// api
app.get('/api/infos', back.infos);
app.get('/api/validinfos', back.countUnvalidatedInfos);
app.get('/api/geoinfos/:x1/:y1/:x2/:y2/:heat/:type', back.geoinfos);
app.get('/api/zones/:x/:y', back.zones);
app.get('/api/zones/:id', back.findZoneById);
app.post('/api/users', back.users);
app.get('/api/users', back.users);

app.get('/api/feed/:id', back.findFeedById);
app.get('/api/cats/:id', back.catsById);
app.get('/api/cats', api.cats);
app.get('/api/tags', api.tags);
app.get('/api/places', back.places);
app.get('/api/places/:pageIndex/:pageSize/:searchTerm/:sortBy/:sortDirection/:status', back.gridPlaces);
app.get('/api/places/:id', back.findPlaceById);
app.get('/api/feeds/:pageIndex/:pageSize/:searchTerm/:sortBy/:sortDirection/:status/:type', back.gridFeeds);
app.get('/api/usersearch/:string', back.usersearch);
app.get('/api/findCatById', back.findCatById);
app.get('/api/user/:id', back.findUserById);

app.get('/api/validusers', back.countUnvalidatedUsers);
app.get('/api/validcats', back.countUnvalidatedCats);
app.get('/api/validplaces', back.countUnvalidatedPlaces);

app.get('/api/places/validate/:ids', back.validatePlaces);
app.get('/api/places/delete/:ids', back.deletePlaces);
app.get('/api/places/wait/:ids', back.waitPlaces);

app.post('/api/favplace', back.addfavplace);
app.post('/api/delfavplace', back.delfavplace);

// redirect all others to the index (HTML5 history)
app.get('*', back.index);




// Start server
app.listen(conf.backport,conf.backdns, function(){
 console.log("Express server %s listening on port %d in %s mode", conf.backdns, conf.backport, app.settings.env);
});


// Uglify with node-minify : https://github.com/srod/node-minify
new compressor.minify({
  type: 'yui-js',
  fileIn: [
  
   __dirname+'/public/javascripts/lib/jquery/js/jquery-1.8.2.min.js'
  , __dirname+'/public/javascripts/lib/jquery/js/jquery-ui-1.8.24.custom.min.js'
  
  , __dirname+'/public/javascripts/lib/plugin/jquery.form.js'
  , __dirname+'/public/javascripts/lib/toastr/toastr.js'
  , __dirname+'/public/javascripts/lib/jquery/js/timeago.js'
  , __dirname+'/public/javascripts/lib/plugin/happy.js'
  , __dirname+'/public/javascripts/lib/jquery/js/jquery.ui.widget.js'
  , __dirname+'/public/javascripts/lib/jquery/js/jquery.iframe-transport.js'
  , __dirname+'/public/javascripts/lib/jquery/js/jquery.fileupload.js'
  , __dirname+'/public/javascripts/lib/fuelux/lib/require.js'
  , __dirname+'/public/javascripts/lib/fuelux/dist/loader.min.js'
  , __dirname+'/public/javascripts/lib/bootstrap/js/bootstrap.min.js'
  , __dirname+'/public/javascripts/lib/bootstrap/js/bootstrap-typeahead.js'
  , __dirname+'/public/javascripts/lib/plugin/jquery.cookie.js'
  , __dirname+'/public/javascripts/lib/plugin/jquery.mousewheel.min.js'
  , __dirname+'/public/javascripts/lib/plugin/jquery.mCustomScrollbar.min.js'
  , __dirname+'/public/javascripts/lib/plugin/jquery/js/jquery.md5.min.js'
   , __dirname+'/public/javascripts/common.js'
  , __dirname+'/public/javascripts/back_common.js'
  ],
  fileOut: __dirname+'/public/javascripts/minify/back-min-'+ mainConf.versionback+'.js',
  callback: function(err){
    if(err)
      console.log(err);
    else
      console.log('YUI JS BACK compressor ok');
  } 
});

new compressor.minify({
  type: 'yui-css',
  fileIn: [
  
   __dirname+'/public/javascripts/lib/bootstrap/css/bootstrap.css'
  , __dirname+'/public/javascripts/lib/bootstrap/css/bootstrap-responsive.css'
  , __dirname+'/public/javascripts/lib/jquery/css/custom-theme/jquery-ui-1.8.24.custom.css'
  , __dirname+'/public/javascripts/lib/jquery/css/jquery.mCustomScrollbar.css'
  , __dirname+'/public/javascripts/lib/fuelux/dist/css/fuelux.css'
  , __dirname+'/public/javascripts/lib/toastr/toastr.css'
  , __dirname+'/public/stylesheets/common.css'
  , __dirname+'/public/stylesheets/backstyle.css'
  ],
  fileOut: __dirname+'/public/stylesheets/minify/back-min-'+ mainConf.versionback+'.css',
  callback: function(err){
    if(err)
      console.log(err);
    else
      console.log('YUI CSS BACK compressor ok');
  } 
});

