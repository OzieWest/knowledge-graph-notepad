console.log('page.topic loaded!');

(function (ng, show) {
	'use strict';

	var name = 'page.topic';
	var app = ng.module(name, ['core', 'topicRepository', 'newTopic', 'statusTypes', 'linkTypes', 'connectionList', 'linkList', 'searchByTitle']);

	app.controller(name, ['$scope', 'topicRepository',
		function ($scope, repo) {
			$scope.currentStatus = { id: 0, text: 'Ожидает' };

			// Topics ====================================================
			$scope.topic = {};
			$scope.newTopic = {};
			$scope.isShowCreateBox = false;

			$scope.deleleCurrentPost = function () {
				repo.topics.del($scope.topic.Id).then(function () {
					window.location = "/";
				}, onError);
			};

			$scope.switchView = function () {
				$scope.isShowCreateBox = !$scope.isShowCreateBox;

				if ($scope.isShowCreateBox) {
					$scope.newTopic.Title = $scope.topic.Title;
					$scope.newTopic.Value = $scope.topic.Value;
					$scope.newTopic.Category = $scope.topic.Category;

					$scope.currentStatus.text = $scope.topic.Status;
				}
			};

			$scope.onAddNewTopic = function () {
				repo.topics.update(id, $scope.topic).then(function () {
					//$scope.connections.load($scope.topic.Connections);
				}, onError);
			};

			$scope.saveTopic = function () {
				$scope.newTopic.Links = $scope.topic.Links;
				$scope.newTopic.Connections = $scope.topic.Connections;

				$scope.newTopic.Status = $scope.currentStatus.text;

				repo.topics.update($scope.topic.Id, $scope.newTopic).then(function (status) {
					if (status) {

						$scope.topic.Category = $scope.newTopic.Category;
						$scope.topic.Status = $scope.newTopic.Status;

						$scope.topic.Value = $scope.newTopic.Value;
						$scope.topic.Title = $scope.newTopic.Title;
						$scope.topic.Links = $scope.newTopic.Links;
						$scope.topic.Connections = $scope.newTopic.Connections;

						$scope.isShowCreateBox = false;

						show.success('Topic updated!', 'Success');
					} else {
						onError();
					}
				}, onError);
			};

			// INIT ====================================================
			(function () {
				repo.topics.getById(id).then(function (result) {
					$scope.topic = ng.copy(result);
					document.title = $scope.topic.Title + ' ' + document.title;
					
					$scope.$broadcast('changeCategory', { topic: ng.copy($scope.topic) });
				}, onError);
			})();

		}]);
}(angular, toastr));