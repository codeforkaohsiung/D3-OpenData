app = angular.module('starter', ['ui.bootstrap', 'vr.directives.slider']);



app.controller('appCtrl', ($scope, $http)->
	$scope.appModel = {}

	$scope.appModel.chartShkey = '1x6C86tzJ2F8ZTau6g7uUNxSb496wuoIR2s2I9lEWQSI'
	$scope.loadChart = (path)->
		getGoogleChart($scope.appModel.chartShkey)
	$scope.replaceGSX = (str)->
		return str.replace('gsx$', '')
	$scope.renderData = (name)->
		console.log 'aa'
		renderData()
	$scope.$watchCollection $scope.appModel, ()->
		console.log $scope.appModel
		renderData()

	$scope.$watch($scope.appModel, (newValue, oldValue)-> 
		if newValue
			console.log "I see a data change!"
	, true);
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
				console.log data.data.feed
				$scope.dataRemote = data.data.feed.entry
				console.log data, $scope.dataRemote
				$scope.appModel.jsonKey = getJsonKey($scope.dataRemote) #取得資料標頭
				$scope.appModel.xVal = $scope.appModel.jsonKey[0].name #預設xVal
				renderForm()
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
			jsonKey.push {"name": orgKey[i]}  if orgKey[i].indexOf(prefix) > -1
			i++

		jsonKey

	renderForm = () ->
		# 繪製表單
		sliderData()

		# if $.isEmptyObject(userControl)
		# 	updateUserControl()
		# else
		# 	loadUserControl()

	# 繪製Slider
	xTemp = ''
	sliderData = ()->
		xData = []
			# 如果使用者還沒有選擇，則先選擇第一個
		if xTemp != $scope.appModel.xVal && $scope.appModel.xVal != ''
			xTemp = $scope.appModel.xVal
		else if xTemp != $scope.appModel.xVal && $scope.appModel.xVal == ''
			$scope.appModel.xVal = $scope.appModel.jsonKey[0].name
			xTemp = $scope.appModel.xVal
		min = 0
		console.log xTemp
		# load x data
		angular.forEach $scope.dataRemote, (d, i) ->
			xData.push(d[xTemp].$t)
		$scope.appModel.xData = xData
		$scope.appModel.xDataMin = min
		$scope.appModel.xDataMax = $scope.appModel.xData.length
		renderData()

	renderData = () ->
		# 轉換數據 為C3.js用
		dataset = []
		x = ["x"]
		xVal = $scope.appModel.xVal
		dataVal = []
		dataTemp = []
		angular.forEach $scope.appModel.jsonKey, (d, i) ->
			if d.dataSelect is true
				dataVal.push(d.name)

		# 將使用者選擇的資料暫存
		k = 0
		while k < dataVal.length
			dataTemp.push [dataVal[k]]
			k++

		max = parseInt($scope.appModel.xDataMax, 10); 
		min = parseInt($scope.appModel.xDataMin, 10); 
		# convert to c3 json

		i2 = 0

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