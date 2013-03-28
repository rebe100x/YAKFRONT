
exports.db = function(conf){
	mongoose = require('mongoose'), Schema = mongoose.Schema;
	//mongoose.set('debug', true);
	db = mongoose.connect('mongodb://localhost/'+conf.dbtrackname);
	
};

exports.trak_user = function(req,res){
	console.log(req.params);
	var Track = db.model('Track');
	track = new Track();
	track.userid = req.params.userid;
	track.actionid = parseInt(req.params.actionid);
	track.params = JSON.parse(req.params.params);


	track.save(function (err) {
		if (!err) 
			{
				console.log('Success!');
				res.send("Success!");	
			}
		else
		{
			console.log(err);	
			res.send("Error!");
		}
		
	});
};

