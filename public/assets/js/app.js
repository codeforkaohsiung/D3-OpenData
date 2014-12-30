var userControl;

userControl = {};

$(function() {
  var $btn, chartList, chartSlider, chartType, checkform, dataRemote, dataset, errorMessage, errorStatus, firstStart, form, getJson, getJsonKey, getKey, getKeyBtn, getSpreadsheet, headerBanner, jsonDone, loadSheet, loadUserControl, maximumCheck, minimumCheck, pageValueInput, renderChart, renderData, renderForm, replaceGSX, resetForm, resetStatus, shKey, submitGetKey, uiSlider, updateUserControl, xAxis, xTemp;
  getKeyBtn = $('#getKey');
  loadSheet = $('.load-sheet');
  submitGetKey = $('#submitGetKey');
  chartSlider = $('#chart-slider');
  minimumCheck = $('#minimum');
  maximumCheck = $('#maximum');
  form = '#form';
  xAxis = '#x-Axis';
  checkform = '#checkform';
  chartList = '#chart-list';
  errorMessage = '#errorMessage';
  dataRemote = [];
  dataset = [];
  $btn = {};
  headerBanner = '.header-banner';
  chartType = [
    {
      name: "長條",
      key: "bar"
    }, {
      name: "線條圖",
      key: "line"
    }, {
      name: "面積圖",
      key: "area-spline"
    }, {
      name: "圓餅圖",
      key: "pie"
    }, {
      name: "圓環",
      key: "donut"
    }
  ];
  resetForm = function() {
    $(xAxis).html('');
    $(checkform).html('');
    return $('.demo').html('');
  };
  resetStatus = function() {
    resetForm();
    return $(errorMessage).addClass('hidden');
  };
  errorStatus = function() {
    return $(errorMessage).removeClass('hidden');
  };
  firstStart = function() {
    if ($btn.length > 0) {
      $btn.button('reset');
    }
    $(headerBanner).removeClass('index');
    $('.section-intro').removeClass('in active');
    return $('.section-chart').addClass('active').delay(30).queue(function() {
      return $('.section-chart').addClass('in');
    });
  };
  $(submitGetKey).on('click', function() {
    $btn = $(this).button('loading');
    resetStatus();
    return getKey(getKeyBtn);
  });
  loadSheet.on('click', function() {
    var shKey;
    $btn = $(this).button('loading');
    resetStatus();
    shKey = $(this).attr('data-key');
    return getSpreadsheet(shKey);
  });
  getKey = function(input) {
    var shKey;
    shKey = input.val();
    return getSpreadsheet(shKey);
  };
  getSpreadsheet = function(shKey) {
    var listKey, shCallback, shPath, url;
    shPath = 'https://spreadsheets.google.com/feeds/list/';
    shCallback = '/public/values?alt=json-in-script&callback=?';
    listKey = 'od6';
    url = shPath + shKey + '/' + listKey + shCallback;
    return getJson(url);
  };
  getJson = function(url) {
    dataRemote = [];
    dataset = [];
    return $.getJSON(url).done(function(data) {
      var entry;
      entry = data.feed.entry;
      dataRemote.push(entry);
      firstStart();
      resetForm();
      return jsonDone(dataRemote);
    }).fail(function(jqxhr, textStatus, error) {
      firstStart();
      errorStatus();
      return console.log("GG,沒戲唱了");
    });
  };
  jsonDone = function(dataRemote) {
    var jsonKey;
    jsonKey = [];
    jsonKey = getJsonKey(dataRemote);
    renderForm(dataRemote, jsonKey);
    return renderData(dataRemote, jsonKey);
  };
  getJsonKey = function(obj) {
    var i, jsonKey, key, orgKey, prefix;
    orgKey = [];
    prefix = "gsx$";
    jsonKey = [];
    for (key in obj[0][0]) {
      orgKey.push(key);
    }
    i = 0;
    while (i < orgKey.length) {
      if (orgKey[i].indexOf(prefix) > -1) {
        jsonKey.push(orgKey[i]);
      }
      i++;
    }
    return jsonKey;
  };
  renderForm = function(dataRemote, jsonKey) {
    var checkWrap;
    d3.select(chartList).selectAll('option').data(chartType).enter().append('option').attr('value', function(d) {
      return d.key;
    }).text(function(d) {
      return d.name;
    });
    d3.select(xAxis).selectAll('option').data(jsonKey).enter().append("option").text(function(d) {
      return d;
    });
    checkWrap = d3.select(checkform).selectAll('div').data(jsonKey).enter().append('li').append('label');
    checkWrap.insert('input').attr({
      type: 'checkbox',
      value: function(d) {
        return d;
      }
    });
    checkWrap.append('span').text(function(d) {
      return replaceGSX(d);
    });
    uiSlider();
    if ($.isEmptyObject(userControl)) {
      return updateUserControl();
    } else {
      return loadUserControl();
    }
  };
  xTemp = '';
  uiSlider = function() {
    var max, min, renderSliderValue, slider, xData, xDataMax, xVal;
    xVal = $(xAxis).val();
    xData = [];
    if (xTemp !== xVal) {
      xTemp = xVal;
      max = 0;
      min = 0;
      $.each(dataRemote[0], function(i, d) {
        return xData.push(d[xVal].$t);
      });
      xDataMax = xData.length;
      maximumCheck.val(xDataMax);
      minimumCheck.on('change', function() {
        if ($(this).prop('checked')) {
          chartSlider.slider('values', 0, 0);
          return $('#slider-min').text(xData[0]);
        }
      });
      maximumCheck.on('change', function() {
        if ($(this).prop('checked')) {
          chartSlider.slider('values', 1, $(this).val());
          return $('#slider-max').text(xData[xDataMax - 1]);
        }
      });
      slider = chartSlider.slider({
        range: true,
        min: 0,
        max: xDataMax,
        values: [0, xDataMax],
        slide: function(event, ui) {
          max = ui.values[1];
          min = ui.values[0];
          max === xDataMax || maximumCheck.prop('checked', false);
          min === 0 || minimumCheck.prop('checked', false);
          return setTimeout(function() {
            renderSliderValue(min, max);
            userControl = {};
            return updateUserControl();
          }, 100);
        }
      });
    }
    renderSliderValue = function(min, max) {
      console.log(min, max);
      $('#slider-min').text(xData[min]);
      return $('#slider-max').text(xData[max]);
    };
    return renderSliderValue(0, chartSlider.slider('values', 1) - 1);
  };
  $('#form').on("change", function() {
    userControl = {};
    uiSlider();
    return updateUserControl();
  });
  updateUserControl = function() {
    var userDatakey;
    userDatakey = [];
    $.each($(checkform).find('input:checked'), function() {
      return userDatakey.push($(this).val());
    });
    userControl.chartType = {
      name: $(chartList).find('option').filter(':selected').text(),
      value: $(chartList).val()
    };
    userControl.xAxis = {
      name: $(xAxis).find('option').filter(':selected').text(),
      value: $(xAxis).val()
    };
    userControl.data = {
      name: '',
      value: userDatakey
    };
    userControl.range = {
      name: $(xAxis).val(),
      min: chartSlider.slider('values', 0),
      max: chartSlider.slider('values', 1),
      minimum: minimumCheck.prop('checked'),
      maximum: maximumCheck.prop('checked')
    };
    return renderData();
  };
  loadUserControl = function() {
    var max;
    $.each($(chartList).find('option'), function(i, d) {
      if ($(this).text() === userControl.chartType.name) {
        return $(this).prop('selected', true);
      }
    });
    $.each($(xAxis).find('option'), function(i, d) {
      if ($(this).text() === userControl.xAxis.name) {
        return $(this).prop('selected', true);
      }
    });
    $.each(userControl.data.value, function(i, d) {
      return $.each($(checkform).find('input'), function(i2, d2) {
        if ($(this).val() === d) {
          return $(this).prop('checked', true);
        }
      });
    });
    max = userControl.range.max;
    chartSlider.slider('values', 0, userControl.range.min);
    chartSlider.slider('values', 1, userControl.range.max);
    if (userControl.range.minimum) {
      chartSlider.slider('values', 0, 0);
      minimumCheck.prop('checked', true);
    }
    if (userControl.range.maximum) {
      chartSlider.slider('values', 1, maximumCheck.val());
      return maximumCheck.prop('checked', true);
    }
  };
  renderData = function() {
    var dataTemp, dataVal, i, max, min, x, xVal;
    dataset = [];
    x = ["x"];
    xVal = userControl.xAxis.value;
    dataVal = userControl.data.value;
    dataTemp = [];
    min = userControl.range.min;
    max = userControl.range.max;
    i = 0;
    while (i < dataVal.length) {
      dataTemp.push([dataVal[i]]);
      i++;
    }
    $.each(dataRemote[0], function(i, d) {
      if (i >= min && i <= max) {
        x.push(d[xVal].$t);
      }
      return $.each(dataVal, function(i2, d2) {
        if (i >= min && i <= max) {
          return dataTemp[i2].push(d3.round(d[d2].$t));
        }
      });
    });
    dataset.push(x);
    i = 0;
    while (i < dataTemp.length) {
      dataset.push(dataTemp[i]);
      i++;
    }
    return renderChart(dataset, x);
  };
  renderChart = function(dataset, x) {
    var chart, chartCase;
    chartCase = userControl.chartType.value;
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
  replaceGSX = function(str) {
    return str.replace('gsx$', '');
  };
  pageValueInput = $('#page-value');
  if (pageValueInput.length > 0) {
    shKey = pageValueInput.attr('value');
    userControl = pageUserControl;
    return getSpreadsheet(shKey);
  }
});



$(function() {
  $('.dropdown.mega-dropdown a').on('click', function(event) {
    return $(this).parent().toggleClass('open');
  });
  $('body').on('click', function(e) {
    if (!$('.dropdown.mega-dropdown').is(e.target) && $('.dropdown.mega-dropdown').has(e.target).length === 0 && $('.open').has(e.target).length === 0) {
      return $('.dropdown.mega-dropdown').removeClass('open');
    }
  });
  return $('[data-toggle="tooltip"]').tooltip();
});
