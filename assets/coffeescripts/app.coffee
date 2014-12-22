$ ->

	# get shKey
	getKeyBtn = $('#getKey')
	submitGetKey = $('#submitGetKey')
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
			name: "長條"
			key: "bar"
		}
		{
			name: "線條圖"
			key: "line"
		}
		{
			name: "面積圖"
			key: "area-spline"
		}
		{
			name: "圓餅圖"
			key: "pie"
		}
		
		{
			name: "圓環"
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

	getKey = (input)->
		shKey = input.val()
		getSpreadsheet(shKey)

	


	# get spreadsheet
	getSpreadsheet = (shKey)->
		shPath = 'https://spreadsheets.google.com/feeds/list/'
		shCallback = '/public/values?alt=json-in-script&callback=?'
		listKey = 'od6'

		url = shPath + shKey + '/' + listKey + shCallback
		getJson(url)


	getJson = (url)->
		dataRemote = []
		dataset = []
		$.getJSON(url)
		.done((data) -> # Success
			entry = data.feed.entry
			dataRemote.push entry
			$btn.button('reset')
			firstStart()
			resetForm()
			jsonDone(dataRemote)
		).fail (jqxhr, textStatus, error) ->
			$btn.button('reset')
			firstStart()
			errorStatus()
			console.log "GG,沒戲唱了" #失敗


	jsonDone = (dataRemote)->
		jsonKey = []
		jsonKey = getJsonKey(dataRemote)
		renderForm(dataRemote, jsonKey)
		renderData(dataRemote, jsonKey)
		console.log jsonKey

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
			.text((d) -> d)


		$("#form input, #form select").on "change", ->
		  renderData jsonKey

	renderData = (jsonKey) ->
		dataset = []
		x = ["x"]
		xVal = $(xAxis).val()
		dataVal = []
		dataTemp = []
		
		#get checkbox data key
		$.each $(checkform).find("input:checked"), (id) ->
			dataVal.push $(this).val()

		i = 0
		while i < dataVal.length
			dataTemp.push [dataVal[i]]
			i++
		
		# convert to c3 json
		$.each dataRemote[0], (i, d) ->
			x.push d[xVal].$t
			$.each dataVal, (i2, d2) ->
				dataTemp[i2].push d3.round(d[d2].$t)

		dataset.push x

		i = 0
		while i < dataTemp.length
			dataset.push dataTemp[i]
			i++
		renderChart dataset, x

	renderChart = (dataset, x) ->
		# C3.js Chart
		chartCase = $(chartList).val()
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
		)

		$(chartList).on "change", ->
		  chartCase = $(this).val()
		  transformChart chart, chartCase
		
	transformChart = (chart, chartCase) ->
		switch chartCase
			when "line"
				chart.transform "line"
			when "bar"
				chart.transform "bar"
			when "pie"
				chart.transform "pie"
			when "area-spline"
				chart.transform "area-spline"
			when "donut"
				chart.transform "donut"


	## Canvas to png


	#==== bootstrap function ====
	# bootstrap dropdown -> mega dropdown
	$('.dropdown.mega-dropdown a').on 'click', (event)-> 
	  $(this).parent().toggleClass('open')

	$('body').on 'click', (e)->
		if (!$('.dropdown.mega-dropdown').is(e.target) && $('.dropdown.mega-dropdown').has(e.target).length is 0 && $('.open').has(e.target).length is 0)
			$('.dropdown.mega-dropdown').removeClass('open')
