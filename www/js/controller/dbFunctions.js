function dbFunctions(shortName, version, displayName, maxSize) {

	this.shortName = shortName;
	this.version = version;
	this.displayName = displayName;
	this.maxSize = maxSize;
	var results = [];

	//add functions to object
	this.addEvent = addEvent;
	this.listEventsOfEventType = listEventsOfEventType;
	this.listAllEvents = listAllEvents;
	this.editEvent = editEvent;
	this.listHistoryEvents = listHistoryEvents;
	this.listCurrentEvents = listCurrentEvents;
	this.addFoodEventInstance = addFoodEventInstance;
	this.addActivityEventInstance = addActivityEventInstance;
	this.sendDbData = sendDbData;
	this.updateEventInstance = updateEventInstance;
	this.deleteFoodEvent = deleteFoodEvent;
	this.deleteActivityEvent = deleteActivityEvent;
	this.editEventInstance = editEventInstance;
	this.setBeenSentFoodEventInstance = setBeenSentFoodEventInstance;
	this.setBeenSentActivityEventInstance = setBeenSentActivityEventInstance;
	this.setBeenSentEvent = setBeenSentEvent;
	
	//add all the sql queries
	//create statements
	/*
	 * old data model
	var CREATE_EVENT = 'CREATE TABLE IF NOT EXISTS Event(id INTEGER PRIMARY KEY AUTOINCREMENT, sID INTEGER, name TEXT NOT NULL, eventType TEXT NOT NULL, beenSent INTEGER DEFAULT 0, deleted INTEGER DEFAULT 0, timeStamp INTEGER)';
	var CREATE_EVENTINSTANCE = 'CREATE TABLE IF NOT EXISTS EventInstance ( id INTEGER NOT NULL AUTO INCREMENT, DType TEXT DEFAULT NULL, beginTime INTEGER NOT NULL, event INTEGER NOT NULL, PRIMARY KEY (`id`), CONSTRAINT FK_EventInstance_Event FOREIGN KEY (Event) REFERENCES Event (id))';
	
	var CREATE_FOOD_EVENT = 'CREATE TABLE IF NOT EXISTS FoodEventInstance(id INTEGER PRIMARY KEY AUTOINCREMENT, eventID INTEGER, sID INTEGER, event TEXT NOT NULL, amount INTEGER NOT NULL, beginTime INTEGER NOT NULL, beenSent INTEGER DEFAULT 0, deleted INTEGER DEFAULT 0, timeStamp INTEGER, FOREIGN KEY(eventID) REFERENCES Event(id))';
	var CREATE_ACTIVITY_EVENT = 'CREATE TABLE IF NOT EXISTS ActivityEventInstance(id INTEGER PRIMARY KEY AUTOINCREMENT, eventID INTEGER, sID INTEGER, event TEXT NOT NULL, intensity INTEGER NOT NULL, beginTime INTEGER NOT NULL, endTime INTEGER, beenSent INTEGER DEFAULT 0, deleted INTEGER DEFAULT 0, timeStamp INTEGER, FOREIGN KEY(eventID) REFERENCES Event(id))';
	*/
	
	var CREATE_EVENT = 'CREATE TABLE IF NOT EXISTS Event(id INTEGER PRIMARY KEY AUTOINCREMENT, sID INTEGER, eventType TEXT NOT NULL, name TEXT NOT NULL, beenSent INTEGER DEFAULT 0, deleted INTEGER DEFAULT 0, timeStamp INTEGER)';
	var CREATE_EVENT_INSTANCE = 'CREATE TABLE IF NOT EXISTS EventInstance ( id INTEGER PRIMARY KEY AUTOINCREMENT, sID INTEGER, Dtype TEXT DEFAULT NULL, beginTime INTEGER NOT NULL, event INTEGER NOT NULL, beenSent INTEGER DEFAULT 0, deleted INTEGER DEFAULT 0, timeStamp INTEGER, CONSTRAINT FK_EventInstance_Event FOREIGN KEY (event) REFERENCES Event (id))';
	
	var CREATE_FOOD_EVENT = 'CREATE TABLE IF NOT EXISTS FoodEventInstance(id INTEGER PRIMARY KEY, amount INTEGER NOT NULL, CONSTRAINT FK_FoodEventInstance_id FOREIGN KEY(id) REFERENCES EventInstance(id))';
	var CREATE_ACTIVITY_EVENT = 'CREATE TABLE IF NOT EXISTS ActivityEventInstance(id INTEGER PRIMARY KEY, endTime INTEGER, intensity INTEGER NOT NULL, CONSTRAINT FK_ActivityEventInstance_id FOREIGN KEY(id) REFERENCES EventInstance(id))';
	
	//update statements
	var SET_BEEN_SENT_EVENT_TRUE = 'UPDATE Event SET beenSent = 1, sID =? WHERE id = ?';
	var SET_BEEN_SENT_EVENT_FALSE = 'UPDATE Event SET beenSent = 0, WHERE id=?';
	var SET_BEEN_SENT_INSTANCE_TRUE = 'UPDATE EventInstance SET beenSent = 1, sID=? WHERE id = ?';
	var SET_BEEN_SENT_INSTANCE_FALSE = 'UPDATE EventInstance SET beenSent = 0 WHERE id =?';
	var UPDATE_EVENT = 'UPDATE Event SET name=?, eventType =?, beenSent = 0 WHERE id =?';
	var UPDATE_EVENT_INSTANCE = 'UPDATE EventInstance SET beginTime = ?, beenSent = 0 WHERE id=?';
	var UPDATE_ACTIVITY = 'UPDATE ActivityEventInstance SET intensity= ?, endTime=? WHERE id = ?';
	var UPDATE_FOOD = 'UPDATE FoodEventInstance SET amount= ? WHERE id = ?';
	var DELETE_INSTANCE = 'UPDATE EventInstance SET deleted = 1, beenSent = 0 WHERE id = ?';
	
	//select statements
	var SELECT_CURRENT_EVENT_INSTANCES = 'SELECT e.beginTime, a.intensity, e.id, ev.name, a.endTime from Event ev join EventInstance e on ev.id = e.event join ActivityEventInstance a on a.id = e.id WHERE e.deleted = 0 AND a.endTime IS NULL ORDER BY e.beginTime DESC;';
	var SELECT_FOOD_EVENT_INSTANCES = 'SELECT * from Event ev join EventInstance e on ev.id = e.event join FoodEventInstance f on e.id = f.id where e.deleted = 0 ORDER BY e.beginTime DESC;';
	var SELECT_ACTIVITY_EVENT_INSTANCES = 'SELECT * from Event ev join EventInstance e on ev.id = e.event join ActivityEventInstance a on e.id = a.id where e.deleted = 0  AND a.endTime IS NOT NULL ORDER BY e.beginTime DESC;';
	var SELECT_ALL_EVENT_INSTANCES = 'SELECT e.beginTime, a.endtime, f.amount, a.intensity, e.id, ev.name from Event ev join EventInstance e on ev.id = e.event left join ActivityEventInstance a on a.id = e.id left join FoodEventInstance f on e.id = f.id WHERE e.deleted = 0 AND (ev.eventType = "food" OR a.endTime IS NOT NULL) ORDER BY e.beginTime DESC;';
	var SELECT_ALL_EVENTS = 'SELECT * FROM Event ORDER BY lower(name) ASC;'
	var SELECT_EVENTS_WITH_TYPE = 'SELECT * FROM Event where eventType = ? ORDER BY lower(name) ASC;';
	var SELECT_PARTICULAR_EVENT = 'SELECT * FROM Event where name = ?;';
	
	var SELECT_UNSENT_EVENTS = 'SELECT * FROM Event where beenSent = 0;';
	var SELECT_UNSENT_FOOD_INSTANCES =  'SELECT e.sID, i.beginTime, f.amount FROM Eventinstance i, FoodEventInstance f, Event e WHERE i.event = e.id AND i.id = f.id AND i.beenSent = 0 AND e.sID IS NOT NULL;';
	var SELECT_UNSENT_ACTIVITY_INSTANCES = 'SELECT * FROM Eventinstance i, ActivityEventInstance a, Event e WHERE i.event = e.id AND a.id = e.id AND i.beenSent = 0 AND endTime IS NOT NULL AND e.sID IS NOT NULL;';
	
	
	//insert statements
	var ADD_INSTANCE = 'INSERT INTO EventInstance(beginTime, event) VALUES (?,?)';
	var ADD_FOOD = 'INSERT INTO FoodEventInstance(id, amount) VALUES (?,?)';
	var ADD_ACTIVITY = 'INSERT INTO ActivityEventInstance(id, intensity) VALUES (?,?)';
	var ADD_EVENT = 'INSERT INTO Event(name, eventType) VALUES (?,?)';
	
	if (!window.openDatabase) {
		// not all mobile devices support databases  if it does not, the following alert will display
		// indicating the device will not be albe to run this application
		alert('cannot open database');
		return;
	}

	// this line tries to open the database base locally on the device
	// if it does not exist, it will create it and return a databaseobject stored in variable db
	var db = openDatabase(shortName, version, displayName, maxSize);

	// this line will try to create the table User in the database justcreated/openned
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

		//execute queries for creation of the table
		
		tx.executeSql( CREATE_EVENT, [], nullHandler, errorHandler);
		
		tx.executeSql( CREATE_EVENT_INSTANCE, [], nullHandler, errorHandler);
		
		tx.executeSql( CREATE_FOOD_EVENT, [], nullHandler, errorHandler);
		
		
		tx.executeSql( CREATE_ACTIVITY_EVENT, [], nullHandler, errorHandler);
		

	}, errorHandler, successCallBack);

	function setBeenSentEvent(sID,id){
		var db = openDatabase(shortName, version, displayName, maxSize);
	db.transaction(function(transaction) {
		transaction.executeSql(SET_BEEN_SENT_EVENT_TRUE, [sID, id], nullHandler, errorHandler);
	});
	}
	function setBeenSentFoodEventInstance(sID,id){
		var db = openDatabase(shortName, version, displayName, maxSize);
		
		db.transaction(function(transaction) {
			transaction.executeSql(SET_BEEN_SENT_INSTANCE_TRUE, [sID, id], nullHandler, errorHandler);
		});
	}
	function setBeenSentActivityEventInstance(sID,id){
	var db = openDatabase(shortName, version, displayName, maxSize);
	db.transaction(function(transaction) {
		transaction.executeSql(SET_BEEN_SENT_INSTANCE_TRUE, [sID, row.id], nullHandler, errorHandler);
	});
	}

/*
	 * This method selects all the records of ActivityEventInstance that are currently running. And calls
	 * showCurrentEvents to insert the info in the DOM
	 */
	function listCurrentEvents() {
		
		//empty list
		var db = openDatabase(shortName, version, displayName, maxSize);
		db.transaction(function(transaction) {
			transaction.executeSql(SELECT_CURRENT_EVENT_INSTANCES, []
			, showCurrentEvents, errorHandler);
		}, errorHandler, nullHandler);
	}
	
	
	/*
	 * This method selects all the EventInstances regarding the given event type. 
	 */
	function listHistoryEvents(type) {
		results = [];
		
		
		var db = openDatabase(shortName, version, displayName, maxSize);

		if (type === 'Food') {
			db.transaction(function(transaction) {
				transaction.executeSql(SELECT_FOOD_EVENT_INSTANCES, [], showEventInstanceList, errorHandler);
			}, errorHandler, nullHandler);

		} else if (type === 'Activity') {
			db.transaction(function(transaction) {
				transaction.executeSql(SELECT_ACTIVITY_EVENT_INSTANCES, [], showEventInstanceList, errorHandler);
			}, errorHandler, nullHandler);
		} else if (type === 'All' || type === null) {
			//because transaction occurs asynchronously the code after both transactions will be called before the array is filled,
			//so the second transaction has a diffrent method in where the post-transaction-code resides
			/*
			//fill array results with food event instances
			db.transaction(function(transaction) {
				transaction.executeSql(SELECT_FOOD_EVENT_INSTANCES, [], fillResultsArray, errorHandler);
			}, errorHandler, nullHandler);
			//array is filled with food event instances
			//now fill the array with activity event instances
			db.transaction(function(transaction) {
				transaction.executeSql(SELECT_ACTIVITY_EVENT_INSTANCES, [], fillResultsArray2, errorHandler);
			}, errorHandler, nullHandler);
			*/
			db.transaction(function(transaction) {
				transaction.executeSql(SELECT_ALL_EVENT_INSTANCES, [], showEventInstanceList, errorHandler);
			}, errorHandler, nullHandler);
		}

	}
	
	/*
	* This method selects all the events stored in the db
	*/
	function listAllEvents() {
		
		var db = openDatabase(shortName, version, displayName, maxSize);
		db.transaction(function(transaction) {
			transaction.executeSql(SELECT_ALL_EVENTS, [], showList, errorHandler);
		}, errorHandler, nullHandler);
	}
	/*
	 * This method selects all events of a certain eventType
	 */
	function listEventsOfEventType(eventType) {
		
		var db = openDatabase(shortName, version, displayName, maxSize);
		db.transaction(function(transaction) {
			transaction.executeSql(SELECT_EVENTS_WITH_TYPE, [eventType], showList, errorHandler);
		}, errorHandler, nullHandler);

	}
	
	/*
	 * This method selects all the data from every table, and calls other methods to send the data to the server
	 */
	function sendDbData() {
		
		var db = openDatabase(shortName, version, displayName, maxSize);
		
		db.transaction(function(transaction) {
			transaction.executeSql(SELECT_UNSENT_EVENTS, [], sendEvents, errorHandler);
		}, errorHandler, nullHandler);
		
		db.transaction(function(transaction) {
			transaction.executeSql(SELECT_UNSENT_FOOD_INSTANCES, [], sendFoodEventInstance, errorHandler);
		}, errorHandler, nullHandler);
		
		/*
		db.transaction(function(transaction) {
			transaction.executeSql(SELECT_UNSENT_ACTIVITY_INSTANCES, [], sendActivityEventInstance, errorHandler);
		}, errorHandler, nullHandler);
		*/
	}
	
	/*
	 * This method edits a certain event, given the eventKey(primary key), the new eventName
	 * and the eventType(which can be altered as well).
	 */
	function editEvent(eventKey, eventName, eventType){
		
		var db = openDatabase(shortName, version, displayName, maxSize);
		db.transaction(function(transaction) {
			transaction.executeSql(UPDATE_EVENT, [eventName, eventType, eventKey], nullHandler, errorHandler);
		});
		
		
	}
	
	function updateEventInstance(type, amount,beginTime,endTime, id){
		
		var db = openDatabase(shortName, version, displayName, maxSize);
		db.transaction(function(transaction) {
			transaction.executeSql(UPDATE_EVENT_INSTANCE, [beginTime, id], nullHandler, errorHandler);
		});
		if (type === 'activity') {

			db.transaction(function(transaction) {
				transaction.executeSql(UPDATE_ACTIVITY, [amount, endTime, id], nullHandler, errorHandler);
			});
		} else {
			
			db.transaction(function(transaction) {
				transaction.executeSql(UPDATE_FOOD, [amount, id], nullHandler, errorHandler);
			});
		}
	}
	
	/*
	 * This method sets deleted on 1(true) of the given id and thereby basically
	 * in-activates the record
	 */
	function deleteActivityEvent(id) {
		var db = openDatabase(shortName, version, displayName, maxSize);
		//alert('addEvent : '+ eventName+' , eventType: '+eventType);

		db.transaction(function(transaction) {
			transaction.executeSql(DELETE_INSTANCE, [id], nullHandler, errorHandler);
		});
		sendDbData();
	}
	/*
	 * Same as deleteActivity
	 */
	function deleteFoodEvent(id) {
		var db = openDatabase(shortName, version, displayName, maxSize);
		//alert('addEvent : '+ eventName+' , eventType: '+eventType);

		db.transaction(function(transaction) {
			transaction.executeSql(DELETE_INSTANCE, [id], nullHandler, errorHandler);
		});
		sendDbData();

	}
	
	
	function addFoodEventInstance(event, amount, beginTime, eventID) {
		//could not manage to keep the db connection global, so connection need to
		//be openned for every call
		var db = openDatabase(shortName, version, displayName, maxSize);
		db.transaction(function(transaction) {
			transaction.executeSql(ADD_INSTANCE, [beginTime, eventID], function(transaction, result){
				
				db.transaction(function(transaction) {
					transaction.executeSql(ADD_FOOD, [result.insertId, amount], nullHandler, errorHandler);
				});
			}, errorHandler);
			});
		
		
		sendDbData();
	}

	function addActivityEventInstance(event, intensity, beginTime, eventID) {
		//could not manage to keep the db connection global, so connection need to
		//be openned for every call
		var db = openDatabase(shortName, version, displayName, maxSize);
		db.transaction(function(transaction) {
			transaction.executeSql(ADD_INSTANCE, [beginTime, eventID], function(transaction, result){
				
				db.transaction(function(transaction) {
					transaction.executeSql(ADD_ACTIVITY, [result.insertId, intensity], nullHandler, errorHandler);
				});
			}, errorHandler);
		});
		
		sendDbData();

	}
	
	function addEvent(eventName, eventType) {
		var db = openDatabase(shortName, version, displayName, maxSize);
		db.transaction(function(transaction) {
			transaction.executeSql(SELECT_PARTICULAR_EVENT, [eventName], function(transaction, result){
				if(result.rows.length > 0){
					alert('Event allready exists')
				}
				else{
					db.transaction(function(transaction) {
						transaction.executeSql(ADD_EVENT, [eventName, eventType], function(){
							sendDbData();
						}, errorHandler);
					});
					
					
				}
			}, errorHandler);
		}, errorHandler, nullHandler);
		
		
	}
	
}