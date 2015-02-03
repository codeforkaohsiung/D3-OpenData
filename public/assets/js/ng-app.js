var MODULE_NAME, SLIDER_TAG, angularize, bindHtml, gap, halfWidth, hide, inputEvents, module, offset, offsetLeft, pixelize, qualifiedDirectiveDefinition, roundStep, show, sliderDirective, width;

MODULE_NAME = 'uiSlider';

SLIDER_TAG = 'slider';

angularize = function(element) {
  return angular.element(element);
};

pixelize = function(position) {
  return "" + position + "px";
};

hide = function(element) {
  return element.css({
    opacity: 0
  });
};

show = function(element) {
  return element.css({
    opacity: 1
  });
};

offset = function(element, position) {
  return element.css({
    left: position
  });
};

halfWidth = function(element) {
  return element[0].offsetWidth / 2;
};

offsetLeft = function(element) {
  return element[0].offsetLeft;
};

width = function(element) {
  return element[0].offsetWidth;
};

gap = function(element1, element2) {
  return offsetLeft(element2) - offsetLeft(element1) - width(element1);
};

bindHtml = function(element, html) {
  return element.attr('ng-bind-html-unsafe', html);
};

roundStep = function(value, precision, step, floor) {
  var decimals, remainder, roundedValue, steppedValue;
  if (floor == null) {
    floor = 0;
  }
  if (step == null) {
    step = 1 / Math.pow(10, precision);
  }
  remainder = (value - floor) % step;
  steppedValue = remainder > (step / 2) ? value + step - remainder : value - remainder;
  decimals = Math.pow(10, precision);
  roundedValue = steppedValue * decimals / decimals;
  return roundedValue.toFixed(precision);
};

inputEvents = {
  mouse: {
    start: 'mousedown',
    move: 'mousemove',
    end: 'mouseup'
  },
  touch: {
    start: 'touchstart',
    move: 'touchmove',
    end: 'touchend'
  }
};

sliderDirective = function($timeout) {
  return {
    restrict: 'EA',
    scope: {
      floor: '@',
      ceiling: '@',
      step: '@',
      precision: '@',
      ngModel: '=?',
      ngModelLow: '=?',
      ngModelHigh: '=?',
      translate: '&'
    },
    template: '<span class="bar"></span><span class="bar selection"></span><span class="pointer"></span><span class="pointer"></span><span class="bubble selection"></span><span ng-bind-html-unsafe="translate({value: floor})" class="bubble limit"></span><span ng-bind-html-unsafe="translate({value: ceiling})" class="bubble limit"></span><span class="bubble"></span><span class="bubble"></span><span class="bubble"></span>',
    compile: function(element, attributes) {
      var ceilBub, cmbBub, e, flrBub, fullBar, highBub, lowBub, maxPtr, minPtr, range, refHigh, refLow, selBar, selBub, watchables, _i, _len, _ref, _ref1;
      if (attributes.translate) {
        attributes.$set('translate', "" + attributes.translate + "(value)");
      }
      range = (attributes.ngModel == null) && ((attributes.ngModelLow != null) && (attributes.ngModelHigh != null));
      _ref = (function() {
        var _i, _len, _ref, _results;
        _ref = element.children();
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          e = _ref[_i];
          _results.push(angularize(e));
        }
        return _results;
      })(), fullBar = _ref[0], selBar = _ref[1], minPtr = _ref[2], maxPtr = _ref[3], selBub = _ref[4], flrBub = _ref[5], ceilBub = _ref[6], lowBub = _ref[7], highBub = _ref[8], cmbBub = _ref[9];
      refLow = range ? 'ngModelLow' : 'ngModel';
      refHigh = 'ngModelHigh';
      bindHtml(selBub, "'Range: ' + translate({value: diff})");
      bindHtml(lowBub, "translate({value: " + refLow + "})");
      bindHtml(highBub, "translate({value: " + refHigh + "})");
      bindHtml(cmbBub, "translate({value: " + refLow + "}) + ' - ' + translate({value: " + refHigh + "})");
      if (!range) {
        _ref1 = [selBar, maxPtr, selBub, highBub, cmbBub];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          element = _ref1[_i];
          element.remove();
        }
      }
      watchables = [refLow, 'floor', 'ceiling'];
      if (range) {
        watchables.push(refHigh);
      }
      return {
        post: function(scope, element, attributes) {
          var barWidth, boundToInputs, dimensions, maxOffset, maxValue, minOffset, minValue, ngDocument, offsetRange, pointerHalfWidth, updateDOM, valueRange, w, _j, _len1;
          boundToInputs = false;
          ngDocument = angularize(document);
          if (!attributes.translate) {
            scope.translate = function(value) {
              return value.value;
            };
          }
          pointerHalfWidth = barWidth = minOffset = maxOffset = minValue = maxValue = valueRange = offsetRange = void 0;
          dimensions = function() {
            var value, _j, _len1;
            if (scope.precision == null) {
              scope.precision = 0;
            }
            if (scope.step == null) {
              scope.step = 1;
            }
            for (_j = 0, _len1 = watchables.length; _j < _len1; _j++) {
              value = watchables[_j];
              scope[value] = roundStep(parseFloat(scope[value]), parseInt(scope.precision), parseFloat(scope.step), parseFloat(scope.floor));
            }
            scope.diff = roundStep(scope[refHigh] - scope[refLow], parseInt(scope.precision), parseFloat(scope.step), parseFloat(scope.floor));
            pointerHalfWidth = halfWidth(minPtr);
            barWidth = width(fullBar);
            minOffset = 0;
            maxOffset = barWidth - width(minPtr);
            minValue = parseFloat(attributes.floor);
            maxValue = parseFloat(attributes.ceiling);
            valueRange = maxValue - minValue;
            return offsetRange = maxOffset - minOffset;
          };
          updateDOM = function() {
            var adjustBubbles, bindToInputEvents, fitToBar, percentOffset, percentToOffset, percentValue, setBindings, setPointers;
            dimensions();
            percentOffset = function(offset) {
              return ((offset - minOffset) / offsetRange) * 100;
            };
            percentValue = function(value) {
              return ((value - minValue) / valueRange) * 100;
            };
            percentToOffset = function(percent) {
              return pixelize(percent * offsetRange / 100);
            };
            fitToBar = function(element) {
              return offset(element, pixelize(Math.min(Math.max(0, offsetLeft(element)), barWidth - width(element))));
            };
            setPointers = function() {
              var newHighValue, newLowValue;
              offset(ceilBub, pixelize(barWidth - width(ceilBub)));
              newLowValue = percentValue(scope[refLow]);
              offset(minPtr, percentToOffset(newLowValue));
              offset(lowBub, pixelize(offsetLeft(minPtr) - (halfWidth(lowBub)) + pointerHalfWidth));
              if (range) {
                newHighValue = percentValue(scope[refHigh]);
                offset(maxPtr, percentToOffset(newHighValue));
                offset(highBub, pixelize(offsetLeft(maxPtr) - (halfWidth(highBub)) + pointerHalfWidth));
                offset(selBar, pixelize(offsetLeft(minPtr) + pointerHalfWidth));
                selBar.css({
                  width: percentToOffset(newHighValue - newLowValue)
                });
                offset(selBub, pixelize(offsetLeft(selBar) + halfWidth(selBar) - halfWidth(selBub)));
                return offset(cmbBub, pixelize(offsetLeft(selBar) + halfWidth(selBar) - halfWidth(cmbBub)));
              }
            };
            adjustBubbles = function() {
              var bubToAdjust;
              fitToBar(lowBub);
              bubToAdjust = highBub;
              if (range) {
                fitToBar(highBub);
                fitToBar(selBub);
                if (gap(lowBub, highBub) < 10) {
                  hide(lowBub);
                  hide(highBub);
                  fitToBar(cmbBub);
                  show(cmbBub);
                  bubToAdjust = cmbBub;
                } else {
                  show(lowBub);
                  show(highBub);
                  hide(cmbBub);
                  bubToAdjust = highBub;
                }
              }
              if (gap(flrBub, lowBub) < 5) {
                hide(flrBub);
              } else {
                if (range) {
                  if (gap(flrBub, bubToAdjust) < 5) {
                    hide(flrBub);
                  } else {
                    show(flrBub);
                  }
                } else {
                  show(flrBub);
                }
              }
              if (gap(lowBub, ceilBub) < 5) {
                return hide(ceilBub);
              } else {
                if (range) {
                  if (gap(bubToAdjust, ceilBub) < 5) {
                    return hide(ceilBub);
                  } else {
                    return show(ceilBub);
                  }
                } else {
                  return show(ceilBub);
                }
              }
            };
            bindToInputEvents = function(pointer, ref, events) {
              var onEnd, onMove, onStart;
              onEnd = function() {
                pointer.removeClass('active');
                ngDocument.unbind(events.move);
                return ngDocument.unbind(events.end);
              };
              onMove = function(event) {
                var eventX, newOffset, newPercent, newValue;
                eventX = event.clientX || event.touches[0].clientX;
                newOffset = eventX - element[0].getBoundingClientRect().left - pointerHalfWidth;
                newOffset = Math.max(Math.min(newOffset, maxOffset), minOffset);
                newPercent = percentOffset(newOffset);
                newValue = minValue + (valueRange * newPercent / 100.0);
                if (range) {
                  if (ref === refLow) {
                    if (newValue > scope[refHigh]) {
                      ref = refHigh;
                      minPtr.removeClass('active');
                      maxPtr.addClass('active');
                    }
                  } else {
                    if (newValue < scope[refLow]) {
                      ref = refLow;
                      maxPtr.removeClass('active');
                      minPtr.addClass('active');
                    }
                  }
                }
                newValue = roundStep(newValue, parseInt(scope.precision), parseFloat(scope.step), parseFloat(scope.floor));
                scope[ref] = newValue;
                return scope.$apply();
              };
              onStart = function(event) {
                pointer.addClass('active');
                dimensions();
                event.stopPropagation();
                event.preventDefault();
                ngDocument.bind(events.move, onMove);
                return ngDocument.bind(events.end, onEnd);
              };
              return pointer.bind(events.start, onStart);
            };
            setBindings = function() {
              var bind, inputMethod, _j, _len1, _ref2, _results;
              boundToInputs = true;
              bind = function(method) {
                bindToInputEvents(minPtr, refLow, inputEvents[method]);
                return bindToInputEvents(maxPtr, refHigh, inputEvents[method]);
              };
              _ref2 = ['touch', 'mouse'];
              _results = [];
              for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
                inputMethod = _ref2[_j];
                _results.push(bind(inputMethod));
              }
              return _results;
            };
            setPointers();
            adjustBubbles();
            if (!boundToInputs) {
              return setBindings();
            }
          };
          $timeout(updateDOM);
          for (_j = 0, _len1 = watchables.length; _j < _len1; _j++) {
            w = watchables[_j];
            scope.$watch(w, updateDOM);
          }
          return window.addEventListener("resize", updateDOM);
        }
      };
    }
  };
};

qualifiedDirectiveDefinition = ['$timeout', sliderDirective];

module = function(window, angular) {
  return angular.module(MODULE_NAME, []).directive(SLIDER_TAG, qualifiedDirectiveDefinition);
};

module(window, window.angular);

var app, chartType;

app = angular.module('starter', ['ui.bootstrap', 'uiSlider']);

app.controller('appCtrl', function($scope, $http) {
  var getGoogleChart, getJsonKey, renderChart, renderData, renderForm, sliderData, xTemp;
  $scope.appModel = {};
  $scope.appModel.chartShkey = '1x6C86tzJ2F8ZTau6g7uUNxSb496wuoIR2s2I9lEWQSI';
  $scope.loadChart = function(path) {
    return getGoogleChart($scope.appModel.chartShkey);
  };
  $scope.replaceGSX = function(str) {
    return str.replace('gsx$', '');
  };
  $scope.renderData = function(name) {
    return renderData();
  };
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
      $scope.appModel.xVal = $scope.appModel.jsonKey[0].name;
      return renderForm();
    }, function(response) {
      return console.log('Fail:', response);
    });
  };
  getJsonKey = function(obj) {
    var i, jsonKey, key, orgKey, prefix;
    orgKey = [];
    prefix = "gsx$";
    jsonKey = [];
    for (key in obj[0]) {
      orgKey.push(key);
    }
    i = 0;
    while (i < orgKey.length) {
      if (orgKey[i].indexOf(prefix) > -1) {
        jsonKey.push({
          "name": orgKey[i]
        });
      }
      i++;
    }
    return jsonKey;
  };
  renderForm = function() {
    return sliderData();
  };
  xTemp = '';
  sliderData = function() {
    var min, xData;
    xData = [];
    if (xTemp !== $scope.appModel.xVal && $scope.appModel.xVal !== '') {
      xTemp = $scope.appModel.xVal;
    } else if (xTemp !== $scope.appModel.xVal && $scope.appModel.xVal === '') {
      $scope.appModel.xVal = $scope.appModel.jsonKey[0].name;
      xTemp = $scope.appModel.xVal;
    }
    min = 0;
    console.log(xTemp);
    angular.forEach($scope.dataRemote, function(d, i) {
      return xData.push(d[xTemp].$t);
    });
    $scope.appModel.xData = xData;
    $scope.appModel.xDataMin = min;
    $scope.appModel.xDataMax = $scope.appModel.xData.length;
    return renderData();
  };
  renderData = function() {
    var dataTemp, dataVal, dataset, i, i2, k, max, min, x, xVal;
    dataset = [];
    x = ["x"];
    xVal = $scope.appModel.xVal;
    dataVal = [];
    dataTemp = [];
    angular.forEach($scope.appModel.jsonKey, function(d, i) {
      if (d.dataSelect === true) {
        return dataVal.push(d.name);
      }
    });
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
