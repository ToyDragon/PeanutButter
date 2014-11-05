'use strict';
var express = require('express');
var pb = require('../../src/peanutbutter.js');

var app = express();
pb.registerApp(app);

app.listen(8080);
console.log("Listening on port 8080");