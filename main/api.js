
/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  api = require('./routes/api'),
  //users = require('./routes/users'),
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
    "store":  new express.session.MemoryStore({ reapInterval: 60000 * 10 })
  }));
  app.use(function(req, res, next){
    res.locals.session = req.session.user;
	res.locals.redir = req.query.redir;
	res.locals.message = req.session.message;
	res.locals.type = req.session.type;
	res.locals.mainConf = config.confs.main;
    next();
  });
  
  app.use(express.methodOverride());
  app.use(app.router);
  
});

app.configure('development', function(){
	conf = config.confs.devrenaud;
	app.locals.conf = JSON.stringify(config.confs.devrenaud);
	
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});


app.configure('production', function(){
	conf = config.confs.prod;
	app.locals.conf = JSON.stringify(config.confs.prod);
	app.use(express.errorHandler());
});

var db = routes.db(conf);	


	
// Routes
app.get('/', routes.api_default);
app.get('/docs/api',  routes.docs_api);

// images
app.get('/pictures/:size/:picture', routes.picture);
app.get('/static/images/:name', routes.static_image);

// OPEN ACCESS API
app.get('/api/infos', api.infos);
app.get('/api/feeds', api.feeds);
app.get('/api/afeed', api.afeed);

app.get('/api/searchfeed/', api.feed_search);

app.get('/api/geoinfos/:x1/:y1/:x2/:y2/:ago/:now/:type/:str', api.geoinfos);
app.get('/api/geoinfos/:x1/:y1/:x2/:y2/:ago/:now/:type/:str/:limit', api.geoinfos);
app.get('/api/geoinfos/:x1/:y1/:x2/:y2/:ago/:now/:type/:str/:limit/:skip', api.geoinfos);
app.get('/api/geoalerts/:x1/:y1/:x2/:y2/:ago/:now/:type/:str', routes.requiresLogin, api.geoalerts);
app.get('/api/geoalerts/:x1/:y1/:x2/:y2/:ago/:now/:type/:str/:limit', routes.requiresLogin, api.geoalerts);
app.get('/api/geoalerts/:x1/:y1/:x2/:y2/:ago/:now/:type/:str/:limit/:skip', routes.requiresLogin, api.geoalerts);

app.get('/api/zones/:x/:y', api.zones);
app.get('/api/zones/:id', api.findZoneById);
app.get('/api/tags', api.tags);
app.get('/api/cats', api.cats);
app.get('/api/findCatById', api.findCatById);
app.get('/api/catsandtags/:x/:y/:z/:d/:print', api.catsandtags);
app.get('/api/places', api.places);
app.get('/api/searchplaces/:str', api.searchplaces);
app.get('/api/usersearch/:string', api.usersearch);

// API OAUTH 2
app.get('/api/oauth/login', api.oauth_login);
app.get('/api/oauth/authorize', api.oauth_authorize); 
app.get('/api/oauth/authorize/:client_id/:redirect_uri', api.oauth_authorize); 
app.get('/api/oauth/authorize/:client_id/:redirect_uri/:response_type', api.oauth_authorize); 
app.get('/api/oauth/authorize/:client_id/:redirect_uri/:response_type/:scope', api.oauth_authorize); 
app.get('/api/oauth/access_token/:client_id/:client_secret/:grant_type/:redirect_uri/:code', api.oauth_access_token); 
app.post('/api/oauth/access_token', api.oauth_access_token);
app.get('/api/oauth/access_token', api.oauth_access_token);
app.post('/api/oauth/session',api.oauth_session);



//app.get('/api/error', api.oauth_error);

app.get('/api/test1', api.test1); 
app.get('/api/test2', api.test2); 

//favplace
app.post('/api/favplace/:userid', api.requiresToken, api.add_favplace); 
app.delete('/api/favplace/:userid', api.requiresToken, api.del_favplace); 
app.get('/api/favplace/:userid', api.list_favplace); 
app.put('/api/favplace/:userid', api.requiresToken, api.put_favplace); 
// for non restfull guys
app.post('/api/delfavplace/:userid', api.requiresToken, api.del_favplace); 
app.post('/api/updatefavplace/:userid', api.requiresToken, api.put_favplace); 

// user subscribtion to other user's news feeds
app.post('/api/subscribe/user/:userid', api.requiresToken, api.add_subs_user); 
app.put('/api/subscribe/user/:userid', api.requiresToken, api.put_subs_user); 
app.delete('/api/subscribe/user/:userid', api.requiresToken, api.del_subs_user); 
app.get('/api/subscribe/user/:userid', api.list_subs_user);
// for non restfull guys
app.post('/api/unsubscribe/user/:userid', api.requiresToken, api.del_subs_user); 
app.post('/api/updatesubscribe/user/:userid', api.requiresToken, api.put_subs_user); 

// user subscribtion to tags
app.post('/api/subscribe/tag/:userid', api.requiresToken, api.add_subs_tag); 
app.put('/api/subscribe/tag/:userid', api.requiresToken, api.put_subs_tag); 
app.delete('/api/subscribe/tag/:userid', api.requiresToken, api.del_subs_tag); 
app.get('/api/subscribe/tag/:userid',  api.list_subs_tag);
// for non restfull guys
app.post('/api/unsubscribe/tag/:userid', api.requiresToken, api.del_subs_tag); 
app.post('/api/updatesubscribe/tag/:userid', api.requiresToken, api.put_subs_tag); 

// user feed ( infos )
app.get('/api/user/feed/:userid', api.get_user_feed);
app.post('/api/user/feed/:userid',api.requiresToken, api.add_user_feed);
app.delete('/api/user/feed/:userid',api.requiresToken, api.del_user_feed);
app.put('/api/user/feed/:userid',api.requiresToken, api.add_user_feed);
// for non restfull guys
app.post('/api/user/updatefeed/:userid', api.requiresToken, api.put_user_feed); 
app.post('/api/user/delfeed/:userid', api.requiresToken, api.del_user_feed); 

// places
app.get('/api/thisplace/:placeid	', api.get_place);
app.get('/api/place/', api.get_places);
app.get('/api/place/:userid', api.get_places);
app.post('/api/place/:userid',api.requiresToken, api.add_place);
app.delete('/api/place/:userid',api.requiresToken, api.del_place);
app.put('/api/place/:userid',api.requiresToken, api.put_place);
// for non restfull guys
app.post('/api/updateplace/:userid', api.requiresToken, api.put_place); 
app.post('/api/delplace/:userid', api.requiresToken, api.del_place); 

// user's profile
app.post('/api/user/create',api.requiresClient, api.user_creation);
app.post('/api/user/validate', api.requiresClient, api.user_validation);
app.get('/api/user/:userid', api.get_user_details);
app.put('/api/user/:userid',api.requiresToken, api.put_user_details);
app.post('/api/updateuser/:userid',api.requiresToken, api.put_user_details);

//SEARCH
app.get('/api/user/search/:string', api.user_search);
app.get('/api/place/search/:string', api.place_search);
app.get('/api/cat/search/:string', api.cat_search);
app.get('/api/tag/search/:string', api.tag_search);

 




// DOCS
app.get('/docs/api', routes.docs_api);


// redirect all others to the index (HTML5 history)
app.get('*', routes.api_default);



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
app.listen(conf.apiport, function(){
 console.log("Express server %s listening on port %d in %s mode", conf.apidns, conf.apiport, app.settings.env);
});

