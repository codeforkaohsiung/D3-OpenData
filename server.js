// server.js
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var path = require('path');
var partials = require('express-partials');
app.use(partials());
var bodyParser = require('body-parser');
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));
//指定port
var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
//指定路徑
app.use(express.static(path.join(__dirname, 'public')));
// 頁面 get與post位址
app.set('view engine', 'ejs');
var page = require('./routes/page');
app.get('/', page.index);
app.get('/add', page.add);
app.get('/doc', page.doc);
app.get('/showcase', page.showcase);
app.get('/demopage', page.demopage);

   

