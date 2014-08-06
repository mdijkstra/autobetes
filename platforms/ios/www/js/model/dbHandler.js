function dbHandler(shortName, version, displayName, maxSize) {

	this.shortName = shortName;
	this.version = version;
	this.displayName = displayName;
	this.maxSize = maxSize;
	var results = [];

	//add functions to object
	this.addEvent = addEvent;
	this.serverAddEntity = serverAddEntity;
	this.listEventsOfEventType = listEventsOfEventType;
	this.showEvents = showEvents;
	this.updateEvent = updateEvent;
	this.serverUpdateEntity = serverUpdateEntity;
	this.listHistoryEvents = listHistoryEvents;
	this.showCurrentActivityEventInstances = showCurrentActivityEventInstances;
	this.addEventInstance = addEventInstance;
	this.sendDbData = sendDbData;
	this.updateEventInstance = updateEventInstance;
	this.deleteEventInstance = deleteEventInstance;
	this.deleteEvent = deleteEvent;
	//this.setBeenSentEvent = setBeenSentEvent;
	//this.setBeenSentEventInstance = setBeenSentEventInstance;
	this.setSidEvent = setSidEvent;
	this.setSidEventInstance = setSidEventInstance;
	this.getUserInfo = getUserInfo;
	this.addUser = addUser;
	this.updateUser = updateUser;
	this.getLastUpdateTimeStamp = getLastUpdateTimeStamp;
	this.updateLastUpdateTimeStamp = updateLastUpdateTimeStamp;
	this.getEventsAfterTimeStamp = getEventsAfterTimeStamp;
	this.getActivityEventInstancesAfterTimeStamp = getActivityEventInstancesAfterTimeStamp;
	this.getFoodEventInstancesAfterTimeStamp = getFoodEventInstancesAfterTimeStamp;
	this.getEntityWithSId = getEntityWithSId;
	this.getEntityWithCId = getEntityWithCId;
	this.updateEmailAndPassword = updateEmailAndPassword;
	this.resetDBExceptUserTable = resetDBExceptUserTable;
	
	
	
	//add all the sql queries
	//create statements
	/*
	 * old data model
	var CREATE_EVENT = 'CREATE TABLE IF NOT EXISTS Event(id INTEGER PRIMARY KEY AUTOINCREMENT, sId INTEGER, name TEXT NOT NULL, eventType TEXT NOT NULL, beenSent INTEGER DEFAULT 0, deleted INTEGER DEFAULT 0, timeStamp INTEGER)';
	var CREATE_EVENTINSTANCE = 'CREATE TABLE IF NOT EXISTS EventInstance ( id INTEGER NOT NULL AUTO INCREMENT, DType TEXT DEFAULT NULL, beginTime INTEGER NOT NULL, event INTEGER NOT NULL, PRIMARY KEY (`id`), CONSTRAINT FK_EventInstance_Event FOREIGN KEY (Event) REFERENCES Event (id))';
	
	var CREATE_FOOD_EVENT_INSTANCE = 'CREATE TABLE IF NOT EXISTS FoodEventInstance(id INTEGER PRIMARY KEY AUTOINCREMENT, eventID INTEGER, sId INTEGER, event TEXT NOT NULL, amount INTEGER NOT NULL, beginTime INTEGER NOT NULL, beenSent INTEGER DEFAULT 0, deleted INTEGER DEFAULT 0, timeStamp INTEGER, FOREIGN KEY(eventID) REFERENCES Event(id))';
	var CREATE_ACTIVITY_EVENT_INSTANCE = 'CREATE TABLE IF NOT EXISTS ActivityEventInstance(id INTEGER PRIMARY KEY AUTOINCREMENT, eventID INTEGER, sID INTEGER, event TEXT NOT NULL, intensity INTEGER NOT NULL, beginTime INTEGER NOT NULL, endTime INTEGER, beenSent INTEGER DEFAULT 0, deleted INTEGER DEFAULT 0, timeStamp INTEGER, FOREIGN KEY(eventID) REFERENCES Event(id))';
	*/
	
	var CREATE_EVENT = 'CREATE TABLE IF NOT EXISTS Event(cId INTEGER PRIMARY KEY AUTOINCREMENT, sId INTEGER, eventType TEXT NOT NULL, name TEXT NOT NULL, deleted INTEGER DEFAULT 0, lastchanged INTEGER NOT NULL)';
	
	
	var CREATE_EVENT_INSTANCE = 'CREATE TABLE IF NOT EXISTS EventInstance ( cId INTEGER PRIMARY KEY AUTOINCREMENT, sId INTEGER, Dtype TEXT DEFAULT NULL, beginTime INTEGER NOT NULL, cEvent INTEGER NOT NULL, sEvent INTEGER, deleted INTEGER DEFAULT 0, lastchanged INTEGER NOT NULL, CONSTRAINT FK_EventInstance_Event FOREIGN KEY (cEvent) REFERENCES Event (cId))';
	var CREATE_FOOD_EVENT_INSTANCE = 'CREATE TABLE IF NOT EXISTS FoodEventInstance(cId INTEGER PRIMARY KEY, amount INTEGER NOT NULL, CONSTRAINT FK_FoodEventInstance_id FOREIGN KEY(cId) REFERENCES EventInstance(cId))';
	var CREATE_ACTIVITY_EVENT_INSTANCE = 'CREATE TABLE IF NOT EXISTS ActivityEventInstance(cId INTEGER PRIMARY KEY, endTime INTEGER, intensity INTEGER NOT NULL, CONSTRAINT FK_ActivityEventInstance_id FOREIGN KEY(cId) REFERENCES EventInstance(cId))';
	
	var CREATE_USER = 'CREATE TABLE IF NOT EXISTS User(cId INTEGER PRIMARY KEY, email TEXT, pumpId TEXT, password TEXT)';
	var CREATE_LAST_UPDATE = 'CREATE TABLE IF NOT EXISTS LastUpdate(cId INTEGER PRIMARY KEY, lastchanged INTEGER NOT NULL)';
	
		//update statements
	var SET_SID_EVENT = 'UPDATE Event SET sId = ? WHERE cId = ?';
	var SET_SID_INSTANCE = 'UPDATE EventInstance SET sId = ? WHERE cId = ?';
	//var SET_BEEN_SENT_EVENT_TRUE = 'UPDATE Event SET beenSent = 1 WHERE cId = ?';
	//var SET_BEEN_SENT_EVENT_FALSE = 'UPDATE Event SET beenSent = 0, WHERE cId=?';
	//var SET_BEEN_SENT_INSTANCE_TRUE = 'UPDATE EventInstance SET beenSent = 1 WHERE cId = ?';
	//var SET_BEEN_SENT_INSTANCE_FALSE = 'UPDATE EventInstance SET beenSent = 0 WHERE cId =?';
	
	var UPDATE_EVENT = 'UPDATE Event SET name=?, eventType =?, lastchanged=? WHERE cId =?';
	var UPDATE_EVENT_INSTANCE = 'UPDATE EventInstance SET beginTime = ?, lastchanged=? WHERE cId=?';
	var SERVER_UPDATE_EVENT = 'UPDATE Event SET sId=?, name=?, eventType =?, lastchanged=?, deleted=? WHERE cId =?';
	var SERVER_UPDATE_INSTANCE = 'UPDATE EventInstance SET sId = ?, sEvent = ?, beginTime = ?, deleted=?, lastchanged=? WHERE cId=?';
	
	var UPDATE_ACTIVITY_INSTANCE = 'UPDATE ActivityEventInstance SET intensity= ?, endTime=? WHERE cId = ?';
	var UPDATE_FOOD_INSTANCE = 'UPDATE FoodEventInstance SET amount= ? WHERE cId = ?';
	var DELETE_INSTANCE = 'UPDATE EventInstance SET deleted = 1, lastchanged=? WHERE cId = ?';
	var DELETE_EVENT = 'UPDATE Event SET deleted = 1, lastchanged=? WHERE cId = ?';
	var EDIT_USER = 'UPDATE User SET email = ?,pumpId = ?, password = ? WHERE cId = 1';
	var UPDATE_EMAIL_AND_PASSWORD = 'UPDATE User SET email = ?, password = ? WHERE cId = 1';
	var EDIT_LAST_UPDATE_TIMESTAMP = 'UPDATE LastUpdate SET lastchanged = ? WHERE cId = 1';
	
	
	//select statements
	var SELECT_LAST_UPDATE_TIMESTAMP = 'SELECT lastchanged FROM LastUpdate WHERE cId = 1';
	var SELECT_CURRENT_EVENT_INSTANCES = 'SELECT e.beginTime, a.intensity, e.cId, ev.name, a.endTime from Event ev join EventInstance e on ev.cId = e.cEvent join ActivityEventInstance a on a.cId = e.cId WHERE e.deleted = 0 AND a.endTime IS NULL AND ev.deleted = 0 ORDER BY e.beginTime DESC;';
	var SELECT_FOOD_EVENT_INSTANCES = 'SELECT * from Event ev join EventInstance e on ev.cId = e.cEvent join FoodEventInstance f on e.cId = f.cId where e.deleted = 0 AND ev.deleted = 0 ORDER BY e.beginTime DESC;';
	var SELECT_ACTIVITY_EVENT_INSTANCES = 'SELECT * from Event ev join EventInstance e on ev.cId = e.cEvent join ActivityEventInstance a on e.cId = a.cId where e.deleted = 0  AND a.endTime IS NOT NULL AND ev.deleted = 0 ORDER BY e.beginTime DESC;';
	var SELECT_ALL_EVENT_INSTANCES = 'SELECT e.beginTime, a.endtime, f.amount, a.intensity, e.cId, ev.name from Event ev join EventInstance e on ev.cId = e.cEvent left join ActivityEventInstance a on a.cId = e.cId left join FoodEventInstance f on e.cId = f.cId WHERE e.deleted = 0 AND (ev.eventType = "Food" OR a.endTime IS NOT NULL) AND ev.deleted = 0 ORDER BY e.beginTime DESC;';
	var SELECT_ALL_EVENTS = 'SELECT * FROM Event WHERE deleted=0 ORDER BY lower(name) ASC;'
	var SELECT_EVENTS_AFTER_TIMESTAMP = 'SELECT * FROM Event where lastchanged > ?;'
	var SELECT_ACTIVITY_EVENT_INSTANCES_AFTER_TIMESTAMP = 'SELECT * from EventInstance e join ActivityEventInstance a on e.cId = a.cId where e.lastchanged > ?;';
	var SELECT_FOOD_EVENT_INSTANCES_AFTER_TIMESTAMP = 'SELECT * from EventInstance e  join FoodEventInstance f on e.cId = f.cId where e.lastchanged > ?;';
	var SELECT_EVENTS_WITH_TYPE = 'SELECT * FROM Event where eventType = ? ORDER BY lower(name) ASC;';
	var SELECT_PARTICULAR_EVENT = 'SELECT * FROM Event where name = ? and deleted=0;';
	var SELECT_USER_INFO = 'SELECT * FROM User LIMIT 1';
	//var SELECT_UNSENT_EVENTS = 'SELECT * FROM Event where beenSent = 0;';
	//var SELECT_UNSENT_FOOD_INSTANCES =  'SELECT i.cId, e.sId eventSID, i.beginTime, f.amount, i.sId instanceSID FROM Eventinstance i, FoodEventInstance f, Event e WHERE i.cEvent = e.cId AND i.cId = f.cId AND i.beenSent = 0 AND e.sId IS NOT NULL;';
	//var SELECT_UNSENT_ACTIVITY_INSTANCES = 'SELECT * FROM Eventinstance i, ActivityEventInstance a, Event e WHERE i.cEvent = e.cId AND a.cId = e.cId AND i.beenSent = 0 AND endTime IS NOT NULL AND e.sId IS NOT NULL;';
	
	var SELECT_EVENT_WITH_SID = 'SELECT * FROM Event WHERE sId=?';
	var SELECT_EVENT_INSTANCE_WITH_SID = 'SELECT * FROM EventInstance WHERE sId=?';
	var SELECT_EVENT_WITH_CID = 'SELECT * FROM Event WHERE cId=?';
	var SELECT_EVENTINSTANCE_WITH_CID = 'SELECT * FROM EventInstance WHERE cId=?';
	var GET_CEVENT_WITH_SEVENT = 'SELECT cId FROM Event where sId=?';
		
	//insert statements
	var ADD_INSTANCE = 'INSERT INTO EventInstance(beginTime, cEvent, sEvent, lastchanged) VALUES (?,?,?,?)';
	var ADD_FOOD_INSTANCE = 'INSERT INTO FoodEventInstance(cId, amount) VALUES (?,?)';
	var ADD_ACTIVITY_INSTANCE = 'INSERT INTO ActivityEventInstance(cId, intensity) VALUES (?,?)';
	var ADD_EVENT = 'INSERT INTO Event(name, eventType,lastchanged) VALUES (?,?,?)';
	var ADD_USER = 'INSERT INTO User(cId, email, pumpId, password) VALUES (1,?,?,?)';
	var ADD_LAST_UPDATE_TIMESTAMP = 'INSERT INTO LastUpdate(cId, lastchanged) VALUES(1,0)';
	var SERVER_ADD_EVENT = 'INSERT INTO Event(sId, name, eventType, deleted, lastchanged) VALUES(?,?,?,?,?)';
	var SERVER_ADD_EVENT_INSTANCE = 'INSERT INTO EventInstance(sId, sEvent, cEvent, beginTime, deleted, lastchanged) VALUES(?,?,?,?,?,?)';
	var ADD_ACTIVITY_INSTANCE_WITH_ENDTIME = 'INSERT INTO ActivityEventInstance(cId, intensity, endTime) VALUES (?,?,?)';
	
	
	if (!window.openDatabase) {
		// not all mobile devices support databases  if it does not, the following alert will display
		// indicating the device will not be albe to run this application
		showMessageDialog("", CANNOT_OPEN_DATABASE);
		return;
	}

	// this line tries to open the database base locally on the device
	// if it does not exist, it will create it and return a databaseobject stored in variable db
	var db = openDatabase(shortName, version, displayName, maxSize);
	
	//resetDB();
	createTablesIfNotExists();

	function executeQuery(query, argumentsTuple, callBackFunction){
		
		db.transaction(function(transaction) {
			transaction.executeSql(query, argumentsTuple, callBackFunction, errorHandler);
		});
		
	}
	
	function resetDB(){
		executeQuery( 'DROP TABLE IF EXISTS User;', [], nullHandler);
					 
		executeQuery( 'DROP TABLE IF EXISTS LastUpdate;', [], nullHandler);
					
		executeQuery( 'DROP TABLE IF EXISTS Event;', [], nullHandler);
					
					
		executeQuery( 'DROP TABLE IF EXISTS FoodEventInstance;', [], nullHandler);
					
		executeQuery( 'DROP TABLE IF EXISTS ActivityEventInstance;', [], nullHandler);
					
		executeQuery( 'DROP TABLE IF EXISTS EventInstance;', [], nullHandler);
		
		createTablesIfNotExists();
	}
	
	function createTablesIfNotExists(){
		//create tables if not exist
		
		executeQuery( CREATE_LAST_UPDATE, [], nullHandler);
		
		executeQuery( CREATE_USER, [], nullHandler);
		
		executeQuery( CREATE_EVENT, [], nullHandler);
		
		executeQuery( CREATE_EVENT_INSTANCE, [], nullHandler);
		
		executeQuery( CREATE_FOOD_EVENT_INSTANCE, [], nullHandler);

		executeQuery( CREATE_ACTIVITY_EVENT_INSTANCE, [], nullHandler);
		

		executeQuery( SELECT_LAST_UPDATE_TIMESTAMP, [], function(transaction,result){
			if(result.rows.length === 0){
				//table contains no value
				//create null timestamp so it can be modified later
				executeQuery( ADD_LAST_UPDATE_TIMESTAMP, [], nullHandler);
			}
			else{
				//table contains value
			}
		});
		
		executeQuery( SELECT_USER_INFO, [], function(transaction,result){
			if(result.rows.length === 0){
				//table contains no value
				//create null user so it can be modified later
				addUser(null, null, null);
			}
			else{
				//table contains value
			}
		});
		
	}
	
	function resetDBExceptUserTable(){
					 
		executeQuery( 'DROP TABLE IF EXISTS LastUpdate;', [], nullHandler);
					
		executeQuery( 'DROP TABLE IF EXISTS Event;', [], nullHandler);
					
					
		executeQuery( 'DROP TABLE IF EXISTS FoodEventInstance;', [], nullHandler);
					
		executeQuery( 'DROP TABLE IF EXISTS ActivityEventInstance;', [], nullHandler);
					
		executeQuery( 'DROP TABLE IF EXISTS EventInstance;', [], nullHandler);
		
		createTablesIfNotExists();
	}
	/*
	function setBeenSentEvent(cId){
		executeQuery(SET_BEEN_SENT_EVENT_TRUE, [cId], synchronise);
		
	}
	function setBeenSentEventInstance(cId){
		executeQuery(SET_BEEN_SENT_INSTANCE_TRUE, [cId], nullHandler);
	}
	*/
	
	function setSidEvent(sId, cId){
		executeQuery(SET_SID_EVENT, [sId, cId], nullHandler);
		
	}
	function setSidEventInstance(sId, cId){
		executeQuery(SET_SID_INSTANCE, [sId, cId], nullHandler);
	
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
			
		} else if (type === ALL || type === null) {
			executeQuery(SELECT_ALL_EVENT_INSTANCES, [], showEventInstanceList);
			
		}

	}
	
	/*
	* This method selects all the events stored in the db
	*/
	function showEvents() {

		executeQuery(SELECT_ALL_EVENTS, [], showEventList);
		
	}
	function getEventsAfterTimeStamp(lastchanged, callback) {

		executeQuery(SELECT_EVENTS_AFTER_TIMESTAMP, [lastchanged], callback);
		
	}
	function getActivityEventInstancesAfterTimeStamp(lastchanged, callback) {
		executeQuery(SELECT_ALL_EVENT_INSTANCES, [], function(transaction, result){
			console.log(result);
			for (var i = 0; i < result.rows.length; i++) {
				var row = result.rows.item(i);
				console.log(row);
			}
		});
		executeQuery(SELECT_ACTIVITY_EVENT_INSTANCES_AFTER_TIMESTAMP, [lastchanged], callback);
		
	}
	function getFoodEventInstancesAfterTimeStamp(lastchanged, callback) {

		executeQuery(SELECT_FOOD_EVENT_INSTANCES_AFTER_TIMESTAMP, [lastchanged], callback);
		
	}
	
	function getEntityWithSId(sId, entityType, callback){
		if(entityType === EVENT){
			executeQuery(SELECT_EVENT_WITH_SID, [sId], callback);
		}
		else{
			executeQuery(SELECT_EVENT_INSTANCE_WITH_SID, [sId], callback)
		}
	}

	
	function getEntityWithCId(cId, entityType, callback){
		if(entityType === INSTANCE){
			executeQuery(SELECT_EVENTINSTANCE_WITH_CID, [cId], callback)
		}
		else{
			executeQuery(SELECT_EVENT_WITH_CID, [cId], callback);
		}
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
		
		//var db = openDatabase(shortName, version, displayName, maxSize);
		
		//executeQuery(SELECT_UNSENT_EVENTS, [], sendEventsToServer);
		//executeQuery(SELECT_UNSENT_FOOD_INSTANCES, [], sendFoodEventInstanceToServer);
		//executeQuery(SELECT_UNSENT_ACTIVITY_INSTANCES, [], sendActivityEventInstance);
		
	}
	
	/*
	 * This method edits a certain event, given the eventKey(primary key), the new eventName
	 * and the eventType(which can be altered as well).
	 */
	function updateEvent(cId, eventName, eventType){
		executeQuery(UPDATE_EVENT, [eventName, eventType, getCurrentTimestamp(),cId], synchronise);
		
		
	}
	
	function updateEventInstance(type, amount,beginTime,endTime, cId){
		executeQuery(UPDATE_EVENT_INSTANCE, [beginTime, getCurrentTimestamp(), cId], synchronise);
		
		
		if (type === ACTIVITY) {
			executeQuery(UPDATE_ACTIVITY_INSTANCE, [amount, endTime, cId], nullHandler);
			
		} else {
			executeQuery(UPDATE_FOOD_INSTANCE, [amount, cId], nullHandler);
			
		}
	}
	

	
	function serverUpdateEntity(entityType, entity, row){//sId, sEvent, type, amount,beginTime,endTime, deleted, timeStampLastChanged, cId
		
		if(entityType === EVENT){
			executeQuery(SERVER_UPDATE_EVENT, [entity.sId, entity.name, entity.eventType, entity.lastchanged, entity.deleted, row.cId], nullHandler);
		}
		
		else{
		executeQuery(SERVER_UPDATE_INSTANCE, [entity.sId, entity.sEvent, entity.beginTime, entity.deleted, entity.lastchanged, row.cId], nullHandler);
		
		if (entity.intensity) {
			executeQuery(UPDATE_ACTIVITY_INSTANCE, [entity.intensity, entity.endTime, row.cId], nullHandler);
			
		} else {
			executeQuery(UPDATE_FOOD_INSTANCE, [entity.amount, row.cId], nullHandler);
			
		}
		}
	}
	/*
	 * This method sets deleted on 1(true) of the given id and thereby basically
	 * in-activates the record
	 */
	function deleteEventInstance(cId) {
		executeQuery(DELETE_INSTANCE, [getCurrentTimestamp(), cId], synchronise);
		
		
	}
	
	/*
	 * This method sets deleted on 1(true) of the given id and thereby basically
	 * in-activates the record
	 */
	function deleteEvent(cId) {
		executeQuery(DELETE_EVENT, [getCurrentTimestamp(), cId], synchronise);
		
		
	}
	
	
	function addEventInstance(quantity, beginTime, cId, eventType) {
		
		getEntityWithCId(cId, EVENT, function(transaction, result){
			var row = result.rows.item(0);
			//callback function, inserts values in the extended table (FoodEventInstance)
			var addFoodFunction = function(transaction, result){
				executeQuery(ADD_FOOD_INSTANCE, [result.insertId, quantity],synchronise);
			};
			var addActivityFunction = function(transaction, result){
				executeQuery(ADD_ACTIVITY_INSTANCE, [result.insertId, quantity],synchronise);
			};
			if(eventType === FOOD){
				executeQuery(ADD_INSTANCE, [beginTime, cId, row.sId, getCurrentTimestamp()], addFoodFunction);
			}
			else{
				executeQuery(ADD_INSTANCE, [beginTime, cId, row.sId, getCurrentTimestamp()], addActivityFunction);
			}
		});
		
		
		
	}

	function serverAddEntity(entityType,entity){ //sId, sEvent, type, beginTime, endTime, intensity, deleted, lastchanged
		
		if(entityType === EVENT){
			
			
			executeQuery(SERVER_ADD_EVENT, [entity.sId, entity.name, entity.eventType, entity.deleted, entity.lastchanged], null);
		}
		else{
		//console.log("sid is:"+ sId);
		var getCEVENTFunction = function(transaction, result){
			if(result.rows.length === 0){
				//error, no cEvent found
				
			}
			else{
				
				var cEvent = result.rows.item(0).cId;
				
				if (entity.intensity) {
					var addActivityFunction = function(transaction, result){
						executeQuery(ADD_ACTIVITY_INSTANCE_WITH_ENDTIME, [result.insertId, entity.intensity, entity.endTime], nullHandler);
					};
					
					executeQuery(SERVER_ADD_EVENT_INSTANCE, [entity.sId, entity.sEvent, entity.cEvent, entity.beginTime, entity.deleted, entity.lastchanged], addActivityFunction);
				}
				else{
					var addFoodFunction = function(transaction, result){
						executeQuery(ADD_FOOD_INSTANCE, [result.insertId, entity.amount],nullHandler);
					};
					
					executeQuery(SERVER_ADD_EVENT_INSTANCE, [entity.sId, entity.sEvent, cEvent, entity.beginTime, entity.deleted, entity.lastchanged], addFoodFunction);
				}
			}
		}
		
		executeQuery(GET_CEVENT_WITH_SEVENT, [entity.sEvent], getCEVENTFunction);
		}
		
	}
	
	function addEvent(eventName, eventType) {
		
		
		var addEventFunction = function(transaction, result){
			if(result.rows.length > 0){
				showMessageDialog("", eventName+ ALLREADY_EXISTS);
			}
			else{
				executeQuery(ADD_EVENT, [eventName, eventType, getCurrentTimestamp()], synchronise);

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
	
	function updateUser(email, pumpId, password){
		executeQuery(EDIT_USER, [email, pumpId, password], nullHandler);
	}
	function updateEmailAndPassword(email, password, callback){
		executeQuery(UPDATE_EMAIL_AND_PASSWORD, [email, password], callback);
	}
	
	function getLastUpdateTimeStamp(callback){
		executeQuery(SELECT_LAST_UPDATE_TIMESTAMP,[],callback);
	}
	
	function updateLastUpdateTimeStamp(lastchanged){
		executeQuery(EDIT_LAST_UPDATE_TIMESTAMP, [lastchanged], nullHandler);
	}
	function updateEventIfServerTimeStampIsGreater(){
		
	}
	function updateEventInstanceIfServerTimeStampIsGreater(){
	
	}
	function getCurrentTimestamp(){
		return new Date().getTime();
		
	}
}