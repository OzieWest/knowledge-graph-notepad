console.log('page-index loaded!');

; (function (ng, show) {
	'use strict';

	var name = 'page-index';

	var app = ng.module(name, ['core', 'topicRepository', 'newTopic', 'statusTypes', 'linkTypes', 'linkList']);
	app.controller(name, ['$scope', 'topicRepository',
		function ($scope, repo) {
			var ctrl = this;

			$scope.config = {
				offset: 0,
				count: 20,
				fields: 'Id.Category.Status.Title.Created.Connections',
				category: '',
				busy: true
			};

			ctrl.onError = function (err) {
				show.error(err.message, 'Error');
				console.log('Error', err);
			};

			// -------------------------------------------------------
			$scope.topics = {
				data: [],
				del: function (id) {
					var that = this;
					repo.topics.del(id).then(function () {
						var ind = _.map(that.data, function (e) {
							return e.Id;
						}).indexOf(id);
						that.data.splice(ind, 1);
						show.success('Topic deleted!', 'Success');
					}, ctrl.onError);
				},
				all: 0
			};

			var dbGetAll = function () {
				var count = $scope.config.count;
				var offset = $scope.config.offset;
				var fields = $scope.config.fields;
				var category = $scope.config.category;

				return repo.topics.getAll(count, offset, category, fields).then(function (r) {
					$scope.topics.data = ng.copy(r.data);
					$scope.topics.all = r.all;
				}, ctrl.onError);
			};

			$scope.toMain = function () {
				$scope.config.offset = 0;
				$scope.config.category = '';
				ctrl.onChangeCategory();
				dbGetAll();
			};

			$scope.byCategory = function (cat) {
				$scope.config.offset = 0;
				$scope.config.category = cat;
				ctrl.onChangeCategory(cat);
				dbGetAll();
			};
			
			ctrl.onChangeCategory = function (cat) {
				$scope.$broadcast('changeCategory', { topic: { Category: cat } });
			};

			$scope.next = function () {
				$scope.config.offset = $scope.config.offset - $scope.config.count;
				dbGetAll();
			};

			$scope.back = function () {
				$scope.config.offset = $scope.config.count + $scope.config.offset;
				dbGetAll();
			};

			$scope.$on('topicAdded', function (event, args) {
				show.info('on topicAdded', 'DEBUG');
				var topic = ng.copy(args.topic);
				$scope.topics.data.splice(0, 0, topic);
			});

			// INIT -------------------------------------------
			dbGetAll();
		}]);

}(angular, toastr));