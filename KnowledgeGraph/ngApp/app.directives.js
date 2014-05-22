(function (ng, show) {

	var app = ng.module('app.directive', ['app.service']);

	app.directive('newTopic', function () {
		return {
			replace: true,
			restrict: 'E',
			scope: {
				parent: "=",
				onAdd: "&"
			},
			templateUrl: '../templates/tmpl.directive.new-topic.html?1',
			controller: function ($scope, repoTopics) {
				var that = this;

				$scope.newTopicId = 0;
				$scope.isShowCreateBox = false;
				$scope.isShowHelpLink = false;

				that.clearTopic = function () {
					$scope.model = {
						Title: '',
						Value: '',
						Tags: [],
						Links: [],
						Category: '',

						TagSource: '',
					};
				}

				$scope.switchView = function (command) {
					if (command == 'createbox') {
						$scope.isShowCreateBox = !$scope.isShowCreateBox;

						if (!$scope.model.Category) {
							$scope.model.Category = $scope.parent.Category;
						}
					}
					else if (command == 'helplink') {
						$scope.isShowCreateBox = false;
						$scope.isShowHelpLink = false;
					}
				};

				that.checkModel = function () {
					$scope.model.Tags = $scope.model
										.TagSource
										.toLowerCase()
										.split(',');
					
					$scope.model.Links.push($scope.parent.Id);

					if ($scope.model.Title && $scope.model.Category && $scope.model.Value) {
						return true;
					}

					return false;
				};

				$scope.addTopic = function () {
					if (that.checkModel()) {

						repoTopics.add($scope.model).then(function (res) {
							$scope.newTopicId = res;
							
							that.updateParentLink();
							that.clearTopic();
							that.changeView();
						});
					}
				};

				that.changeView = function () {
					$scope.isShowCreateBox = false;
					$scope.isShowHelpLink = true;
				};

				that.updateParentLink = function () {
					$scope.parent.Links.push($scope.newTopicId);
					$scope.onAdd();
				};

				$scope.goToNewTopic = function () {
					window.location = "../home/viewtopic?id=" + $scope.newTopicId;
				};

				// INIT ------------------------------------------------

				that.clearTopic();
			}
		};
	});

}(angular, toastr));

