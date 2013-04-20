

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
  AWS = require('aws-sdk'),
  config_secret = require('./confs_secret.js'),
  compressor = require('node-minify')
  ;
    
var app = express();


// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views/front');
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
	var oneYear = 31557600000;
	app.use(express.static(__dirname + '/public'), { maxAge: oneYear });
	conf = config.confs.prod;
	app.locals.conf = JSON.stringify(conf);
	mainConf = config.confs.main;
	app.locals.mainConf = JSON.stringify(mainConf);
	app.use(express.errorHandler());
});

var db = routes.db(conf);	


	
// Routes


// OPEN ACCES ROUTES :
app.get('/user/login', routes.user_login);
app.get('/user/logout', routes.user_logout);
app.get('/user/new', routes.user_new);
app.get('/user/forgotpassword', routes.user_forgotpassword);
app.get('/user/validate/:token/:password', routes.user_validate);
app.get('/user/resetpassword/:token/:password', routes.user_resetpassword);
app.get('/pictures/:size/:picture', routes.picture);
app.get('/static/images/:name', routes.static_image);

app.get('/track/user/:userid/:actionid/:logparams', routes.track_user);

app.post('/user',routes.user);
app.post('/forgotpassword',routes.forgotpassword);
//app.post('/validate',routes.validate);
app.post('/session',routes.session);
app.post('/session2',routes.session2);

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

app.get('/settings/blacklist', routes.requiresLogin, routes.settings_blacklist);

app.post('/user/alertsLastCheck', routes.requiresLogin, routes.user_alertsLastCheck);
app.post('/user/setUserAlerts', routes.requiresLogin, routes.set_user_alerts);
app.post('/user/setUserAlertsFeed', routes.requiresLogin, routes.set_user_alerts_feed);

app.post('/alerts',routes.requiresLogin,routes.alerts);

app.get('/settings/password', routes.requiresLogin, routes.settings_password);
app.post('/password',routes.requiresLogin, routes.password);


app.get('/settings/resetpassword', routes.requiresLogin, routes.settings_resetpassword);
app.post('/resetpassword',routes.requiresLogin, routes.resetpassword);

app.get('/settings/firstvisit', routes.requiresLogin, routes.settings_firstvisit);
app.post('/firstvisit',routes.requiresLogin, routes.firstvisit);

app.post('/favplace', routes.requiresLogin, routes.addfavplace); 
app.post('/delfavplace', routes.requiresLogin, routes.delfavplace); 

app.post('/favplacerange', routes.requiresLogin, routes.updatefavplacerange);

app.post('/setLikes', routes.requiresLogin, routes.setLikes);
app.post('/setSpams', routes.requiresLogin, routes.setSpams);
app.get('/getSpams/:infoid/:userid', routes.requiresLogin, routes.getSpams);
app.post('/api/setComment', routes.requiresLogin, api.setComment);
app.post('/api/del_Comment', routes.requiresLogin, api.del_comment);

// OPEN ACCESS API
app.get('/api/infos', api.infos);
app.get('/api/feeds', api.feeds);
app.get('/api/afeed', api.afeed);

app.get('/api/geoinfos/:x1/:y1/:x2/:y2/:ago/:now/:type/:str', api.geoinfos);
app.get('/api/geoinfos/:x1/:y1/:x2/:y2/:ago/:now/:type/:str/:limit', api.geoinfos);
app.get('/api/geoinfos/:x1/:y1/:x2/:y2/:ago/:now/:type/:str/:limit/:skip', api.geoinfos);
app.get('/api/geoalerts/:x1/:y1/:x2/:y2/:ago/:now/:type/:str', routes.requiresLogin, api.geoalerts);
app.get('/api/geoalerts/:x1/:y1/:x2/:y2/:ago/:now/:type/:str/:limit', routes.requiresLogin, api.geoalerts);
app.get('/api/geoalerts/:x1/:y1/:x2/:y2/:ago/:now/:type/:str/:limit/:skip', routes.requiresLogin, api.geoalerts);
app.get('/api/geoalertsNumber/:x1/:y1/:x2/:y2/:ago/:lastcheck', api.geoalertsNumber);

app.get('/api/zones/:x/:y', api.zones);
app.get('/api/cats', api.cats);
app.get('/api/catsandtags/:x/:y/:z/:d/:print', api.catsandtags);
app.get('/api/places', api.places);
app.get('/api/searchplaces/:str', api.searchplaces);
app.get('/api/usersearch/:string', api.user_search);
app.get('/api/usersearchbyid2/:id', api.findUserById2);
app.get('/api/feedsearchbyid2/:id', api.findFeedById2);
app.get('/api/countUserInfo/:id', api.countUserInfo);
app.get('/api/countUserSubscribers/:id', api.countUserSubscribers);
app.get('/api/user/feed/:userid', api.get_user_feed);
app.get('/api/feed/feed/:feedid', api.get_feed_feed);
app.post('/api/user/blacklist', routes.requiresLogin, api.user_blacklist);
app.post('/api/user/blacklist/remove', routes.requiresLogin, api.user_blacklist_remove);

app.get('/api/findbylogin/:string', api.user_findbylogin);
app.get('/api/findbymail/:string', api.user_findbymail);

app.get('/api/feedusersearch/:string', api.feeduser_search);
app.get('/api/feedsearch/:string', api.feed_search);
//app.get('/api/getUsers', api.getUsers);
app.get('/api/getContentTitles', api.getContentTitles);
app.get('/api/getHotTags/:x/:y/:z/:d/:print/:limit', api.getHotTags);

// DOCS
app.get('/docs/api', routes.docs_api);
app.get('/docs/opendata', routes.docs_opendata);
app.get('/docs/cgu', routes.docs_cgu);
app.get('/docs/faq', routes.docs_faq);
app.get('/docs/log', routes.docs_log);


/**
* routes / call to twitter
*/
app.get('/auth/twitter/check', routes.auth_twitter_check);
app.get('/auth/twitter', routes.auth_twitter);
app.get('/auth/twitter/associate', routes.auth_twitter_associate);
/**
* routes / the call back after validation
*/
app.get('/auth/twitter/callback', routes.auth_twitter_callback);
app.get('/auth/twitter/callback2', routes.auth_twitter_callback2);


app.post('/user/settwitterFriend', routes.requiresLogin, routes.user_settwitterFriend);
/**
routes / call to facebook
*/
app.post('/auth/facebook', routes.auth_facebook);
app.post('/auth/facebook/check', routes.auth_facebook_check);
/**
routes / call to google
*/
app.post('/auth/google', routes.auth_google);
app.post('/auth/google/check', routes.auth_google_check);


/**
routes / call to google plus
*/
app.get('/auth/google', routes.auth_google);


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

// Uglify with node-minify : https://github.com/srod/node-minify
new compressor.minify({
	type: 'yui-js',
	fileIn: [
	
	 __dirname+'/public/javascripts/lib/jquery/js/jquery-1.8.2.min.js'
	, __dirname+'/public/javascripts/lib/jquery/js/jquery-ui-1.8.24.custom.min.js'
	, __dirname+'/public/javascripts/lib/bootstrap/js/bootstrap.min.js'
	, __dirname+'/public/javascripts/lib/bootstrap/js/bootstrap-typeahead.js'
	, __dirname+'/public/javascripts/lib/plugin/jquery.cookie.js'
	, __dirname+'/public/javascripts/lib/plugin/jquery.mousewheel.min.js'
	, __dirname+'/public/javascripts/lib/plugin/happy.js'
	, __dirname+'/public/javascripts/lib/plugin/jquery.scrollTo-min.js'
	, __dirname+'/public/javascripts/lib/jquery/js/timeago.js'
	, __dirname+'/public/javascripts/customSB.js'
	, __dirname+'/public/javascripts/lib/jquery/js/share.js'
	, __dirname+'/public/javascripts/lib/jquery/js/jquery.livequery.js'
	, __dirname+'/public/javascripts/json2.js'
	, __dirname+'/public/javascripts/common.js'
	, __dirname+'/public/javascripts/front_common.js'
	],
	fileOut: __dirname+'/public/javascripts/minify/front-min-'+ mainConf.version+'.js',
	callback: function(err){
		if(err)
			console.log(err);
		else
			console.log('YUI JS FRONT compressor ok');
	}	
});

new compressor.minify({
	type: 'yui-css',
	fileIn: [
	
	 __dirname+'/public/javascripts/lib/bootstrap/css/bootstrap.css'
	, __dirname+'/public/javascripts/lib/bootstrap/css/bootstrap-responsive.css'
	, __dirname+'/public/javascripts/lib/jquery/css/custom-theme/jquery-ui-1.8.24.custom.css'
	, __dirname+'/public/stylesheets/common.css'
	, __dirname+'/public/stylesheets/customSB.css'
	, __dirname+'/public/javascripts/lib/jquery/css/share.css'
	, __dirname+'/public/stylesheets/style.css'
	],
	fileOut: __dirname+'/public/stylesheets/minify/front-min-'+ mainConf.version+'.css',
	callback: function(err){
		if(err)
			console.log(err);
		else
			console.log('YUI CSS FRONT compressor ok');
	}	
});

// MAP PAGE
new compressor.minify({
	type: 'yui-js',
	fileIn: [
	 __dirname+'/public/javascripts/map.js'
	],
	fileOut: __dirname+'/public/javascripts/minify/map-min-'+ mainConf.version+'.js',
	callback: function(err){
		if(err)
			console.log(err);
		else
			console.log('YUI JS MAP compressor ok');
	}	
});

// FEED PAGE
new compressor.minify({
	type: 'yui-js',
	fileIn: [
	 __dirname+'/public/javascripts/feed.js'
	],
	fileOut: __dirname+'/public/javascripts/minify/feed-min-'+ mainConf.version+'.js',
	callback: function(err){
		if(err)
			console.log(err);
		else
			console.log('YUI JS FEED compressor ok');
	}	
});

// POST PAGE
new compressor.minify({
	type: 'yui-js',
	fileIn: [
	 __dirname+'/public/javascripts/lib/plugin/jquery-ui-timepicker-addon.js',
	 __dirname+'/public/javascripts/post.js',
	],
	fileOut: __dirname+'/public/javascripts/minify/post-min-'+ mainConf.version+'.js',
	callback: function(err){
		if(err)
			console.log(err);
		else
			console.log('YUI JS POST compressor ok');
	}	
});