var _ = require('underscore');
var topicSchema = require('./topicValidator').topicSchema;
var linkSchema = require('./topicValidator').linkSchema;

function onError(error){
	if(error){
		console.log(error);
		return true;
	}

	return false;
}

var db = {};
var collectionName = '';


/*	Set mongo db
*/
module.exports.setDb = function(dBase) {
	db = dBase
};


/*	Set collection name
	@name = string
*/
module.exports.setCollection = function(name) {
	collectionName = name;
};

module.exports.close = function() {
	db.close();
};


/* Open db connection and get collection
*/
function openDb (fnCollection){
	db.open(function(error){
		if(!onError(error)) {
			console.log('We are connected!');

			db.collection(collectionName, function (error, collection) {
				if(!onError(error)) {
					fnCollection(collection);
				}
			});
		}
	});
};


/* 	Get last N entry`s of collection
	
	@count = int
	@offset = int
	@fields = Object - example { title: 1, value: 1 }
	@category = string
	@fn = function(err, array)
*/
function getAll (count, offset, fields, category, fn) {

	openDb(function (collection){
			
		collection.find({}, 
		{
			limit: count, 
			skip: offset,
			fields: fields
		}).toArray(fn);

	});
}
module.exports.getAll = getAll;


/*	Get entry by ID
	@id = mongo Object
	@fn = function(err, topic)	
*/
function getById (id, fields, fn) {
	openDb(function (collection){
		collection.findOne({ _id: id }, { fields: fields }, fn);
	});
}
module.exports.getById = getById;


/*	Add entry to collection
	@topic = Topic class
	@fn = function(error = array)
*/
function addTopic(topic, fn) {
	var errors = topicSchema.validate(topic);

	if(errors.length != 0){
		fn(errors);
	}
	else {
		topic.created = new Date().toLocaleString();
		openDb(function (collection){
			collection.insert(topic, fn(null));
		});
	}
}
module.exports.addTopic = addTopic;


/*	Update one entry in collection
	@id = mongo Object
	@topic = Topic class
	@fn = function(error, result)
*/
function updateTopic(id, topic, fn) {
	var errors = topicSchema.validate(topic);
	if(errors.length != 0) {
		fn(errors, null);
	}
	else {
		topic.modified = new Date().toLocaleString();

		openDb(function (collection){
			collection.update(
				{ _id: id }, 
				{ $set: topic }
			);
			fn(null, true);
		});
	}
}
module.exports.updateTopic = updateTopic;


/*	Delete entry from collection
	@id = mongo Object
	@fn = function(error, result = int)
*/
function deleteTopic(id, fn){
	openDb(function (collection){
		collection.remove(
			{ _id: id }, 
			{ w: 1 },
			fn
		);
	});
}
module.exports.deleteTopic = deleteTopic;


/*	Get collection of entry.title
	@ids = array<mongo Object>
	@fields = Object: example { title: 1 }
	@fn = function(error, result = array)
*/
function getTitles(ids, fields, fn) {
	openDb(function (collection){
		collection.find({ _id: { $in: ids } }, { fields: fields }).toArray(fn);
	});
}
module.exports.getTitles = getTitles;


/*	Search entry by title in collection
	@substring = string
	@fields = Object: example { title: 1 }
	@fn = function(error, result = array)
*/
function searchTitle(substring, fields, fn) {
	openDb(function (collection) {
		collection.find({ title: new RegExp(substring) }, { fields: fields }).toArray(fn);
	});
}
module.exports.searchTitle = searchTitle;


/*	Add connections to entries
	@firstId 	= mongo Object
	@secondId 	= mongo Object
	@fn = function(error)
*/
function addConnection(firstId, secondId, fn) {
	openDb(function (collection){

		var firstQuery = { _id: firstId };
		var firstAction = { $addToSet: { connections: secondId } };
		
		collection.update(firstQuery, firstAction, {}, function(error, result) {
			if(error)
				fn(error, result);
			else{
				var secondQuery = { _id: secondId };
				var secondAction = { $addToSet: { connections: firstId } };
				collection.update(secondQuery, secondAction, {}, fn);
			}
		});
	});
}
module.exports.addConnection = addConnection;


/*	Delete connections from entries
	@firstId 	= mongo Object
	@secondId 	= mongo Object
	@fn = function(error)
*/
function deleteConnection(firstId, secondId, fn) {
	openDb(function (collection){

		var firstQuery = { _id: firstId };
		var firstAction = { $pop: { connections: secondId } };
		
		collection.update(firstQuery, firstAction, {}, function(error, result) {
			if(error)
				fn(error, result);
			else{
				var secondQuery = { _id: secondId };
				var secondAction = { $pop: { connections: firstId } };
				collection.update(secondQuery, secondAction, {}, fn);
			}
		});
	});
}
module.exports.deleteConnection = deleteConnection;


/*	Add link to entry
	@id 	= mongo Object
	@link 	= Link class { id: int, type: string, url: string, title: string }
	@fn = function(error)
*/
function addLink(id, link, fn) {
	var errors = linkSchema.validate(link);
	if(errors.length != 0){
		fn(errors);
	}
	else {
		openDb(function (collection){
			var query = { _id: id };
			var action = { $addToSet: { links: link } };
			collection.update(query, action, {}, fn);
		});
	}
}
module.exports.addLink = addLink;


/*	Delete link from entry
	@id 	= mongo Object
	@idLink = int
	@fn = function(error)
*/
function deleteLink(id, idLink, fn) {
	if(idLink == 0 || id == 0){
		fn(errors);
	}
	else {
		openDb(function (collection){
			var query = { _id: id };
			var action = { $pull: { 'links': { id: idLink }}};
			collection.update(query, action, {}, fn);
		});
	}
}
module.exports.deleteLink = deleteLink;