(function (ng, show) {
	'use strict';
	var app = ng.module('app.service', []);

	app.factory('repoTopics', function ($q, $http, $log) {
		var ROOT = "http://localhost:55528/api/";
		
		var call = function (params, data) {
			$log.debug([new Date().toLocaleTimeString(), 'send', params, 'and', data]);
			var path = ROOT + params;
			var deferred = $q.defer();
			var p;
			
			if (data) {
				p = $http.post(path, data);
			} else {
				p = $http.get(path);
			}

			p.success(function (result) {
				deferred.resolve(result);
				$log.debug([new Date().toLocaleTimeString(), params, 'return', result]);
			}).error(function (err) {
				deferred.reject(err);
				$log.debug([new Date().toLocaleTimeString(), params, 'error', err]);
			});
			return deferred.promise;
		};

		return {
			getAll: function () {
				return call("topic");
			},
			getById: function (id) {
				return call("topic/" + id);
			},
			add: function (topic) {
				return call("topic", topic);
			}
		};
	});

})(angular, toastr);