userControl = {}
# userControl =   
# 	chartType:
# 		name: "圓餅圖"
# 		value: "pie"

# 	xAxis:
# 		name: "gsx$時間"
# 		value: "gsx$時間"

# 	data:
# 		name: ""
# 		value: [
# 			"gsx$新北市總計"
# 			"gsx$臺北市總計"
# 			"gsx$高雄市總計"
# 		]


$ ->
	# get shKey
	getKeyBtn = $('#getKey')
	# loadSheet = $('.load-sheet')
	submitGetKey = $('#submitGetKey')
	chartSlider = $('#chart-slider')
	minimumCheck = $('#minimum')
	maximumCheck = $('#maximum')
	chartName = '#chartName'
	chartDiscription = '#chartDiscription'
	form = '#form'
	xAxis = '#x-Axis'
	checkform = '#checkform'
	chartList = '#chart-list'
	errorMessage = '#errorMessage'
	dataRemote = []
	dataset = []
	$btn = {}
	headerBanner = '.header-banner'
	chartType = [
		{
			name: "長條圖 Bar"
			key: "bar"
		}
		{
			name: "折線圖 Line"
			key: "line"
		}
		{
			name: "曲線圖 Spline"
			key: "spline"
		}
		{
			name: "面積圖 Area Spline"
			key: "area-spline"
		}
		{
			name: "圓餅圖 Pie Chart"
			key: "pie"
		}
		
		{
			name: "圓環 Donut Chart"
			key: "donut"
		}	
	]


	
	resetForm = ()->
		$(xAxis).html ''
		$(checkform).html ''
		$('.demo').html ''

	resetStatus = ()->
		resetForm()
		$(errorMessage).addClass 'hidden'

	errorStatus = ()->
		$(errorMessage).removeClass 'hidden'

	firstStart = ()->
		if $btn.length > 0
			$btn.button('reset')
		$(headerBanner).removeClass 'index'
		$('.section-intro').removeClass('in active')
		$('.section-chart').addClass('active').delay(30)
			.queue(()->
				$('.section-chart').addClass('in')
			)


	# Start 
	$(submitGetKey).on('click', ()->
		$btn = $(this).button('loading')
		resetStatus()
		getKey(getKeyBtn)
		
	)

	# loadSheet.on 'click', ()->
	# 	$btn = $(this).button('loading')
	# 	resetStatus()
	# 	shKey = $(@).attr 'data-key'
	# 	getSpreadsheet(shKey)

	getKey = (input)->
		shKey = input.val()
		getSpreadsheet(shKey)

	


	# get spreadsheet
	getSpreadsheet = (shKey)->
		shPath = 'https://spreadsheets.google.com/feeds/list/'
		shCallback = '/public/values?alt=json-in-script&callback=?'
		listKey = 'od6'
		# console.log shKey
		url = shPath + shKey + '/' + listKey + shCallback
		getJson(url)


	getJson = (url)->
		dataRemote = []
		dataset = []
		$.getJSON(url)
		.done((data) -> # Success
			entry = data.feed.entry
			$('#chart-title').text(data.feed.title.$t) #暫時放的
			dataRemote.push entry
			firstStart()
			resetForm()
			jsonDone(dataRemote)
		).fail (jqxhr, textStatus, error) ->
			firstStart()
			errorStatus()
			console.log "GG,沒戲唱了" #失敗


	jsonDone = (dataRemote)->
		jsonKey = []
		jsonKey = getJsonKey(dataRemote)

		renderForm(dataRemote, jsonKey)
		renderData(dataRemote, jsonKey)
		# console.log jsonKey

	# get spreadsheet th
	getJsonKey = (obj)->
		orgKey = []
		prefix = "gsx$"
		jsonKey = []
		for key of obj[0][0]
			orgKey.push key
		i = 0
		while i < orgKey.length
			jsonKey.push orgKey[i]  if orgKey[i].indexOf(prefix) > -1
			i++
		jsonKey

	renderForm = (dataRemote, jsonKey) ->
		# 圖表類型
		d3.select(chartList).selectAll('option')
			.data(chartType).enter()
			.append('option')
			.attr 'value', (d) -> 
				d.key
			.text (d) -> 
				d.name

		# X 軸的資料
		d3.select(xAxis).selectAll('option')
			.data(jsonKey).enter()
			.append("option").text (d) -> 
				d

		# Y 軸資料
		checkWrap = d3.select(checkform).selectAll('div')
			.data(jsonKey).enter()
			.append('li').append('label')
			
		checkWrap
			.insert('input').attr
				type: 'checkbox'
				value: (d) -> d

		checkWrap.append('span')
			.text((d) -> replaceGSX(d))


		# render slider
		uiSlider()

		if $.isEmptyObject(userControl)
			updateUserControl()
		else
			loadUserControl()
		
	xTemp = ''	
	uiSlider = ()->
		xVal = $(xAxis).val()
		xData = []
		if xTemp != xVal
			xTemp = xVal
			max = 0
			min = 0
			# load x data
			$.each dataRemote[0], (i, d) ->
				xData.push d[xVal].$t
			xDataMax = xData.length

			# max and min checkbox
			maximumCheck.val(xDataMax)
			minimumCheck.on 'change', ()->
				if $(@).prop('checked')
					chartSlider.slider('values', 0, 0)
					$('#slider-min').text(xData[0])
			maximumCheck.on 'change', ()->
				if $(@).prop('checked')
					chartSlider.slider('values', 1,$(@).val())
					$('#slider-max').text(xData[xDataMax - 1])

			# ui slider
			slider = chartSlider.slider(
				range: true,
				min: 0,
				max: xDataMax,
				values: [ 0, xDataMax],
				slide: (event, ui)->
					max = ui.values[1]
					min = ui.values[0]
					# 更新資料
					max is xDataMax || maximumCheck.prop('checked',false)
					min is 0 || minimumCheck.prop('checked',false)
					setTimeout( ->
						renderSliderValue(min, max - 1)
						userControl = {}
						updateUserControl()
					,100)
				)		
		renderSliderValue = (min, max)->
			$('#slider-min').text(xData[min])
			$('#slider-max').text(xData[max])

		renderSliderValue(0, chartSlider.slider('values', 1) - 1)


	$('#form').on "change", ->
		# Slider 也必須綁定以下function
		userControl = {}
		uiSlider()
		updateUserControl()

		

	updateUserControl = ->
		userDatakey = []
		$.each $(checkform).find('input:checked'), ()->
			userDatakey.push $(this).val()

		# 圖表類型
		userControl.chartType = 
			name: $(chartList).find('option').filter(':selected').text()
			value: $(chartList).val()
		# X軸
		userControl.xAxis =
			name: $(xAxis).find('option').filter(':selected').text()
			value: $(xAxis).val()
		# 選取的資料
		userControl.data =
			name: ''
			value: userDatakey
		# 資料範圍
		userControl.range =
			name: $(xAxis).val()
			min: chartSlider.slider('values', 0)
			max: chartSlider.slider('values', 1)
			minimum: minimumCheck.prop('checked')
			maximum: maximumCheck.prop('checked')
		

		# uiSlider(userControl.xAxis.value)


		# console.log(JSON.stringify(userControl))
		
		renderData()

	loadUserControl = ->
		# 將預設資料存回input 及 select
		$.each $(chartList).find('option'), (i,d)->
			if $(@).text() is userControl.chartType.name
				$(@).prop('selected', true)

		$.each $(xAxis).find('option'), (i,d)->
			if $(@).text() is userControl.xAxis.name
				$(@).prop('selected', true)

		$.each userControl.data.value, (i, d)->
			$.each $(checkform).find('input'), (i2,d2)->
				if $(@).val() is d
					$(@).prop('checked', true)

		max = userControl.range.max
		chartSlider.slider('values', 0, userControl.range.min)
		chartSlider.slider('values', 1, userControl.range.max)
		if userControl.range.minimum 
			chartSlider.slider('values', 0, 0)
			minimumCheck.prop('checked', true)
		if userControl.range.maximum 
			chartSlider.slider('values', 1, maximumCheck.val())
			maximumCheck.prop('checked', true)


	renderData = () ->
		dataset = []
		x = ["x"]
		xVal = userControl.xAxis.value
		dataVal = userControl.data.value
		dataTemp = []

		min = userControl.range.min
		max = userControl.range.max
		# get checkbox data key
		# dataVal = userControl.data.value
		
		i = 0
		while i < dataVal.length
			dataTemp.push [dataVal[i]]
			i++


		# convert to c3 json
		$.each dataRemote[0], (i, d) ->
			if (i >= min and i <= max)
				x.push d[xVal].$t
			$.each dataVal, (i2, d2) ->
				if (i >= min and i <= max)
					dataTemp[i2].push d3.round(d[d2].$t, 2)

		dataset.push x

		i = 0
		while i < dataTemp.length
			dataset.push dataTemp[i]
			i++
		renderChart dataset, x

	renderChart = (dataset, x) ->
		# C3.js Chart
		chartCase = userControl.chartType.value
		chart = c3.generate(
			bindto: ".demo"
			data:
				x: "x"
				columns: dataset
				type: chartCase
			size:
				height: 480
			axis:
				x:
					type: "category"
					tick:
						rotate: 45
						multiline: false
						culling:
							max: 20
			# zoom: 
			# 	enabled: true
			subchart:
				show: true
		)
	#分享FB
	$('.jq-fb').on 'click',(e)->
		e.preventDefault()
		url = document.URL
		window.open 'https://www.facebook.com/sharer/sharer.php?u=' + url, "_blank"
 	#儲存圖表
	$('.jq-SaveData').on 'click', ()->
		name = $(chartName).val();
		img = $('#chartImg').attr('src');
		description = $(chartDiscription).val();
		googleId = $('#getKey').val()
		chartType_name =  $(chartList).find('option').filter(':selected').text()
		chartType_value = $(chartList).val()
		xAxis_name = $(xAxis).find('option').filter(':selected').text()
		xAxis_value = $(xAxis).val()
		data_name = ''
		userDatakey = []
		$.each $(checkform).find('input:checked'), ()->
			userDatakey.push $(this).val()
		data_value = userDatakey
		range_name = $(xAxis).val()
		range_min = chartSlider.slider('values', 0)
		range_max = chartSlider.slider('values', 1)
		range_minimum = minimumCheck.prop('checked')
		range_maximum = maximumCheck.prop('checked')
		# console.log googleId,
		# '\n'+chartType_name,
		# '\n'+name,
		# '\n'+description,
		# '\n'+xAxis_name,
		# '\n'+xAxis_value,
		# '\n'+data_name,
		# '\n'+data_value,
		# '\n'+range_name,
		# '\n'+range_min,
		# '\n'+range_max,
		# '\n'+range_minimum,
		# '\n'+range_maximum,
		

		jqxhr = $.post("/saveImage",  
			'googleId':googleId
			'name':name
			'description':description
			'img': img
			'chartType_name': chartType_name
			'chartType_value': chartType_value
			'xAxis_name':xAxis_name
			'xAxis_value':xAxis_value
			'data_name':data_name
			'data_value':data_value
			'range_name':range_name
			'range_min':range_min
			'range_max':range_max
			'range_minimum':range_minimum
			'range_maximum':range_maximum
			, (data)->
				if data == 'success'
					window.location.href = '/showcase'
		)
	# 取代文字
	replaceGSX = (str)->
		return str.replace('gsx$', '')

	# By page
	pageValueInput = $('#page-value')
	if (pageValueInput.length > 0)
		shKey = pageValueInput.attr('value')
		userControl = pageUserControl
		getSpreadsheet(shKey)
	$('#updateImg').on 'click', (e)->
		e.preventDefault()
		createChartImages()
	#render img
	styles = undefined
	createChartImages = ->
	  $("defs").remove()
	  inlineAllStyles()
	  canvas = $("#canvas").empty()[0]
	  canvas.width = $(".demo").width() 
	  canvas.height = $(".demo").height() 
	  canvasContext = canvas.getContext("2d")
	  svg = $.trim($(".demo > svg")[0].outerHTML)
	  canvasContext.drawSvg svg, 0, 0
	  $("#downloadImg").attr("href", canvas.toDataURL("png")).attr "download", ->
	    "_llamacharts.png"
	  $("#chartImg").attr('src',canvas.toDataURL("png"))
	  return

	inlineAllStyles = ->
	  chartStyle = undefined
	  selector = undefined
	  
	  # Get rules from c3.css
	  i = 0

	  while i <= document.styleSheets.length - 1
	    if document.styleSheets[i].href and document.styleSheets[i].href.indexOf("c3.css") isnt -1
	      if document.styleSheets[i].rules isnt `undefined`
	        chartStyle = document.styleSheets[i].rules
	      else
	        chartStyle = document.styleSheets[i].cssRules
	    i++
	  if chartStyle isnt null and chartStyle isnt `undefined`
	    
	    # SVG doesn't use CSS visibility and opacity is an attribute, not a style property. Change hidden stuff to "display: none"
	    changeToDisplay = ->
	      $(this).css "display", "none"  if $(this).css("visibility") is "hidden" or $(this).css("opacity") is "0"
	      return

	    
	    # Inline apply all the CSS rules as inline
	    i = 0
	    while i < chartStyle.length
	      if chartStyle[i].type is 1
	        selector = chartStyle[i].selectorText
	        styles = makeStyleObject(chartStyle[i])
	        $("svg *").each changeToDisplay
	        
	        # $(selector).hide();
	        $(selector).not($(".c3-chart path")).css styles
	      $(".c3-chart path").filter(->
	        $(this).css("fill") is "none"
	      ).attr "fill", "none"
	      $(".c3-chart path").filter(->
	        not $(this).css("fill") is "none"
	      ).attr "fill", ->
	        $(this).css "fill"

	      i++
	  return


	# Create an object containing all the CSS styles.
	# TODO move into inlineAllStyles
	makeStyleObject = (rule) ->
	  styleDec = rule.style
	  output = {}
	  s = undefined
	  s = 0
	  while s < styleDec.length
	    output[styleDec[s]] = styleDec[styleDec[s]]
	    s++
	  output	

	
