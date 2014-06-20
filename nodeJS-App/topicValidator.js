var Validator = require('jsonschema').Validator;
var v = new Validator();

var topicSchema = {
	"type":"object",
	"required":true,
	"properties":{ 
		"category": { 
			"type":"string", 
			"required":true,
		}, 
		"connections": { 
			"type":"array", 
			"required":true,
			"items": { 
				"type":"object", 
				"required":true 
			}
		}, 
		"created": { 
			"type":"string", 
			"required":false,
		}, 
		"links": { 
			"type":"array", 
			"required":true, 
			"items": { 
				"type":"object", 
				"required":true,
				"properties": { 
					"title": { 
						"type":"string", 
						"required":true,
					}, 
					"type": { 
						"type":"string", 
						"required":true,
					}, 
					"url": { 
						"type":"string", 
						"required":true, 
					} 
				}
			} 
		}, 
		"modified": { 
			"type":"string", 
			"required":false,
		}, 
		"status": { 
			"type":"string", 
			"required":true, 
		}, 
		"title": { 
			"type":"string", 
			"required":true, 
		}, 
		"value": { 
			"type":"string", 
			"required":true, 
		} 
	}
};

var linkSchema = {
	"type":"object", 
	"required":true,
	"properties": { 
		"title": { 
			"type":"string", 
			"required":true,
		}, 
		"type": { 
			"type":"string", 
			"required":true,
		}, 
		"url": { 
			"type":"string", 
			"required":true, 
		} 
	}
};

function validateTopic(topic) {
	var errors = v.validate(topic, topicSchema).errors;
	return errors;
}

function validateLink(link) {
	var errors = v.validate(link, linkSchema).errors;
	return errors;
}

module.exports.topicSchema = { validate: validateTopic };
module.exports.linkSchema = { validate: validateLink };