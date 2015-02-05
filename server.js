// server.js
var express = require('express');
var http           = require( 'http' );
var path = require('path');
var engine = require( 'ejs-locals' );
var cookieParser   = require( 'cookie-parser' );
var bodyParser = require('body-parser');
// var partials = require('express-partials');
var static = require('serve-static');
//載入data
require('./db');
var app = express();
var page = require('./routes/page');
// app.use(partials());
//w
// express use
app.set( 'port', process.env.PORT || 3000);
app.engine( 'ejs', engine );
app.set( 'view engine', 'ejs' );
app.use( cookieParser());
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true}));



// 頁面 get與post位址
app.get('/', page.index);
app.get('/add', page.add);
app.get('/doc', page.doc);
app.get('/showcase', page.showcase);
app.get('/storyEditor', page.storyEditor);
app.get('/page/:id', page.page);
// app.get('/demopage', page.demopage);
app.post('/saveImage', page.saveImage);
app.use( static( path.join( __dirname, 'public' )));


//指定port
http.createServer(app).listen(app.get( 'port' ), function (){
  console.log( 'Express server listening on port ' + app.get( 'port' ));
});