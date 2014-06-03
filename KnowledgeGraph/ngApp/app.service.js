(function (ng, show) {
	'use strict';
	var app = ng.module('app.service', []);

	app.factory('topicRepository', function ($q, $http, $log) {
		var ROOT = "http://localhost:55528/api/";
		
		var call = function (method, params, data) {
			$log.debug([new Date().toLocaleTimeString(), 'send', params, 'and', data]);
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
				$log.debug([new Date().toLocaleTimeString(), params, 'return', result]);
			}).error(function (err) {
				deferred.reject(err);
				$log.debug([new Date().toLocaleTimeString(), params, 'error', err]);
			});
			return deferred.promise;
		};

		return {
			getAll: function (count, offset, partial) {
				return call("get", "topic?" + "count=" + count + "&offset=" + offset + "&partial=" + partial);
			},
			getById: function (id) {
				return call("get", "topic/" + id);
			},
			getByCategory: function (category, count, offset) {
				return call("post", "topic/0/Category/",
					{
						category: category, 
						count: count, 
						offset: offset
					});
			},
			search: function (search, count, offset, partial) {
				return call("post", "topic/0/Search/",
					{
						search: search, 
						count: count, 
						offset: offset,
						partial: partial
					});
			},
			add: function (topic) {
				return call("post", "topic", topic);
			},
			del: function (id) {
				return call("delete", "topic/" + id);
			},
			update: function (id, topic) {
				return call("put", "topic/" + id, topic);
			},
			titles: function (id, arrayId) {
				return call("post", "topic/" + id + "/Titles", arrayId);
			},
			connections: {
				del: function (id, conId) {
					return call("post", "topic/" + id + "/DeleteConnections", { conId: conId });
				},
				add: function (id, conId) {
					return call("post", "topic/" + id + "/AddConnection", { conId: conId });
				}
			},
			deleteLink: function (id, link) {
				return call("post", "topic/" + id + "/DeleteLink", link);
			},
			addLink: function (id, link) {
				return call("post", "topic/" + id + "/AddLink", link);
			},
		};
	});

})(angular, toastr);