(function (ng) {
	'use strict';

	var name = 'linkTypes';
	ng.module(name, [])
		.directive(name, function () {
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
})(angular);