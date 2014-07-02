function dbFunctions(shortName, version, displayName, maxSize) {

	this.shortName = shortName;
	this.version = version;
	this.displayName = displayName;
	this.maxSize = maxSize;
	var results = [];

	//add functions to object
	this.addEvent = addEvent;
	this.listEventsOfEventType = listEventsOfEventType;
	this.showEvents = showEvents;
	this.editEvent = editEvent;
	this.listHistoryEvents = listHistoryEvents;
	this.showCurrentActivityEventInstances = showCurrentActivityEventInstances;
	this.addFoodEventInstance = addFoodEventInstance;
	this.addActivityEventInstance = addActivityEventInstance;
	this.sendDbData = sendDbData;
	this.updateEventInstance = updateEventInstance;
	this.deleteEventInstance = deleteEventInstance;
	this.updateEventInstance = updateEventInstance;
	this.setBeenSentEvent = setBeenSentEvent;
	this.setBeenSentEventInstance = setBeenSentEventInstance;
	this.setSidEvent = setSidEvent;
	this.setSidEventInstance = setSidEventInstance;
	this.getUserInfo = getUserInfo;
	this.addUser = addUser;
	
	
	//add all the sql queries
	//create statements
	/*
	 * old data model
	var CREATE_EVENT = 'CREATE TABLE IF NOT EXISTS Event(id INTEGER PRIMARY KEY AUTOINCREMENT, sID INTEGER, name TEXT NOT NULL, eventType TEXT NOT NULL, beenSent INTEGER DEFAULT 0, deleted INTEGER DEFAULT 0, timeStamp INTEGER)';
	var CREATE_EVENTINSTANCE = 'CREATE TABLE IF NOT EXISTS EventInstance ( id INTEGER NOT NULL AUTO INCREMENT, DType TEXT DEFAULT NULL, beginTime INTEGER NOT NULL, event INTEGER NOT NULL, PRIMARY KEY (`id`), CONSTRAINT FK_EventInstance_Event FOREIGN KEY (Event) REFERENCES Event (id))';
	
	var CREATE_FOOD_EVENT = 'CREATE TABLE IF NOT EXISTS FoodEventInstance(id INTEGER PRIMARY KEY AUTOINCREMENT, eventID INTEGER, sID INTEGER, event TEXT NOT NULL, amount INTEGER NOT NULL, beginTime INTEGER NOT NULL, beenSent INTEGER DEFAULT 0, deleted INTEGER DEFAULT 0, timeStamp INTEGER, FOREIGN KEY(eventID) REFERENCES Event(id))';
	var CREATE_ACTIVITY_EVENT = 'CREATE TABLE IF NOT EXISTS ActivityEventInstance(id INTEGER PRIMARY KEY AUTOINCREMENT, eventID INTEGER, sID INTEGER, event TEXT NOT NULL, intensity INTEGER NOT NULL, beginTime INTEGER NOT NULL, endTime INTEGER, beenSent INTEGER DEFAULT 0, deleted INTEGER DEFAULT 0, timeStamp INTEGER, FOREIGN KEY(eventID) REFERENCES Event(id))';
	*/
	
	var CREATE_EVENT = 'CREATE TABLE IF NOT EXISTS Event(cid INTEGER PRIMARY KEY AUTOINCREMENT, sid INTEGER, eventType TEXT NOT NULL, name TEXT NOT NULL, beenSent INTEGER DEFAULT 0, deleted INTEGER DEFAULT 0, timeStamp INTEGER)';
	var CREATE_EVENT_INSTANCE = 'CREATE TABLE IF NOT EXISTS EventInstance ( cid INTEGER PRIMARY KEY AUTOINCREMENT, sid INTEGER, Dtype TEXT DEFAULT NULL, beginTime INTEGER NOT NULL, event INTEGER NOT NULL, beenSent INTEGER DEFAULT 0, deleted INTEGER DEFAULT 0, timeStamp INTEGER, CONSTRAINT FK_EventInstance_Event FOREIGN KEY (event) REFERENCES Event (cid))';
	
	var CREATE_FOOD_EVENT = 'CREATE TABLE IF NOT EXISTS FoodEventInstance(cid INTEGER PRIMARY KEY, amount INTEGER NOT NULL, CONSTRAINT FK_FoodEventInstance_id FOREIGN KEY(cid) REFERENCES EventInstance(cid))';
	var CREATE_ACTIVITY_EVENT = 'CREATE TABLE IF NOT EXISTS ActivityEventInstance(cid INTEGER PRIMARY KEY, endTime INTEGER, intensity INTEGER NOT NULL, CONSTRAINT FK_ActivityEventInstance_id FOREIGN KEY(cid) REFERENCES EventInstance(cid))';
	
	var CREATE_USER = 'CREATE TABLE IF NOT EXISTS User(cid INTEGER PRIMARY KEY, email TEXT, pumpId TEXT, password TEXT)';
	//update statements
	var SET_SID_EVENT = 'UPDATE Event SET sid = ? WHERE cid = ?';
	var SET_SID_INSTANCE = 'UPDATE EventInstance SET sid = ? WHERE cid = ?';
	var SET_BEEN_SENT_EVENT_TRUE = 'UPDATE Event SET beenSent = 1 WHERE cid = ?';
	var SET_BEEN_SENT_EVENT_FALSE = 'UPDATE Event SET beenSent = 0, WHERE cid=?';
	var SET_BEEN_SENT_INSTANCE_TRUE = 'UPDATE EventInstance SET beenSent = 1 WHERE cid = ?';
	var SET_BEEN_SENT_INSTANCE_FALSE = 'UPDATE EventInstance SET beenSent = 0 WHERE cid =?';
	var UPDATE_EVENT = 'UPDATE Event SET name=?, eventType =?, beenSent = 0 WHERE cid =?';
	var UPDATE_EVENT_INSTANCE = 'UPDATE EventInstance SET beginTime = ?, beenSent = 0 WHERE cid=?';
	var UPDATE_ACTIVITY = 'UPDATE ActivityEventInstance SET intensity= ?, endTime=? WHERE cid = ?';
	var UPDATE_FOOD = 'UPDATE FoodEventInstance SET amount= ? WHERE cid = ?';
	var DELETE_INSTANCE = 'UPDATE EventInstance SET deleted = 1, beenSent = 0 WHERE cid = ?';
	
	//select statements
	var SELECT_CURRENT_EVENT_INSTANCES = 'SELECT e.beginTime, a.intensity, e.cid, ev.name, a.endTime from Event ev join EventInstance e on ev.cid = e.event join ActivityEventInstance a on a.cid = e.cid WHERE e.deleted = 0 AND a.endTime IS NULL ORDER BY e.beginTime DESC;';
	var SELECT_FOOD_EVENT_INSTANCES = 'SELECT * from Event ev join EventInstance e on ev.cid = e.event join FoodEventInstance f on e.cid = f.cid where e.deleted = 0 ORDER BY e.beginTime DESC;';
	var SELECT_ACTIVITY_EVENT_INSTANCES = 'SELECT * from Event ev join EventInstance e on ev.cid = e.event join ActivityEventInstance a on e.cid = a.cid where e.deleted = 0  AND a.endTime IS NOT NULL ORDER BY e.beginTime DESC;';
	var SELECT_ALL_EVENT_INSTANCES = 'SELECT e.beginTime, a.endtime, f.amount, a.intensity, e.cid, ev.name from Event ev join EventInstance e on ev.cid = e.event left join ActivityEventInstance a on a.cid = e.cid left join FoodEventInstance f on e.cid = f.cid WHERE e.deleted = 0 AND (ev.eventType = "Food" OR a.endTime IS NOT NULL) ORDER BY e.beginTime DESC;';
	var SELECT_ALL_EVENTS = 'SELECT * FROM Event ORDER BY lower(name) ASC;'
	var SELECT_EVENTS_WITH_TYPE = 'SELECT * FROM Event where eventType = ? ORDER BY lower(name) ASC;';
	var SELECT_PARTICULAR_EVENT = 'SELECT * FROM Event where name = ?;';
	var SELECT_USER_INFO = 'SELECT * FROM User';
	
	var SELECT_UNSENT_EVENTS = 'SELECT * FROM Event where beenSent = 0;';
	var SELECT_UNSENT_FOOD_INSTANCES =  'SELECT i.cid, e.sid eventSID, i.beginTime, f.amount, i.sid instanceSID FROM Eventinstance i, FoodEventInstance f, Event e WHERE i.event = e.cid AND i.cid = f.cid AND i.beenSent = 0 AND e.sid IS NOT NULL;';
	var SELECT_UNSENT_ACTIVITY_INSTANCES = 'SELECT * FROM Eventinstance i, ActivityEventInstance a, Event e WHERE i.event = e.cid AND a.cid = e.cid AND i.beenSent = 0 AND endTime IS NOT NULL AND e.sid IS NOT NULL;';
	
	
	//insert statements
	var ADD_INSTANCE = 'INSERT INTO EventInstance(beginTime, event) VALUES (?,?)';
	var ADD_FOOD = 'INSERT INTO FoodEventInstance(cid, amount) VALUES (?,?)';
	var ADD_ACTIVITY = 'INSERT INTO ActivityEventInstance(cid, intensity) VALUES (?,?)';
	var ADD_EVENT = 'INSERT INTO Event(name, eventType) VALUES (?,?)';
	var ADD_USER = 'INSERT INTO User(email, pumpId, password) VALUES (?,?,?)'
	
	if (!window.openDatabase) {
		// not all mobile devices support databases  if it does not, the following alert will display
		// indicating the device will not be albe to run this application
		alert('cannot open database');
		return;
	}

	// this line tries to open the database base locally on the device
	// if it does not exist, it will create it and return a databaseobject stored in variable db
	var db = openDatabase(shortName, version, displayName, maxSize);


	db.transaction(function(tx) {

		//to drop the table
		/*
		tx.executeSql( 'DROP TABLE IF EXISTS Event;',
		[],nullHandler,errorHandler);
		
		
		tx.executeSql( 'DROP TABLE IF EXISTS FoodEventInstance;',
		[],nullHandler,errorHandler);
		
		tx.executeSql( 'DROP TABLE IF EXISTS ActivityEventInstance;',
		[],nullHandler,errorHandler);
		
		tx.executeSql( 'DROP TABLE IF EXISTS EventInstance;',
				[],nullHandler,errorHandler);
		*/

		//create tables if not exist
		
		tx.executeSql( CREATE_USER, [], nullHandler, errorHandler);
		
		tx.executeSql( CREATE_EVENT, [], nullHandler, errorHandler);
		
		tx.executeSql( CREATE_EVENT_INSTANCE, [], nullHandler, errorHandler);
		
		tx.executeSql( CREATE_FOOD_EVENT, [], nullHandler, errorHandler);
		
		
		tx.executeSql( CREATE_ACTIVITY_EVENT, [], nullHandler, errorHandler);
		

	}, errorHandler, successCallBack);

	function executeQuery(query, argumentsTuple, callBackFunction){
		var db = openDatabase(shortName, version, displayName, maxSize);
		db.transaction(function(transaction) {
			transaction.executeSql(query, argumentsTuple, callBackFunction, errorHandler);
		});
	}
	
	function setBeenSentEvent(cid){
		executeQuery(SET_BEEN_SENT_EVENT_TRUE, [cid], nullHandler);
		
	}
	function setBeenSentEventInstance(cid){
		executeQuery(SET_BEEN_SENT_INSTANCE_TRUE, [cid], nullHandler);
	}
	
	
	function setSidEvent(sid, cid){
		executeQuery(SET_SID_EVENT, [sid, cid], nullHandler);
		
	}
	function setSidEventInstance(sid, cid){
		executeQuery(SET_SID_INSTANCE, [sid, cid], nullHandler);
	
	}


/*
	 * This method selects all the records of ActivityEventInstance that are currently running. And calls
	 * showCurrentEvents to insert the info in the DOM
	 */
	function showCurrentActivityEventInstances() {
		executeQuery(SELECT_CURRENT_EVENT_INSTANCES, [], showCurrentEventInstanceActivity);
		
	}
	
	
	/*
	 * This method selects all the EventInstances regarding the given event type. 
	 */
	function listHistoryEvents(type) {
		
		if (type === FOOD) {
			executeQuery(SELECT_FOOD_EVENT_INSTANCES, [], showEventInstanceList);
			

		} else if (type === ACTIVITY) {
			executeQuery(SELECT_ACTIVITY_EVENT_INSTANCES, [], showEventInstanceList);
			
		} else if (type === 'All' || type === null) {
			executeQuery(SELECT_ALL_EVENT_INSTANCES, [], showEventInstanceList);
			
		}

	}
	
	/*
	* This method selects all the events stored in the db
	*/
	function showEvents() {

		executeQuery(SELECT_ALL_EVENTS, [], showEventList);
		
	}
	/*
	 * This method selects all events of a certain eventType
	 */
	function listEventsOfEventType(eventType) {
		executeQuery(SELECT_EVENTS_WITH_TYPE, [eventType], showEventList);

	}
	
	//TODO add new function synchronizeWithServer retrieveRecentChangesFromServer(); sendRecentChangesToServer
	
	/*
	 * This method selects all the data from every table, and calls other methods to send the data to the server
	 */
	function sendDbData() {
		
		var db = openDatabase(shortName, version, displayName, maxSize);
		
		executeQuery(SELECT_UNSENT_EVENTS, [], sendEventsToServer);
		executeQuery(SELECT_UNSENT_FOOD_INSTANCES, [], sendFoodEventInstanceToServer);
		//executeQuery(SELECT_UNSENT_ACTIVITY_INSTANCES, [], sendActivityEventInstance);
		
		
	}
	
	/*
	 * This method edits a certain event, given the eventKey(primary key), the new eventName
	 * and the eventType(which can be altered as well).
	 */
	function editEvent(cid, eventName, eventType){
		executeQuery(UPDATE_EVENT, [eventName, eventType, cid], nullHandler);
		
		
	}
	
	function updateEventInstance(type, amount,beginTime,endTime, cid){
		console.log('update query+'+ type+" "+ amount+" "+beginTime+" "+endTime+" "+ cid)
		executeQuery(UPDATE_EVENT_INSTANCE, [beginTime, cid], nullHandler);
		
		
		if (type === ACTIVITY) {
			executeQuery(UPDATE_ACTIVITY, [amount, endTime, cid], nullHandler);
			
		} else {
			executeQuery(UPDATE_FOOD, [amount, cid], nullHandler);
			
		}
	}
	
	/*
	 * This method sets deleted on 1(true) of the given id and thereby basically
	 * in-activates the record
	 */
	function deleteEventInstance(cid) {
		executeQuery(DELETE_INSTANCE, [cid], nullHandler);
		
		sendDbData();
	}
	
	
	function addFoodEventInstance(event, amount, beginTime, cid) {
		//callback function, inserts values in the extended table (FoodEventInstance)
		var addFoodFunction = function(transaction, result){
			executeQuery(ADD_FOOD, [result.insertId, amount],nullHandler);
		};
		executeQuery(ADD_INSTANCE, [beginTime, cid], addFoodFunction);
		
		sendDbData();
	}

	function addActivityEventInstance(event, intensity, beginTime, cid) {
		//callback function, inserts values in the extended table (ActivityEventInstance)
		var addActivityFunction = function(transaction, result){
			executeQuery(ADD_ACTIVITY, [result.insertId, intensity], nullHandler);
		};
		executeQuery(ADD_INSTANCE, [beginTime, cid], addActivityFunction);
		
		sendDbData();

	}
	
	function addEvent(eventName, eventType) {

		
		var addEventFunction = function(transaction, result){
			if(result.rows.length > 0){
				alert('Event allready exists')
			}
			else{
				executeQuery(ADD_EVENT, [eventName, eventType], nullHandler);

			}
		}

		executeQuery(SELECT_PARTICULAR_EVENT, [eventName], addEventFunction);


	}
	
	function getUserInfo(callback){
		executeQuery(SELECT_USER_INFO, [], callback);
	}
	
	function addUser(email, pumpId, password){
		executeQuery(ADD_USER, [email, pumpId, password], nullHandler);
	}
}