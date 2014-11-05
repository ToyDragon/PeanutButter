var url = require('url');
var util = require('util');
var path = require('path');
var fs = require('fs');

var defaultPage = '/index.html';

var mimeTypes = {
	'pb'  : 'text/html',
	'html': 'text/html',
	'jpeg': 'image/jpeg',
	'jpg' : 'image/jpeg',
	'png' : 'image/png',
	'js'  : 'text/javascript',
	'css' : 'text/css'};

var peanutpattern = /(?:<script language="peanutbutter">((?:.|[\r\n])*?)<\/script>)|(?:<pb>((?:.|[\r\n])*?)<\/pb>)/g;
var nextpeanutpattern = /(?:<script language="peanutbutter">((?:.|[\r\n])*?)<\/script>)|(?:<pb>((?:.|[\r\n])*?)<\/pb>)/;

function getMatches(string, regex) {
	var matches = [];
	var match;
	while (match = regex.exec(string)) {
		var raw = match[1] || match[2];
		matches.push(raw);
	}
	return matches;
}

pb = {};
pb.currentmessage='';

pb.write = function(message){
	pb.currentmessage+=message;
}

function evalPeanut(peanut){
	pb.currentmessage='';
	eval(peanut);
	return pb.currentmessage;
}

function processPage(page){
	var peanuts = getMatches(page, peanutpattern, 2);
	var results = [];
	var test = '';
	//console.log('Loading peanuts');
	for(i in peanuts){
		peanut = peanuts[i];
		var peanuteval = '';
		try{
			peanuteval = evalPeanut(peanut);
		}catch(error){
			peanuteval = 'Error evaluating peanut('+error+')';
		}
		page = page.replace(nextpeanutpattern, peanuteval);
		results.push(peanuteval);
		test += results[i];
	}

	return page;
}

exports.registerApp = function(app, page){
	if(page !== undefined)
		defaultPage = page;

	app.get('/*', function(req, res){
		var requrl = url.parse(req.url,true);
		var route = requrl.pathname;
		var params = requrl.query;
		if(route === '/' || route === ''){
			route = defaultPage;
		}
		console.log('Routing('+route+')');
		console.log('Query('+util.inspect(params)+')');
		var filename = path.join(process.cwd(), "www"+route);

		var exists = path.exists || fs.exists;

		exists(filename, function(exists) {
			if(!exists) {
				console.log('File doesn\' exist: ' + filename);
				res.writeHead(200, {'Content-Type': 'text/plain'});
				res.write('404 Not Found\n');
				res.end();
			}else{
				var mimeType = mimeTypes[path.extname(filename).split('.')[1]];
				res.writeHead(200, mimeType);
				fs.readFile(filename, 'utf8', function(err,data){
					//data = util.inspect(processPage(data));
					if(params.nopeanutbutter !== ''){

						data = processPage(data);
					}
					//console.log(data);
					//console.log(req.params[1]);
					res.write(data);
					res.end();
				});
			}
		}); //end path.exist
	});

	console.log("App Registered!");
}