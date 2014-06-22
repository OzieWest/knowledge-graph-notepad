; (function () {
	'use strict';

	describe('FRIENDS', function () {
		var injector, repo, qh;

		beforeEach(function () {
			injector = angular.injector(['ng', 'vk.provider', 'vk.support']);

			injector.invoke(function (vkProvider, queryHelper) {
				repo = vkProvider;
				qh = queryHelper;
			});
		});

		xit('Get - should return defined object', function (done) {

			var query = qh.start()
						.userId('26033241')
						.order('name')
						.count(5)
						.offset(0)
						.fields('photo')
						.nameCase('gen')
						.end();

			var p = repo.friends.get(query);

			p.then(function (res) {
				expect(res).toBeDefined();
				expect(res.length).toBeDefined();
			}).finally(done);
		});

		xit('GetOnline - should return defined object', function (done) {

			var query = qh.start()
						.userId('169483251')
						.onlineMobile(1)
						.order('random')
						.count(10)
						.offset(0)
						.end();

			var p = repo.friends.getOnline(query);

			p.then(function (res) {
				expect(res).toBeDefined();
				expect(res.online).toBeDefined();
				expect(res.online_mobile).toBeDefined();
			}).finally(done);
		});

		xit('GetMutual - should return defined object', function (done) {

			var query = qh.start()
						.sourceUid('169483251')
						.targetUid('26033241')
						.order('random')
						.count(100)
						.offset(0)
						.end();

			var p = repo.friends.getMutual(query);

			p.then(function (res) {
				expect(res).toBeDefined();
				expect(res.length).toBeDefined();
			}).finally(done);
		});

		xit('GetRecent - should return defined object', function (done) {

			var query = qh.start()
						.count(10)
						.end();

			var p = repo.friends.getRecent(query);

			p.then(function (res) {
				expect(res).toBeDefined();
				expect(res.length).toBeDefined();
			}).finally(done);

		});

		xit('GetAppUsers - should return defined object', function (done) {

			var p = repo.friends.getAppUsers();

			p.then(function (res) {
				expect(res).toBeDefined();
				expect(res.length).toBeDefined();
			}).finally(done);
		});

		xit('AreFriends - should return defined object', function (done) {

			var query = qh.start()
				.userIds(['169483251', '26033241'])
				.needSign(1)
				.end();

			var p = repo.friends.areFriends(query);

			p.then(function (res) {
				expect(res).toBeDefined();
				expect(res.length).toBeDefined();
			}).finally(done);
		});
	});
})();