app = angular.module('starter', ['ui.bootstrap', 'vr.directives.slider', 'ngTouch']);


app.controller('appCtrl', ($scope, $http)->
)	

app.controller('storyCtrl', ($scope, $http)->
)

app.controller('chartCtrl', ($scope, $http)->
	$scope.appModel = {}
	$scope.pageStatus = {}
	$scope.pageStatus.start = false
	resetList = ['xVal','xDataMin', 'xDataMax', 'jsonKey', 'xData', 'content']
	$scope.appModel.chartShkey = '1x6C86tzJ2F8ZTau6g7uUNxSb496wuoIR2s2I9lEWQSI'
	$scope.enterChart = (keyEvent, path)-> # 鍵盤事件
		if keyEvent.keyCode is 13 
			$scope.loadChart(path)
	$scope.loadChart = (path)->
		resetData($scope.appModel, resetList) # 當使用者開啟試算表時，重置資料
		$scope.appModel.chartShkey = path
		getGoogleChart($scope.appModel.chartShkey)

	$scope.replaceGSX = (str)->
		return str.replace('gsx$', '')
	$scope.renderData = (name)->
		renderData()

	$scope.maximumXdata = ()->
		if $scope.appModel.xDataMaximum
			$scope.appModel.xDataMax = $scope.appModel.xData.length
	$scope.singlePointUpdate = ()->
		if $scope.appModel.singlePoint
			$scope.appModel.xDataMaximum = false
		$scope.$broadcast('refreshSlider')
	$scope.sliderUpdate = ()->
		if $scope.appModel.xDataMax != $scope.appModel.xData.length
			$scope.appModel.xDataMaximum = false
		renderData()

	# 重置資料
	resetData = (data, resetList)->
		angular.forEach resetList, (d)->
			 data[d] = ""
		data

	# test http 進入頁面後讀取...
	# jsonPath = 'data/test.json'
	# $http(
	# 	'url': jsonPath,
	# 	'method': "GET"
	# ).then((data)->
	# 	$scope.appModel = data.data
	# 	getGoogleChart($scope.appModel.chartShkey)
	# , (response)->
	# 	console.log('Fail:', response)
	# )

	# Chart 的類型定義
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
				$scope.dataRemote = data.data.feed.entry
				$scope.appModel.jsonKey = getJsonKey($scope.dataRemote) #取得資料標頭
				$scope.appModel.xVal = $scope.appModel.jsonKey[0] #預設xVal
				renderForm()
			, (response)->
				console.log('Fail:', response)
			)
# 			$http.get('/status', {
#   ignoreLoadingBar: true
# });
		$scope.pageStatus.start = true
	# 儲存資料  

	$scope.saveGoogleChart = ()->
		$http.post('/saveImage', googleId: $scope.appModel.chartShkey).success((data, status, headers, config) ->
			console.log(data)
		).error (data, status, headers, config) ->
		 

	# 取得資料標頭
	getJsonKey = (obj)->
		orgKey = []
		prefix = "gsx$"
		jsonKeyTemp = []
		for key of obj[0]
			orgKey.push key
		i = 0
		while i < orgKey.length
			jsonKeyTemp.push {"name": orgKey[i]}  if orgKey[i].indexOf(prefix) > -1
			i++
		# 驗證原始資料
		jsonKeyVerify = true
		if $scope.appModel.jsonKey 
			console.log $scope.appModel.jsonKey.length
			angular.forEach $scope.appModel.jsonKey, (d,i)->
				if $scope.appModel.jsonKey[i].name != jsonKeyTemp[i].name
					jsonKeyVerify = false
			if jsonKeyVerify
				return $scope.appModel.jsonKey
		jsonKeyTemp

	renderForm = () ->
		# 繪製表單
		sliderData()

	# 繪製Slider
	xTemp = ''
	sliderData = ()->
		xData = []
		# 如果使用者還沒有選擇，則先選擇第一個
		if xTemp != $scope.appModel.xVal.name && $scope.appModel.xVal.name != ''
			xTemp = $scope.appModel.xVal.name
		else if xTemp != $scope.appModel.xVal.name && $scope.appModel.xVal.name == ''
			$scope.appModel.xVal = $scope.appModel.jsonKey[0].name
			xTemp = $scope.appModel.xVal.name
		min = 0
		# load x data
		angular.forEach $scope.dataRemote, (d, i) ->
			xData.push(d[xTemp].$t)
		$scope.appModel.xData = xData
		if !$scope.appModel.xDataMin
			$scope.appModel.xDataMin = min
		if !$scope.appModel.xDataMax || $scope.appModel.xDataMaximum
			$scope.appModel.xDataMax = $scope.appModel.xData.length
		
		renderData()

	renderData = () ->
		# 轉換數據 為C3.js用
		dataset = []
		x = ["x"]
		xVal = $scope.appModel.xVal.name
		dataVal = []
		dataTemp = []
		angular.forEach $scope.appModel.jsonKey, (d, i) ->
			if d.dataSelect is true
				dataVal.push(d.name)

		# slider x data
		xTemp = $scope.appModel.xVal.name
		xData = []
		angular.forEach $scope.dataRemote, (d, i) ->
			xData.push(d[xTemp].$t)
		$scope.appModel.xData = xData		

		# 將使用者選擇的資料暫存
		k = 0
		while k < dataVal.length
			dataTemp.push [dataVal[k]]
			k++

		max = parseInt($scope.appModel.xDataMax, 10); 
		min = parseInt($scope.appModel.xDataMin, 10); 
		# convert to c3 json

		i2 = 0


		# 如果是單點資料
		if $scope.appModel.singlePoint
			angular.forEach $scope.dataRemote, (d, i)->
				if (i is min)
					x.push $scope.dataRemote[i][xVal].$t
					angular.forEach dataVal, (d2, i2)->
						dataTemp[i2].push d3.round(d[d2].$t, 2)
		else
			angular.forEach $scope.dataRemote, (d, i)->
				if (i >= min and i < max)
					x.push $scope.dataRemote[i][xVal].$t
					angular.forEach dataVal, (d2, i2)->
						dataTemp[i2].push d3.round(d[d2].$t, 2)

		dataset.push x

		i = 0
		while i < dataTemp.length
			dataset.push dataTemp[i]
			i++

		renderChart dataset, x

	renderChart = (dataset, x)->
		chartCase = $scope.appModel.chartType.key
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
)


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