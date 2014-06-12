(function (ng, show) {
	'use strict';

	var name = 'linkList';
	ng.module(name, [])
		.directive(name, function () {
			return {
				replace: true,
				restrict: 'E',
				scope: {
					topic: "=",
				},
				templateUrl: '../ngApp/views/directive.links.html?time=' + (new Date().getTime()),
				controller: function ($scope, topicRepository) {
					var repo = topicRepository;
					var ctrl = this;

					$scope.linkType = {};
					$scope.model = {};
					$scope.isAdd = false;

					$scope.switchView = function () {
						$scope.isAdd = !$scope.isAdd;
					};

					$scope.clear = function () {
						$scope.model = {
							Title: '',
							Type: 'Статья',
							Url: ''
						};
					};

					$scope.add = function () {
						$scope.model.Type = $scope.linkType.text;

						if ($scope.topic.Id) {
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
							}, onError);
						} else {
							$scope.topic.Links.push($scope.model);
							$scope.clear();
						}
					};

					$scope.del = function (link) {
						if ($scope.topic.Id) {
							repo.links.del($scope.topic.Id, link).then(function(res) {
								if (res) {
									var ind = _.map($scope.topic.Links, function(e) {
										return e.Url;
									}).indexOf(link.Url);

									$scope.topic.Links.splice(ind, 1);
									show.success('Link deleted!', 'Success');
								}
							}, onError);
						} else {
							var ind = _.map($scope.topic.Links, function (e) {
								return e.Url;
							}).indexOf(link.Url);
							$scope.topic.Links.splice(ind, 1);
						}
					};

					$scope.clear();
				}
			};
		});

})(angular, toastr);