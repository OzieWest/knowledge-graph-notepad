(function (ng, show) {

	var app = ng.module('app.directive', ['app.service', 'textAngular']);

	app.directive('newTopic', function () {
		return {
			replace: true,
			restrict: 'E',
			scope: {
				parent: "=",
				onAdd: "&"
			},
			templateUrl: '../templates/tmpl.directive.new-topic.html?1',
			controller: function ($scope, topicRepository) {
				var that = this;

				$scope.newTopicId = 0;
				$scope.isView = {
					NewTopic: false,
					NewLinks: false,
				};

				that.clearLink = function () {
					$scope.newLink = {
						Title: '',
						Url: '',
					};
				};

				that.clearTopic = function() {
					$scope.model = {
						Title: '',
						Value: '',
						Connections: [],
						Links: [],
						Category: '',
					};
				};

				$scope.switchView = {
					Topic: function () {
						$scope.isView.NewTopic = !$scope.isView.NewTopic;

						if (!$scope.model.Category) {
							$scope.model.Category = $scope.parent.Category;
						}
					},
					Links: function () {
						$scope.isView.NewLinks = !$scope.isView.NewLinks;
					}
				};

				that.checkModel = function () {
					
					$scope.model.Connections.push($scope.parent.Id);

					if ($scope.model.Title && $scope.model.Category && $scope.model.Value) {
						return true;
					}

					return false;
				};

				$scope.addTopic = function () {
					if (that.checkModel()) {
						topicRepository.add($scope.model).then(function (res) {
							$scope.newTopicId = res;
							
							that.updateParentLink();
							that.clearTopic();

							$scope.isView.NewTopic = false;
							show.success('New topic created!', 'Success');
						});
					}
				};

				$scope.addLink = function () {
					if ($scope.newLink.Title && $scope.newLink.Url) {
						$scope.model.Links.push($scope.newLink);
						that.clearLink();
					} else {
						show.error('Incorrect link!','Error');
					}
				};

				that.updateParentLink = function () {
					$scope.parent.Connections.push($scope.newTopicId);
					$scope.onAdd();
				};

				$scope.goToNewTopic = function () {
					window.location = "../home/topic?id=" + $scope.newTopicId;
				};

				// INIT -----------------------------------------------
				that.clearTopic();
				that.clearLink();
			}
		};
	});

}(angular, toastr));

