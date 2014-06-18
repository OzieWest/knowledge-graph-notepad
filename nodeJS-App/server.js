// 539d74cfeebbdcc40905b4e0

var v = require('./topicValidator');
var _ = require('underscore');
var topicController = require('./dbfunc');

var mongo = require('mongodb');
var host = '127.0.0.1';
var port = mongo.Connection.DEFAULT_PORT;
var db = new mongo.Db('for-test', new mongo.Server(host, port, {}));

var getDate = function(){
	return new Date().toLocaleString();
};

var createId = function(stringKey){
	return new mongo.ObjectID(stringKey);
}

topicController.setDb(db);
topicController.setCollection('topic');

var id = createId('539d74cfeebbdcc40905b4e0');
var secondId = createId('539d902a5d2de1182034dd39');
var thirdId = createId('539d902a5d2de1182034dd37');

var topic = {
	title: 'search title',
	value: '1',
	category: '1',
	status: '1',
	links: [],
	connections: [],
	modified: getDate(),
};

/*topicController.getAll(5, 0, {}, '', function(err, data) {

	_.each(data, function(elm){
		console.log(elm);
	});
	db.close();
});*/

/*topicController.getById(id, { title: 1 }, function(error, topic){
	console.log(topic);

	db.close();
});*/

/*topicController.addTopic(topic, function(error){
	console.log(error);
	db.close();
});*/

/*topicController.updateTopic(id, topic, function(error, result) {
	console.log(error, result);
	db.close();
});*/

/*topicController.deleteTopic(deleteId, function(error, result){
	console.log(error, result);
	db.close();
});*/

/*topicController.getTitles([id, createId('539d902a5d2de1182034dd37')], { title: 1 }, function(error, result){
	console.log(error, result);
	db.close();
});*/

/*topicController.searchTitle('sea', { title: 1 }, function(error, result) {
	console.log(error, result);
	db.close();
});*/

/*topicController.addConnection(id, thirdId, function(error) {
	console.log(error);
	db.close();
});*/

/*topicController.deleteConnection(id, thirdId, function(error) {
	console.log(error);
	db.close();
});*/

var link = { id: 1, type: 'в ожидании', title: 'вики', url: 'http://google.com' };
/*topicController.addLink(id, link, function(error) {
	console.log(error);
	db.close();
});*/

/*topicController.deleteLink(id, 1, function(error) {
	console.log(error);
	db.close();
});*/

