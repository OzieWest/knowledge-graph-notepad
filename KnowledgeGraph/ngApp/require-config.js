require.config({
	baseUrl: '../ngApp',
	urlArgs: 'time=' + (new Date().getTime()),
	paths: {
		ctrl: '../ngApp/controllers',
		dir: '../ngApp/directives',
		serv: '../ngApp/services',
	}
});

define('main', ['core'], function () { console.log('core.package loaded!'); });

define('services', ['serv/topicRepository'], function () { console.log('services.package loaded!'); });

define('directives', [
	'dir/newTopic',
	'dir/connection-list',
	'dir/link-list',
	'dir/link-types',
	'dir/search-by-title',
	'dir/status-types'], function () { console.log('directives.package loaded!'); });

define('all', ['main', 'services', 'directives'], function () { });