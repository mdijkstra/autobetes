function dbHandler(shortName, version, displayName, maxSize) {

	this.shortName = shortName;
	this.version = version;
	this.displayName = displayName;
	this.maxSize = maxSize;
	var results = [];

	//add functions to object
	this.addEvent = addEvent;
	this.listEventsOfEventType = listEventsOfEventType;
	this.showEvents = showEvents;
	this.updateEvent = updateEvent;
	this.listHistoryEvents = listHistoryEvents;
	this.showCurrentActivityEventInstances = showCurrentActivityEventInstances;
	this.addEventInstance = addEventInstance;
	this.updateEventInstance = updateEventInstance;
	this.deleteEventInstance = deleteEventInstance;
	this.deleteEvent = deleteEvent;
	this.getUserInfo = getUserInfo;
	this.addUser = addUser;
	this.updateUser = updateUser;
	this.getLastUpdateTimeStamp = getLastUpdateTimeStamp;
	this.updateLastUpdateTimeStamp = updateLastUpdateTimeStamp;
	this.getEventsAfterTimeStamp = getEventsAfterTimeStamp;
	this.getActivityEventInstancesAfterTimeStamp = getActivityEventInstancesAfterTimeStamp;
	this.getFoodEventInstancesAfterTimeStamp = getFoodEventInstancesAfterTimeStamp;
	this.updateEmailAndPassword = updateEmailAndPassword;
	this.resetDBExceptUserTable = resetDBExceptUserTable;
	this.getParticularEvent = getParticularEvent;
	this.getParticularEventInstance = getParticularEventInstance;
	this.serverProcessEvent = serverProcessEvent;
	this.serverProcessEventInstance = serverProcessEventInstance;

	var ID_STRING_LENGTH = 10;//length of the string of an id
	//add all the sql queries
	//create statements
	var CREATE_EVENT = 'CREATE TABLE IF NOT EXISTS Event(id TEXT PRIMARY KEY UNIQUE, eventType TEXT NOT NULL, name TEXT NOT NULL, deleted INTEGER DEFAULT 0, lastchanged INTEGER NOT NULL)';
	var CREATE_FOOD_EVENT = 'CREATE TABLE IF NOT EXISTS FoodEvent(id TEXT PRIMARY KEY UNIQUE, alcoholicUnits INTEGER, carbs INTEGER, CONSTRAINT FK_FoodEvent_id FOREIGN KEY(id) REFERENCES Event(id))';
	var CREATE_ACTIVITY_EVENT = 'CREATE TABLE IF NOT EXISTS ActivityEvent(id TEXT PRIMARY KEY UNIQUE, power INTEGER, CONSTRAINT FK_ActivityEvent_id FOREIGN KEY(id) REFERENCES Event(id))';

	var CREATE_EVENT_INSTANCE = 'CREATE TABLE IF NOT EXISTS EventInstance ( id TEXT PRIMARY KEY UNIQUE, Dtype TEXT DEFAULT NULL, beginTime INTEGER NOT NULL, eventId STRING NOT NULL, deleted INTEGER DEFAULT 0, lastchanged INTEGER NOT NULL, CONSTRAINT FK_EventInstance_Event FOREIGN KEY (eventId) REFERENCES Event (id))';
	var CREATE_FOOD_EVENT_INSTANCE = 'CREATE TABLE IF NOT EXISTS FoodEventInstance(id TEXT PRIMARY KEY UNIQUE, amount INTEGER NOT NULL, CONSTRAINT FK_FoodEventInstance_id FOREIGN KEY(id) REFERENCES EventInstance(id))';
	var CREATE_ACTIVITY_EVENT_INSTANCE = 'CREATE TABLE IF NOT EXISTS ActivityEventInstance(id TEXT PRIMARY KEY UNIQUE, endTime INTEGER, intensity INTEGER NOT NULL, CONSTRAINT FK_ActivityEventInstance_id FOREIGN KEY(id) REFERENCES EventInstance(id))';

	var CREATE_USER = 'CREATE TABLE IF NOT EXISTS User(cId INTEGER PRIMARY KEY UNIQUE, email TEXT, pumpId TEXT, password TEXT)';
	var CREATE_LAST_UPDATE = 'CREATE TABLE IF NOT EXISTS LastUpdate(cId INTEGER PRIMARY KEY UNIQUE, lastchanged INTEGER NOT NULL)';

	//update statements

	var UPDATE_EVENT = 'UPDATE Event SET name=?, eventType =?, lastchanged=? WHERE id =?';
	var UPDATE_FOOD_EVENT = 'UPDATE FoodEvent SET alcoholicUnits=?, carbs=? WHERE id=?';
	var UPDATE_ACTIVITY_EVENT = 'UPDATE ActivityEvent SET power=? WHERE id=?';

	var UPDATE_EVENT_INSTANCE = 'UPDATE EventInstance SET beginTime = ?, lastchanged=? WHERE id=?';
	var UPDATE_ACTIVITY_INSTANCE = 'UPDATE ActivityEventInstance SET intensity= ?, endTime=? WHERE id = ?';
	var UPDATE_FOOD_INSTANCE = 'UPDATE FoodEventInstance SET amount= ? WHERE id = ?';
	
	var SERVER_UPDATE_EVENT = 'UPDATE Event SET name=?, eventType =?, lastchanged=?, deleted=? WHERE id =?';
	var SERVER_UPDATE_INSTANCE = 'UPDATE EventInstance SET eventId = ?, beginTime = ?, deleted=?, lastchanged=? WHERE id=?';

	
	var DELETE_INSTANCE = 'UPDATE EventInstance SET deleted = 1, lastchanged=? WHERE id = ?';
	var DELETE_EVENT = 'UPDATE Event SET deleted = 1, lastchanged=? WHERE id = ?';
	var EDIT_USER = 'UPDATE User SET email = ?,pumpId = ?, password = ? WHERE cId = 1';
	var UPDATE_EMAIL_AND_PASSWORD = 'UPDATE User SET email = ?, password = ? WHERE cId = 1';
	var EDIT_LAST_UPDATE_TIMESTAMP = 'UPDATE LastUpdate SET lastchanged = ? WHERE cId = 1';


	//select statements
	var SELECT_LAST_UPDATE_TIMESTAMP = 'SELECT lastchanged FROM LastUpdate WHERE cId = 1';
	var SELECT_CURRENT_EVENT_INSTANCES = 'SELECT e.beginTime, a.intensity, a.id, ev.name, a.endTime, ev.eventType from Event ev join EventInstance e on ev.id = e.eventId join ActivityEventInstance a on a.id = e.id WHERE e.deleted = 0 AND a.endTime IS NULL AND ev.deleted = 0 ORDER BY e.beginTime DESC;';
	var SELECT_FOOD_EVENT_INSTANCES = 'SELECT e.beginTime, f.amount, e.id, ev.name, ev.eventType, fev.carbs from Event ev join FoodEvent fev on ev.id = fev.id join EventInstance e on ev.id = e.eventId join FoodEventInstance f on e.id = f.id where e.deleted = 0 AND ev.deleted = 0 ORDER BY e.beginTime DESC;';
	var SELECT_ACTIVITY_EVENT_INSTANCES = 'SELECT e.beginTime, a.endtime, a.intensity, e.id, ev.name, ev.eventType from Event ev join EventInstance e on ev.id = e.eventId join ActivityEventInstance a on e.id = a.id where e.deleted = 0  AND a.endTime IS NOT NULL AND ev.deleted = 0 ORDER BY e.beginTime DESC;';
	var SELECT_ALL_EVENT_INSTANCES = 'SELECT e.beginTime, a.endtime, f.amount, a.intensity, e.id, ev.name, ev.eventType, fev.carbs from Event ev left join FoodEvent fev on ev.id = fev.id join EventInstance e on ev.id = e.eventId left join ActivityEventInstance a on a.id = e.id left join FoodEventInstance f on e.id = f.id WHERE e.deleted = 0 AND (ev.eventType = "Food" OR a.endTime IS NOT NULL) AND ev.deleted = 0 ORDER BY e.beginTime DESC;';
	var SELECT_ALL_EVENTS = 'SELECT * FROM Event WHERE deleted=0 ORDER BY lower(name) ASC;'
	var SELECT_PARTICULAR_FOOD_EVENT_INSTANCE = 'SELECT e.beginTime, f.amount, e.id, ev.name, ev.eventType, fev.carbs from Event ev join EventInstance e on ev.id = e.eventId join FoodEventInstance f on e.id = f.id join FoodEvent fev on ev.id = fev.id where e.id =?;';
	var SELECT_PARTICULAR_ACTIVITY_EVENT_INSTANCE = 'SELECT e.beginTime, a.endtime, a.intensity, e.id, ev.name, ev.eventType from Event ev join EventInstance e on ev.id = e.eventId join ActivityEventInstance a on e.id = a.id where e.id =?;';
	var SELECT_EVENTS_AFTER_TIMESTAMP = 'SELECT e.id, e.name, e.eventType, e.deleted, e.lastchanged, f.alcoholicUnits, f.carbs, a.power FROM Event e left join FoodEvent f on e.id = f.id left join ActivityEvent a on e.id = a.id WHERE lastchanged > ? ORDER BY lastchanged DESC'
	var SELECT_ACTIVITY_EVENT_INSTANCES_AFTER_TIMESTAMP = 'SELECT e.id, e.Dtype, e.beginTime, e.eventId, e.deleted, e.lastchanged, a.endTime, a.intensity from EventInstance e join ActivityEventInstance a on e.id = a.id where e.lastchanged > ? ORDER BY lastchanged DESC;';
	var SELECT_FOOD_EVENT_INSTANCES_AFTER_TIMESTAMP = 'SELECT e.id, e.Dtype, e.beginTime, e.eventId , e.deleted, e.lastchanged, f.amount from EventInstance e  join FoodEventInstance f on e.id = f.id where e.lastchanged > ? ORDER BY lastchanged DESC;';
	var SELECT_EVENTS_WITH_TYPE = 'SELECT * FROM Event where eventType = ? AND deleted=0 ORDER BY lower(name) ASC;';
	var SELECT_PARTICULAR_EVENT_WITH_NAME = 'SELECT * FROM Event where name = ? and deleted=0;';
	var SELECT_USER_INFO = 'SELECT * FROM User LIMIT 1';
	var SELECT_EVENT_WITH_ID = 'SELECT * FROM Event WHERE id=?';
	var SELECT_EVENTINSTANCE_WITH_ID = 'SELECT * FROM EventInstance WHERE id=?';
	var SELECT_PARTICULAR_EVENT = 'SELECT e.id, e.eventType, e.name, e.deleted, e.lastchanged, f.alcoholicUnits, f.carbs, a.power FROM Event e LEFT JOIN FoodEvent f on e.id = f.id LEFT JOIN ActivityEvent a on e.id = a.id WHERE e.id =?'

		
	//insert statements
	var ADD_INSTANCE = 'INSERT INTO EventInstance(id, beginTime, eventId, lastchanged) VALUES (?,?,?,?)';
	var ADD_FOOD_INSTANCE = 'INSERT INTO FoodEventInstance(id, amount) VALUES (?,?)';
	var ADD_ACTIVITY_INSTANCE = 'INSERT INTO ActivityEventInstance(id, intensity) VALUES (?,?)';
	var ADD_EVENT = 'INSERT INTO Event(id, name, eventType,lastchanged) VALUES (?,?,?,?)';
	var ADD_FOOD = 'INSERT INTO FoodEvent(id, alcoholicUnits, carbs) VALUES(?,?,?)';
	var ADD_ACTIVITY = 'INSERT INTO ActivityEvent(id, power) VALUES(?,?)'
	var ADD_USER = 'INSERT INTO User(cId, email, pumpId, password) VALUES (1,?,?,?)';
	var ADD_LAST_UPDATE_TIMESTAMP = 'INSERT INTO LastUpdate(cId, lastchanged) VALUES(1,0)';
	var SERVER_ADD_EVENT = 'INSERT INTO Event(id, name, eventType, deleted, lastchanged) VALUES(?,?,?,?,?)';
	var SERVER_ADD_EVENT_INSTANCE = 'INSERT INTO EventInstance(id, eventId, beginTime, deleted, lastchanged) VALUES(?,?,?,?,?)';
	var ADD_ACTIVITY_INSTANCE_WITH_ENDTIME = 'INSERT INTO ActivityEventInstance(id, intensity, endTime) VALUES (?,?,?)';


	if (!window.openDatabase) {
		// not all mobile devices support databases  if it does not, the following alert will display
		// indicating the device will not be albe to run this application
		showMessageDialog("", CANNOT_OPEN_DATABASE);
		return;
	}

	// open db, create if not exists
	
	var db = openDatabase(shortName, version, displayName, maxSize);
	resetDB();
	createTablesIfNotExists();

	/*
	 * Executes given query with arguments. Result will be processed in the callback function
	 */
	function executeQuery(query, argumentsTuple, callBackFunction){
		//console.log(query);
		//console.log(JSON.stringify(argumentsTuple));
		db.transaction(function(transaction) {
			transaction.executeSql(query, argumentsTuple, callBackFunction, errorHandler);
		});

	}
	function executeQueryWithErrorCallback(query, argumentsTuple, successCallback, errorCallback){
		
		db.transaction(function(transaction) {
			transaction.executeSql(query, argumentsTuple, successCallback, function(transaction, error){
				toastMessage(error.message);
				errorCallback();
			});
		});

	}
	/* 
	 * Resets all tables
	 */
	function resetDB(){
		executeQuery( 'DROP TABLE IF EXISTS User;', [], null);

		executeQuery( 'DROP TABLE IF EXISTS LastUpdate;', [], null);

		executeQuery( 'DROP TABLE IF EXISTS FoodEvent;', [], null);

		executeQuery( 'DROP TABLE IF EXISTS ActivityEvent;', [], null);

		executeQuery( 'DROP TABLE IF EXISTS Event;', [], null);

		executeQuery( 'DROP TABLE IF EXISTS FoodEventInstance;', [], null);

		executeQuery( 'DROP TABLE IF EXISTS ActivityEventInstance;', [], null);

		executeQuery( 'DROP TABLE IF EXISTS EventInstance;', [], null);

		createTablesIfNotExists();
	}
	/*
	 * Creates all tables if not exist
	 */
	function createTablesIfNotExists(){
		//create tables if not exist

		executeQuery( CREATE_LAST_UPDATE, [], null);

		executeQuery( CREATE_USER, [], null);

		executeQuery( CREATE_EVENT, [], null);


		executeQuery( CREATE_FOOD_EVENT, [], null);

		executeQuery( CREATE_ACTIVITY_EVENT, [], null);

		executeQuery( CREATE_EVENT_INSTANCE, [], null);

		executeQuery( CREATE_FOOD_EVENT_INSTANCE, [], null);

		executeQuery( CREATE_ACTIVITY_EVENT_INSTANCE, [], null);

		//Create row with id 0 in table last update if not exists
		executeQuery( SELECT_LAST_UPDATE_TIMESTAMP, [], function(transaction,result){
			if(result.rows.length === 0){
				//table contains no value
				//create null timestamp so it can be modified later
				executeQuery( ADD_LAST_UPDATE_TIMESTAMP, [], null);
			}
			else{
				//table contains value
			}
		});
		//same as above
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
	/*
	 * Resets all tables except for the user table. Used when user switches account
	 */
	function resetDBExceptUserTable(){

		executeQuery( 'DROP TABLE IF EXISTS LastUpdate;', [], null);

		executeQuery( 'DROP TABLE IF EXISTS FoodEvent;', [], null);

		executeQuery( 'DROP TABLE IF EXISTS ActivityEvent;', [], null);

		executeQuery( 'DROP TABLE IF EXISTS Event;', [], null);			

		executeQuery( 'DROP TABLE IF EXISTS FoodEventInstance;', [], null);

		executeQuery( 'DROP TABLE IF EXISTS ActivityEventInstance;', [], null);

		executeQuery( 'DROP TABLE IF EXISTS EventInstance;', [], null);

		createTablesIfNotExists();
	}


	/*
	 * This method selects all the records of ActivityEventInstance that are currently running. And calls
	 * showCurrentEventInstanceActivity to insert the info in the DOM
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
	
	function getParticularEvent(id, callback){
		executeQuery(SELECT_PARTICULAR_EVENT, [id], callback);
	}
	function getParticularEventInstance(id, eventType, callback){
		if(eventType === FOOD){
			executeQuery(SELECT_PARTICULAR_FOOD_EVENT_INSTANCE, [id], callback);
		}
		else{
			executeQuery(SELECT_PARTICULAR_ACTIVITY_EVENT_INSTANCE, [id], callback);
		}
	}
	function getEventsAfterTimeStamp(lastchanged, callback) {

		executeQuery(SELECT_EVENTS_AFTER_TIMESTAMP, [lastchanged], callback);

	}
	function getActivityEventInstancesAfterTimeStamp(lastchanged, callback) {

		executeQuery(SELECT_ACTIVITY_EVENT_INSTANCES_AFTER_TIMESTAMP, [lastchanged], callback);

	}
	function getFoodEventInstancesAfterTimeStamp(lastchanged, callback) {

		executeQuery(SELECT_FOOD_EVENT_INSTANCES_AFTER_TIMESTAMP, [lastchanged], callback);

	}


	function getEventInstanceWithId(id, callback){
		executeQuery(SELECT_EVENTINSTANCE_WITH_ID, [id], callback)
	}
	
	function getEventWithId(id, callback){
		executeQuery(SELECT_EVENT_WITH_ID, [id], callback);
	}


	/*
	 * This method selects all events of a certain eventType
	 */
	function listEventsOfEventType(eventType) {
		executeQuery(SELECT_EVENTS_WITH_TYPE, [eventType], showEventList);

	}



	/*
	 * This method edits a certain event, given the eventKey(primary key), the new eventName
	 * and the eventType(which can be altered as well).
	 */
	function updateEvent(id, eventName, eventType, carbs, alcoholicUnits, power){
		executeQuery(UPDATE_EVENT, [eventName, eventType, getCurrentTimestamp(),id], null);
		if(eventType === FOOD){
			executeQuery(UPDATE_FOOD_EVENT, [alcoholicUnits, carbs, id], synchronise);
		}
		else{
			executeQuery(UPDATE_ACTIVITY_EVENT, [power, id], synchronise);
		}

	}
	/*
	 * Adds a food or activity event regarding the given eventType
	 * 
	 * 	var ADD_EVENT = 'INSERT INTO Event(id, name, eventType,lastchanged) VALUES (?,?,?,?)';
	var ADD_FOOD = 'INSERT INTO FoodEvent(id, alcoholicUnits, carbs) VALUES(?,?,?)';
	var ADD_ACTIVITY = 'INSERT INTO ActivityEvent(id, power) VALUES(?,?)'

	 */
	function addEvent(eventName, eventType, carbs, alcoholicUnits, power) {
		var generatedId = makeId();

		var addFoodFunction = function(transaction, result){
			executeQuery(ADD_FOOD, [generatedId, alcoholicUnits, carbs],synchronise);
		};
		var addActivityFunction = function(transaction, result){
			executeQuery(ADD_ACTIVITY, [generatedId, power],synchronise);
		};



		executeQuery(SELECT_PARTICULAR_EVENT_WITH_NAME, [eventName], function(transaction, result){
			if(result.rows.length > 0){
				//allready an undeleted event with the same name in the database
				showMessageDialog("", eventName+ ALLREADY_EXISTS);
			}
			else{
				if(eventType === FOOD){
					//eventType is food, add row in table event with a row in table FoodEvent assigned to it
					executeQuery(ADD_EVENT, [generatedId, eventName, eventType, getCurrentTimestamp()], addFoodFunction);
				}
				else{
					executeQuery(ADD_EVENT, [generatedId, eventName, eventType, getCurrentTimestamp()], addActivityFunction);
				}

			}
		});


	}

	function updateEventInstance(type, amount,beginTime,endTime, id){
		executeQuery(UPDATE_EVENT_INSTANCE, [beginTime, getCurrentTimestamp(), id], synchronise);


		if (type === ACTIVITY) {
			executeQuery(UPDATE_ACTIVITY_INSTANCE, [amount, endTime, id], null);

		} else {
			executeQuery(UPDATE_FOOD_INSTANCE, [amount, id], null);

		}
	}

	function serverUpdateEvent(entity, callback){
		executeQueryWithErrorCallback(SERVER_UPDATE_EVENT, [ setNullIfFieldIsEmpty(entity.name), setNullIfFieldIsEmpty(entity.eventType), setNullIfFieldIsEmpty(entity.lastchanged), setNullIfFieldIsEmpty(entity.deleted), setNullIfFieldIsEmpty(entity.id)], null, callback);

		if(entity.eventType === FOOD){
			executeQueryWithErrorCallback(UPDATE_FOOD_EVENT, [setNullIfFieldIsEmpty(entity.alcoholicUnits), setNullIfFieldIsEmpty(entity.carbs), setNullIfFieldIsEmpty(entity.id)], callback, callback);
		}
		else{
			executeQueryWithErrorCallback(UPDATE_ACTIVITY_EVENT, [setNullIfFieldIsEmpty(entity.power), setNullIfFieldIsEmpty(entity.id)], callback,callback);
		}	
	}

	function serverAddEvent(entity,callback){
		executeQueryWithErrorCallback(SERVER_ADD_EVENT, [setNullIfFieldIsEmpty(entity.id), setNullIfFieldIsEmpty(entity.name), setNullIfFieldIsEmpty(entity.eventType), setNullIfFieldIsEmpty(entity.deleted), setNullIfFieldIsEmpty(entity.lastchanged)], function(){
			if(entity.eventType === FOOD){
				executeQueryWithErrorCallback(ADD_FOOD, [setNullIfFieldIsEmpty(entity.id), setNullIfFieldIsEmpty(entity.alcoholicUnits), setNullIfFieldIsEmpty(entity.carbs)],callback,callback);
			}
			else{
				executeQueryWithErrorCallback(ADD_ACTIVITY, [setNullIfFieldIsEmpty(entity.id), setNullIfFieldIsEmpty(entity.power)],callback,callback);
			}
		}, callback);
	}
	function serverUpdateEventInstance(entity, callback){
		executeQueryWithErrorCallback(SERVER_UPDATE_INSTANCE, [setNullIfFieldIsEmpty(entity.eventId), setNullIfFieldIsEmpty(entity.beginTime), setNullIfFieldIsEmpty(entity.deleted), setNullIfFieldIsEmpty(entity.lastchanged), setNullIfFieldIsEmpty(entity.id)], null, callback);

		if (entity.intensity) {

			executeQueryWithErrorCallback(UPDATE_ACTIVITY_INSTANCE, [setNullIfFieldIsEmpty(entity.intensity), setNullIfFieldIsEmpty(entity.endTime), setNullIfFieldIsEmpty(entity.id)], callback, callback);

		} else {
			executeQuery(UPDATE_FOOD_INSTANCE, [setNullIfFieldIsEmpty(entity.amount), setNullIfFieldIsEmpty(entity.id)], callback, callback);

		}
	}

	function serverAddEventInstance(entity, callback){
		executeQueryWithErrorCallback(SERVER_ADD_EVENT_INSTANCE, [setNullIfFieldIsEmpty(entity.id), setNullIfFieldIsEmpty(entity.eventId), setNullIfFieldIsEmpty(entity.beginTime), setNullIfFieldIsEmpty(entity.deleted), setNullIfFieldIsEmpty(entity.lastchanged)], function(){
			if (entity.intensity) {
				executeQueryWithErrorCallback(ADD_ACTIVITY_INSTANCE_WITH_ENDTIME, [setNullIfFieldIsEmpty(entity.id), setNullIfFieldIsEmpty(entity.intensity), setNullIfFieldIsEmpty(entity.endTime)], callback, callback);
			}
			else{
				executeQueryWithErrorCallback(ADD_FOOD_INSTANCE, [setNullIfFieldIsEmpty(entity.id), setNullIfFieldIsEmpty(entity.amount)],callback, callback);
			}
		}, callback);
	}
	
	function serverProcessEvent(entity, callback){
			//check if event allready exists on device by selecting event based on id. If no event is retrieved from db
		//then the event is not stored yet and need to be added. If an event is retrieved from db then the lastchanged values 
		//need to be compared. If entity from server has a equal or higher lastchanged, then we consider it more recent and then
		//we update it.
		
		//get event from db
			executeQueryWithErrorCallback(SELECT_EVENT_WITH_ID, [entity.id], function(transaction, result){
				//check if an event is received
				if (0 < result.rows.length) {
					//an event is received
					//event on device
					var row = result.rows.item(0);
					//compare lastchanged of both events
					if( entity.lastchanged >= row.lastchanged){
						//event of server is more recent
						//update event
						serverUpdateEvent(entity, callback);
					}
					else{
						//event of device is more recent
						//execute callback
						callback();
					}
				}
				else{
					//no event is received
					//event not on device yet
					//add event
					serverAddEvent(entity, callback);
					
				}
			}, callback);
		
		
	}
	
	function serverProcessEventInstance(entity, callback){

		executeQueryWithErrorCallback(SELECT_EVENTINSTANCE_WITH_ID, [entity.id], function(transaction, result){
			if (0 < result.rows.length) {
				//event instance is on device
				var row = result.rows.item(0);
				if( entity.lastchanged >= row.lastchanged){
					//update event instance
					serverUpdateEventInstance(entity, callback);

				}
				else{
					callback()
				}
			}
			else{
				//event instance is not on device
				serverAddEventInstance(entity, callback);
				
			}
		}, callback);
	}
	


	/*
	 * This method sets deleted on 1(true) of the given id and thereby basically
	 * in-activates the record
	 */
	function deleteEventInstance(id) {
		
		executeQuery(DELETE_INSTANCE, [getCurrentTimestamp(), id], synchronise);

	}

	/*
	 * This method sets deleted on 1(true) of the given id and thereby basically
	 * in-activates the record
	 */
	function deleteEvent(id) {
		executeQuery(DELETE_EVENT, [getCurrentTimestamp(), id], synchronise);

	}


	function addEventInstance(quantity, beginTime, eventType, eventId) {

		var generatedId = makeId();

		//callback function, inserts values in the extended table (FoodEventInstance)
		var addFoodFunction = function(transaction, result){
			executeQuery(ADD_FOOD_INSTANCE, [generatedId, quantity],synchronise);
		};
		var addActivityFunction = function(transaction, result){

			executeQuery(ADD_ACTIVITY_INSTANCE, [generatedId, quantity],synchronise);
		};
		if(eventType === FOOD){
			executeQuery(ADD_INSTANCE, [generatedId, beginTime, eventId, getCurrentTimestamp()], addFoodFunction);
		}
		else{
			executeQuery(ADD_INSTANCE, [generatedId, beginTime, eventId, getCurrentTimestamp()], addActivityFunction);
		}




	}

	function getUserInfo(callback){
		executeQuery(SELECT_USER_INFO, [], callback);
	}

	function addUser(email, pumpId, password){
		executeQuery(ADD_USER, [email, pumpId, password], null);
	}

	function updateUser(email, pumpId, password){
		executeQuery(EDIT_USER, [email, pumpId, password], null);
	}
	function updateEmailAndPassword(email, password, callback){
		executeQuery(UPDATE_EMAIL_AND_PASSWORD, [email, password], callback);
	}

	function getLastUpdateTimeStamp(callback){
		executeQuery(SELECT_LAST_UPDATE_TIMESTAMP,[],callback);
	}

	function updateLastUpdateTimeStamp(lastchanged){
		executeQuery(EDIT_LAST_UPDATE_TIMESTAMP, [lastchanged], null);
	}

	function getCurrentTimestamp(){
		return new Date().getTime();

	}
	function makeId()
	{
	    var text = "";
	    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";

	    for( var i=0; i < ID_STRING_LENGTH; i++ )
	        text += possible.charAt(Math.floor(Math.random() * possible.length));
	    
	    
	    return text;
	}
}