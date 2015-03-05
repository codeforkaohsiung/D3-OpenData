var mongoose = require('mongoose');
var C3data = mongoose.model('C3data');
exports.index = function(req, res) {
    res.render('pages/index',{
        ogheadTitle: '首頁',
        ogdescription: '',
        ogImage: ''
    });
};
exports.add = function(req, res) {
    res.render('pages/add');
};
exports.storyEditor = function(req, res) {
    res.render('pages/storyEditor',{
        ogheadTitle: '故事模式',
        ogdescription: '',
        ogImage: ''
    });
};
exports.storyEditor = function(req, res) {
    res.render('pages/storyReader',{
        ogheadTitle: '故事模式',
        ogdescription: '',
        ogImage: ''
    });
};
exports.doc = function(req, res) {
    res.render('pages/doc',{
        ogheadTitle: '使用教學',
        ogdescription: '',
        ogImage: ''
    });
};
exports.showcase = function(req, res) {
    C3data.find(function(err, C3data, count) {
        res.render('pages/showcase', {
              C3data: C3data,
              ogheadTitle: '展示區',
              ogdescription: '',
              ogImage: ''
        });
    });
};
// exports.demopage = function(req, res) {
//     res.render('pages/demopage', {
//         chartType_name: '圓餅圖',
//         chartType_value: 'pie',
//         xAxis_name: 'gsx$時間',
//         xAxis_value: 'gsx$時間',
//         data_name: "",
//         data_value: "['gsx$新北市總計', 'gsx$臺北市總計', 'gsx$高雄市總計']",
//         range_name: 'gsx$時間',
//         range_min: 5,
//         range_max: 13,
//         range_minimum: 'true',
//         range_maximum: 'true',

//     });
// };
exports.page = function(req, res, next) {
   
    C3data.find({ _id: req.params.id }, function ( err, C3data, count ){
         console.log(C3data[0].data_value);
          res.render( 'pages/page', {
         C3data:C3data,
         ogheadTitle: C3data[0].name,
         ogdescription: C3data[0].description,
         ogImage: C3data[0].img
    });
  }); 
  
};
exports.saveImage = function(req, res) {
  console.log(req.body.googleId);
    C3data({
        googleId: req.body.googleId,
        name: req.body.name,
        img: req.body.img,
        description: req.body.description,
        chartType_name: req.body.chartType_name,
        chartType_value: req.body.chartType_value,
        xAxis_name: req.body.xAxis_name,
        xAxis_value: req.body.xAxis_value,
        data_name: '',
        data_value: req.body.data_value,
        range_name: req.body.range_name,
        range_min: req.body.range_min,
        range_max: req.body.range_max,
        range_minimum: req.body.range_minimum,
        range_maximum: req.body.range_maximum,


    }).save(function(err) {
        return res.send('success');
    });
};
