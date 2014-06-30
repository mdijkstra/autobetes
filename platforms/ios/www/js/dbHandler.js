function dbHandler(shortName, version, displayName, maxSize) {

	this.shortName = shortName;
	this.version = version;
	this.displayName = displayName;
	this.maxSize = maxSize;
	var results = [];

	//add methods to objects
	this.addEvent = addEvent;
	this.listEventsOfEventType = listEventsOfEventType;
	this.listAllEvents = listAllEvents;
	this.editEvent = editEvent;
	this.listHistoryEvents = listHistoryEvents;
	this.listCurrentEvents = listCurrentEvents;
	this.addFoodEventInstance = addFoodEventInstance;
	this.addActivityEventInstance = addActivityEventInstance;
	this.setRightScreen = setRightScreen;
	this.sendDbData = sendDbData;
	
	//add all the sql queries
	//create statements
	var CREATE_EVENT = 'CREATE TABLE IF NOT EXISTS Event(id INTEGER PRIMARY KEY AUTOINCREMENT, sID INTEGER, name TEXT NOT NULL, eventType TEXT NOT NULL, beenSent INTEGER DEFAULT 0, deleted INTEGER DEFAULT 0, timeStamp INTEGER)';
	var CREATE_EVENTINSTANCE = 'CREATE TABLE IF NOT EXISTS EventInstance ( id INTEGER NOT NULL AUTO INCREMENT, DType TEXT DEFAULT NULL, beginTime INTEGER NOT NULL, event INTEGER NOT NULL, PRIMARY KEY (`id`), CONSTRAINT FK_EventInstance_Event FOREIGN KEY (Event) REFERENCES Event (id))';
	
	var CREATE_FOOD_EVENT = 'CREATE TABLE IF NOT EXISTS FoodEventInstance(id INTEGER PRIMARY KEY AUTOINCREMENT, eventID INTEGER, sID INTEGER, event TEXT NOT NULL, amount INTEGER NOT NULL, beginTime INTEGER NOT NULL, beenSent INTEGER DEFAULT 0, deleted INTEGER DEFAULT 0, timeStamp INTEGER, FOREIGN KEY(eventID) REFERENCES Event(id))';
	var CREATE_ACTIVITY_EVENT = 'CREATE TABLE IF NOT EXISTS ActivityEventInstance(id INTEGER PRIMARY KEY AUTOINCREMENT, eventID INTEGER, sID INTEGER, event TEXT NOT NULL, intensity INTEGER NOT NULL, beginTime INTEGER NOT NULL, endTime INTEGER, beenSent INTEGER DEFAULT 0, deleted INTEGER DEFAULT 0, timeStamp INTEGER, FOREIGN KEY(eventID) REFERENCES Event(id))';
	
	
	//update statements
	var SET_BEEN_SENT_EVENT = 'UPDATE Event SET beenSent = 1, sID =? WHERE id = ?';
	var SET_BEEN_SENT_FOOD = 'UPDATE FoodEventInstance SET beenSent = 1, sID=? WHERE id = ?';
	var SET_BEEN_SENT_ACTIVITY = 'UPDATE ActivityEventInstance SET beenSent = 1, sID=? WHERE id = ?';
	var UPDATE_ACTIVITY = 'UPDATE ActivityEventInstance SET event=?, intensity= ?, beginTime= ?, endTime=?, beenSent = 0 WHERE id = ?';
	var UPDATE_FOOD = 'UPDATE FoodEventInstance SET event=?, amount= ?, beginTime= ?, beenSent = 0 WHERE id = ?';
	var DELETE_ACTIVITY = 'UPDATE ActivityEventInstance SET deleted = 1, beenSent = 0 WHERE id = ?';
	var DELETE_FOOD = 'UPDATE FoodEventInstance SET deleted = 1, beenSent = 0 WHERE id = ?';
	
	//select statements
	var SELECT_CURRENT_EVENT_INSTANCES = 'SELECT * FROM ActivityEventInstance where endTime IS NULL and deleted = 0 ORDER BY beginTime DESC;';
	var SELECT_FOOD_EVENT_INSTANCES = 'SELECT * FROM FoodEventInstance where deleted = 0 ORDER BY beginTime DESC;';
	var SELECT_ACTIVITY_EVENT_INSTANCES = 'SELECT * FROM ActivityEventInstance where endTime IS NOT NULL and deleted = 0 ORDER BY beginTime DESC;';
	var SELECT_ALL_EVENTS = 'SELECT * FROM Event ORDER BY lower(name) ASC;'
	var SELECT_EVENTS_WITH_TYPE = 'SELECT * FROM Event where eventType = ? ORDER BY lower(name) ASC;';
	var SELECT_UNSENT_EVENTS = 'SELECT * FROM Event where beenSent = 0;';
	var SELECT_UNSENT_FOOD_INSTANCES =  'SELECT * FROM FoodEventInstance f, EVENT e WHERE f.eventID = e.id AND f.beenSent = 0 AND e.sID IS NOT NULL;';
	var SELECT_UNSENT_ACTIVITY_INSTANCES = 'SELECT * FROM ActivityEventInstance a, EVENT e WHERE a.eventID = e.id AND beenSent = 0 AND endTime IS NOT NULL AND e.href IS NOT NULL;';
	var SELECT_PARTICULAR_EVENT = 'SELECT * FROM Event where name = ?;';
	
	//insert statements
	var ADD_FOOD = 'INSERT INTO FoodEventInstance(eventID, event, amount, beginTime) VALUES (?,?,?,?)';
	var ADD_ACTIVITY = 'INSERT INTO ActivityEventInstance(eventID, event, intensity, beginTime) VALUES (?,?,?,?)';
	var ADD_EVENT = 'INSERT INTO Event(name, eventType) VALUES (?,?)';
	
	
	//add SQL queries
	var LIST_CURRENT_EVENTS_QUERY = 'SELECT * FROM ActivityEventInstance where endTime IS NULL and deleted = 0 ORDER BY beginTime DESC;';
	
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
		tx.executeSql( 'DROP TABLE IF EXISTS Event',
		[],nullHandler,errorHandler);
		
		tx.executeSql( 'DROP TABLE IF EXISTS FoodEventInstance;',
		[],nullHandler,errorHandler);

		tx.executeSql( 'DROP TABLE IF EXISTS ActivityEventInstance;',
		[],nullHandler,errorHandler);
		*/

		//execute queries for creation of the table
		tx.executeSql('CREATE TABLE IF NOT EXISTS Event(id INTEGER PRIMARY KEY AUTOINCREMENT, sID INTEGER, name TEXT NOT NULL, eventType TEXT NOT NULL, beenSent INTEGER DEFAULT 0, deleted INTEGER DEFAULT 0, timeStamp INTEGER)', [], nullHandler, errorHandler);

		tx.executeSql('CREATE TABLE IF NOT EXISTS FoodEventInstance(id INTEGER PRIMARY KEY AUTOINCREMENT, eventID INTEGER, sID INTEGER, event TEXT NOT NULL, amount INTEGER NOT NULL, beginTime INTEGER NOT NULL, beenSent INTEGER DEFAULT 0, deleted INTEGER DEFAULT 0, timeStamp INTEGER, FOREIGN KEY(eventID) REFERENCES Event(id))', [], nullHandler, errorHandler);

		tx.executeSql('CREATE TABLE IF NOT EXISTS ActivityEventInstance(id INTEGER PRIMARY KEY AUTOINCREMENT, eventID INTEGER, sID INTEGER, event TEXT NOT NULL, intensity INTEGER NOT NULL, beginTime INTEGER NOT NULL, endTime INTEGER, beenSent INTEGER DEFAULT 0, deleted INTEGER DEFAULT 0, timeStamp INTEGER, FOREIGN KEY(eventID) REFERENCES Event(id))', [], nullHandler, errorHandler);

	}, errorHandler, successCallBack);


	/*
	 * This method selects all the records of ActivityEventInstance that are currently running. And calls
	 * showCurrentEvents to insert the info in the DOM
	 */
	function listCurrentEvents() {
		$('.event-list3').html('');
		//empty list
		var db = openDatabase(shortName, version, displayName, maxSize);
		db.transaction(function(transaction) {
			transaction.executeSql(LIST_CURRENT_EVENTS_QUERY, []
			, showCurrentEvents, errorHandler);
		}, errorHandler, nullHandler);
	}
	/*
	 * This method pushes the results in the array subsequently,
	 * in order to perform a sorting later on. This method only
	 * gets executed when all the event instances need to be listed.
	 * In that case both tables, activityeventinstance and foodeventinstance, need to be called in sql
	 * and so sql cannot order it
	 */
	function fillResultsArray(transaction, result) {
		
		if (result !== null && result.rows !== null) {

			for (var i = 0; i < result.rows.length; i++) {

				var row = result.rows.item(i);
				results.push(row);
			}

		}
	}
	/*
	 * This method will be executed after fillResultsArray. So then both
	 * queries are executed and stored in the array. This method then sorts
	 * the array and calls showEventInstanceList.
	 */
	function fillResultsArray2(transaction, result) {
		//push results in array
		if (result !== null && result.rows !== null) {

			for (var i = 0; i < result.rows.length; i++) {

				var row = result.rows.item(i);
				results.push(row);
			}

		}

		//sort array
		results.sort(function(a, b) {
			return parseInt(b.beginTime) - parseInt(a.beginTime);
		});

		//fill the view list
		showEventInstanceList('inputIsArray', results);

	}
	/*
	 * This method selects all the EventInstances regarding the given event type. 
	 */
	function listHistoryEvents(type) {

		results = [];
		$('.event-list2').html('');
		//empty list
		var db = openDatabase(shortName, version, displayName, maxSize);

		if (type === 'Food') {
			db.transaction(function(transaction) {
				transaction.executeSql('SELECT * FROM FoodEventInstance where deleted = 0 ORDER BY beginTime DESC;', [], showEventInstanceList, errorHandler);
			}, errorHandler, nullHandler);

		} else if (type === 'Activity') {
			db.transaction(function(transaction) {
				transaction.executeSql('SELECT * FROM ActivityEventInstance where endTime IS NOT NULL and deleted = 0 ORDER BY beginTime DESC;', [], showEventInstanceList, errorHandler);
			}, errorHandler, nullHandler);
		} else if (type === 'All' || type === null) {
			//because transaction occurs asynchronously the code after both transactions will be called before the array is filled,
			//so the second transaction has a diffrent method in where the post-transaction-code resides

			//fill array results with food event instances
			db.transaction(function(transaction) {
				transaction.executeSql('SELECT * FROM FoodEventInstance where deleted = 0 ORDER BY beginTime DESC;', [], fillResultsArray, errorHandler);
			}, errorHandler, nullHandler);
			//array is filled with food event instances
			//now fill the array with activity event instances
			db.transaction(function(transaction) {
				transaction.executeSql('SELECT * FROM ActivityEventInstance where endTime IS NOT NULL and deleted = 0 ORDER BY beginTime DESC;', [], fillResultsArray2, errorHandler);
			}, errorHandler, nullHandler);

		}

	}
	/*
	* This method selects all the events stored in the db
	*/
	function listAllEvents() {
		$('#event-list').html('');
		var db = openDatabase(shortName, version, displayName, maxSize);
		db.transaction(function(transaction) {
			transaction.executeSql('SELECT * FROM Event ORDER BY lower(name) ASC;', [], showList, errorHandler);
		}, errorHandler, nullHandler);
	}
	/*
	 * This method selects all events of a certain eventType
	 */
	function listEventsOfEventType(eventType) {
		$('#event-list').html('');
		var db = openDatabase(shortName, version, displayName, maxSize);
		db.transaction(function(transaction) {
			transaction.executeSql('SELECT * FROM Event where eventType = ? ORDER BY lower(name) ASC;', [eventType], showList, errorHandler);
		}, errorHandler, nullHandler);

	}
	/*
	 * This method selects all the data from every table, and calls other methods to send the data to the server
	 */
	function sendDbData() {
		
		var db = openDatabase(shortName, version, displayName, maxSize);
		
		db.transaction(function(transaction) {
			transaction.executeSql('SELECT * FROM Event where beenSent = 0;', [], sendEvents, errorHandler);
		}, errorHandler, nullHandler);
		
		db.transaction(function(transaction) {
			transaction.executeSql('SELECT * FROM FoodEventInstance f, EVENT e WHERE f.eventID = e.id AND f.beenSent = 0 AND e.sID IS NOT NULL;', [], sendFoodEventInstance, errorHandler);
		}, errorHandler, nullHandler);
		
		/*
		db.transaction(function(transaction) {
			transaction.executeSql('SELECT * FROM ActivityEventInstance a, EVENT e WHERE a.eventID = e.id AND beenSent = 0 AND endTime IS NOT NULL AND e.href IS NOT NULL;', [], sendActivityEventInstance, errorHandler);
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
			transaction.executeSql('UPDATE Event SET name=?, eventType =? WHERE id =?', [eventName, eventType, eventKey], nullHandler, errorHandler);
		});
		//present the edited button on top of the list with a green background
		//indicate that the green button on top needs to be shown
		$('#presentBoolean').text('show');
		//show div
		$('#recentlyAddedEvent').show();
		//tag certain event to be presented on top. The method showlist handles
		//this privilege
		$('#eventNameToBePrivileged').text(eventName);
		
	}
	/*
	 * 
	 */
	function editEventInstance(id, type) {
		//extract time and date from html
		var beginTimeAndDate = $('#mydate2').val() + " " + $('#beginTime').val();
		//convert to unix timestamp
		var unixBeginTime = Date.parse(beginTimeAndDate).getTime();
		//same with end time
		var endTimeAndDate = $('#mydate2').val() + " " + $('#endTime').val();
		var unixEndTime = Date.parse(endTimeAndDate).getTime();

		//correct endtime if necessary(when end date is actually one day later
		//convert to date objects for comparison
		var beginDate = new Date(unixBeginTime);
		var endDate = new Date(unixEndTime);
		
		if (beginDate.getHours() > endDate.getHours()) {
			//end time is before begin time, so we automatically suppose that
			//end time is next day
			unixEndTime += 86400000;
			//add one day in milliseconds
		} else if (beginDate.getHours() === endDate.getHours() && beginDate.getMinutes() > endDate.getMinutes()) {
			//same case as the if statement
			unixEndTime += 86400000;
			//add one day in milliseconds
		}
		//update event instance in database
		var db = openDatabase(shortName, version, displayName, maxSize);
		if (type === 'activity') {

			db.transaction(function(transaction) {
				transaction.executeSql('UPDATE ActivityEventInstance SET event=?, intensity= ?, beginTime= ?, endTime=?, beenSent = 0 WHERE id = ?', [$('#startEventName2').text(), $('#slider-3').val(), unixBeginTime, unixEndTime, id], nullHandler, errorHandler);
			});
		} else {

			db.transaction(function(transaction) {
				transaction.executeSql('UPDATE FoodEventInstance SET event=?, amount= ?, beginTime= ?, beenSent = 0 WHERE id = ?', [$('#startEventName2').text(), $('#slider-3').val(), unixBeginTime, id], nullHandler, errorHandler);
			});
		}
		//send db data to server
		sendDbData();
	}
	/*
	 * This method sets deleted on 1(true) of the given id and thereby basically
	 * in-activates the record
	 */
	function deleteActivity(id) {

		var db = openDatabase(shortName, version, displayName, maxSize);
		//alert('addEvent : '+ eventName+' , eventType: '+eventType);

		db.transaction(function(transaction) {
			transaction.executeSql('UPDATE ActivityEventInstance SET deleted = 1, beenSent = 0 WHERE id = ?', [id], nullHandler, errorHandler);
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
			transaction.executeSql('UPDATE FoodEventInstance SET deleted = 1, beenSent = 0 WHERE id = ?', [id], nullHandler, errorHandler);
		});
		sendDbData();

	}
	/*
	 * This method is a callback function. It iterates the result array and present every
	 * item as a button on the page
	 */
	function showList(transaction, result) {
		if (result !== null && result.rows !== null) {
			
			for (var i = 0; i < result.rows.length; i++) {
				var row = result.rows.item(i);
				
				if($('#presentBoolean').text() === 'show' && $('#eventNameToBePrivileged').text() === row.name ){
				//the item need to be presented as a special button on top of the list, not in the list itself
				var buttonText = '<span id="name">' + row.name + '</span><span id="eventType" style="display: none">'+row.eventType+'</span><span id="eventKey" style="display: none">'+row.id+'</span>';
				//show new event in button on top of the list
				$('#recentAddedEventButton').html(buttonText);
				$('#recentAddedEventButton').val(row.eventType);
				
				
				//ensure next call this button is not presented
				$('#presentBoolean').text('hide');
				
				}
				else{
					//item just needs to be presented in the list
					var eventButton = $('<A CLASS="eventButtons ui-btn ui-shadow ui-corner-all"><span id="name">' + row.name + '</span><span id="eventType" style="display: none">'+row.eventType+'</span><span id="eventKey" style="display: none">'+row.id+'</span></A>');
					eventButton.val(row.eventType);
				$('#event-list').append(eventButton);
				//set click function
				eventButton.click(function() {
					setRightScreen(this);
				});

			}
			}
		} else {
			//nothing in db
		}
		if($('#editModeButton').val() ==="on"){
			//edit mode is on, background needs to be changed to make that clear
			//to the user
    		$('.eventButtons').attr("style","background: #8df3e6 !important");
    		
        }
	}
	/*
	 * This method gets called when an event button is clicked. When the edit mode is on
	 * the screen in where the user can modify the event will be set. When de edit mode
	 * is not on, the start2(start event) screen will be set.
	 */
	function setRightScreen(context){
		
		if($('#editModeButton').val() ==="on"){
			//edit mode is on, the screen newEvent will be used
			
			window.location.href = '#newEvent';
			//get eventKey
			var eventKey = $(context).find('#eventKey').text();
			//set eventKey
			$('#eventKey').text(eventKey);
			//set header name
			$('#newEvent').find("#headerName").text("Edit");
			//set name of event 
			$('#newEvent').find('#newEventName').val($(context).find("#name").text());
			
			//get event type
			var eventType = $(context).find('#eventType').text();
			//set the fieldset right
			if(eventType === "food"){
            	$("#radio-choice-h-2a").prop("checked", true);
            	$("#radio-choice-h-2b").prop("checked",false);
            	$("input[type='radio']").checkboxradio("refresh");
			}
			else{
				$("#radio-choice-h-2b").prop("checked", true);
				$("#radio-choice-h-2a").prop("checked", false);
            	$("input[type='radio']").checkboxradio("refresh");
			}
			
		}
		else{
			//edit mode is off. open start2 screen
			window.location.href = '#start2';
			//set reference id of the event
			var eventKey = $(context).find('#eventKey').text();
			
			fillAddEventScreen(context, eventKey);
		}
	}
	
	function showCurrentEvents(inputType, result) {
		//html tags for the opening of the list

		var html = '<ul class="ui-listview" data-role="listview" data-icon="false" data-split-icon="delete">';
		//open list
		html += '<li class="ui-li-has-alt ui-first-child">';
		//open list item
		var type;
		var endedActivity = 'false';

		var arrayLength = result.rows.length;
	
		for (var i = 0; i < arrayLength; i++) {
			//progress results
			var row = result.rows.item(i);
			
			
			

			//add button to html
			html += makeEventButton(row, 'running');
			//end list item
			html += '</li>';
			if (i + 1 < arrayLength) {
				//there is a next item so new <li> can be set
				html += '<li class="ui-li-has-alt">';
			}
		}
		//close list tag
		html += "</ul>";

		$('.event-list3').append(html);
		//add functionality to end activity button
		
		$(function() {
			$('.endEvent').click(function() {
				
				var bd = new parseButtonData(this);
				//button data object

				insertDataInEditScreen(bd);

				//remove startbutton wich can be present
				if ($('#startButton2')) {
					$('#startButton2').remove();
				}
				var editEventButton = $('<A data-rel="back" id="startButton2" type CLASS="ui-btn ui-shadow ui-corner-all">' + "Save" + '</A>');

				$('#editScreen').append(editEventButton);
				editEventButton.click(function() {
				//edit event
				editEventInstance(bd.id, bd.type);
	
				
				});
			});
		});
	}

	function showEventInstanceList(inputType, result) {
		//html tags for the opening of the list

		var html = '<ul class="ui-listview" data-role="listview" data-icon="false" data-split-icon="delete">';
		//open list
		html += '<li class="ui-li-has-alt ui-first-child">';
		//open list item
		var type;
		var endedActivity = 'false';

		var arrayLength;
		if (inputType === 'inputIsArray') {
			arrayLength = result.length;
		} else {
			arrayLength = result.rows.length;
		}

		for (var i = 0; i < arrayLength; i++) {
			//progress results
			var row;
			if (inputType === 'inputIsArray') {
				row = result[i];
			} else {
				row = result.rows.item(i);
			}
			if (row.intensity) {
				type = 'activity';
				if (row.endTime !== null) {
					endedActivity = 'true';
				}
			} else {
				type = 'food';
			}
			//there are three types of events that are relevant for creating the list
			//food activity, current event and ended event

			//add button to html
			html += makeEventButton(row, 'ended');
			//end list item
			html += '</li>';
			if (i + 1 < arrayLength) {
				//there is a next item so new <li> can be set
				html += '<li class="ui-li-has-alt">';
			}
		}
		//close list tag
		html += "</ul>";

		$('.event-list2').append(html);
		//add functionality to end activity button
		//if button be clicked, data will be extracted, editScreenActivity will be opened
		//and the data will be inserted
		
		$(function() {
			$('.editEvent').click(function() {
				
				var bd = new parseButtonData(this);
				//button data object

				insertDataInEditScreen(bd);

				//remove startbutton wich can be present
				if ($('#startButton2')) {
					$('#startButton2').remove();
				}
				var editEventButton = $('<A data-rel="back" id="startButton2" type CLASS="ui-btn ui-shadow ui-corner-all">' + "Save" + '</A>');
				
				$('#editScreen').append(editEventButton);
				editEventButton.click(function() {
					//edit event

					editEventInstance(bd.id, bd.type);
					//refresh the right list
					/*
					 if(type ==='activity'){
					 if(endedActivity === 'true'){
					 listHistoryActivityEvents();
					 }
					 else{
					 listCurrentEvents();
					 }
					 }
					 else{
					 listHistoryFoodEvents();
					 }
					 */

				});

			});
		});
		
		$(function() {
			$('.deleteEvent').click(function() {
				//before event be deleted(inactivated) a confirm box pops up
				//to ensure the user 
				var eventName = $(this).find('#eventName').text();
				var eventID = parseInt($(this).find('#eventID').text());
				var eventType = $(this).find('#eventType').text();
				
				$('#dialogText').html('Are you sure you want to delete '+ eventName+'?');
				
					$('#dialogConfirmButton').click(function() {
						var selectedTabIndex = $(document).data('selectedTabIndex2');
						var selectedTab = selectedTabIndex === undefined ? null : selectedTabIndex.eventType;
						if (eventType === 'Activity') {
							deleteActivity(eventID);
							listHistoryEvents(selectedTab);
						}
						 else {

							deleteFoodEvent(eventID);
							listHistoryEvents(selectedTab);
						}
					});
				

			});
		});

	}

	function addFoodEventInstance(event, amount, beginTime, eventKey) {
		//could not manage to keep the db connection global, so connection need to
		//be openned for every call
		var db = openDatabase(shortName, version, displayName, maxSize);

		db.transaction(function(transaction) {
			transaction.executeSql('INSERT INTO FoodEventInstance(eventID, event, amount, beginTime) VALUES (?,?,?,?)', [eventKey, event, amount, beginTime], nullHandler, errorHandler);
		});
		sendDbData();
	}

	function addActivityEventInstance(event, intensity, beginTime, eventKey) {
		//could not manage to keep the db connection global, so connection need to
		//be openned for every call
		var db = openDatabase(shortName, version, displayName, maxSize);

		db.transaction(function(transaction) {
			transaction.executeSql('INSERT INTO ActivityEventInstance(eventID, event, intensity, beginTime) VALUES (?,?,?,?)', [eventKey, event, intensity, beginTime], nullHandler, errorHandler);
		});
		sendDbData();

	}
	
	function addEvent(eventName, eventType) {
		//i could not manage to keep the db connection global, so connection need to
		//be openned every call
		var db = openDatabase(shortName, version, displayName, maxSize);
		db.transaction(function(transaction) {
			transaction.executeSql('SELECT * FROM Event where name = ?;', [eventName], function(transaction, result){
				if(result.rows.length > 0){
					alert('Event allready exists')
				}
				else{
					db.transaction(function(transaction) {
						transaction.executeSql('INSERT INTO Event(name, eventType) VALUES (?,?)', [eventName, eventType], function(){
							sendDbData();
						}, errorHandler);
					});
					//new added event need to be privileged
					$('#presentBoolean').text('show');
					$('#recentlyAddedEvent').show();
					$('#eventNameToBePrivileged').text(eventName);
					
				}
			}, errorHandler);
		}, errorHandler, nullHandler);
		
		
	}

	function sendEvents(transaction, result){
		if (result !== null && result.rows !== null) {

			for (var i = 0; i < result.rows.length; i++) {

				var row = result.rows.item(i);

				var eventObject = {
						'name' : row.name,
						'owner': '1',
						'eventType': row.eventType
				};

				restClient.add('http://localhost:8080/api/v1/event', eventObject,	function(data, textStatus, response){
			    	var location = response.getResponseHeader('Location');//Api returns new resource location when creating a new entity
					if(textStatus === 'success'){
						var sID = parseInt(location.substr(location.lastIndexOf('/')+1));
						console.log("sID: " + sID);
			        	db.transaction(function(transaction) {
							transaction.executeSql('UPDATE Event SET beenSent = 1, sID =? WHERE id = ?', [sID, row.id], nullHandler, errorHandler);
						});
						
					}
				}, callbackError);
			
			}
		}
	}
	
	function callbackError(request, textStatus, error){
		console.log(request);
		console.log(textStatus);
		console.log(error);
	}
	
	function callbackSuccess(data, textStatus, response){
    	var location = response.getResponseHeader('Location');//Api returns new resource location when creating a new entity
		if(textStatus === 'success'){
			//row successfully sent, now row has to be updated with beenSent = 1
			console.log("update event:"+ row);
			console.log("href is:"+ location);
        	db.transaction(function(transaction) {
				transaction.executeSql('UPDATE Event SET beenSent = 1, sID =? WHERE id = ?', [location, row.id], nullHandler, errorHandler);
			});
			
		}
	}

	function sendFoodEventInstance(transaction, result){
		if (result !== null && result.rows !== null) {

			for (var i = 0; i < result.rows.length; i++) {

				var row = result.rows.item(i);
				console.log("the row object:"+ row.href)
				
				var eventObject = {
						'event' : row.event,
						'owner': '1',
						'beginTime': row.beginTime,
						'amount' : row.amount

				};

				restClient.add('http://localhost:8080/api/v1/foodEventInstanceFull', eventObject, function(data, textStatus, response){
					if(textStatus === 'success'){
						//row successfully sent, now row has to be updated with beenSent = 1
						var location = response.getResponseHeader('Location');//Api returns new resource location when creating a new entity
						var db = openDatabase(shortName, version, displayName, maxSize);
						
						db.transaction(function(transaction) {
							transaction.executeSql('UPDATE FoodEventInstance SET beenSent = 1, sID=? WHERE id = ?', [location, row.id], nullHandler, errorHandler);
						});
						
					}
				});
			}
		}
	}

	function sendActivityEventInstance(transaction, result){
		if (result !== null && result.rows !== null) {

			for (var i = 0; i < result.rows.length; i++) {

				var row = result.rows.item(i);

				var eventObject = {
						'event' : row.event,
						'owner': '1',
						'beginTime': row.beginTime,
						'intensity' : row.intensity,
						'endTime' : row.endTime
				};

				restClient.add('http://localhost:8080/api/v1/activityEventInstanceFull', eventObject, function(data, textStatus, request){
					if(textStatus === 'success'){
						//row successfully sent, now row has to be updated with beenSent = 1
						var location = response.getResponseHeader('Location');//Api returns new resource location when creating a new entity
						var db = openDatabase(shortName, version, displayName, maxSize);
						db.transaction(function(transaction) {
							transaction.executeSql('UPDATE ActivityEventInstance SET beenSent = 1, sID=? WHERE id = ?', [location, row.id], nullHandler, errorHandler);
						});
					}
				});

			}
		}
	}

	// this is called when an error happens in a transaction
	function errorHandler(transaction, error) {
		alert('Error: ' + error.message + ' code: ' + error.code);

	}
	function successCallBack(transaction, results){
		
	}

	function nullHandler() {
	}
	
	/*
	 * This method gets called when the user wants to start an event intstance. It retrieves the context,
	 * which is the context of clicked button, and the eventKey which is the primary
	 * key to the event.
	 */
	function fillAddEventScreen(context, eventKey){
		//set the eventID which is the primary key of the event
		$('#eventID').text(eventKey);
		//set event name
		$('#startEventName').html($(context).find('#name').text());
		//get current time
		var curTime = new Date();
		var month = curTime.getMonth() + 1;
		var day = curTime.getDate();
		//make date string for the jquery datepicker plugin, to select
		//the current time.
		if (month < 10) {
			//ensure month consist of 2 digits(necessary in jquery plugin
			month = "0" + month;
		}
		if (day < 10) {
			day = "0" + day;//same as for month
		}
		var dateStringForMyDate = curTime.getFullYear() + "-" + month + '-' + day;
		//set the current time
		$('#mydate').val(dateStringForMyDate);
		//make time string in the same fashion as the date string
		var currentMinutes = curTime.getMinutes();
		if (parseInt(currentMinutes) < 10) {
			currentMinutes = "0" + currentMinutes;
		}
		var currentHours = curTime.getHours();
		if (parseInt(currentHours) < 10) {
			currentHours = "0" + currentHours;
		}
		var timeStringForMyTime = currentHours + ":" + currentMinutes;
		$('#mytime').val(timeStringForMyTime);
		
		//add event screen varies by event type
		var eventType = $(context).val();
		$('#eventType2').text(eventType);
		if (eventType === 'food') {
			$('#quantity').html('Amount');
			$('#intensityToText').hide();
			
			$('#slider-2').attr('min', '0.25');
			$('#slider-2').attr('step', '0.25');
			$('#slider-2').val('1').slider('refresh');
			
		} else {
			$('#quantity').html('Intensity');
			$('#slider-2').attr('min', '1');
			$('#slider-2').attr('step', '1');
			$('#slider-2').val('1').slider('refresh');
			setIntensityText('#intensityToText', parseInt($('#slider-2').val()));

			$('#slider-2').change(function() {

				setIntensityText('#intensityToText', parseInt($('#slider-2').val()));
			});
			$('#intensityToText').show();
			
		}
		

	}

}

function parseButtonData(context) {
	//extract values
	this.eventName = $(context).children("h3:first").text();
	this.id = $(context).children('p:first').text();
	this.month = $(context).find('#month').text();
	this.day = $(context).find('#day').text();
	this.year = $(context).find('#year').text();
	this.hours = $(context).find('#beginHours').text();
	this.minutes = $(context).find('#beginMinutes').text();
	this.beginTime = this.hours + ":" + this.minutes;

	if ($(context).find('#intensity').text() === '') {
		//food event
		this.intensity = $(context).find('#amount').text();
		this.type = 'food';
	} else {
		//activity event
		this.intensity = $(context).find('#intensity').text();
		this.type = 'activity';
	}
	//modify data to make it compatible for jquery widgets
	if (parseInt(this.month) < 10) {
		this.month = "0" + this.month;
	}

	if (parseInt(this.day) < 10) {
		this.day = "0" + this.day;
	}
	if (parseInt(this.hours) < 10) {
		this.beginTime = "0" + this.beginTime;
	}

	this.dateStringForMyDate = this.year + "-" + this.month + '-' + this.day;

	if ($(context).find('#endHours').text() === '') {
		//button has no end time, so activity is still going, current time
		//will be used as end time

		var curTimePoint = new Date();
		var curMinutes = parseInt(curTimePoint.getMinutes());
		var curHour = parseInt(curTimePoint.getHours());
		//modify data to make it compatible for jquery widgets
		if (curMinutes < 10) {
			curMinutes = "0" + curMinutes;
		}
		if (curHour < 10) {
			curHour = "0" + curHour;
		}

		this.endTime = curHour + ":" + curMinutes;

	} else {
		//button has end time, so activity has allready ended
		//parse end time string
		this.endTime = $(context).find('#endHours').text() + ":" + $(context).find('#endMinutes').text();

		if (parseInt($(context).find('#endHours').text()) < 10) {
			endTime = "0" + this.endTime;
		}
	}
}

function insertDataInEditScreen(bd) {
	//insert button data into editscreenActivity
	$('#startEventName2').html(bd.eventName);
	$('#mydate2').val(bd.dateStringForMyDate);
	$('#beginTime').val(bd.beginTime);
	

	if (bd.type === 'activity') {
		//activity has an endtime
		$('#endTimeField').show();
		$('#endTime').val(bd.endTime);
		$('#quantity2').text('Intensity');
		$('#intensityToText2').show();
		$('#slider-3').attr('step', '1');
		$('#slider-3').attr('min', '1');
		$('#slider-3').val(bd.intensity).slider('refresh');
		
		setIntensityText('#intensityToText2', parseInt(bd.intensity));

		$('#slider-3').change(function() {
			setIntensityText('#intensityToText2', parseInt($('#slider-3').val()));

		});

	} else {
		$('#slider-3').attr('step', '0.25');
		$('#slider-3').attr('min', '0.25');
		$('#slider-3').val(bd.intensity).slider('refresh');
		$('#intensityToText2').hide();
		$('#endTimeField').hide();
		$('#quantity2').text('Amount');

	}

}
/*
 * Sets the right color according to the given value
 */
function setIntensityText(selector, value) {
	switch(value) {
		case 1:
			$(selector).css({
				'color' : '#CCFF33'
			});
			$(selector).text('Very easy');
			break;
		case 2:
			$(selector).css({
				'color' : '#99FF33'
			});
			$(selector).text('Somewhat easy');
			break;
		case 3:
			$(selector).css({
				'color' : '#33CC33'
			});
			$(selector).text('Moderate');
			break;
		case 4:
			$(selector).css({
				'color' : '#FF9933'
			});
			$(selector).text('Somewhat hard');
			break;
		case 5:
			$(selector).css({
				'color' : '#FF6600'
			});
			$(selector).text('Moderately hard');
			break;
		case 6:
			$(selector).css({
				'color' : '#FF0000'
			});
			$(selector).text('Hard');
			break;
		case 7:
			$(selector).css({
				'color' : '#FF0000'
			});
			$(selector).text('Hard');
			break;
		case 8:
			$(selector).css({
				'color' : '#CC0000'
			});
			$(selector).text('Very hard');
			break;
		case 9:
			$(selector).css({
				'color' : '#A31919'
			});
			$(selector).text('Very, very hard');
			break;
		case 10:
			$(selector).css({
				'color' : '#721212'
			});
			$(selector).text('Maximal');
			break;

	}

}

function makeEventButton(row, buttonType) {
	//
	var date = new Date(row.beginTime);
	var minutes = parseInt(date.getMinutes());
	//make string to display the date
	var dateString = '<span id="day">' + date.getDate() + '</span>-<span id="month">' + (date.getMonth() + 1) + '</span>-<span id="year">' + date.getFullYear() + '</span>';

	if (minutes < 10) {
		//show minutes correct
		minutes = "0" + minutes;
	}
	//timestring, contains begintime and end time in case of ended activities
	var timeString;
	if (row.endTime === null) {
		//going activity, dont display endTime
		timeString = '<p class="ui-li-aside"><strong><span id="beginHours">' + date.getHours() + '</span>:<span id="beginMinutes">' + minutes + '</span></strong><br>'+dateString+'</p>';
	} else if (row.amount) {
		//event is food
		timeString = '<p class="ui-li-aside"><strong><span id="beginHours">' + date.getHours() + '</span>:<span id="beginMinutes">' + minutes + '</span></strong><br>'+dateString+'</p>';
	} else {
		//ended activity, display endtime to
		var endDate = new Date(row.endTime);
		var endMinutes = parseInt(endDate.getMinutes());
		if (endMinutes < 10) {
			endMinutes = "0" + endMinutes;
		}
		timeString = '<p class="ui-li-aside"><strong><span id="beginHours">' + date.getHours() + '</span>:<span id="beginMinutes">' + minutes + '</span> - <span id="endHours">' + endDate.getHours() + '</span>:<span id="endMinutes">' + endMinutes + '</span></strong><br>'+dateString+'</p>';

	}
	

	var amountOrIntensityString;
	var type;
	if (row.intensity) {
		//this event is an activity
		type = 'Activity';
		amountOrIntensityString = '<p class ="topic"><strong>Intensity: <span id="intensity">' + row.intensity + '</span></strong></p>';
	} else {
		//this event is not an activity
		type = 'Food';
		amountOrIntensityString = '<p class ="topic"><strong>Amount: <span id="amount">' + row.amount + '</span></strong></p>';
	}

	//make html button
	var html = "";
	if(buttonType === "ended"){
		//event has ended so editting will be enabled
		html += '<a href="#editScreen" class="editEvent ui-btn"><p style="display: none">' + row.id + '</p>';
	}
	else{
		//event not ended, so editting is not preferably, button does nothing
		html += '<a class="editEvent ui-btn"><p style="display: none">' + row.id + '</p>';
	}
	html += '<h3>' + row.event + '</h3>';
	html += amountOrIntensityString;
	html += timeString;
	//html += dateString;
	html += '</a>';
	if(buttonType === "ended"){
		//append delete button
		html += '<a href="#deleteDialog" class="deleteEvent ui-btn ui-btn-icon-notext ui-icon-delete" data-rel="dialog" data-transition="slidedown" title="Delete"><p id="eventName" style="display: none">'+row.event+'</p><p id="eventID" style="display: none">' + row.id + '</p><p id="eventType" style="display: none">' + type + '</p></a>';
	}
	else{
		//append an end button,
		html += '<a href="#editScreen" class="endEvent ui-btn ui-icon-stop"  title="End"><p id="eventID" style="display: none">' + row.id + '</p><p id="eventType" style="display: none">' + type + '</p>';
		html += '<h3 style="display: none">' + row.event + '</h3>';
		html += '<p id="intensity" style="display: none">' + row.intensity + '</span>';
		html += '<p style="display: none"><span id="day">' + date.getDate() + '</span>- <span id="month">' + (date.getMonth() + 1) + '</span>- <span id="year">' + date.getFullYear() + '</span></p>';
		html += '<p style="display: none"><span id="beginHours">' + date.getHours() + '</span>:<span id="beginMinutes">' + minutes + '</span></p>';
		html += '</a>';
	}
	return html;
}

