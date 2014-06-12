(function (ng, show) {

	var name = 'newTopic';

	ng.module(name, [])
		.directive(name, function () {
			return {
				replace: true,
				restrict: 'E',
				templateUrl: '../ngApp/views/directive.new-topic.html?time=' + (new Date().getTime()),
				controller: function ($scope, topicRepository) {
					var repo = topicRepository;
					var that = this;
					
					$scope.currentStatus = { id: 0, text: 'Ожидает' };
					
					/* VIEW ------------------------------------------------------------------
					*/
					$scope.isView = {
						NewTopic: false,
						NewLinks: false,
					};
					
					$scope.switchView = {
						Topic: function () {
							$scope.isView.NewTopic = !$scope.isView.NewTopic;
						},
						Links: function () {
							$scope.isView.NewLinks = !$scope.isView.NewLinks;
						}
					};

					
					/* TOPIC ------------------------------------------------------------------
					*/
					that.clearLink = function () {
						$scope.newLink = {
							Title: '',
							Url: '',
						};
					};
					
					$scope.addLink = function () {
						if ($scope.newLink.Title && $scope.newLink.Url) {
							$scope.model.Links.push($scope.newLink);
							that.clearLink();
						} else {
							show.error('Incorrect link!', 'Error');
						}
					};
					

					/* LINK ------------------------------------------------------------------
					*/
					that.clearTopic = function () {
						$scope.model = {
							Id: 0,
							Title: '',
							Value: '',
							Connections: [],
							Links: [],
							Category: 'Общее',
						};
					};

					$scope.$on('changeCategory', function (event, args) {
						$scope.model.Category = args.topic.Category || 'Общее';
						show.info('Category updated!', 'DEBUG');
					});
					
					$scope.$on('pageLoad', function (event, args) {
						var id = args.topic.Id || 0;
						
						if (id) {
							$scope.model.Connections.push(id);
							show.info('Connections updated!', 'DEBUG');
						}
					});

					that.checkModel = function () {
						if (!$scope.currentStatus.text) {
							return false;
						} else {
							$scope.model.Status = $scope.currentStatus.text;
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

								$scope.model.Id = res;
								that.onTopicAdded(ng.copy($scope.model));
								that.clearTopic();

								$scope.isView.NewTopic = false;
								show.success('New topic created!', 'Success');
							});
						}
					};

					/* should push to connections	
					*/
					that.onTopicAdded = function (topic) {
						$scope.$broadcast('topicAdded', { topic: topic });
					};


					// INIT -----------------------------------------------
					that.clearTopic();
					that.clearLink();
				}
			};
		});
}(angular, toastr));

