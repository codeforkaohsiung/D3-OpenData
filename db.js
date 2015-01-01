var mongoose = require('mongoose');
mongoose.connect('mongodb://liao:nba45678@ds029801.mongolab.com:29801/data');
// mongoose.connect('mongodb://localhost/express-todo');
// var db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function callback () {});
var Schema   = mongoose.Schema;
var C3data = new Schema({
    name: String,
    description:String,
    googleId:String,
    img:String,
    chartType_name : String,
    chartType_value: String,
    xAxis_name: String,
    xAxis_value: String,
    data_name: String,
    data_value: [],
    range_name: String,
    range_min: Number,
    range_max: Number,
    range_minimum: String,
    range_maximum: String

});
mongoose.model( 'C3data', C3data );
var C3data = mongoose.model('C3data');
