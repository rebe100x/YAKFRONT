exports.confs = {
	"main": {
		"imgSizeAvatar": [{"width":128,"height":128},{"width":48,"height":48},{"width":24,"height":24}],
		"imgSizeInfo": [{"width":120,"height":90},{"width":256,"height":0},{"width":512,"height":0}],
		"imgSizePlace": [{"width":120,"height":90},{"width":256,"height":0},{"width":512,"height":0}],
		"searchParams": {"subSize": 200,"limit": 10, "sliderMin" : 1, "sliderMax" : 10, "sliderDefault": 20},
		"rangeDefault":80,
		"typeDefault":'1,2,4',
		"dateFromDefault":0,
		"version":'1-3-4',
		"versionback":'0.0.6',
		"favPlaces":[{'name':'Nice, France','location':{'lat':43.681343,'lng':7.232094},'range':100},{'name':'Marseille, France','location':{'lat':43.298198,'lng':5.370255},'range':100},{'name':'Paris, France','location':{'lat':48.851875,'lng':2.356374},'range':100}],
		"fbAccessKeyId":"512425592148558",
		"gpKey":"990732382781",
	},
	"devrenaud" : {
		"resetpassUrl":"http://dev.labs.yakwala.fr:3000/user/resetpassword/",
		"validationUrl":"http://dev.labs.yakwala.fr:3000/user/validate/",
		"batchurl":"http://dev.batch.yakwala.fr/BACKEND/",
		"backurl":"http://dev.backend.yakwala.fr:3001",
		"fronturl":"http://dev.labs.yakwala.fr:3000",
		"apiurl":"http://dev.api.yakwala.fr:3002",
		"trackurl":"http://dev.labs.yakwala.fr:3004",
		"twitter_callbackurl":"http://dev.labs.yakwala.fr:3000/auth/twitter/callback",
		"twitter_callbackurl2":"http://dev.labs.yakwala.fr:3000/auth/twitter/callback2",
		"twitter_callbackurl_create":"http://dev.labs.yakwala.fr:3000/auth/twitter/callback_create",
		"backdns":"dev.backend.yakwala.fr",
		"frontdns":"dev.labs.yakwala.fr",
		"apidns":"dev.api.yakwala.fr",
		"frontport":3000,
		"backport":3001,
		"apiport":3002,
		"fileport":3003,
		"trakport" : 3004,
		"dbname":"yakwala",
		"dbtrackname":"yaktrack",
		"env":"DEV",
		"uploadsDir":__dirname+"\\public\\uploads\\",
		"ga":"",
		"gmapKey":"AIzaSyBBjGZqkyZuTHuSuaZ_aHP9gyf4rCW1qe4",
		"bucket":"yak1",
		"bucketstatic":"yakstatic",
		
	},
	
	"devdany" : {
		"resetpassUrl":"http://dev.labs.yakwala.fr:3000/user/resetpassword/",
		"validationUrl":"localhost:3000/user/validate/",
		"batchurl":"http://localhost:8080/YAKREP/BACKEND/",
		"backurl":"http://localhost:8080/YAKREP/BACKEND/",
		"fronturl":"http://localhost:3000",
		"apiurl":"localhost:3000",
		"trackurl":"http://localhost:3004",
		"twitter_callbackurl":"http://dev.labs.yakwala.fr:3000/auth/twitter/callback",
		"twitter_callbackurl2":"http://dev.labs.yakwala.fr:3000/auth/twitter/callback2",
		"twitter_callbackurl_create":"http://dev.labs.yakwala.fr:3000/auth/twitter/callback_create",
		"backdns":"localhost",
		"frontdns":"localhost",
		"apidns":"localhost",
		"frontport":3000,
		"backport":3001,
		"apiport":3002,
		"fileport":3003,
		"trakport" : 3004,
		"dbname":"yakwala",
		"dbtrackname":"yaktrack",
		"env":"DEV",
		"uploadsDir":__dirname+"\\public\\uploads\\",
		"ga":"",
		"gmapKey":"AIzaSyBBjGZqkyZuTHuSuaZ_aHP9gyf4rCW1qe4",
		"bucket":"yak1",
		"bucketstatic":"yakstatic"
	},
	
	"preprod" : {
		"resetpassUrl":"http://preprod.labs.yakwala.fr/user/resetpassword/",	
		"validationUrl":"http://preprod.labs.yakwala.fr/user/validate/",
		"batchurl":"http://batch.yakwala.fr/PREPROD/YAKREP/BACKEND/",
		"backurl":"http://preprod.backend.yakwala.fr/PREPROD/YAKREP/BACKEND/",
		"fronturl":"http://preprod.labs.yakwala.fr",
		"apiurl":"http://preprod.api.yakwala.fr",
		"trackurl":"http://preprod.labs.yakwala.fr:62404",
		"twitter_callbackurl":"http://preprod.labs.yakwala.fr/auth/twitter/callback",
		"twitter_callbackurl2":"http://preprod.labs.yakwala.fr/auth/twitter/callback2",
		"twitter_callbackurl_create":"http://preprod.labs.yakwala.fr:3000/auth/twitter/callback_create",
		"backdns":"preprod.backend.yakwala.fr",
		"frontdns":"preprod.labs.yakwala.fr",
		"apidns":"api.yakwala.fr",
		"frontport":62400,
		"backport":62401,
		"apiport":62402,
		"fileport":62403,
		"trakport" : 62404,
		"dbname":"yakwala_preprod",
		"dbtrackname":"yaktrack_preprod",
		"env":"PREPROD",
		"uploadsDir":__dirname+'/public/uploads/',
		"ga":"",
		"gmapKey":"AIzaSyBBjGZqkyZuTHuSuaZ_aHP9gyf4rCW1qe4",
		"bucket":"yak2",
		"bucketstatic":"yakstatic"
	},
	"prod" : {
		"resetpassUrl":"http://labs.yakwala.fr/user/resetpassword/",	
		"validationUrl":"http://labs.yakwala.fr/user/validate/",
		"batchurl":"http://batch.yakwala.fr/PROD/YAKREP/BACKEND/",
		"backurl":"http://backend.yakwala.fr/PROD/YAKREP/BACKEND/",
		"fronturl":"http://labs.yakwala.fr",
		"apiurl":"http://api.yakwala.fr",
		"trackurl":"http://labs.yakwala.fr:62504",
		"twitter_callbackurl":"http://labs.yakwala.fr/auth/twitter/callback",
		"twitter_callbackurl2":"http://labs.yakwala.fr/auth/twitter/callback2",
		"twitter_callbackurl_create":"http://labs.yakwala.fr:3000/auth/twitter/callback_create",
		"backdns":"backend.yakwala.fr",
		"frontdns":"labs.yakwala.fr",
		"apidns":"api.yakwala.fr",
		"frontport":62500,
		"backport":62501,
		"apiport":62502,
		"fileport":62503,
		"trakport" : 62504,
		"dbname":"yakwala",
		"dbtrackname":"yaktrack",
		"env":"Labs",
		"uploadsDir":__dirname+'/public/uploads/',
		"ga":"var _gaq = _gaq || [];_gaq.push(['_setAccount', 'UA-31211954-2']);_gaq.push(['_trackPageview']);(function() {var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);})();",
		"gmapKey":"AIzaSyBBjGZqkyZuTHuSuaZ_aHP9gyf4rCW1qe4",
		"bucket":"yak3",
		"bucketstatic":"yakstatic"
	},
};


