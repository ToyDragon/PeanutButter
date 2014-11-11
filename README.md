PeanutButter
============

Run server side javascript right in your page with this nodejs module! Interact with mongodb right on the page without worry of clients being able to access your sensitive information!

###Creating A PeanutButter Project

Create a directory to contain your site

    mkdir FrogTown && cd FrogTown

Create a www folder and www/index.html

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

Install PeanutButter

    npm install peanutbutter
    
Create a basic server.js

    'use strict';
    var pb = require('peanutbutter');
    
    pb.registerApp();

Test your project!

    node server.js

Connect to http://localhost:8080 to see your page!

###Accessing A Mongodb Instance

Install the mongoose NodeJS module

    npm install mongoose
