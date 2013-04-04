exports.GetImg = function(urlImg, destName, conf, mainConf){
	var http = require('http')
	, fs = require('fs')
	, url = require('url');

	var theUrl = url.parse(urlImg);
	var options = {
		hostname: theUrl.hostname,
		port: 80,
		path: theUrl.pathname,
		method: 'GET'
	};  
	var request = http.get(options, function(res){
		res.setEncoding('binary')
		var imagedata = '';
		var image = {};		
		

		res.on('data', function(chunk){
			imagedata += chunk
		})

		res.on('end', function(){
			fs.writeFile(conf.uploadsDir+'originals/'+destName, imagedata, 'binary', function(err){
				if (err) throw err
				image.path = conf.uploadsDir+'originals/'+destName;
				image.name = destName;
				fs.stat(conf.uploadsDir+'originals\\'+image.name, function (err, stats) {
					image.size = stats.size;
					var size = mainConf.imgSizeAvatar;
					for(i=0;i<size.length;i++){
						profileThumb = module.exports.StoreImg(image,destName,{w:size[i].width,h:size[i].height},conf);
					}
					return image.name;
				});
			})
		})
		
	})

	

	

}

exports.StoreImg = function(file,destName,size,conf){
	
	var message = [];
	var thumbFlag = 0;
	var flagError = 0;
	var srcPath = '';
	var srcName = '';
	var im = require('imagemagick');
	var fs = require('fs');	
	//var crypto = require('crypto');
	
	if(file.size){
		
		var srcPathTmp = file.path;
		var srcNameTmp = file.name;
		srcPath = srcPathTmp.replace('.gif', '.jpeg');
		srcPath = srcPathTmp.replace('.png', '.jpeg');
		srcPath = srcPathTmp.replace('.jpg', '.jpeg');
		srcName = srcNameTmp.replace('.gif', '.jpeg');
		srcName = srcNameTmp.replace('.png', '.jpeg');
		srcName = srcNameTmp.replace('.jpg', '.jpeg');
		//destName =  crypto.createHash('md5').update(srcName).digest("hex")+'.jpeg'; 
		// convert to jpeg
		im.convert([srcPathTmp,srcPath],function(err,stdout){
			// if convertion ok, we begin to build the small images
			if(!err){
				
					//var w = size.w;
					//var h = size.h;
					//console.log( size.w+' x '+ size.h);
					
					if(size.w > 0 && size.h > 0){
						//console.log("1="+conf.uploadsDir+'pictures/'+ size.w+'_'+ size.h+'/'+destName);
						im.resize({
							srcPath: srcPath,
							dstPath: conf.uploadsDir+'pictures/'+size.w+'_'+size.h+'/'+destName,
							strip : false,
							width : size.w,
							height : size.h+"^",
							customArgs: [
								 "-gravity", "center"
								,"-extent", size.w+"x"+size.h
								]
							
						}, function(err, stdout, stderr){
							if (err) {
								//console.log('error creating thumbnail');
								flagError = 1;
								message.push("L'image n'est pas reconnue, essayer avec une autre image !");
							}else{
								//console.log(size.w+" "+size.h);
								//console.log('thumbnail created successfully');
								//console.log("11="+conf.uploadsDir+'pictures/'+size.w+'_'+size.h+'/'+destName);
								StoreImgOnS3(size.w+'_'+size.h+'/'+destName,conf);
							}
								
						});
					}
					
					if(size.h == 0){
						//console.log("2="+conf.uploadsDir+'pictures/'+size.w+'_'+size.h+'/'+destName);
						im.identify(['-format', '%w', srcPath], function(err, output){
							if (!err){
								//console.log('ELO'+output +">"+ size.w);
								if(output > size.w){
									im.resize({
										srcPath: srcPath,
										dstPath: conf.uploadsDir+'pictures/'+size.w+'_0/'+destName,
										strip : false,
										width : size.w,
									}, function(err, stdout, stderr){
										if (err){
											//console.log('im.resize failed');
											flagError = 1;
											message.push("L'image n'est pas reconnue, essayer avec une autre image !");
											throw err;
										}else{
											//console.log('resized to'+size.w+'_'+size.h+'/'+destName);
											StoreImgOnS3(size.w+'_'+size.h+'/'+destName,conf);
										}
											
									});
								}else{
									im.resize({
										srcPath: srcPath,
										dstPath: conf.uploadsDir+'pictures/'+size.w+'_0/'+destName,
										strip : false,
										height : '100%',
										width : '100%',
									}, function(err, stdout, stderr){
										if (err){
											//console.log('im.resize to same size failed');
											flagError = 1;
											message.push("L'image n'est pas reconnue, essayer avec une autre image !");
										}else{
											//console.log('resized to'+size.w+'_'+size.h+'/'+destName);
											StoreImgOnS3(size.w+'_'+size.h+'/'+destName,conf);
										}
											
									});
								}
							}else{
								//console.log('im.identity failed'+srcPath);
								flagError = 1;
								message.push("L'image n'est pas reconnue, essayer avec une autre image !");
								throw err;
							}
						});
					} // END H==0
				
			} // END NO ERR IN CONVERT TO JPG
			else{
				console.log('convert to jpeg failed');
				flagError = 1;
				message.push("L'image n'est pas reconnue, essayer avec une autre image !");
				throw err;
			}
		});// END CONVERT TO JPG
	} // END FILE null
	else{
			console.log('file empty');
			flagError = 0;
			destName = '';
			
		}
		
		
		var fileThumb = {"name":destName,"err":flagError,"msg":message};
		return fileThumb;
}

exports.SetThumbFlag = function(imgName,conf){
	var im = require('imagemagick');
	var fs = require('fs');	
	//var crypto = require('crypto');
	var srcPathTmp = imgName;
	var srcPath = '';	
	srcPath = srcPathTmp.replace('.gif', '.jpeg');
	srcPath = srcPathTmp.replace('.png', '.jpeg');
	srcPath = srcPathTmp.replace('.jpg', '.jpeg');

	var imgPath = conf.uploadsDir+'originals/'+srcPath;
	var thumbFlag = 0;
	im.identify(['-format', '%w', imgPath], function(err, output){
		if(output>320)
			thumbFlag = 2;
		else
			thumbFlag = 1;	
	});
	return thumbFlag;
}

function StoreImgOnS3(imgPath,conf){
	var AWS = require('aws-sdk');
	var fs = require('fs');
	var config_secret = require('../confs_secret.js');
	var secretConf = config_secret.confs_secret;
	AWS.config.update({ "accessKeyId": secretConf.S3.accessKeyId, "secretAccessKey": secretConf.S3.secretAccessKey, "region": "eu-west-1" });
	var s3 = new AWS.S3();
	fs.readFile(conf.uploadsDir+'pictures/'+imgPath, function (err, data) {
	  if (err) { throw err; }
	  var data2send = {Bucket: conf.bucket, Key: imgPath, Body: data, ACL:'public-read',ContentType:'image/jpeg'};
	  s3.client.putObject(data2send, function() {
	    console.log("Successfully uploaded data to "+conf.bucket+"/"+imgPath);
	  });
	});
}
