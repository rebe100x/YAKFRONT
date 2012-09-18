exports.confs = {
	"dev" : {
		"backurl":"http://dev.backend.yakwala.com/BACKEND/",
		"port":3000,
		"dbname":"yakwala",
		"env":"DEV"
	},
	"preprod" : {
		"backurl":"http://ec2-54-247-18-97.eu-west-1.compute.amazonaws.com/YAKREP/BACKEND/",
		"port":62501,
		"dbname":"yakwala_preprod",
		"env":"PREPROD"
	},
	"prod" : {
		"backurl":"http://ec2-54-247-18-97.eu-west-1.compute.amazonaws.com/YAKREP/BACKEND/",
		"port":62500,
		"dbname":"yakwala",
		"env":"PROD"
	}
};


