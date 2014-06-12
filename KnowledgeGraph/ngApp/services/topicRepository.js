(function (ng) {
	'use strict';

	var name = 'topicRepository';
	var app = ng.module(name, []);
	
	app.factory('timestampMarker', ['$log', function ($log) {
		var timestampMarker = {
			request: function (config) {
				$log.info(new Date().toLocaleTimeString(), [config.method, config.url, config]);
				return config;
			},
			response: function (response) {
				$log.info(new Date().toLocaleTimeString(), ['response', response.config.url, response]);
				return response;
			}
		};
		return timestampMarker;
	}]);
	
	app.config(['$httpProvider', function ($httpProvider) {
		$httpProvider.interceptors.push('timestampMarker');
	}]);

	app.factory(name, function ($q, $http) {
		var ROOT = "../api/";
		
		var call = function (method, params, data) {
			var path = ROOT + params;
			var deferred = $q.defer();
			var p;
			
			if (method == "post") {
				p = $http.post(path, data);
			}
			else if (method == "get") {
				p = $http.get(path);
			}
			else if (method == "delete") {
				p = $http.delete(path);
			}
			else if (method == "put") {
				p = $http.put(path, data);
			}

			p.success(function (result) {
				deferred.resolve(result);
			}).error(function (err) {
				deferred.reject(err);
			});
			return deferred.promise;
		};

		var topics = {
			getAll: function (count, offset, category, partial) {
				return call("get", "topic/GetAll?count=" + count + "&offset=" + offset + "&partial=" + partial + "&category=" + category);
			},
			getById: function (id) {
				return call("get", "topic/GetById?id=" + id);
			},
			search: function (search, count, offset, partial) {
				return call("post", "topic/Search/",
					{
						search: search, 
						count: count, 
						offset: offset,
						partial: partial
					});
			},
			add: function (topic) {
				return call("post", "topic/AddTopic", { topic: topic });
			},
			del: function (id) {
				return call("post", "topic/DeleteTopic", { id: id });
			},
			update: function (id, topic) {
				return call("post", "topic/UpdateTopic", { id: id, topic: topic });
			},
			titles: function (id, arrayId) {
				return call("post", "topic/GetTitles", { arrayId: arrayId });
			},
		};

		var links = {
			add: function (id, link) {
				return call("post", "topic/AddLink", { id: id, link: link });
			},
			del: function (id, link) {
				return call("post", "topic/DeleteLink", { id: id, link: link });
			}
		};

		var connections = {
			add: function (id, conId) {
				return call("post", "topic/AddConnection", { id: id, conId: conId });
			},
			del: function (id, conId) {
				return call("post", "topic/DeleteConnections", { id: id, conId: conId });
			}
		};

		return {
			topics: topics,
			links: links,
			connections: connections
		};
	});

})(angular);