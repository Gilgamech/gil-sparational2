//Gil.JS
// Comments are fundamental
// aSecretToEverybody

var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt-nodejs');
var session = require("express-session");
var $AWS = require('aws-sdk');
var stripe = require("stripe")(process.env.STRIPE_KEY || 'sk_test_abcdef1234567890');

var app = express();

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
	}; // end if err
}	catch(e){console.log(e)};
}); // end s3 getObject

$settingsVar = {
    userName: "Login",
    deviceType: "null",
    apiVersion: 302, 
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
	}; // end if err
}	catch(e){console.log(e)};
}); // end s3 getObject

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
	}; // end if err
}	catch(e){console.log(e)};
}); // end s3 getObject

var lineBreak = "\r\n"
var $basePrice = (Math.random()*10)
var $rootPage = "root"
var $publicBucket = "gilpublic";
var $siteBase = "https://s3.amazonaws.com/" + $publicBucket
var $publicParams = {Bucket: $publicBucket};

$settingsVar.userName= "null";
$settingsVar.deviceType= "null";
$settingsVar.apiVersion= 302; 
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

app.use(bodyParser.urlencoded({ extended: true })); // get information from html forms
app.use(cookieParser()); // read cookies (needed for auth)

$s3.getSignedUrl('getObject', $urlPWHParams, function(err, url){
    addErr('the url is ' + url);
});

function getBadPW() {
	return Math.random().toString(36).slice(-20);
 }

function addErr(err) {
  $settingsVar.errgoLogic += err + "<br>"// lineBreak
};

function newSite() {
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
		}; // end if err
	}); // end s3
	return $siteName
};

function sendS3Url($userName,$siteName)	{
	
	if($userName){
		addErr(("S3url - user found: " + $userName));
		console.log(("S3url - user found: " + $userName));
		//If you have an ACL
		if ($aclTable[$userName] = $siteName) {
			addErr(("S3url site "+$siteName+" for user: " + $userName));
			console.log(("S3url site "+$siteName+" for user: " + $userName));

			var $urlParams = {
				ContentType: "text/plain;charset=UTF-8",
				ACL: 'public-read',
				Bucket: $publicBucket, 
				Key: $aclTable[$userName] + "/" + $aclTable[$userName] + ".json"
				//Key: $site + "/" + $site + ".json"
			};; // end urlParams
			$s3.getSignedUrl('putObject', $urlParams, function(err, url){
				if (err) {
					addErr(err);
				}; // end if err
					console.log("S3url: " + url);
					return(url); 
				}); // end s3
			
		}; // end if site
	} else {
		return("Please login."); 
	}
}
// Page calls
app.get(/\S+/, function(request, response) {
	//https://gil-api.herokuapp.com/?p=giltech
	var $queryString = request.path
	if ($queryString == "/") {
		$queryString += $rootPage
	}; //end if siteName
	$settingsVar.clientIP = request.ip;
	$settingsVar.googleApiKey= process.env.GOOGLE_API_KEY;

	response.send('<!DOCTYPE html><html lang="en"><html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><link rel="shortcut icon" href="' + $siteBase + '/favicon.ico" type="image/x-icon"><link href="' + $siteBase + '' + $queryString + $queryString + '.css" rel="stylesheet" type="text/css"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><div id="deleteme" hidden><p1>Page requires Javascript and load files (XHR) to function.</p1><br><p3>This page composes itself entirely from Javascript -  a true single-page application, not only is it entirely one page in the browser. Where most websites use HTML for structure, CSS for style, and Javascript for operations, this page uses JSON to express every element. This uses a small (less than 500 lines) Javascript engine to interpret the JSON. To see this in action, please permit the site to run Javascript, and load files from the data source: </p3><br><div id="pageSettingsJson" >' + $siteBase + '' + $queryString + $queryString + '.json</div></div></body></html><script src="' + $siteBase + '/Gilgamech.js"></script><script>$settingsVar='+JSON.stringify($settingsVar)+'</script> ');
});

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
			}; //end if err
			if ($userFound) {
				request.session.regenerate(function(err) {
					addErr(("User password matches: " + $userName));
					request.session.userName = $userName;
					console.log(request.session.userName);
					
					$settingsVar.userName = request.session.userName;
					$settingsVar.clientIP = request.ip;
					$settingsVar.googleApiKey= process.env.GOOGLE_API_KEY;
					response.json($settingsVar); 
				})
			} else {
				addErr(("User password not match: " + $userName));
				response.json("User password not match.");
			}; //end if userFound
		}); // end bcrypt.compare
	} else {
		//Signup
		addErr(("User not found: " + $userName + " - starting signup."));
		bcrypt.hash($enteredPassword, null, null, function($err, $hash){
		if ($err) {
				addErr($err);
		}; //end if err
		  
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
			}; // end if err
		});		  
		
		$aclTable[$userName] = getBadPW();
		var $putParams = {
			Bucket: $privateBucket,
			Key: "ACL.json", 
			Body: JSON.stringify($aclTable),
			ContentType: "application/json"
		};
		$s3.putObject($putParams, function(err, data) {
			if (err) {
				addErr(err);
			}; // end if err
		}); // end s3
		
		addErr(("User password stored: " + $userName));

		$settingsVar.clientIP = request.ip;
		$settingsVar.googleApiKey= process.env.GOOGLE_API_KEY;
		response.json($settingsVar);

	  }); // end bcrypt.hash
	}; // end if userPWHTable
}); // end app post login 

app.post('/logout', function(request, response) {
    var $userName = request.session.userName;
	request.session.destroy(function(err) {
		console.log("User Logout: " + $userName);
		response.json("You have been logged out."); 
	})
});

app.post('/newSite', function(request, response){
	var $userName = request.session.userName;
	if(request.session.userName){
		$sitename = newSite();
		response.json(sendS3Url($userName,$siteName));
   }
	
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
    //var $siteName = request.query.siteName;
	// If logged in
	if($userName){
		addErr(("S3url - user found: " + $userName));
		console.log(("S3url - user found: " + $userName));
		//If you have an ACL
		if ($aclTable[$userName]) {
			addErr(("S3url for user: " + $userName));
			console.log(("S3url for user: " + $userName));

			var $urlParams = {
				ContentType: "text/plain;charset=UTF-8",
				ACL: 'public-read',
				Bucket: $publicBucket, 
				Key: $aclTable[$userName] + "/" + $aclTable[$userName] + ".json"
			};
			$s3.getSignedUrl('putObject', $urlParams, function(err, url){
				if (err) {
					addErr(err);
				}; // end if err
				console.log("S3url: " + url);
				response.json(url); 
			}); // end s3
			
		}
	} else {
		response.json("Please login."); 
	}
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

// Error capture
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
	addErr((req + err));
    next(err);
});

app.use(function(err, req, res, next) {
	addErr(err);
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
