// The feed model



var mongoose = require('mongoose')
, Schema = mongoose.Schema;


var YakNE = new Schema({
	title	: {type :String, index: true}
	,match	: { type : [{ title: String, level: String }] }
	,description : {type: String}
	,yakCatName : [String]
	,yakCatId : [String]
	,creationDate : {type: Date, required: true, default: Date.now}
	,lastModifDate: {type: Date, required: true, default: Date.now}
	,status : {type :Number, index: true}
},{ collection: 'yakNE' });

YakNE.index({"match.title":1});

YakNE.statics.findByTitle = function (str,callback) {
  searchStr = new RegExp(str,'i');
  var cond = {'title': {$regex:searchStr},"status":1};
  return this.find( cond,{title:1}, callback );
}


  
YakNE.statics.findAll = function (callback) {
  return this.find({"status":1},{},{sort:{title:1}}, callback);
}

YakNE.statics.searchOne = function (str,exact,callback) {
  if(!exact)
	searchStr = new RegExp(str,'i');
  else
	searchStr = new RegExp('^'+str+'$','i');
  
  var cond = { "status":1,'title': {$regex:searchStr}	};
  return this.find(cond,{},{limit:1}, callback);
}


YakNE.statics.findById = function (id, callback) {
	return this.findOne({'_id': id}, callback);
}


YakNE.statics.findGridYakNE = function (pageIndex, pageSize, searchTerm, sortProperties, sortDirections, status, callback) {

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

YakNE.statics.countSearch = function (searchTerm, status, callback) {
	var search = new RegExp(searchTerm, 'i');

	var conditions = {
		$or:[ {'title': search}]	
	};

	if (status != 'all') {
			conditions["status"] = status;
	}
	
	return this.count(conditions, callback);
}

mongoose.model('YakNE', YakNE);
