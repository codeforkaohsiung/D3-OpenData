$(function() {
  var chartList, checkform, dataRemote, dataset, form, getJson, getJsonKey, getKey, getKeyBtn, getSpreadsheet, jsonDone, renderChart, renderData, renderForm, submitGetKey, transformChart, xAxis;
  getKeyBtn = $('#getKey');
  submitGetKey = $('#submitGetKey');
  form = '#form';
  xAxis = '#x-Axis';
  checkform = '#checkform';
  chartList = '#chart-list';
  dataRemote = [];
  dataset = [];
  $(submitGetKey).on('click', function() {
    $(this).addClass('loading');
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
    return $.getJSON(url).done(function(data) {
      var entry;
      entry = data.feed.entry;
      dataRemote.push(entry);
      submitGetKey.removeClass('loading');
      return jsonDone(dataRemote);
    }).fail(function(jqxhr, textStatus, error) {
      submitGetKey.removeClass('loading');
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
    d3.select(xAxis).html("");
    d3.select(checkform).html("");
    d3.select(xAxis).selectAll("option").data(jsonKey).enter().append("option").text(function(d) {
      return d;
    });
    checkWrap = d3.select(checkform).selectAll('div').data(jsonKey).enter().append('div').attr('class', 'ui checkbox');
    checkWrap.insert("input", ":first-child").attr({
      type: 'checkbox',
      value: function(d) {
        return d;
      }
    });
    checkWrap.append('label').text(function(d) {
      return d;
    });
    $('.ui.checkbox').checkbox();
    return $("#form input, #form select").on("change", function() {
      return renderData(jsonKey);
    });
  };
  renderData = function(jsonKey) {
    var dataTemp, dataVal, i, x, xVal;
    dataset = [];
    x = ["x"];
    xVal = $(xAxis).val();
    dataVal = [];
    dataTemp = [];
    $.each($(checkform).find("input:checked"), function(id) {
      return dataVal.push($(this).val());
    });
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
  renderChart = function(dataset, x) {
    var chart, chartCase;
    chartCase = $(chartList).val();
    chart = c3.generate({
      bindto: ".demo",
      data: {
        x: "x",
        columns: dataset,
        type: chartCase
      },
      axis: {
        x: {
          type: "category",
          tick: {
            rotate: 75,
            multiline: false,
            culling: {
              max: 20
            }
          }
        }
      }
    });
    return $(chartList).on("change", function() {
      chartCase = $(this).val();
      return transformChart(chart, chartCase);
    });
  };
  return transformChart = function(chart, chartCase) {
    switch (chartCase) {
      case "line":
        return chart.transform("line");
      case "pie":
        return chart.transform("pie");
      case "area-spline":
        return chart.transform("area-spline");
      case "donut":
        return chart.transform("donut");
    }
  };
});
