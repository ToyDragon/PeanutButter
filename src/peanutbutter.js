var url = require('url');
var util = require('util');
var path = require('path');
var http = require('http');
var fs = require('fs');

/*
 * PeanutButter.js is a NodeJS module that currently provides the ability to "register" an app
 *   which assigns the http routing functionality in the www folder, and preprocesses all files
 *   with whitelisted extensions to evaluate all inline javascript blocks called peanuts labeled
 *   with the <pb></pb> tags, or the <script language="peanutbutter"></script> tags.
 */

//debug and config options
var displayErrors = false;
var displayCantFindIco = false;
var displayQuery = false;
var displayRoute = true;

//mimeTypes for different file types to be served
var mimeTypes = {
	'pb'  : 'text/html',
	'html': 'text/html',
	'jpeg': 'image/jpeg',
	'jpg' : 'image/jpeg',
	'png' : 'image/png',
	'js'  : 'text/javascript',
	'css' : 'text/css'
};

//list of all processable types
var processableTypes = {
	'html' : true
};

//pb is the object that peanuts will use to interact with the current page. It will be directly accessible
//  from within a peanut.
pb = {};

//currentmessage is a helper variable that is used in evaluatePeanut to track a peanuts output
pb.currentmessage='';

pb.write = function(message){
	pb.currentmessage+=message;
}

//page to route to when requesting root(IE: www.frogtown.me instead of www.frogtown.me/index.html)
var defaultPage = '/index.html';

//local folder to contain the root of the web accessible content
var routingRoot = 'www';

//regex patterns to recongnize and retreive peanuts out of a file
var patternAllPeanuts = /(?:<script language="peanutbutter">((?:.|[\r\n])*?)<\/script>)|(?:<pb>((?:.|[\r\n])*?)<\/pb>)/g;
var patternNextPeanut = /(?:<script language="peanutbutter">((?:.|[\r\n])*?)<\/script>)|(?:<pb>((?:.|[\r\n])*?)<\/pb>)/;

/**
 * This is a helper method used in processing. returns true if processableTypes contains a true value for this extension
 */
function isProcessableExtension(extension){
	return processableTypes[extension];
}

/**
 * getPeanuts provides an easy method to get all peanuts from a string
 */
function getPeanuts(string) {
	var matches = [];
	var match;
	while (match = patternAllPeanuts.exec(string)) {
		var raw = match[1] || match[2];
		matches.push(raw);
	}
	return matches;
}

/**
 * evaluatePeanut runs a single peanut in the javascript runtime, and then returns the content of the
 *   currentmessage variable, which is written by the peanut with pb.write
 */
function evaluatePeanut(peanut){
	pb.currentmessage='';
	eval(peanut);
	return pb.currentmessage;
}

/**
 * processAllPeanuts accepts a raw string as input and parses the string for peanuts, and then replaces the peanuts
 *   with their evaluated results. It returns the processed string.
 */
function processAllPeanuts(page){
	var peanuts = getPeanuts(page);
	var results = [];
	for(peanut_i in peanuts){
		peanut = peanuts[peanut_i];
		var peanutEvaluation = '';
		try{
			peanutEvaluation = evaluatePeanut(peanut);
		}catch(error){
			if(displayErrors){
				peanutEvaluation = 'Error evaluating peanut('+error+')';
			}
		}
		page = page.replace(patternNextPeanut, peanutEvaluation);
		results.push(peanutEvaluation);
	}

	return page;
}

/**
 * registerApp takes an optional port number. It assigns a default http route handler for the specified port
 *   in the routing root and provides PeanutButter preprocessing.
 */
exports.registerApp = function(port){
	port = port | 8080;

	http.createServer(function(req, res) {
		var requrl = url.parse(req.url,true);
		var route = requrl.pathname;
		var params = requrl.query;

		if(route === '/' || route === ''){
			route = defaultPage;
		}

		if(displayRoute)console.log('Routing('+route+')');
		if(displayQuery)console.log('Query('+util.inspect(params)+')');

		var filename = path.join(process.cwd(), routingRoot+route);

		var exists = path.exists || fs.exists;

		exists(filename, function(exists) {
			var fileExtension = path.extname(filename).split('.')[1];

			if(!exists) {
				if(fileExtension !== 'ico' || displayCantFindIco){
					console.log('Could not open file: ' + filename);
				}
				res.writeHead(200, {'Content-Type': 'text/plain'});
				res.write('404 Not Found\n');
				res.end();
			}else{
				var mimeType = mimeTypes[fileExtension];
				res.writeHead(200, mimeType);
				fs.readFile(filename, 'utf8', function(err,data){

					//if this is filetype is in the processable white list, process it
					if(isProcessableExtension(fileExtension)){
						if(params.nopeanutbutter !== ''){
							data = processAllPeanuts(data);
						}
					}

					res.write(data);
					res.end();
				});
			}
		});
	}).listen(port);

	//Often times the registerApp could be the only method called in the base application,
	//  give a verification message that it ran successfully
	console.log('App Registered to port ' + port + '!');
}