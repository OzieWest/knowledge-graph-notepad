(function (ng) {
	'use strict';
	var name = 'statusTypes';
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

					var results = [
						{ id: 0, text: "Ожидает" },
						{ id: 1, text: "В процессе" },
						{ id: 2, text: "Изучен" },
					];

					$scope.options = {
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
})(angular);