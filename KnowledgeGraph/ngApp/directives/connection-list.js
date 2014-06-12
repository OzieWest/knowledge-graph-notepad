(function (ng, show) {

	var name = 'connectionList';
	ng.module(name, [])
		.directive(name, function () {
			return {
				replace: true,
				restrict: 'E',
				scope: {
					topic: "=",
				},
				templateUrl: '../ngApp/views/directive.connections.html?time=' + (new Date().getTime()),
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
							if ($scope.topic.Connections.length) {
								$scope.connections.load($scope.topic.Connections);
							}
							wasLoaded = true;
						}
					});
				}
			};
		});

})(angular, toastr);