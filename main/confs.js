exports.confs = {
	"main": {
		"imgSizeAvatar": [{"width":128,"height":128},{"width":48,"height":48},{"width":24,"height":24}],
		"imgSizeInfo": [{"width":120,"height":90},{"width":512,"height":0}],
		"imgSizePlace": [{"width":120,"height":90},{"width":512,"height":0}],
		"searchParams": {"subSize": 200,"limit": 10,},
	},
	"devrenaud" : {
		"validationUrl":"http://dev.labs.yakwala.fr:3000/user/validate/",
		"batchurl":"http://dev.batch.yakwala.fr/BACKEND/",
		"backurl":"http://dev.backend.yakwala.fr:3001",
		"fronturl":"http://dev.labs.yakwala.fr:3000",
		"apiurl":"http://dev.api.yakwala.fr:3002",
		"backdns":"dev.backend.yakwala.fr",
		"frontdns":"dev.labs.yakwala.fr",
		"apidns":"dev.api.yakwala.fr",
		"frontport":3000,
		"backport":3001,
		"apiport":3002,
		"dbname":"yakwala",
		"env":"DEV",
		"uploadsDir":__dirname+"\\public\\uploads\\",
	},
	
	"devdany" : {
		"validationUrl":"localhost:3000/user/validate/",
		"batchurl":"localhost:3000/BACKEND/",
		"backurl":"http://localhost:8080/YAKREP/BACKEND/",
		"fronturl":"localhost:3000",
		"apiurl":"localhost:3000",
		"backdns":"localhost",
		"frontdns":"localhost",
		"apidns":"localhost",
		"frontport":3000,
		"backport":3001,
		"apiport":3002,
		"dbname":"yakwala",
		"env":"DEV",
		"uploadsDir":__dirname+"\\public\\uploads\\",
		
	},
	
	"preprod" : {
		"validationUrl":"http://preprod.labs.yakwala.fr/user/validate/",
		"batchurl":"http://batch.yakwala.fr/PREPROD/YAKREP/BACKEND/",
		"backurl":"http://preprod.backend.yakwala.fr/PREPROD/YAKREP/BACKEND/",
		"fronturl":"http://preprod.labs.yakwala.fr",
		"apiurl":"http://preprod.api.yakwala.fr",
		"backdns":"preprod.backend.yakwala.fr",
		"frontdns":"preprod.labs.yakwala.fr",
		"apidns":"api.yakwala.fr",
		"frontport":62400,
		"backport":62401,
		"apiport":62402,
		"dbname":"yakwala_preprod",
		"env":"PREPROD",
		"uploadsDir":__dirname+'/public/uploads/',
	},
	"prod" : {
		"validationUrl":"http://labs.yakwala.fr/user/validate/",
		"batchurl":"http://batch.yakwala.fr/PROD/YAKREP/BACKEND/",
		"backurl":"http://backend.yakwala.fr/PROD/YAKREP/BACKEND/",
		"fronturl":"http://labs.yakwala.fr",
		"apiurl":"http://api.yakwala.fr",
		"backdns":"backend.yakwala.fr",
		"frontdns":"labs.yakwala.fr",
		"apidns":"api.yakwala.fr",
		"frontport":62500,
		"backport":62501,
		"apiport":62502,
		"dbname":"yakwala",
		"env":"PROD",
		"uploadsDir":__dirname+'/public/uploads/',
	},
};


