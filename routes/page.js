exports.index = function(req, res) {
    res.render('pages/index');
};
exports.add = function(req, res) {
    res.render('pages/add');
};
exports.doc = function(req, res) {
    res.render('pages/doc');
};
exports.showcase = function(req, res) {
    res.render('pages/showcase');
};
exports.demopage = function(req, res) {
    res.render('pages/demopage', {
       chartType_name : '圓餅圖',
       chartType_value : 'pie',
       xAxis_name : 'gsx$時間',
       xAxis_value : 'gsx$時間',
       data_name : "",
       data_value : "['gsx$新北市總計', 'gsx$臺北市總計', 'gsx$高雄市總計']",
       range_name : 'gsx$時間',
       range_min : 5,
       range_max : 13,
       range_minimum : 'true',
       range_maximum : 'true',

    });
};
