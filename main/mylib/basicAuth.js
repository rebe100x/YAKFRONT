
//  (c) 2012 Beau Sorensen
//  MIT Licensed
//  For all details and documentation:
//  https://github.com/tblobaum/mongoose-troop

// basicAuth
// ---------

// Dependencies
var crypto = require('crypto')

// Plugin
function auth (schema, options) {
  options || (options = {})

  // Options
  var loginPath = options.loginPath || 'login'
	, mailPath = options.mailPath || 'mail'
  , hashPath = options.hashPath || 'hash'
	, saltPath = options.hashSalt || 'salt'
    , workFactor = options.workFactor || 10
    , query = {}
    , fields = {}

  // Add paths to schema if not present
  if (!schema.paths[loginPath]) {
    fields[loginPath] = {
      type: String
    , lowercase: true
    , required: true
    , index: { unique: true } 
    }
  }
  if (!schema.paths[hashPath]) {
    fields[hashPath] = { type: String }
  }
  if (!schema.paths[saltPath]) {
    fields[saltPath] = {
      type: String
    , lowercase: true
    , required: true
    , index: { unique: true } 
    }
  }
  schema.add(fields)

  // Main authentication method, compare the given password 
  // against the current instances stored hash
  schema.method('authenticate', function (password, next) {
    if (!password || !this[hashPath] || !this[saltPath]) {
      return next('missing parameters')
    }
	
	if (password == null || password == undefined || this[hashPath] == null || this[hashPath] == undefined || this[saltPath] == null || this[saltPath] == undefined) {
        throw new Error('data and hash arguments required');
    } else if (typeof password !== 'string' || typeof this[hashPath] !== 'string') {
        throw new Error('data and hash must be strings');
    }

   if(crypto.createHash('sha1').update(password+"yakwala@secure"+this[saltPath]).digest("hex") == this[hashPath]) 
		next(null,1)
	else
		next(null,null)
    return this
  })

  
 
  
  // Set and encrypt the password of the current model
  schema.method('setPassword', function (password, next) {
    var self = this;	
	var salt = crypto.createHash('sha1').update(this[hashPath]).digest("hex"); 
    var hash = crypto.createHash('sha1').update(password+"yakwala@secure"+salt).digest("hex");
	
	self[hashPath] = hash;
	self[saltPath] = salt;
	
	
	next();
	return this;
   
  })

  // Authenticate with the configured login path and password on 
  // the model layer, passing the authenticated instance into the callback
  schema.static('authenticate', function (username, password, token, next) {
    query = {$or:[{'login':username},{'mail':username}]};
    this.findOne(query, function (err, model) {
      if (err) return next(err)
      if (!model) return next('model does not exist')
      if(model.token == token) return next(null, model)
      model.authenticate(password, function (err, valid) {
        if (err) return next(err)
        if (valid) return next(null, model)
        return next('invalid password', null)
      })
    })
    return this
  })

  // Authenticate by token, passing the authenticated instance into the callback
  schema.static('authenticateByToken', function ( token, password, next) {
    query = {'token':token};
    this.findOne(query, function (err, model) {
      if (err) return next(err)
      if (!model) return next('model does not exist')

      model.authenticate(password, function (err, valid) {
        if (err) return next(err)
        if (valid) return next(null, model)
        return next('invalid password', null)
      })
    })
    return this
  })
  
 

  // Register a new user instance with the supplied attributes, passing
  // the new instance into the callback if no errors were found
  schema.static('register', function (attr, next) {
    this.create(attr, function (err, model) {
      if (err) {
        if (/duplicate key/.test(err)) {
          return next(loginPath + ' taken')
        }
        return next(err)
      }
      return next(null, model)
    })
    return this
  })

  // Create a virtual path for the password path, storing a temporary
  // unencrypted password that will not be persisted, and returning the 
  // encrypted hash upon request
  schema
    .virtual('password')
    .get(function () {
      return this[hashPath]
    })
    .set(function (password) {
      this._password = password
    })

  // Create a hash of the password if one has not already been made, this
  // should only be called the first time a password is set, the `setPassword`
  // method will need to be used after it has been created
  schema.pre('save', function (next) {
	this.setPassword(this._password, function () {
        next()
      });
	  
	 
  })
  
  schema.method('generatePassword',function (len){
		len	= parseInt(len);
		if(!len)
			len = 6;
		var password = "";
		var chars    = "23456789ABCDEFGHJKMNPQRSTUWXYZ";
		var charsN   = chars.length;
		var nextChar;
	 
		for(i=0; i<len; i++){
			nextChar = chars.charAt(Math.floor(Math.random()*charsN));
			password += nextChar;
		}
		return password;
	})
	
	
	
	schema.static('createApiToken',function (clientid,code,redirect_uri,conf,next){
		var User = this;
		var results = new Object();
		var now = new Date();
		var tmp = now.getTime() + 1000*60*60*2;
		var maxApiCodeCreationDate = new Date();
		maxApiCodeCreationDate.setTime(tmp);
//		User.findOne({"apiData.apiClientId":clientid},{}, function(err, userFound) {
    User.findOne({"apiData.apiClientId":clientid,"apiData.apiCode":code,"apiData.apiStatus":1},{}, function(err, userFound) {
      var user = null;
      if(userFound){
        userFound.apiData.forEach(function(item){
          
          if(item.apiClientId == clientid && item.apiCode == code && item.apiStatus == 1)
            user = userFound;
        });
      }
			if(!(typeof(user) == 'undefined' || user === null || user === '')){
				var crypto = require('crypto');
				//var now = new Date();
				var salt = Math.round(now.valueOf() * Math.random());
				var token = crypto.createHash('sha1').update("yakwala@secure"+salt).digest("hex");

				User.update({"_id":user._id,"apiData.apiClientId":clientid},{$set:{"apiData.$.apiToken":token,"apiData.$.apiTokenCreationDate":now}}, function(err,docs){
					if(err)
						throw err;
					else{
						if(typeof(user.thumb)== 'undefined' || user.thumb == '')
							var thumb = conf.fronturl+"/static/images/no-user.png";
						else
							var thumb = conf.fronturl+"/pictures/128_128/"+user.thumb;
						var tokenObject = {
							"access_token": token,
							"user": {
								"id": user._id,
								"username": user.login,
								"full_name": user.name,
								"profile_picture": thumb
							}
						};
						next(tokenObject);
						
					}
				});
			
			}else{
				var error = {"error":"access_denied","error_reason": "Login failed","error_description":"Client is not allowed."};
				next(error);
				//res.redirect('http://'+redirect_uri+"?error="+JSON.parms(error));
			}
		});
	})
	

// Send an email with the validation link or the validation code
  schema.static('sendIlliciteMail', function ( mail, content, cb) {

    var nodemailer = require("nodemailer");
    var fs = require('fs');
    var error = '';
    var messageSubject = '';
    var headerContent = ''
    var mailTemplate = __dirname+'/../views/mails/contenuIllicite.html';
    messageSubject = "Modération d'un de vos contenu"; 
    headerContent = "Un de vos contenu a été désactivé";
    var logo = conf.fronturl+"/static/images/yakwala-logo_petit.png";

    fs.readFile(mailTemplate, 'utf8', function(err, data) {
      data = data.replace("*|MC:SUBJECT|*","Votre inscription");
      data = data.replace("*|MC:HEADERIMG|*",logo);
      data = data.replace("*|MC:ILLICITECONTENT|*",content);
      data = data.replace("*|CURRENT_YEAR|*",new Date().getFullYear());
      var config_secret = require('../confs_secret.js');
      var secretConf = config_secret.confs_secret;
      var smtpTransport = nodemailer.createTransport("SES", {
        AWSAccessKeyID: secretConf.S3.accessKeyId,
        AWSSecretKey: secretConf.S3.secretAccessKey,
      });

      var mailOptions = {
        from: "Labs Yakwala <labs.yakwala@gmail.com>", // sender address
        to: mail, // list of receivers
        subject: messageSubject, // Subject line
        text: "Bonjour, \r\n Un de vos contenu a été modéré : " + content, // plaintext bod
        html: data
      } 

      smtpTransport.sendMail(mailOptions, function(error, response){
        if(error)
          console.log(error);
        else
          console.log(response);
        smtpTransport.close(); // shut down the connection pool, no more messages
        console.log('---return');
        cb(error);
      });
    });

    
  })

  // Send an email with the validation link or the validation code
  schema.static('sendValidationMail', function ( link, mail, template, logo, next) {

    var nodemailer = require("nodemailer");
    var fs = require('fs');
    var error = '';
    var messageSubject = '';
    var headerContent = ''
    if(template == 'code')
    {
      var mailTemplate = __dirname+'/../views/mails/account_validationByCode.html';
      messageSubject = 'Votre inscription à Yakwala'; 
      headerContent = 'Votre inscription';
    }
    else if (template == 'link')
    {
      var mailTemplate = __dirname+'/../views/mails/account_validationByLink.html';
      messageSubject = 'Votre inscription à Yakwala'; 
      headerContent = 'Votre inscription';
    }
    else
    {
      var mailTemplate = __dirname+'/../views/mails/resetPasswordLink.html';
      messageSubject = 'Changement du mot de passe dans Yakwala'; 
      headerContent = 'Votre mot de passe dans yakwala';
    }

    fs.readFile(mailTemplate, 'utf8', function(err, data) {
      data = data.replace("*|MC:SUBJECT|*","Votre inscription");
      data = data.replace("*|MC:HEADERIMG|*",logo);
      data = data.replace("*|MC:VALIDATIONLINK|*",link);
      data = data.replace("*|CURRENT_YEAR|*",new Date().getFullYear());
      
      
      var config_secret = require('../confs_secret.js');
      var secretConf = config_secret.confs_secret;

      var smtpTransport = nodemailer.createTransport("SES", {
        AWSAccessKeyID: secretConf.S3.accessKeyId,
        AWSSecretKey: secretConf.S3.secretAccessKey,
        //ServiceUrl: "https://email.us-east-1.amazonaws.com" // optional
      });
    
      var mailOptions = {
        from: "Labs Yakwala <labs.yakwala@gmail.com>", // sender address
        to: mail, // list of receivers
        subject: messageSubject, // Subject line
        text: "Bonjour, \r\n Votre clé de validation est : "+link, // plaintext bod
        html: data
      } 
        
      
      smtpTransport.sendMail(mailOptions, function(error, response){
        if(error)
          console.log(error);
        else
          console.log(response);
        smtpTransport.close(); // shut down the connection pool, no more messages
      });
    });
    
    next(error);
  })





}




module.exports = auth
