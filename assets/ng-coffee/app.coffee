app = angular.module('starter', ['ui.bootstrap', 'uiSlider']);



app.controller('appCtrl', ($scope, $http)->
	$scope.appModel = {}

	$scope.appModel.chartShkey = '1x6C86tzJ2F8ZTau6g7uUNxSb496wuoIR2s2I9lEWQSI'
	dataRemote = []
	$scope.loadChart = (path)->
		getGoogleChart($scope.appModel.chartShkey)
	$scope.replaceGSX = (str)->
		return str.replace('gsx$', '')

	# Chart 
	$scope.chartType = chartType

	# 取得資料
	getGoogleChart = (shkey)->
		shPath = 'https://spreadsheets.google.com/feeds/list/'
		shCallback = '/public/values?alt=json'
		listKey = 'od6'
		url = shPath + shkey + '/' + listKey + shCallback
		# getJson(url)
		$http(
				'url': url,
				'method': "GET"
			).then((data)->
				dataRemote = data.data.feed.entry
				console.log data, dataRemote
				$scope.appModel.jsonKey = getJsonKey(dataRemote) #取得資料標頭
				$scope.appModel.xVal = $scope.appModel.jsonKey[0] #預設xVal
				renderForm(dataRemote)
				# renderData(dataRemote, jsonKey)
			, (response)->
				console.log('Fail:', response)
			)

	# 取得資料標頭
	getJsonKey = (obj)->
		orgKey = []
		prefix = "gsx$"
		jsonKey = []
		for key of obj[0]
			orgKey.push key
		i = 0
		while i < orgKey.length
			jsonKey.push orgKey[i]  if orgKey[i].indexOf(prefix) > -1
			i++

		jsonKey

	renderForm = (dataRemote) ->
		# # render slider
		sliderData()

		# if $.isEmptyObject(userControl)
		# 	updateUserControl()
		# else
		# 	loadUserControl()

	xTemp = ''
	sliderData = ()->
		xData = []
			# 如果使用者還沒有選擇，則先選擇第一個
		if xTemp != $scope.appModel.xVal && $scope.appModel.xVal != ''
			xTemp = $scope.appModel.xVal
		else if xTemp != $scope.appModel.xVal && $scope.appModel.xVal == ''
			$scope.appModel.xVal = $scope.appModel.jsonKey[0]
			xTemp = $scope.appModel.xVal
		console.log dataRemote
		max = 0
		min = 0
		# load x data
		angular.forEach dataRemote, (d, i) ->
			xData.push(d[xTemp].$t)
		$scope.appModel.xData = xData
		$scope.appModel.xDataMax = $scope.appModel.xData.length
)
# uiSlider = ()->
# 		xVal = $(xAxis).val()
# 		xData = []
# 		if xTemp != xVal
# 			xTemp = xVal
# 			max = 0
# 			min = 0
# 			# load x data
# 			$.each dataRemote[0], (i, d) ->
# 				xData.push d[xVal].$t
# 			xDataMax = xData.length

# 			# max and min checkbox
# 			maximumCheck.val(xDataMax)
# 			minimumCheck.on 'change', ()->
# 				if $(@).prop('checked')
# 					chartSlider.slider('values', 0, 0)
# 					$('#slider-min').text(xData[0])
# 			maximumCheck.on 'change', ()->
# 				if $(@).prop('checked')
# 					chartSlider.slider('values', 1,$(@).val())
# 					$('#slider-max').text(xData[xDataMax - 1])

# 			# ui slider
# 			slider = chartSlider.slider(
# 				range: true,
# 				min: 0,
# 				max: xDataMax,
# 				values: [ 0, xDataMax],
# 				slide: (event, ui)->
# 					max = ui.values[1]
# 					min = ui.values[0]
# 					# 更新資料
# 					max is xDataMax || maximumCheck.prop('checked',false)
# 					min is 0 || minimumCheck.prop('checked',false)
# 					setTimeout( ->
# 						renderSliderValue(min, max - 1)
# 						userControl = {}
# 						updateUserControl()
# 					,100)
# 				)		
# 		renderSliderValue = (min, max)->
# 			$('#slider-min').text(xData[min])
# 			$('#slider-max').text(xData[max])

# 		renderSliderValue(0, chartSlider.slider('values', 1) - 1)


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