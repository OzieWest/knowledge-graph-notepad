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
				$scope.currentCategory = {};
				
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
					if (!$scope.currentCategory.text) {
						return false;
					} else {
						$scope.model.Category = $scope.currentCategory.text;
					}

					$scope.model.Connections.push($scope.parent.Id);

					if ($scope.model.Title && $scope.model.Value) {
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
	
	app.directive('categoryList', function () {
		return {
			replace: true,
			restrict: 'E',
			scope: {
				model: "=",
			},
			template: '<input type="text" ui-select2="categoryOptions" ng-model="model">',
			controller: function ($scope) {
				var that = this;
				
				$scope.categories = [
					{ id: 0, text: "Общее" },
					{ id: 1, text: "Алгоритмы" },
					{ id: 2, text: "Биология" },
					{ id: 3, text: "Биография" },
					{ id: 4, text: "Математика" },
					{ id: 5, text: "История" },
					{ id: 6, text: "Физика" },
				];

				$scope.categoryOptions = {
					minimumInputLength: 0,
					placeholder: "Search category...",
					width: 250,
					query: function (query) {
						//console.log(query.term);
						var data = {};
						data.results = $scope.categories;
						query.callback(data);
					},
					initSelection: function (element, callback) {
					}
				};
			}
		};
	});

}(angular, toastr));

