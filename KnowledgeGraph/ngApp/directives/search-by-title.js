(function (ng) {
	'use strict';

	var name = 'searchByTitle';
	ng.module(name, [])
		.directive(name, function () {
			return {
				replace: true,
				restrict: 'E',
				scope: {
					model: "=",
				},
				template: '<input type="text" ui-select2="options" ng-model="model">',
				controller: function ($scope, topicRepository) {
					var ctrl = this;
					var repo = topicRepository;

					var search = _.debounce(function (query) {
						repo.topics.search(query.term, 10, 0, 'Id.Title').then(function (result) {
							var data = {};
							data.results = _.map(result, function (e) {
								return {
									id: e.Id,
									text: e.Title
								};
							});
							query.callback(data);
						});
					}, 2000);

					$scope.options = {
						minimumInputLength: 3,
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

})(angular);