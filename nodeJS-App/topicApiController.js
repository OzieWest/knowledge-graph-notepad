/* Get last N entry`s of collection
	@count = int
	@offset = int
	@category = string
*/
function getAll (count, offset, category) {
}

/*	Get one entry
	@id = mongo Object
*/
function getById (id) {
}

/*	Add entry to collection
	topic = Topic class
*/
function addTopic(topic) {
}

/*	Update one entry in collection
	@id = mongo Object
	@topic = Topic class
*/
function updateTopic(id, topic){
}

/*	Delete entry from collection
	@id = mongo Object
*/
function deleteTopic(id){
}

/*	Get collection of entry.title
	@ids = array<mongo Object>
*/
function getTitles(ids){
}

/*	Search entry by title in collection
	@titleSubstring = string
*/
function searchTitle(titleSubstring) {
}


/*	Add connections to entries
	@firstId 	= mongo Object
	@secondId 	= mongo Object
*/
function addConnection(firstId, secondId){
}

/*	Delete connections from entries
	@firstId 	= mongo Object
	@secondId 	= mongo Object
*/
function deleteConnection(firstId, secondId){
}


/*	Add link to entry
	@id 	= mongo Object
	@link 	= Link class { id: int, type: string, url: string, title: string }
*/
function addLink(id, link){
}

/*	Delete link from entry
	@id 	= mongo Object
	@idLink = int
*/
function deleteLink(id, idLink){
}