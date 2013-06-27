
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

// USER
app.get('/user/login', back.user_login);
app.get('/user/logout', back.user_logout);
app.post('/session',back.session);
app.post('/user/setName', back.requiresLogin, back.user_setname);
app.post('/user/setStatus', back.requiresLogin, back.user_setstatus);
app.post('/user/setType', back.requiresLogin, back.user_settype);

app.get('/api/validusers', back.requiresLogin, back.countUnvalidatedUsers);
app.get('/api/user/:id', back.requiresLogin, back.findUserById);
app.get('/api/usersearch/:string',back.requiresLogin, back.userSearchByNameorLogin);
app.get('/api/users/:pageIndex/:pageSize/:searchTerm/:sortBy/:sortDirection/:status/:type',back.requiresLogin, back.gridUsers);


app.get('/api/sendUserReminder/:id', back.requiresLogin, back.user_reminder);

app.get('/user/list',back.requiresLogin, back.user_list);
app.post('/user', back.requiresLogin, back.user);
app.get('/api/users/:pageIndex/:pageSize/:searchTerm/:sortBy/:sortDirection/:status/:type',back.requiresLogin, back.gridUsers);


// YAKCAT
app.post('/yakcat/setStatus', back.requiresLogin, back.yakcat_setstatus);
app.get('/categories/list',back.requiresLogin, back.categories);
app.get('/api/cats/:id',back.requiresLogin, back.catsById);
app.get('/api/cats',back.requiresLogin, api.cats);
app.get('/api/allCats',back.requiresLogin, api.allCats);
app.get('/api/yakcats/:pageIndex/:pageSize/:searchTerm/:sortBy/:sortDirection/:status', back.requiresLogin, back.gridYakcats);
app.get('/api/findCatById', back.requiresLogin, back.findCatById);
app.get('/api/validcats', back.requiresLogin, back.countUnvalidatedCats);


// ZONE
app.post('/zone/setStatus', back.requiresLogin, back.zone_setstatus);
app.get('/zone/list',back.requiresLogin, back.zone_list);
app.post('/zone', back.requiresLogin, back.zone);
app.get('/api/zones/:x/:y', back.requiresLogin, back.findAllZoneNear);
app.get('/api/zonesContaining/:x/:y', back.requiresLogin, back.findAllZoneContaining);

app.get('/api/zone/:id', back.requiresLogin, back.findZoneById);
app.get('/api/zoneByNum/:num', back.requiresLogin, back.findZoneByNum);
app.get('/api/zoneMaxnum', back.requiresLogin, back.findZoneMaxnum);
app.get('/api/zones', back.requiresLogin, back.zones);
app.get('/api/zones/:pageIndex/:pageSize/:searchTerm/:sortBy/:sortDirection/:status', back.requiresLogin, back.gridZones);


// PLACE
app.get('/place/list', back.requiresLogin, back.place_list);
app.post('/place', back.requiresLogin, back.place);
app.get('/api/places/search/:str/:status', back.requiresLogin, back.searchByTitleAndStatus);
app.get('/api/places/:pageIndex/:pageSize/:searchTerm/:sortBy/:sortDirection/:status/:limit', back.requiresLogin, back.gridPlaces);
app.get('/api/places/:id', back.requiresLogin, back.findPlaceById);
app.get('/api/places/validate/:ids', back.requiresLogin, back.validatePlaces);
app.get('/api/places/delete/:ids', back.requiresLogin, back.deletePlaces);
app.get('/api/places/wait/:ids', back.requiresLogin, back.waitPlaces);
app.get('/api/validplaces', back.requiresLogin, back.countUnvalidatedPlaces);


//FEED
app.get('/feed/list', back.requiresLogin, back.feed_list);
app.get('/api/feedList',back.requiresLogin, back.findAllFeed);
app.post('/feed', back.requiresLogin, back.feed);
app.get('/api/feed/:id',back.requiresLogin, back.findFeedById);
app.get('/api/feedExist/:name',back.requiresLogin, back.findFeedByName);
app.post('/api/getFileSample', back.requiresLogin, back.getFileSample);
app.get('/api/feeds/:pageIndex/:pageSize/:searchTerm/:sortBy/:sortDirection/:status/:type',back.requiresLogin, back.gridFeeds);


//DASHBOARD
app.get('/dashboard/list',back.requiresLogin, back.dashboard_list);
app.get('/api/dashboard/statsByZone/:msts',back.requiresLogin, back.dashboard_statsByZone);
app.get('/api/dashboard/statsByDate/:type/:msts',back.requiresLogin, back.dashboard_statsByDate);

//ILLICITE
app.get('/illicites/list',back.requiresLogin, back.illicites);
app.post('/changeStatusIllicite', back.requiresLogin, back.changeStatusIllicite);
app.get('/api/illicites',back.requiresLogin, back.illicites);
app.get('/api/illicites/:pageIndex/:pageSize/:searchTerm/:sortBy/:sortDirection/:type/:status/:limit',back.requiresLogin, back.gridIllicites);
app.get('/api/validillicites', back.requiresLogin, back.countUnvalidatedIllicites);


//INFO
app.post('/info', back.requiresLogin, back.info);
app.get('/api/validinfos', back.requiresLogin, back.countUnvalidatedInfos);
app.get('/api/geoinfos/:x1/:y1/:x2/:y2/:heat/:type', back.requiresLogin, back.geoinfos);
app.get('/api/info/:id', back.requiresLogin, back.findInfoById);
app.get('/info/list', back.requiresLogin, back.info_list);
app.get('/api/infos/:pageIndex/:pageSize/:searchTerm/:sortBy/:sortDirection/:status/:type/:limit',back.requiresLogin, back.gridInfos);


// YAKNE
app.get('/yakNE/list', back.requiresLogin, back.yakNE_list);
app.get('/api/yakNE/:id', back.requiresLogin, api.yakNE);
app.post('/yakNE', back.requiresLogin, back.yakNE);
app.get('/api/yakNE/:id',back.requiresLogin, back.findyakNEById);
app.get('/api/yakNEExist/:title',back.requiresLogin, back.findYakNEByTitle);
app.get('/api/yakNE/:pageIndex/:pageSize/:searchTerm/:sortBy/:sortDirection/:status',back.requiresLogin, back.gridYakNE);


// FAV PLACE
app.post('/api/favplace', back.requiresLogin, back.addfavplace);
app.post('/api/delfavplace', back.requiresLogin, back.delfavplace);


//UNUSED
//app.post('/alerts', back.requiresLogin, back.alerts);
//app.post('/profile', back.requiresLogin, back.profile);
//app.post('/api/users', back.users);
//app.get('/api/users', back.users);
//app.get('/api/tags',back.requiresLogin, api.tags);



// redirect all others to the index (HTML5 history)
app.get('*', back.index);




// Start server
app.listen(conf.backport, function(){
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
  , __dirname+'/public/javascripts/lib/jquery/js/jquery.md5.min.js'
  , __dirname+'/public/javascripts/lib/plugin/string.min.js'
  , __dirname+'/public/javascripts/lib/bootstrap/js/bootstrap-contextmenu.js'
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

