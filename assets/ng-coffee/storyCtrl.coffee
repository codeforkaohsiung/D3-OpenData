

app.controller('storyCtrl', ($scope, $http, $modal, $log)->
	$scope.storyModel = {}
	$scope.appModel = {}
	$scope.storyModel.showStoryBox = false
	$scope.showStoryBox = (e)->
		if $scope.storyModel.showStoryBox is true
			$scope.storyModel.showStoryBox = false
		else
			$scope.storyModel.showStoryBox = true

	$scope.storyModel.chapters = chapters

	# new chapter
	$scope.storyNewChapter = ()->
		nowDate = new Date()
		idTemp = nowDate.getTime().toString()
		chapterTemp = {}
		chapterTemp.id = idTemp
		$scope.storyModel.chapters.push chapterTemp
		$scope.$broadcast 'storyShareChangeChapter', idTemp

	# save from chartCtrl SaveStoryData
	$scope.$on 'updateShareStoryData', (event, chapterJson, id )->
		updateStoryData(id, chapterJson)
	# edit chapter
	$scope.editChapter = (id)->
		idTemp = id.toString()
		$scope.$broadcast 'storyShareChangeChapter', idTemp

	# update story
	updateStoryData = (id, chapterJson)->
		angular.forEach $scope.storyModel.chapters, (d, i)->
			if d.id is id
				$scope.storyModel.chapters[i] = chapterJson

	# story content modal
	$scope.openStoryModal = ()->
		modalInstance = $modal.open(
			templateUrl: 'modalStoryContent.html',
			controller: 'storyModalInstanceCtrl'
			# resolve: 
			# 	items: -> 
			# 		return 'a'
		)
)

app.controller('storyModalInstanceCtrl', ($scope, $modalInstance)->
  $scope.ok = ->
    $modalInstance.close()

  $scope.cancel = ->
    $modalInstance.dismiss 'cancel'
) 


