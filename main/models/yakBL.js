// The feed model



var mongoose = require('mongoose')
, Schema = mongoose.Schema;


var YakBL = new Schema({
	title	: {type :String, index: true}
	,caseSensitive : Number
	,zone : {type: [Number]}
	,zoneName : [String]
	,feed : {type: [String]}
	,feedName : [String]
	,creationDate : {type: Date, required: true, default: Date.now}
	,lastModifDate: {type: Date, required: true, default: Date.now}
	,status : {type :Number, index: true}
},{ collection: 'yakBL' });

YakBL.index({"title":1});
YakBL.index({"zone":1});
YakBL.index({"feed":1});

YakBL.statics.findByTitle = function (str, cs, callback) {
  if(cs == 1){
  	var searchStr = new RegExp('^'+str+'$');
  }else{
  	var searchStr = new RegExp('^'+str+'$','i');
  }
  	
  var cond = {'title': {$regex:searchStr},"status":1};
  return this.findOne( cond,{title:1}, callback );
}
YakBL.statics.findByTitleZoneFeed = function (str, zone, feed, callback) {
  searchStr = new RegExp(str,'i');
  var cond = {'title': {$regex:searchStr},"status":1};
  if(zone)
  	cond.zone = {$in:zone};
  if(feed)
  	cond.feed = {$in:feed};

  return this.find( cond,{title:1}, callback );
}

  
YakBL.statics.findAll = function (callback) {
  return this.find({"status":1},{},{sort:{title:1}}, callback);
}

YakBL.statics.searchOne = function (str,exact,callback) {
  if(!exact)
	searchStr = new RegExp(str,'i');
  else
	searchStr = new RegExp('^'+str+'$','i');
  
  var cond = { "status":1,'title': {$regex:searchStr}	};
  return this.find(cond,{},{limit:1}, callback);
}


YakBL.statics.findById = function (id, callback) {
	return this.findOne({'_id': id}, callback);
}


YakBL.statics.findGridYakBL = function (pageIndex, pageSize, searchTerm, sortProperties, sortDirections, status, callback) {

	var conditions = {
		$or:[ {'title': new RegExp(searchTerm, 'i')}]	
	};

	var sortBy = {};

	for (index in sortProperties) {
		var desc = 1;
		if (sortDirections[index] == "desc")
			desc = -1;
		sortBy[sortProperties[index]] = desc;
	}

	if (status != 'all') {
			conditions["status"] = status;
	}

	return this.find(
		conditions,
		{},
		{
			skip:
			(pageIndex -1)*pageSize,
			limit:
			pageSize,
			sort:
			sortBy
		},
		callback);
}

YakBL.statics.countSearch = function (searchTerm, status, callback) {
	var search = new RegExp(searchTerm, 'i');

	var conditions = {
		$or:[ {'title': search}]	
	};

	if (status != 'all') {
			conditions["status"] = status;
	}
	
	return this.count(conditions, callback);
}

mongoose.model('YakBL', YakBL);
