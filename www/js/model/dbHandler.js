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
	this.getEntityWithSId = getEntityWithSId;
	this.getEntityWithCId = getEntityWithCId;
	this.updateEmailAndPassword = updateEmailAndPassword;
	this.resetDBExceptUserTable = resetDBExceptUserTable;
	this.getParticularEvent = getParticularEvent;
	this.getParticularEventInstance = getParticularEventInstance;


	//add all the sql queries
	//create statements
	var CREATE_EVENT = 'CREATE TABLE IF NOT EXISTS Event(cId INTEGER PRIMARY KEY AUTOINCREMENT, sId INTEGER, eventType TEXT NOT NULL, name TEXT NOT NULL, deleted INTEGER DEFAULT 0, lastchanged INTEGER NOT NULL)';
	var CREATE_FOOD_EVENT = 'CREATE TABLE IF NOT EXISTS FoodEvent(cId INTEGER PRIMARY KEY, alcoholicUnits INTEGER, carbs INTEGER, CONSTRAINT FK_FoodEvent_id FOREIGN KEY(cId) REFERENCES Event(cId))';
	var CREATE_ACTIVITY_EVENT = 'CREATE TABLE IF NOT EXISTS ActivityEvent(cId INTEGER PRIMARY KEY, power INTEGER)';

	var CREATE_EVENT_INSTANCE = 'CREATE TABLE IF NOT EXISTS EventInstance ( cId INTEGER PRIMARY KEY AUTOINCREMENT, sId INTEGER, Dtype TEXT DEFAULT NULL, beginTime INTEGER NOT NULL, cEvent INTEGER NOT NULL, sEvent INTEGER, deleted INTEGER DEFAULT 0, lastchanged INTEGER NOT NULL, CONSTRAINT FK_EventInstance_Event FOREIGN KEY (cEvent) REFERENCES Event (cId))';
	var CREATE_FOOD_EVENT_INSTANCE = 'CREATE TABLE IF NOT EXISTS FoodEventInstance(cId INTEGER PRIMARY KEY, amount INTEGER NOT NULL, CONSTRAINT FK_FoodEventInstance_id FOREIGN KEY(cId) REFERENCES EventInstance(cId))';
	var CREATE_ACTIVITY_EVENT_INSTANCE = 'CREATE TABLE IF NOT EXISTS ActivityEventInstance(cId INTEGER PRIMARY KEY, endTime INTEGER, intensity INTEGER NOT NULL, CONSTRAINT FK_ActivityEventInstance_id FOREIGN KEY(cId) REFERENCES EventInstance(cId))';

	var CREATE_USER = 'CREATE TABLE IF NOT EXISTS User(cId INTEGER PRIMARY KEY, email TEXT, pumpId TEXT, password TEXT)';
	var CREATE_LAST_UPDATE = 'CREATE TABLE IF NOT EXISTS LastUpdate(cId INTEGER PRIMARY KEY, lastchanged INTEGER NOT NULL)';

	//update statements
	var SET_SID_EVENT = 'UPDATE Event SET sId = ? WHERE cId = ?';
	var SET_SID_INSTANCE = 'UPDATE EventInstance SET sId = ? WHERE cId = ?';

	var UPDATE_EVENT = 'UPDATE Event SET name=?, eventType =?, lastchanged=? WHERE cId =?';
	var UPDATE_FOOD_EVENT = 'UPDATE FoodEvent SET alcoholicUnits=?, carbs=? WHERE cId=?';
	var UPDATE_ACTIVITY_EVENT = 'UPDATE ActivityEvent SET power=? WHERE cId=?';

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
	var SELECT_CURRENT_EVENT_INSTANCES = 'SELECT e.beginTime, a.intensity, a.cId, ev.name, a.endTime, ev.eventType from Event ev join EventInstance e on ev.cId = e.cEvent join ActivityEventInstance a on a.cId = e.cId WHERE e.deleted = 0 AND a.endTime IS NULL AND ev.deleted = 0 ORDER BY e.beginTime DESC;';
	var SELECT_FOOD_EVENT_INSTANCES = 'SELECT e.beginTime, f.amount, e.cId, ev.name, ev.eventType from Event ev join EventInstance e on ev.cId = e.cEvent join FoodEventInstance f on e.cId = f.cId where e.deleted = 0 AND ev.deleted = 0 ORDER BY e.beginTime DESC;';
	var SELECT_ACTIVITY_EVENT_INSTANCES = 'SELECT e.beginTime, a.endtime, a.intensity, e.cId, ev.name, ev.eventType from Event ev join EventInstance e on ev.cId = e.cEvent join ActivityEventInstance a on e.cId = a.cId where e.deleted = 0  AND a.endTime IS NOT NULL AND ev.deleted = 0 ORDER BY e.beginTime DESC;';
	var SELECT_ALL_EVENT_INSTANCES = 'SELECT e.beginTime, a.endtime, f.amount, a.intensity, e.cId, ev.name, ev.eventType from Event ev join EventInstance e on ev.cId = e.cEvent left join ActivityEventInstance a on a.cId = e.cId left join FoodEventInstance f on e.cId = f.cId WHERE e.deleted = 0 AND (ev.eventType = "Food" OR a.endTime IS NOT NULL) AND ev.deleted = 0 ORDER BY e.beginTime DESC;';
	var SELECT_ALL_EVENTS = 'SELECT * FROM Event WHERE deleted=0 ORDER BY lower(name) ASC;'
	var SELECT_PARTICULAR_FOOD_EVENT_INSTANCE = 'SELECT e.beginTime, f.amount, e.cId, ev.name, ev.eventType from Event ev join EventInstance e on ev.cId = e.cEvent join FoodEventInstance f on e.cId = f.cId where e.cId =?;';
	var SELECT_PARTICULAR_ACTIVITY_EVENT_INSTANCE = 'SELECT e.beginTime, a.endtime, a.intensity, e.cId, ev.name, ev.eventType from Event ev join EventInstance e on ev.cId = e.cEvent join ActivityEventInstance a on e.cId = a.cId where e.cId =?;';
	var SELECT_EVENTS_AFTER_TIMESTAMP = 'SELECT * FROM Event WHERE lastchanged > ?'
	var SELECT_ACTIVITY_EVENT_INSTANCES_AFTER_TIMESTAMP = 'SELECT * from EventInstance e join ActivityEventInstance a on e.cId = a.cId where e.lastchanged > ?;';
	var SELECT_FOOD_EVENT_INSTANCES_AFTER_TIMESTAMP = 'SELECT * from EventInstance e  join FoodEventInstance f on e.cId = f.cId where e.lastchanged > ?;';
	var SELECT_EVENTS_WITH_TYPE = 'SELECT * FROM Event where eventType = ? AND deleted=0 ORDER BY lower(name) ASC;';
	var SELECT_PARTICULAR_EVENT_WITH_NAME = 'SELECT * FROM Event where name = ? and deleted=0;';
	var SELECT_USER_INFO = 'SELECT * FROM User LIMIT 1';
	var SELECT_EVENT_WITH_SID = 'SELECT * FROM Event WHERE sId=?';
	var SELECT_EVENT_INSTANCE_WITH_SID = 'SELECT * FROM EventInstance WHERE sId=?';
	var SELECT_EVENT_WITH_CID = 'SELECT * FROM Event WHERE cId=?';
	var SELECT_EVENTINSTANCE_WITH_CID = 'SELECT * FROM EventInstance WHERE cId=?';
	var GET_CEVENT_WITH_SEVENT = 'SELECT cId FROM Event where sId=?';




	var CREATE_EVENT = 'CREATE TABLE IF NOT EXISTS Event(cId INTEGER PRIMARY KEY AUTOINCREMENT, sId INTEGER, eventType TEXT NOT NULL, name TEXT NOT NULL, deleted INTEGER DEFAULT 0, lastchanged INTEGER NOT NULL)';
	var CREATE_FOOD_EVENT = 'CREATE TABLE IF NOT EXISTS FoodEvent(cId INTEGER PRIMARY KEY AUTOINCREMENT, alcoholicUnits INTEGER, carbs INTEGER, CONSTRAINT FK_FoodEvent_id FOREIGN KEY(cId) REFERENCES Event(cId))';
	var CREATE_ACTIVITY_EVENT = 'CREATE TABLE IF NOT EXISTS ActivityEvent(cId INTEGER PRIMARY KEY AUTOINCREMENT, power INTEGER)';

	var SELECT_PARTICULAR_EVENT = 'SELECT e.cId, e.sId, e.eventType, e.name, e.deleted, e.lastchanged, f.alcoholicUnits, f.carbs, a.power FROM Event e LEFT JOIN FoodEvent f on e.cId = f.cId LEFT JOIN ActivityEvent a on e.cId = a.cId WHERE e.cId =?'
		//insert statements
		var ADD_INSTANCE = 'INSERT INTO EventInstance(beginTime, cEvent, sEvent, lastchanged) VALUES (?,?,?,?)';
	var ADD_FOOD_INSTANCE = 'INSERT INTO FoodEventInstance(cId, amount) VALUES (?,?)';
	var ADD_ACTIVITY_INSTANCE = 'INSERT INTO ActivityEventInstance(cId, intensity) VALUES (?,?)';
	var ADD_EVENT = 'INSERT INTO Event(name, eventType,lastchanged) VALUES (?,?,?)';
	var ADD_FOOD = 'INSERT INTO FoodEvent(cId, alcoholicUnits, carbs) VALUES(?,?,?)';
	var ADD_ACTIVITY = 'INSERT INTO ActivityEvent(cId, power) VALUES(?,?)'
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

	// open db, create if not exists
	var db = openDatabase(shortName, version, displayName, maxSize);

	resetDB();
	//createTablesIfNotExists();

	/*
	 * Executes given query with arguments. Result will be processed in the callback function
	 */
	function executeQuery(query, argumentsTuple, callBackFunction){
		db.transaction(function(transaction) {
			transaction.executeSql(query, argumentsTuple, callBackFunction, errorHandler);
		});

	}
	/* 
	 * Resets all tables
	 */
	function resetDB(){
		executeQuery( 'DROP TABLE IF EXISTS User;', [], nullHandler);

		executeQuery( 'DROP TABLE IF EXISTS LastUpdate;', [], nullHandler);

		executeQuery( 'DROP TABLE IF EXISTS FoodEvent;', [], nullHandler);

		executeQuery( 'DROP TABLE IF EXISTS ActivityEvent;', [], nullHandler);

		executeQuery( 'DROP TABLE IF EXISTS Event;', [], nullHandler);

		executeQuery( 'DROP TABLE IF EXISTS FoodEventInstance;', [], nullHandler);

		executeQuery( 'DROP TABLE IF EXISTS ActivityEventInstance;', [], nullHandler);

		executeQuery( 'DROP TABLE IF EXISTS EventInstance;', [], nullHandler);

		createTablesIfNotExists();
	}
	/*
	 * Creates all tables if not exist
	 */
	function createTablesIfNotExists(){
		//create tables if not exist

		executeQuery( CREATE_LAST_UPDATE, [], nullHandler);

		executeQuery( CREATE_USER, [], nullHandler);

		executeQuery( CREATE_EVENT, [], nullHandler);


		executeQuery( CREATE_FOOD_EVENT, [], nullHandler);

		executeQuery( CREATE_ACTIVITY_EVENT, [], nullHandler);

		executeQuery( CREATE_EVENT_INSTANCE, [], nullHandler);

		executeQuery( CREATE_FOOD_EVENT_INSTANCE, [], nullHandler);

		executeQuery( CREATE_ACTIVITY_EVENT_INSTANCE, [], nullHandler);

		//Create row with id 0 in table last update if not exists
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

		executeQuery( 'DROP TABLE IF EXISTS LastUpdate;', [], nullHandler);

		executeQuery( 'DROP TABLE IF EXISTS FoodEvent;', [], nullHandler);

		executeQuery( 'DROP TABLE IF EXISTS ActivityEvent;', [], nullHandler);

		executeQuery( 'DROP TABLE IF EXISTS Event;', [], nullHandler);			

		executeQuery( 'DROP TABLE IF EXISTS FoodEventInstance;', [], nullHandler);

		executeQuery( 'DROP TABLE IF EXISTS ActivityEventInstance;', [], nullHandler);

		executeQuery( 'DROP TABLE IF EXISTS EventInstance;', [], nullHandler);

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
	
	function getParticularEvent(cId, callback){
		executeQuery(SELECT_PARTICULAR_EVENT, [cId], callback);
	}
	function getParticularEventInstance(cId, eventType, callback){
		if(eventType === FOOD){
			executeQuery(SELECT_PARTICULAR_FOOD_EVENT_INSTANCE, [cId], callback);
		}
		else{
			executeQuery(SELECT_PARTICULAR_ACTIVITY_EVENT_INSTANCE, [cId], callback);
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



	/*
	 * This method edits a certain event, given the eventKey(primary key), the new eventName
	 * and the eventType(which can be altered as well).
	 */
	function updateEvent(cId, eventName, eventType, carbs, alcoholicUnits, power){
		executeQuery(UPDATE_EVENT, [eventName, eventType, getCurrentTimestamp(),cId], nullHandler);
		if(eventType === FOOD){
			executeQuery(UPDATE_FOOD_EVENT, [alcoholicUnits, carbs, cId], synchronise);
		}
		else{
			executeQuery(UPDATE_ACTIVITY_EVENT, [power, cId], synchronise);
		}

	}
	/*
	 * Adds a food or activity event regarding the given eventType
	 */
	function addEvent(eventName, eventType, carbs, alcoholicUnits, power) {

		var addFoodFunction = function(transaction, result){
			executeQuery(ADD_FOOD, [result.insertId, alcoholicUnits, carbs],synchronise);
		};
		var addActivityFunction = function(transaction, result){
			executeQuery(ADD_ACTIVITY, [result.insertId, power],synchronise);
		};



		var addEventFunction = function(transaction, result){
			if(result.rows.length > 0){
				//allready an undeleted event with the same name in the database
				showMessageDialog("", eventName+ ALLREADY_EXISTS);
			}
			else{
				if(eventType === FOOD){
					//eventType is food, add row in table event with a row in table FoodEvent assigned to it
					executeQuery(ADD_EVENT, [eventName, eventType, getCurrentTimestamp()], addFoodFunction);
				}
				else{
					executeQuery(ADD_EVENT, [eventName, eventType, getCurrentTimestamp()], addActivityFunction);
				}

			}
		}

		executeQuery(SELECT_PARTICULAR_EVENT_WITH_NAME, [eventName], addEventFunction);


	}

	function updateEventInstance(type, amount,beginTime,endTime, cId){
		executeQuery(UPDATE_EVENT_INSTANCE, [beginTime, getCurrentTimestamp(), cId], synchronise);


		if (type === ACTIVITY) {
			executeQuery(UPDATE_ACTIVITY_INSTANCE, [amount, endTime, cId], nullHandler);

		} else {
			executeQuery(UPDATE_FOOD_INSTANCE, [amount, cId], nullHandler);

		}
	}

	/*
	 * This method gets called in the synchronisation method.It updates an entity, given the entity, its type(Event or EventInstance) and the row of the corresponding 
	 * entity in the db.
	 */
	function serverUpdateEntity(entityType, entity, row){//sId, sEvent, type, amount,beginTime,endTime, deleted, timeStampLastChanged, cId

		if(entityType === EVENT){
			//update event
			executeQuery(SERVER_UPDATE_EVENT, [entity.sId, entity.name, entity.eventType, entity.lastchanged, entity.deleted, row.cId], nullHandler);

			if(entity.eventType === FOOD){
				executeQuery(UPDATE_FOOD_EVENT, [entity.alcoholicUnits, entity.carbs, row.cId], nullHandler);
			}
			else{
				executeQuery(UPDATE_ACTIVITY_EVENT, [entity.power, row.cId], nullHandler);
			}



		}

		else{
			//update event instance
			executeQuery(SERVER_UPDATE_INSTANCE, [entity.sId, entity.sEvent, entity.beginTime, entity.deleted, entity.lastchanged, row.cId], nullHandler);

			if (entity.intensity) {
				executeQuery(UPDATE_ACTIVITY_INSTANCE, [entity.intensity, entity.endTime, row.cId], nullHandler);

			} else {
				executeQuery(UPDATE_FOOD_INSTANCE, [entity.amount, row.cId], nullHandler);

			}
		}
	}
	/*
	 * This method gets called in the synchronisation method when on another device an entity is defined. It stores the entity in db given the entity and entity type.
	 */
	function serverAddEntity(entityType,entity){

		if(entityType === EVENT){
			//add event
			var addFoodFunction = function(transaction, result){
				executeQuery(ADD_FOOD, [result.insertId, entity.alcoholicUnits, entity.carbs],nullHandler);
			};
			var addActivityFunction = function(transaction, result){
				executeQuery(ADD_ACTIVITY, [result.insertId, entity.power],nullHandler);
			};

			
			if(entity.eventType === FOOD){
				
				executeQuery(SERVER_ADD_EVENT, [entity.sId, entity.name, entity.eventType, entity.deleted, entity.lastchanged], addFoodFunction);
			}
			else{
				executeQuery(SERVER_ADD_EVENT, [entity.sId, entity.name, entity.eventType, entity.deleted, entity.lastchanged], addActivityFunction);
			}
		}
		else{
			//cEvent is the foreign key in EventInstance referencing an event. Entity is from another device, where cEvent is referencing the event with another
			// cId(cId's are defined locally). So first the event need to be found to declare cEvent, which is possible because sEvent of entity corresponds with sId of the event 
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

	function getCurrentTimestamp(){
		return new Date().getTime();

	}
}