var _ = require('underscore');
var bodyParser = require('body-parser');
var logger = require('morgan');
var express = require('express');
var v = require('./topicValidator');
var repo = require('./topicApiController');
var mongo = require('mongodb');

var host = '127.0.0.1';
var port = mongo.Connection.DEFAULT_PORT;
var db = new mongo.Db('for-test', new mongo.Server(host, port, {}));

repo.setDb(db);
repo.setCollection('topic');

var app = express();

app.use(express.static(__dirname + '/public'));
app.use(logger('dev'));
app.use(bodyParser.json())

// Get all topics ---------------------------------------------------
app.get('/api/topics', function(req, resp){
	var query = req.query;

	var count = query.count || 10;
	var offset = query.offset || 0;
	var category = query.category || '';

	var fields = getFields(query.fields);

	repo.getAll(count, offset, fields, category, function(error, array) {
		db.close();
		if(error)
			resp.send(error, 400);
		else
			resp.send(array, 200);
	});
});

// Get topic by ID ---------------------------------------------------
app.get('/api/topics/:id', function(req, resp){

	var id = createId(req.params.id);
	if(_.isEmpty(id)) {
		resp.send({ Message: 'Bad parameter: id' }, 400);
		return;
	}

	var fields = getFields(req.query.fields);

	repo.getById(id, fields, function(error, result) {
		db.close();

		if(error) {
			resp.send(error, 400);
			return;
		}

		if(_.isEmpty(result)){
			resp.send({ Message: 'Not found' }, 404);
			return;
		}

		resp.send(result, 200);
	});
});

// Add topic ---------------------------------------------------
app.post('/api/topics', function(req, resp) {
	var body = req.body;

	repo.addTopic(body, function(error, result) {
		db.close();
		if(error)
			resp.send(error, 400);
		else
			resp.send(result, 201);
	});
});

// Update topic ---------------------------------------------------
app.put('/api/topics/:id', function(req, resp) {
	
	var id = createId(req.params.id);
	if(_.isEmpty(id)) {
		resp.send({ Message: 'Bad parameter: id' }, 400);
		return;
	}

	var topic = req.body;
	repo.updateTopic(id, topic, function(error, result) {
		db.close();
		if(error)
			resp.send(error, 400);
		else
			resp.send(result, 200);
	});		
});

// ---------------------------------------------------
app.get('*', function(req, resp){
	var body = 'Default request!';
	resp.setHeader('Content-Type', 'text/html');
	resp.setHeader('Content-Length', body.length);
	resp.send(body);
});
app.listen(3000);
console.log('Server is running...');

//var id = createId('539d74cfeebbdcc40905b4e0');

/*var id = createId('539d74cfeebbdcc40905b4e0');
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

repo.getAll(5, 0, {}, '', function(err, data) {

	_.each(data, function(elm){
		console.log(elm);
	});
	db.close();
});*/

/*repo.getById(id, {}, function(error, topic){
	console.log(topic);

	db.close();
});*/

/*repo.addTopic(topic, function(error){
	console.log(error);
	db.close();
});*/

/*repo.updateTopic(id, topic, function(error, result) {
	console.log(error, result);
	db.close();
});*/

/*repo.deleteTopic(deleteId, function(error, result){
	console.log(error, result);
	db.close();
});*/

/*repo.getTitles([id, createId('539d902a5d2de1182034dd37')], { title: 1 }, function(error, result){
	console.log(error, result);
	db.close();
});*/

/*repo.searchTitle('sea', { title: 1 }, function(error, result) {
	console.log(error, result);
	db.close();
});*/

/*repo.addConnection(id, thirdId, function(error) {
	console.log(error);
	db.close();
});*/

/*repo.deleteConnection(id, thirdId, function(error) {
	console.log(error);
	db.close();
});*/

//var link = { id: 1, type: 'в ожидании', title: 'вики', url: 'http://google.com' };
/*repo.addLink(id, link, function(error) {
	console.log(error);
	db.close();
});*/

/*repo.deleteLink(id, 1, function(error) {
	console.log(error);
	db.close();
});*/

var getDate = function(){
	return new Date().toLocaleString();
};

var createId = function(stringKey){
	var id = {};
	try {
		id = new mongo.ObjectID(stringKey);	
	}
	catch (e) {
	}
	return id;
};

var getFields = function(str) {
	var tempFields = (str || '').split('.');
	var fields = {};
	_.each(tempFields, function(e) {
		fields[e] = 1;
	});
	return fields;
};