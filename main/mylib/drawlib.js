exports.StoreImg = function(file,size,conf){
	
	var message = [];
	var flagError = 0;
	var srcPath = '';
	var srcName = '';
	var im = require('imagemagick');
	var fs = require('fs');	
	var crypto = require('crypto');
	
	if(file.size){
		
		var srcPathTmp = file.path;
		var srcNameTmp = file.name;
		srcPath = srcPathTmp.replace('.gif', '.jpeg');
		srcPath = srcPathTmp.replace('.png', '.jpeg');
		srcPath = srcPathTmp.replace('.jpg', '.jpeg');
		srcName = srcNameTmp.replace('.gif', '.jpeg');
		srcName = srcNameTmp.replace('.png', '.jpeg');
		srcName = srcNameTmp.replace('.jpg', '.jpeg');
		destName =  crypto.createHash('md5').update(srcName).digest("hex")+'.jpeg'; 
		//destName =  md5.digest_s(srcName)+'.jpeg'; 
		//console.log(destName);
		//var destName =  srcPath.split('\');
		// convert to jpeg
		im.convert([srcPathTmp,srcPath],function(err,stdout){
			// if convertion ok, we begin to build the small images
			if(!err){
				for(i=0;i<size.length;i++){
					var w = size[i].width;
					var h = size[i].height;
					
					console.log(w+' x '+h);
					
					if(w > 0 && h > 0){
						im.resize({
							srcPath: srcPath,
							dstPath: conf.uploadsDir+'pictures/'+w+'_'+h+'/'+destName,
							strip : false,
							width : w,
							height : h+"^",
							customArgs: [
								 "-gravity", "center"
								,"-extent", w+"x"+h
								]
							
						}, function(err, stdout, stderr){
							if (err) {
								console.log('error creating thumbnail');
								flagError = 1;
								message.push("L'image n'est pas reconnue, essayer avec une autre image !");
							}else
								console.log('thumbnail created successfully');
						});
					}
					
					if(h == 0){
					
						im.identify(['-format', '%w', srcPath], function(err, output){
							if (!err){
								if(output > w){
									im.resize({
										srcPath: srcPath,
										dstPath: conf.uploadsDir+'pictures/512_0/'+destName,
										strip : false,
										width : 512,
									}, function(err, stdout, stderr){
										if (err){
											console.log('im.resize du < 512px failed');
											flagError = 1;
											message.push("L'image n'est pas reconnue, essayer avec une autre image !");
											throw err;
										}else
											console.log('resize > 512 ok');
									});
								}else{
									im.resize({
										srcPath: srcPath,
										dstPath: conf.uploadsDir+'pictures/512_0/'+destName,
										strip : false,
										height : '100%',
										width : '100%',
									}, function(err, stdout, stderr){
										if (err){
											console.log('im.resize to same size failed');
											flagError = 1;
											message.push("L'image n'est pas reconnue, essayer avec une autre image !");
										}else
											console.log('resize < 512 ok');
											
									});
								}
							}else{
								console.log('im.identity failed'+srcPath);
								flagError = 1;
								message.push("L'image n'est pas reconnue, essayer avec une autre image !");
								throw err;
							}
						});
					} // END H==0
				} // END FOR
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