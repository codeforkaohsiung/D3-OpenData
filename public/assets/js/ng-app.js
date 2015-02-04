var app, chartType;

app = angular.module('starter', ['ui.bootstrap', 'vr.directives.slider']);

app.controller('appCtrl', function($scope, $http) {
  var getGoogleChart, getJsonKey, jsonPath, renderChart, renderData, renderForm, resetData, resetList, sliderData, xTemp;
  $scope.appModel = {};
  resetList = ['xVal', 'xDataMin', 'xDataMax', 'jsonKey', 'xData'];
  $scope.appModel.chartShkey = '1x6C86tzJ2F8ZTau6g7uUNxSb496wuoIR2s2I9lEWQSI';
  $scope.loadChart = function(path) {
    resetData($scope.appModel, resetList);
    $scope.appModel.chartShkey = path;
    return getGoogleChart($scope.appModel.chartShkey);
  };
  $scope.replaceGSX = function(str) {
    return str.replace('gsx$', '');
  };
  $scope.renderData = function(name) {
    return renderData();
  };
  resetData = function(data, resetList) {
    angular.forEach(resetList, function(d) {
      return data[d] = "";
    });
    return data;
  };
  jsonPath = 'data/test.json';
  $http({
    'url': jsonPath,
    'method': "GET"
  }).then(function(data) {
    console.log(data);
    $scope.appModel = data.data;
    return getGoogleChart($scope.appModel.chartShkey);
  }, function(response) {
    return console.log('Fail:', response);
  });
  $scope.chartType = chartType;
  getGoogleChart = function(shkey) {
    var listKey, shCallback, shPath, url;
    shPath = 'https://spreadsheets.google.com/feeds/list/';
    shCallback = '/public/values?alt=json';
    listKey = 'od6';
    url = shPath + shkey + '/' + listKey + shCallback;
    return $http({
      'url': url,
      'method': "GET"
    }).then(function(data) {
      console.log(data.data.feed);
      $scope.dataRemote = data.data.feed.entry;
      console.log(data, $scope.dataRemote);
      $scope.appModel.jsonKey = getJsonKey($scope.dataRemote);
      $scope.appModel.xVal = $scope.appModel.jsonKey[0];
      return renderForm();
    }, function(response) {
      return console.log('Fail:', response);
    });
  };
  getJsonKey = function(obj) {
    var i, jsonKeyTemp, jsonKeyVerify, key, orgKey, prefix;
    orgKey = [];
    prefix = "gsx$";
    jsonKeyTemp = [];
    for (key in obj[0]) {
      orgKey.push(key);
    }
    i = 0;
    while (i < orgKey.length) {
      if (orgKey[i].indexOf(prefix) > -1) {
        jsonKeyTemp.push({
          "name": orgKey[i]
        });
      }
      i++;
    }
    jsonKeyVerify = true;
    if ($scope.appModel.jsonKey) {
      console.log($scope.appModel.jsonKey.length);
      angular.forEach($scope.appModel.jsonKey, function(d, i) {
        if ($scope.appModel.jsonKey[i].name !== jsonKeyTemp[i].name) {
          return jsonKeyVerify = false;
        }
      });
      if (jsonKeyVerify) {
        return $scope.appModel.jsonKey;
      }
    }
    return jsonKeyTemp;
  };
  renderForm = function() {
    return sliderData();
  };
  xTemp = '';
  sliderData = function() {
    var min, xData;
    xData = [];
    if (xTemp !== $scope.appModel.xVal.name && $scope.appModel.xVal.name !== '') {
      xTemp = $scope.appModel.xVal.name;
    } else if (xTemp !== $scope.appModel.xVal.name && $scope.appModel.xVal.name === '') {
      $scope.appModel.xVal = $scope.appModel.jsonKey[0].name;
      xTemp = $scope.appModel.xVal.name;
    }
    min = 0;
    angular.forEach($scope.dataRemote, function(d, i) {
      return xData.push(d[xTemp].$t);
    });
    $scope.appModel.xData = xData;
    if (!$scope.appModel.xDataMin) {
      $scope.appModel.xDataMin = min;
    }
    if (!$scope.appModel.xDataMax) {
      $scope.appModel.xDataMax = $scope.appModel.xData.length;
    }
    return renderData();
  };
  renderData = function() {
    var dataTemp, dataVal, dataset, i, i2, k, max, min, x, xData, xVal;
    dataset = [];
    x = ["x"];
    xVal = $scope.appModel.xVal.name;
    dataVal = [];
    dataTemp = [];
    angular.forEach($scope.appModel.jsonKey, function(d, i) {
      if (d.dataSelect === true) {
        return dataVal.push(d.name);
      }
    });
    xTemp = $scope.appModel.xVal.name;
    xData = [];
    angular.forEach($scope.dataRemote, function(d, i) {
      return xData.push(d[xTemp].$t);
    });
    $scope.appModel.xData = xData;
    k = 0;
    while (k < dataVal.length) {
      dataTemp.push([dataVal[k]]);
      k++;
    }
    max = parseInt($scope.appModel.xDataMax, 10);
    min = parseInt($scope.appModel.xDataMin, 10);
    i2 = 0;
    angular.forEach($scope.dataRemote, function(d, i) {
      if (i >= min && i < max) {
        x.push($scope.dataRemote[i][xVal].$t);
        return angular.forEach(dataVal, function(d2, i2) {
          return dataTemp[i2].push(d3.round(d[d2].$t, 2));
        });
      }
    });
    dataset.push(x);
    i = 0;
    while (i < dataTemp.length) {
      dataset.push(dataTemp[i]);
      i++;
    }
    return renderChart(dataset, x);
  };
  return renderChart = function(dataset, x) {
    var chart, chartCase;
    chartCase = $scope.appModel.chartType.key;
    return chart = c3.generate({
      bindto: ".demo",
      data: {
        x: "x",
        columns: dataset,
        type: chartCase
      },
      size: {
        height: 480
      },
      axis: {
        x: {
          type: "category",
          tick: {
            rotate: 45,
            multiline: false,
            culling: {
              max: 20
            }
          }
        }
      },
      subchart: {
        show: true
      }
    });
  };
});

chartType = [
  {
    name: "長條圖 Bar",
    key: "bar"
  }, {
    name: "折線圖 Line",
    key: "line"
  }, {
    name: "曲線圖 Spline",
    key: "spline"
  }, {
    name: "面積圖 Area Spline",
    key: "area-spline"
  }, {
    name: "圓餅圖 Pie Chart",
    key: "pie"
  }, {
    name: "圓環 Donut Chart",
    key: "donut"
  }
];
