PeanutButter
============

Run server side javascript right in your page with this nodejs module!

#Creating A PeanutButter Project

Create a directory to contain your site

    mkdir FrogTown && cd FrogTown

Clone this git repo into the directory

    giakdiwjoiwajiojawidjw

Create a basic index.html

    <html>
        <head>
            <title>Frog Town</title>
        </head>
        <body>
            <h>Welcome to frogtown!</h>
            <script language="peanutbutter">
                var date = new Date();
                var time = (date.getMonth()+1)+'/'+date.getDate()+'/'+date.getFullYear();
                pb.write("<p>It's " + time + " here where the frogs live</p>");
            </script>
        </body>
    </html>


Create a basic server.js

    'use strict';
    var express = require('express');
    var pb = require('PeanutButter/src/peanutbutter.js');
    
    var app = express();
    pb.registerApp(app);
    
    app.listen(8080);

Test your project!

    node server.js

Connect to http://localhost:8080 to see your page!
