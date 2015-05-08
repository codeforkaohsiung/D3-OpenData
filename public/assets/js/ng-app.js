var app, chartType;

app = angular.module('starter', ['ui.bootstrap', 'vr.directives.slider', 'ngTouch', 'angularChart']);

app.controller('appCtrl', function($scope, $http) {});

app.controller('chartCtrl', function($scope, $http, $timeout) {
  var chart, getGoogleChart, getJsonKey, inlineAllStyles, makeStyleObject, renderChart, renderData, renderForm, resetList, sliderData, storyLoadChart, storyShareCurrentChapter, xTemp;
  $scope.appModel = {};
  $scope.pageStatus = {};
  $scope.pageStatus.start = false;
  $scope.pageStatus.chartPathActive = false;
  resetList = ['xVal', 'xDataMin', 'xDataMax', 'jsonKey', 'xData', 'content'];
  $scope.appModel.chartShkey = '1x6C86tzJ2F8ZTau6g7uUNxSb496wuoIR2s2I9lEWQSI';
  $scope.enterChart = function(keyEvent, path) {
    if (keyEvent.keyCode === 13) {
      return $scope.loadChart(path);
    }
  };
  $scope.loadChart = function(path) {
    $scope.$emit('updateShareStoryData', $scope.appModel, $scope.appModel.id);
    $scope.resetData($scope.appModel, resetList);
    $scope.appModel.chartShkey = path;
    return getGoogleChart($scope.appModel.chartShkey);
  };
  $scope.replaceGSX = function(str) {
    return str.replace('gsx$', '');
  };
  $scope.renderData = function(name) {
    return renderData();
  };
  $scope.maximumXdata = function() {
    if ($scope.appModel.xDataMaximum) {
      return $scope.appModel.xDataMax = $scope.appModel.xData.length;
    }
  };
  $scope.singlePointUpdate = function() {
    if ($scope.appModel.singlePoint) {
      $scope.appModel.xDataMaximum = false;
    }
    return $scope.$broadcast('refreshSlider');
  };
  $scope.sliderUpdate = function() {
    if ($scope.appModel.xDataMax !== $scope.appModel.xData.length) {
      $scope.appModel.xDataMaximum = false;
    }
    return renderData();
  };
  storyShareCurrentChapter = function(currentModel) {
    $scope.appModel = currentModel;
    $scope.$emit('updateShareStoryData', $scope.appModel, $scope.appModel.id);
    $scope.cleanChart();
    return storyLoadChart();
  };
  storyLoadChart = function() {
    return getGoogleChart($scope.appModel.chartShkey);
  };
  $scope.currentChapter = function() {
    var checkCurrentId, currentModel, currentPath;
    if ($scope.storyModel) {
      currentPath = window.location.hash.substr(1);
      currentModel = {};
      checkCurrentId = false;
      angular.forEach($scope.storyModel.chapters, function(d, i) {
        if (d.id === currentPath) {
          console.log(d, 'right');
          currentModel = d;
          return checkCurrentId = true;
        }
      });
      if (!checkCurrentId) {
        currentModel = $scope.storyModel.chapters[0];
      }
      $scope.storyModel.currentChapter = currentModel.id;
      return storyShareCurrentChapter(currentModel);
    }
  };
  $timeout(function() {
    return $scope.currentChapter();
  });
  $scope.$on('storyShareChangeChapter', function(event, idTemp) {
    window.location.hash = idTemp;
    return $scope.currentChapter();
  });
  $scope.chartType = chartType;
  $scope.resetData = function(data, resetList) {
    angular.forEach(resetList, function(d) {
      return data[d] = "";
    });
    return data;
  };
  $scope.cleanChart = function() {
    var demoChart;
    demoChart = angular.element(document.querySelector('.demo')).html('');
    return demoChart.html('');
  };
  getGoogleChart = function(shkey) {
    var listKey, shCallback, shPath, url;
    shPath = 'https://spreadsheets.google.com/feeds/list/';
    shCallback = '/public/values?alt=json';
    listKey = 'od6';
    url = shPath + shkey + '/' + listKey + shCallback;
    $http({
      'url': url,
      'method': "GET"
    }).then(function(data) {
      $scope.dataRemote = data.data.feed.entry;
      $scope.appModel.jsonKey = getJsonKey($scope.dataRemote);
      $scope.appModel.xVal = $scope.appModel.jsonKey[0];
      $scope.pageStatus.chartPathActive = true;
      return renderForm();
    }, function(response) {
      return console.log('Fail:', response);
    });
    if (!$scope.appModel.chartType) {
      $scope.appModel.chartType = $scope.chartType[0];
    }
    return $scope.pageStatus.start = true;
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
    if (!$scope.appModel.xDataMax || $scope.appModel.xDataMaximum) {
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
    if ($scope.appModel.singlePoint) {
      angular.forEach($scope.dataRemote, function(d, i) {
        if (i === min) {
          x.push($scope.dataRemote[i][xVal].$t);
          return angular.forEach(dataVal, function(d2, i2) {
            return dataTemp[i2].push(d3.round(d[d2].$t, 2));
          });
        }
      });
    } else {
      angular.forEach($scope.dataRemote, function(d, i) {
        if (i >= min && i < max) {
          x.push($scope.dataRemote[i][xVal].$t);
          return angular.forEach(dataVal, function(d2, i2) {
            return dataTemp[i2].push(d3.round(d[d2].$t, 2));
          });
        }
      });
    }
    dataset.push(x);
    i = 0;
    while (i < dataTemp.length) {
      dataset.push(dataTemp[i]);
      i++;
    }
    return renderChart(dataset, x);
  };
  chart = {};
  renderChart = function(dataset, x) {
    var chartCase;
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
  $scope.updateImage = function() {
    var canvas, canvasContext, svg;
    $("defs").remove();
    inlineAllStyles();
    canvas = document.getElementById('canvas');
    canvas.width = parseInt(d3.select(".demo").style('width'));
    canvas.height = parseInt(d3.select(".demo").style('height'));
    canvasContext = canvas.getContext("2d");
    svg = document.querySelector(".demo > svg").outerHTML;
    canvasContext.drawSvg(svg, 0, 0);
    d3.select("#downloadImg").attr("href", canvas.toDataURL("png")).attr("download", function() {
      return "_llamacharts.png";
    });
    return d3.select("#chartImg").attr('src', canvas.toDataURL("png"));
  };
  inlineAllStyles = function() {
    var changeToDisplay, chartStyle, i, selector, styles;
    chartStyle = void 0;
    selector = void 0;
    i = 0;
    while (i <= document.styleSheets.length - 1) {
      if (document.styleSheets[i].href && document.styleSheets[i].href.indexOf("c3.css") !== -1) {
        if (document.styleSheets[i].rules !== undefined) {
          chartStyle = document.styleSheets[i].rules;
        } else {
          chartStyle = document.styleSheets[i].cssRules;
        }
      }
      i++;
    }
    if (chartStyle !== null && chartStyle !== undefined) {
      changeToDisplay = function() {
        if (d3.select(this).style("visibility") === "hidden" || d3.select(this).style("opacity") === "0") {
          d3.select(this).style("display", "none");
        }
      };
      i = 0;
      while (i < chartStyle.length) {
        if (chartStyle[i].type === 1) {
          selector = chartStyle[i].selectorText;
          styles = makeStyleObject(chartStyle[i]);
          d3.selectAll("svg *").each(changeToDisplay);
          d3.selectAll(selector).each(function() {
            if (d3.select(this)[0][0].nodeName !== 'path') {
              return d3.select(this).style(styles);
            }
          });
        }
        i++;
      }
    }
  };
  return makeStyleObject = function(rule) {
    var output, s, styleDec;
    styleDec = rule.style;
    output = {};
    s = void 0;
    s = 0;
    while (s < styleDec.length) {
      output[styleDec[s]] = styleDec[styleDec[s]];
      s++;
    }
    return output;
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

app.controller('storyCtrl', function($scope, $http, $modal, $log) {
  var updateStoryData;
  $scope.storyModel = {};
  $scope.appModel = {};
  $scope.storyModel.showStoryBox = false;
  $scope.showStoryBox = function(e) {
    if ($scope.storyModel.showStoryBox === true) {
      return $scope.storyModel.showStoryBox = false;
    } else {
      return $scope.storyModel.showStoryBox = true;
    }
  };
  $scope.storyModel.chapters = chapters;
  $scope.storyNewChapter = function() {
    var chapterTemp, idTemp, nowDate;
    nowDate = new Date();
    idTemp = nowDate.getTime().toString();
    chapterTemp = {};
    chapterTemp.id = idTemp;
    $scope.storyModel.chapters.push(chapterTemp);
    return $scope.$broadcast('storyShareChangeChapter', idTemp);
  };
  $scope.$on('updateShareStoryData', function(event, chapterJson, id) {
    return updateStoryData(id, chapterJson);
  });
  $scope.editChapter = function(id) {
    var idTemp;
    idTemp = id.toString();
    return $scope.$broadcast('storyShareChangeChapter', idTemp);
  };
  updateStoryData = function(id, chapterJson) {
    return angular.forEach($scope.storyModel.chapters, function(d, i) {
      if (d.id === id) {
        return $scope.storyModel.chapters[i] = chapterJson;
      }
    });
  };
  return $scope.openStoryModal = function() {
    var modalInstance;
    return modalInstance = $modal.open({
      templateUrl: 'modalStoryContent.html',
      controller: 'storyModalInstanceCtrl'
    });
  };
});

app.controller('storyModalInstanceCtrl', function($scope, $modalInstance) {
  $scope.ok = function() {
    return $modalInstance.close();
  };
  return $scope.cancel = function() {
    return $modalInstance.dismiss('cancel');
  };
});
