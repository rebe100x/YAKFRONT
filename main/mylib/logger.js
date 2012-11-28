exports.logthis = function(obj,fileName,depth){
	var fs = require('fs');
	var util = require('util');
	fs.writeFile("C:/NODE/YAKFRONT/main/logs/"+fileName, util.inspect(obj, false, depth, true), function(err) {
		if(err) {
			console.log(err);
		} else {
			console.log("The file was saved!");
		}
	}); 
}