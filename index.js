//Gil.JS
// Comments are fundamental
// aSecretToEverybody

var $ver = 338

//{ Init vars
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt-nodejs');
var session = require("express-session");
var $AWS = require('aws-sdk');
var stripe = require("stripe")(process.env.STRIPE_KEY || 'sk_test_abcdef1234567890');
const { Client } = require('pg');

var Sequelize = require('sequelize');
var pg = require('pg').native;
var pghstore = require('pg-hstore');
var sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://dbuser:dbpasswd@dbhost:5432/dbname');

var app = express();
var User = sequelize.import('./User');
User.sync();

var $privateBucket = "gilprivate";
var $privateParams = {Bucket: $privateBucket};

$AWS.config.update({
    "accessKeyId": process.env.AWS_S3_KEY || "AAAAAAAAAAAAA", 
    "secretAccessKey": process.env.AWS_S3_SECRET_KEY || "rc0jbosmx9o09gf72ov1xkp0dz2tirm6",
    "region": process.env.AWS_S3_REGION || "us-east-1"
});

var $s3 = new $AWS.S3({
  apiVersion: '2006-03-01',
  params: $privateParams
});

$s3.createBucket($privateParams);

var $userPWHTable;
var $pageSettingsJson;
var $settingsVar;
var $aclTable;

var $urlPWHParams = {
	Bucket: $privateBucket, 
	Key: 'userPWHTable.json'
};
$s3.getObject($urlPWHParams, function(err, dataStream){
try {
	
	$userPWHTable = JSON.parse(dataStream.Body.toString('utf-8'));
	//addErr(JSON.stringify($userPWHTable));
	if (err) {
		addErr(err);
	};// end if err
}	catch(e){console.log(e)};
});// end s3 getObject

$settingsVar = {
    userName: "Login",
    deviceType: "null",
    apiVersion: 331, 
    googleApiKey: process.env.GOOGLE_API_KEY || 'aSecretToEverybody',
    chatGeneral: "", 
    errgoLogic: "--- Err and Log Output --- " + lineBreak + lineBreak,
    awsS3Key: "",
    session: "",
    clientIP: "",
    fruitbotwin:0,
    fruitbotloss:0,
    fruitbottie:0
};

// PostGre SQL stuff.
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});
client.connect();
client.query('SELECT table_name FROM information_schema.tables;', (err, queryOutput) => {
  $settingsVar.chatGeneral = $settingsVar.chatGeneral + "Connected successfully to server" + lineBreak;
  if (err) addErr((err));
  addErr(("Connected successfully to DB server"));
  // for (let row of queryOutput.rows) {
    // addErr((row.table_name));
  // }
});

User.findAll().then(users => {
  $settingsVar.chatGeneral = $settingsVar.chatGeneral + 'SELECT FROM Users\n\r';
  addErr((users));
});

var $serverParams = {
	Bucket: $privateBucket, 
	Key: 'settings.json'
};
$s3.getObject($serverParams, function(err, dataStream){
try {
	
	$settingsVar = JSON.parse(dataStream.Body.toString('utf-8'));
	addErr(JSON.stringify($settingsVar));
	if (err) {
		addErr(err);
	};// end if err
}	catch(e){console.log(e)};
});// end s3 getObject

var $aclParams = {
	Bucket: $privateBucket, 
	Key: 'ACL.json'
};
$s3.getObject($aclParams, function(err, dataStream){
try {
	
	$aclTable = JSON.parse(dataStream.Body.toString('utf-8'));
	//addErr(JSON.stringify($aclTable));
	if (err) {
		addErr(err);
	};// end if err
}	catch(e){console.log(e)};
});// end s3 getObject

var lineBreak = "\r\n"
var $basePrice = (Math.random()*10)
var $rootPage = "root"
var $publicBucket = "gilpublic";
var $siteBase = "https://s3.amazonaws.com/" + $publicBucket;
var $publicParams = {Bucket: $publicBucket};
//}

//{ settingsVar vars
$settingsVar.userName= "null";
$settingsVar.deviceType= "null";
$settingsVar.apiVersion= $ver;
$settingsVar.googleApiKey= process.env.GOOGLE_API_KEY || 'aSecretToEverybody';
$settingsVar.aclTable= [];
$settingsVar.chatGeneral= "";
$settingsVar.errgoLogic= "--- Err and Log Output --- " + lineBreak + lineBreak;
$settingsVar.awsS3Key= "";
$settingsVar.session= "";
$settingsVar.clientIP= "";
$settingsVar.fruitbotwin=0;
$settingsVar.fruitbotloss=0;
$settingsVar.fruitbottie=0;
//}

//{ app init
app.use(cookieParser(process.env.PASSPORT_SECRET || 'aSecretToEverybody'));
app.use(session());
app.use(require('express-session')({
	secret: process.env.PASSPORT_SECRET || 'aSecretToEverybody', 
	resave: true, 
	saveUninitialized: true, 
	maxAge: null
}));

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));// get information from html forms
app.use(cookieParser());// read cookies (needed for auth)
//}

//{ Functions
$s3.getSignedUrl('getObject', $urlPWHParams, function(err, url){
    addErr('the url is ' + url);
});

function getBadPW() {
	return Math.random().toString(36).slice(-20);
 }

function taskScheduler() {
	var $now = Date().toLocaleString();
	for ($task in $taskList) {
		if ($now == $taskList[$task].execTime){
			exec($taskList[$task].scriptBlock);
		};
	};
 };

function addErr(err) {
  $settingsVar.errgoLogic += err + "<br>"// lineBreak
};

function newSite($userName) {
	if($userName){
		var $siteName = getBadPW();
		$aclTable.users[$userName].userSites[$siteName] = {"permission":"write"};
		var $putParams = {
			Bucket: $privateBucket,
			Key: "ACL.json", 
			Body: JSON.stringify($aclTable),
			ContentType: "application/json"
		};
		$s3.putObject($putParams, function(err, data) {
			if (err) {
				addErr(err);
			};// end if err
		});// end s3
		return $siteName
	} else {
		return("Please login.");
	}
};

function deleteSite($userName,$siteName) {
	if($userName){
		delete $aclTable.users[$userName].userSites[$siteName];
		var $putParams = {
			Bucket: $privateBucket,
			Key: "ACL.json", 
			Body: JSON.stringify($aclTable),
			ContentType: "application/json"
		};
		$s3.putObject($putParams, function(err, data) {
			if (err) {
				addErr(err);
			};// end if err
		});// end s3
		return($siteName + " deleted");
	} else {
		return("Please login.");
	};
};

function deleteAccount($userName) {
	if($userName){
		delete $aclTable.users[$userName];
		var $putParams = {
			Bucket: $privateBucket,
			Key: "ACL.json", 
			Body: JSON.stringify($aclTable),
			ContentType: "application/json"
		};
		$s3.putObject($putParams, function(err, data) {
			if (err) {
				addErr(err);
			};// end if err
		});// end s3
		return($userName + " deleted");
	} else {
		return("Please login.");
	};
};

function sendS3Url($userName,$siteName,$fileName,$callback,$contentType) {
	if(!$fileName){
		$fileName = $siteName + ".json"
	};//end if fileName
	if(!$contentType){
		$contentType = "text/plain;charset=UTF-8"
	};//end if fileName
	if($userName){
		addErr(("S3url - user found: " + $userName));
		console.log(("S3url - user found: " + $userName));
		//If you have an ACL
		if ($aclTable.users[$userName].userSites[$siteName].permission == "write") {
			addErr(("S3url site "+$siteName+" for user: " + $userName));
			console.log(("S3url site "+$siteName+" for user: " + $userName));

			var $urlParams = {
				ContentType: $contentType,
				ACL: 'public-read',
				Bucket: $publicBucket, 
				Key: $siteName + "/" + $fileName
			};// end urlParams
			$s3.getSignedUrl('putObject', $urlParams, function(err, url){
				if (err) {
					addErr(err);
				};// end if err
				$callback(url);
				console.log("S3url: " + url);
			});// end s3
			
		};// end if site
	} else {
		console.log("Bad ACL");
		$callback("Please login.");
	}
}
//}

//{ Page calls
app.get(/\S+/, function(request, response) {
	//https://gil-api.herokuapp.com/?p=giltech
	var $userName = request.session.userName;
	var $requestPath = request.path
	var $directoryPath = $requestPath
	var $pagename
	if ($requestPath == "/") {
		$requestPath += $rootPage
	};//end if siteName
	if ($requestPath.indexOf("ipynb") > -1 ) {
		$pagename = $requestPath;
		$pageSettingsJson = JSON.stringify(request.query);
		console.log($pageSettingsJson);
	} else {
		$pagename = $requestPath + '.spa';
		$pageSettingsJson = $siteBase + $requestPath + $pagename;
	};//end if requestPath.indexOf
   if($userName == ""){
		$settingsVar.userACLTable = [];
	}else{
		$settingsVar.userACLTable = [];
		for ($site in $aclTable.users[$userName].userSites) {$settingsVar.userACLTable += $site+","}
	}// end if userName
	$settingsVar.clientIP = request.ip;
	$settingsVar.googleApiKey= process.env.GOOGLE_API_KEY;
	addErr(("Page load "+$requestPath+" for user: " + $userName));

	response.send('<!DOCTYPE html><html lang="en"><html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><link rel="shortcut icon" href="' + $siteBase + '/favicon.ico" type="image/x-icon"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><div id="deleteme" hidden><p1>Page requires Javascript and load files (XHR) to function.</p1><br><p3>This page composes itself entirely from Javascript -  a true single-page application, not only is it entirely one page in the browser. Where most websites use HTML for structure, CSS for style, and Javascript for operations, this page uses JSON to express every element. This uses a small (less than 500 lines) Javascript engine to interpret the JSON. To see this in action, please permit the site to run Javascript, and load files from the data source: </p3><br><div id="pageSettingsJson" >' + $pageSettingsJson + '</div></div></body></html><script src="' + $siteBase + '/Gilgamech.js"></script><script>$settingsVar='+JSON.stringify($settingsVar)+'</script> ');
});
//}

//{POST calls 
app.post('/login', function(request, response) {
    var $userName = request.query.username;
    var $enteredPassword = request.query.password;
	addErr(("Login for user: " + $userName));
	
	if ($userPWHTable[$userName]) {
		$pwhash = $userPWHTable[$userName];
		addErr(("User found: " + $userName));
	  
		bcrypt.compare($enteredPassword, $pwhash, function($err, $userFound) {
			if ($err) {
					addErr($err);
			};//end if err
			if ($userFound) {
				request.session.regenerate(function(err) {
					addErr(("User password matches: " + $userName));
					request.session.userName = $userName;
					console.log(request.session.userName);
					
					$settingsVar.userName = request.session.userName;
					$settingsVar.clientIP = request.ip;
					$settingsVar.googleApiKey= process.env.GOOGLE_API_KEY;
					response.json($settingsVar);

					request.session.userName = "";
					$settingsVar.userName = "";
					$settingsVar.clientIP = "";
					$settingsVar.googleApiKey= "";
				})
			} else {
				addErr(("User password not match: " + $userName));
				response.json("User password not match.");
			};//end if userFound
		});// end bcrypt.compare
	} else {
		//Signup
		addErr(("User not found: " + $userName + " - starting signup."));
		bcrypt.hash($enteredPassword, null, null, function($err, $hash){
		if ($err) {
				addErr($err);
		};//end if err
		  
		$userPWHTable[$userName] = $hash
		var $putParams = {
			Bucket: $privateBucket,
			Key: "userPWHTable.json", 
			Body: JSON.stringify($userPWHTable),
			ContentType: "application/json"
		};
		$s3.putObject($putParams, function(err, data) {
			if (err) {
				addErr(err);
			};// end if err
		});		  
		addErr(("User password stored: " + $userName));
		
		newSite($userName);
		response.json(sendS3Url($userName,$siteName));

	  });// end bcrypt.hash
	};// end if userPWHTable
});// end app post login 

app.post('/logout', function(request, response) {
    var $userName = request.session.userName;
	request.session.destroy(function(err) {
		console.log("User Logout: " + $userName);
		response.json("You have been logged out.");
	})
});

app.post('/newSite', function(request, response){
	var $userName = request.session.userName;
	console.log("New site: " + $userName);
	$siteName = newSite($userName);
	console.log("New site name: " + $siteName);
	sendS3Url($userName,$siteName,'',function(url){response.json(url)});
});

app.post('/deleteSite', function(request, response){
	var $userName = request.session.userName;
    var $siteName = request.query.siteName;
	console.log("Delete site: " + $siteName);
	deleteSite($userName,$siteName);
	console.log("Delete site name: " + $siteName);
	response.send("Site "+$siteName+" deleted")
});

app.post('/deleteAccount', function(request, response){
	var $userName = request.session.userName;
	console.log("Delete account: " + $userName);
	deleteAccount($userName);
	console.log("Delete account name: " + $userName);
	request.session.destroy(function(err) {
		console.log("User Logout: " + $userName);
		response.send("Account "+$userName+" deleted. You have been logged out.");
	})
});

app.post('/s3upload', function(request, response){
   if(request.session.page_views){
      request.session.page_views++;
      response.send("Hi " + request.session.userName+ ", You visited this page " + request.session.page_views + " times");
   } else {
      request.session.page_views = 1;
      response.send("Welcome to this page for the first time, "+request.session.userName+"!");
   }
});

app.post('/s3url', function(request, response){
	var $userName = request.session.userName;
	console.log("Existing site: " + $userName);
    var $siteName = request.query.siteName;
    var $fileName = request.query.fileName;
    var $contentType = request.query.contentType;
	console.log("Existing site name: " + $siteName+" & file name: " + $fileName+" & content name: " + $contentType);
	sendS3Url($userName,$siteName,$fileName,function(url){response.json(url)},$contentType);
});

app.post('/automation', function(request, res){
	var $score = request.query.score;
   if($score = "teal"){
      request.session.page_views++;
      res.send("Hi " + request.session.userName+ ", You visited this page " + request.session.page_views + " times");
   } else {
      request.session.page_views = 1;
      res.send("Welcome to this page for the first time, "+request.session.userName+"!");
   }
});

app.post('/chat', function(req, res){
	var $channel = request.query.channel;
	var $message = request.query.message;
   if(req.session.page_views){
      req.session.page_views++;
      res.send("Hi " + req.session.userName+ ", You visited this page " + req.session.page_views + " times");
   } else {
      req.session.page_views = 1;
      res.send("Welcome to this page for the first time, "+req.session.userName+"!");
   }
});

app.post('/test', function(req, res){
   if(req.session.page_views){
      req.session.page_views++;
      res.send("Hi " + req.session.userName+ ", You visited this page " + req.session.page_views + " times");
   } else {
      req.session.page_views = 1;
      res.send("Welcome to this page for the first time, "+req.session.userName+"!");
   }
});
//}

//{ Error capture
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    res.status(err.status || 404);
	addErr((req + err));
    res.send('error: '+ err.message)
	next(err);
});

app.use(function(req, res, next) {
    var err = new Error('Not Working');
    res.status(err.status || 500);
	addErr((req + err));
    res.send('error: '+ err.message)
	next(err);
});
//}

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
