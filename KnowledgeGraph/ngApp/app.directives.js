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
				//$scope.currentCategory = { id: 0, text: 'Общее' };
				$scope.currentStatus = { id: 0, text: 'Ожидает' };

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

				that.clearTopic = function () {
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
					if (!$scope.currentStatus.text) {
						return false;
					} else {
						$scope.model.Status = $scope.currentStatus.text;
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
						show.error('Incorrect link!', 'Error');
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

	app.directive('linkTypes', function () {
		return {
			replace: true,
			restrict: 'E',
			scope: {
				model: "=",
			},
			template: '<input type="text" ui-select2="options" ng-model="model">',
			controller: function ($scope) {
				var ctrl = this;

				var data = {
					results: [
						{ id: 0, text: "Статья" },
						{ id: 1, text: "Видео" },
						{ id: 2, text: "Другое" },
					]
				};

				$scope.options = {
					minimumInputLength: 0,
					placeholder: "Search type...",
					width: 180,
					query: function (query) {
						query.callback(data);
					},
					initSelection: function (element, callback) {
					}
				};

				if (!$scope.model.text) {
					$scope.model = data.results[0];
				}
			}
		};
	});

	app.directive('statusList', function () {
		return {
			replace: true,
			restrict: 'E',
			scope: {
				model: "=",
			},
			template: '<input type="text" ui-select2="options" ng-model="model">',
			controller: function ($scope) {
				var that = this;

				var results = [
					{ id: 0, text: "Ожидает" },
					{ id: 1, text: "В процессе" },
					{ id: 2, text: "Изучен" },
				];

				$scope.options = {
					minimumInputLength: 0,
					placeholder: "Choose status...",
					width: 270,
					query: function (query) {
						var data = {};
						data.results = results;
						query.callback(data);
					},
					initSelection: function (element, callback) {
					}
				};
			}
		};
	});

	app.directive('searchByTitle', function () {
		return {
			replace: true,
			restrict: 'E',
			scope: {
				model: "=",
			},
			template: '<input type="text" ui-select2="options" ng-model="model">',
			controller: function ($scope, topicRepository) {
				var that = this;

				var search = _.debounce(function (query) {
					topicRepository.search(query.term, 10, 0, 'Id.Title').then(function(result) {
						var data = {};
						data.results = _.map(result, function(e) {
							return {
								id: e.Id,
								text: e.Title
							};
						});
						query.callback(data);
					});
				}, 1200);

				$scope.options = {
					minimumInputLength: 3,
					placeholder: "Search by title...",
					width: 270,
					query: function (query) {
						search(query);
					},
					initSelection: function (element, callback) {
					}
				};
			}
		};
	});

}(angular, toastr));

