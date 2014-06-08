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
				var repo = topicRepository;
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

					if ($scope.parent.Id){
						$scope.model.Connections.push($scope.parent.Id);
					}

					if ($scope.model.Title && $scope.model.Value) {
						return true;
					}

					return false;
				};

				$scope.addTopic = function () {
					if (that.checkModel()) {

						$scope.model.Created = new Date();
						$scope.model.Modified = new Date();
						
						repo.topics.add($scope.model).then(function (res) {
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
				var repo = topicRepository;

				var search = _.debounce(function (query) {
					repo.topics.search(query.term, 10, 0, 'Id.Title').then(function(result) {
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
	
	app.directive('linkList', function () {
		return {
			replace: true,
			restrict: 'E',
			scope: {
				topic: "=",
			},
			templateUrl: '../templates/tmpl.directive.links.html?1',
			controller: function ($scope, topicRepository) {
				var repo = topicRepository;
				var ctrl = this;

				$scope.linkType = {};
				$scope.model = {};
				$scope.isAdd = false;

				$scope.switchView = function() {
					$scope.isAdd = !$scope.isAdd;
				};

				$scope.clear = function() {
					$scope.model = {
						Title: '',
						Type: 'Статья',
						Url: ''
					};
				};

				$scope.add = function() {
					$scope.model.Type = $scope.linkType.text;
					repo.links.add($scope.topic.Id, $scope.model).then(function(res) {
						if (res) {
							if (!$scope.topic.Links) {
								$scope.topic.Links = [];
							}
							$scope.topic.Links.push($scope.model);

							$scope.switchView();
							$scope.clear();

							show.success('Link added!', 'Success');
						}
					}, ctrl.onError);
				};

				$scope.del = function (link) {
					repo.links.del($scope.topic.Id, link).then(function (res) {
						if (res) {
							var ind = _.map($scope.topic.Links, function (e) {
								return e.Url;
							}).indexOf(link.Url);

							$scope.topic.Links.splice(ind, 1);
							show.success('Link deleted!', 'Success');
						}
					}, ctrl.onError);
				};
				
				$scope.clear();
			}
		};
	});
	
	app.directive('connectionList', function () {
		return {
			replace: true,
			restrict: 'E',
			scope: {
				topic: "=",
			},
			templateUrl: '../templates/tmpl.directive.connections.html?1',
			controller: function ($scope, topicRepository) {
				var repo = topicRepository;
				var ctrl = this;

				$scope.connections = {
					data: [],
					del: function (conId) {
						var obj = this;
						repo.connections.del($scope.topic.Id, conId).then(function (res) {
							if (res) {
								var ind = _.map(obj.data, function (e) {
									return e.val;
								}).indexOf(conId);

								obj.data.splice(ind, 1);

								var conIDs = $scope.topic.Connections;
								conIDs.splice(conIDs.indexOf(conId), 1);

								show.success('Connection broke!', 'Success');
							}
						}, onError);
					},
					load: function (value) {
						var obj = this;
						repo.topics.titles($scope.topic.Id, value).then(function (res) {
							obj.data = ng.copy(res);
						}, onError);
					}
				};

				$scope.newConnection = {
					search: {},
					clear: function () {
						this.search = { id: -1, text: 'None' };
					},
					add: function () {
						var that = this;
						if (that.search.id != -1) {
							repo.connections.add($scope.topic.Id, that.search.id).then(function (res) {
								$scope.connections.data.push({ Id: that.search.id, Title: that.search.text });
								that.clear();
							}, onError);
						}
					},
					isShow: false,
					switchView: function () {
						this.isShow = !this.isShow;
					}
				};
				
				// INIT -------------------------------------------------------------------
				$scope.newConnection.clear();
				var wasLoaded = false;

				$scope.$watch('topic.Id', function (newValue, oldValue) {
					if (newValue && !wasLoaded) {
						if (!$scope.topic.Connections) {
							$scope.topic.Connections = [];
						}
						if ($scope.topic.Connections.length){
							$scope.connections.load($scope.topic.Connections);
						}
						wasLoaded = true;
					}
				});
			}
		};
	});

}(angular, toastr));

