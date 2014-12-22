var userControl;

userControl = {};

userControl = {
  chartType: {
    name: "圓餅圖",
    value: "pie"
  },
  xAxis: {
    name: "gsx$時間",
    value: "gsx$時間"
  },
  data: {
    name: "",
    value: ["gsx$新北市總計", "gsx$臺北市總計", "gsx$高雄市總計"]
  }
};

$(function() {
  var $btn, chartList, chartType, checkform, dataRemote, dataset, errorMessage, errorStatus, firstStart, form, getJson, getJsonKey, getKey, getKeyBtn, getSpreadsheet, headerBanner, jsonDone, loadUserControl, renderChart, renderData, renderForm, resetForm, resetStatus, submitGetKey, updateUserControl, xAxis;
  getKeyBtn = $('#getKey');
  submitGetKey = $('#submitGetKey');
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
      $btn.button('reset');
      firstStart();
      resetForm();
      return jsonDone(dataRemote);
    }).fail(function(jqxhr, textStatus, error) {
      $btn.button('reset');
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
    renderData(dataRemote, jsonKey);
    return console.log(jsonKey);
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
      return d;
    });
    if ($.isEmptyObject(userControl)) {
      console.log('updateUserControl()');
      return updateUserControl();
    } else {
      console.log('loadUserControl()');
      return loadUserControl();
    }
  };
  $('#form').on("change", function() {
    userControl = {};
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
    console.log(JSON.stringify(userControl));
    return renderData();
  };
  loadUserControl = function() {
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
    return $.each(userControl.data.value, function(i, d) {
      return $.each($(checkform).find('input'), function(i2, d2) {
        if ($(this).val() === d) {
          return $(this).prop('checked', true);
        }
      });
    });
  };
  renderData = function() {
    var dataTemp, dataVal, i, x, xVal;
    dataset = [];
    x = ["x"];
    xVal = userControl.xAxis.value;
    dataVal = userControl.data.value;
    dataTemp = [];
    i = 0;
    while (i < dataVal.length) {
      dataTemp.push([dataVal[i]]);
      i++;
    }
    $.each(dataRemote[0], function(i, d) {
      x.push(d[xVal].$t);
      return $.each(dataVal, function(i2, d2) {
        return dataTemp[i2].push(d3.round(d[d2].$t));
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
  return renderChart = function(dataset, x) {
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
      }
    });
  };
});

$(function() {
  $('.dropdown.mega-dropdown a').on('click', function(event) {
    return $(this).parent().toggleClass('open');
  });
  return $('body').on('click', function(e) {
    if (!$('.dropdown.mega-dropdown').is(e.target) && $('.dropdown.mega-dropdown').has(e.target).length === 0 && $('.open').has(e.target).length === 0) {
      return $('.dropdown.mega-dropdown').removeClass('open');
    }
  });
});
