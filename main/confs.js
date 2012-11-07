exports.confs = {
	"dev" : {
		"validationUrl":"http://localhost:3000/user/validate/",
		"backurl":"http://dev.backend.yakwala.com/BACKEND/",
		"port":3000,
		"dbname":"yakwala",
		"env":"DEV",
		"uploadsDir":__dirname+"\\public\\uploads\\",
	
	},
	"preprod" : {
		"validationUrl":"http://http://ec2-54-247-18-97.eu-west-1.compute.amazonaws.com:62501/user/validate/",
		"backurl":"http://ec2-54-247-18-97.eu-west-1.compute.amazonaws.com/PREPROD/YAKREP/BACKEND/",
		"port":62501,
		"dbname":"yakwala_preprod",
		"env":"PREPROD",
		"uploadsDir":__dirname+'/public/uploads/',
	},
	"prod" : {
		"validationUrl":"http://http://ec2-54-247-18-97.eu-west-1.compute.amazonaws.com:62500/user/validate/",
		"backurl":"http://ec2-54-247-18-97.eu-west-1.compute.amazonaws.com/YAKREP/BACKEND/",
		"port":62500,
		"dbname":"yakwala",
		"env":"PROD",
		"uploadsDir":__dirname+'/public/uploads/',
	}
};


