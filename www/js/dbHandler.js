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

	this.listHistoryEvents = listHistoryEvents;
	this.listCurrentEvents = listCurrentEvents;

	this.sendDbData = sendDbData;
	//this.sendHistoryEvents = sendHistoryEvents;
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
		tx.executeSql('CREATE TABLE IF NOT EXISTS Event(name TEXT NOT NULL PRIMARY KEY, eventType TEXT NOT NULL, beenSent INTEGER DEFAULT 0, deleted INTEGER DEFAULT 0)', [], nullHandler, errorHandler);

		tx.executeSql('CREATE TABLE IF NOT EXISTS FoodEventInstance(id INTEGER PRIMARY KEY AUTOINCREMENT, event TEXT NOT NULL, amount INTEGER NOT NULL, beginTime INTEGER NOT NULL, beenSent INTEGER DEFAULT 0, deleted INTEGER DEFAULT 0, FOREIGN KEY(event) REFERENCES Event(name))', [], nullHandler, errorHandler);

		tx.executeSql('CREATE TABLE IF NOT EXISTS ActivityEventInstance(id INTEGER PRIMARY KEY AUTOINCREMENT, event TEXT NOT NULL, intensity INTEGER NOT NULL, beginTime INTEGER NOT NULL, endTime INTEGER, beenSent INTEGER DEFAULT 0, deleted INTEGER DEFAULT 0, FOREIGN KEY(event) REFERENCES Event(name))', [], nullHandler, errorHandler);

	}, errorHandler, successCallBack);

	function listCurrentEvents() {
		$('.event-list3').html('');
		//empty list
		var db = openDatabase(shortName, version, displayName, maxSize);
		db.transaction(function(transaction) {
			transaction.executeSql('SELECT * FROM ActivityEventInstance where endTime IS NULL and deleted = 0 ORDER BY beginTime DESC;', [], showCurrentEvents, errorHandler);
		}, errorHandler, nullHandler);
	}

	function fillResultsArray(transaction, result) {
		//this method pushes the results in the array subsequently,
		//in order to perform a sorting later on. This method only
		//gets executed when all the event instances need to be listed.
		//In that case both tables, activityeventinstance and foodeventinstance, need to be called in sql
		//and so sql cannot order it

		if (result !== null && result.rows !== null) {

			for (var i = 0; i < result.rows.length; i++) {

				var row = result.rows.item(i);
				results.push(row);
			}

		}
	}

	function fillResultsArray2(transaction, result) {
		//is called
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

	function listAllEvents() {
		var db = openDatabase(shortName, version, displayName, maxSize);
		db.transaction(function(transaction) {
			transaction.executeSql('SELECT * FROM Event ORDER BY name ASC;', [], showList, errorHandler);
		}, errorHandler, nullHandler);
	}

	function listEventsOfEventType(eventType) {
		var db = openDatabase(shortName, version, displayName, maxSize);
		db.transaction(function(transaction) {
			transaction.executeSql('SELECT * FROM Event where eventType = ? ORDER BY name ASC;', [eventType], showList, errorHandler);
		}, errorHandler, nullHandler);

	}

	/*
	 function sendHistoryEvents(){
	 var db = openDatabase(shortName, version, displayName, maxSize);
	 db.transaction(function(transaction) {
	 transaction.executeSql('SELECT * FROM FoodEventInstance where beenSent = 0;', [],
	 sendHistoryEventsResults, errorHandler);
	 }, errorHandler, nullHandler);

	 db.transaction(function(transaction) {
	 transaction.executeSql('SELECT * FROM ActivityEventInstance where beenSent = 0;', [],
	 sendHistoryEventsResults, errorHandler);
	 }, errorHandler, nullHandler);

	 }
	 */

	function sendDbData() {
		
		var db = openDatabase(shortName, version, displayName, maxSize);
		db.transaction(function(transaction) {
			transaction.executeSql('SELECT * FROM Event where beenSent = 0;', [], sendEvents, errorHandler);
		}, errorHandler, nullHandler);
		
		db.transaction(function(transaction) {
			transaction.executeSql('SELECT * FROM FoodEventInstance where beenSent = 0;', [], sendFoodEventInstance, errorHandler);
		}, errorHandler, nullHandler);
		
		db.transaction(function(transaction) {
			transaction.executeSql('SELECT * FROM ActivityEventInstance where beenSent = 0 and endTime IS NOT NULL;', [], sendActivityEventInstance, errorHandler);
		}, errorHandler, nullHandler);
	}


	function editEvent(id, type) {
		var beginTimeAndDate = $('#mydate2').val() + " " + $('#beginTime').val();
		var unixBeginTime = Date.parse(beginTimeAndDate).getTime();

		var endTimeAndDate = $('#mydate2').val() + " " + $('#endTime').val();
		var unixEndTime = Date.parse(endTimeAndDate).getTime();

		//correct endtime if necessary(when end date is actually one day later
		//convert to date objects for comparison
		var beginDate = new Date(unixBeginTime);
		var endDate = new Date(unixEndTime);

		if (beginDate.getHours() > endDate.getHours()) {
			//end time is before begin time, so we automatically supose that
			//endt time is next day
			unixEndTime += 86400000;
			//add one day in milliseconds
		} else if (beginDate.getHours() === endDate.getHours() && beginDate.getMinutes() > endDate.getMinutes()) {
			//same case as the if statement
			unixEndTime += 86400000;
			//add one day in milliseconds
		}
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
		sendDbData();
	}

	function deleteActivity(id) {

		var db = openDatabase(shortName, version, displayName, maxSize);
		//alert('addEvent : '+ eventName+' , eventType: '+eventType);

		db.transaction(function(transaction) {
			transaction.executeSql('UPDATE ActivityEventInstance SET deleted = 1, beenSent = 0 WHERE id = ?', [id], nullHandler, errorHandler);
		});
		sendDbData();
	}

	function deleteFoodEvent(id) {

		var db = openDatabase(shortName, version, displayName, maxSize);
		//alert('addEvent : '+ eventName+' , eventType: '+eventType);

		db.transaction(function(transaction) {
			transaction.executeSql('UPDATE FoodEventInstance SET deleted = 1, beenSent = 0 WHERE id = ?', [id], nullHandler, errorHandler);
		});
		sendDbData();

	}

	function showList(transaction, result) {
		if (result !== null && result.rows !== null) {
			$('#startHelpText').html('Choose event to start:');
			$('#searchEventsInputForm').show();
			$('#event-list').html('');
			for (var i = 0; i < result.rows.length; i++) {
				var row = result.rows.item(i);
				var eventButton = $('<A HREF="#start2" CLASS="ui-btn ui-shadow ui-corner-all">' + row.name + '</A>');
				eventButton.val(row.eventType);

				$('#event-list').append(eventButton);

				eventButton.click(function() {
					//window.location.href = "#start2";
					var curTime = new Date();
					var month = curTime.getMonth() + 1;
					var day = curTime.getDate();
					if (month < 10) {
						month = "0" + month;
					}
					if (day < 10) {
						day = "0" + day;
					}
					var dateStringForMyDate = curTime.getFullYear() + "-" + month + '-' + day;

					$('#mydate').val(dateStringForMyDate);
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

					var eventType = $(this).val();
					$('#startEventName').html($(this).html());

					if (eventType === 'food') {
						$('#quantity').html('Amount');
						$('#intensityToText').hide();

					} else {
						$('#quantity').html('Intensity');
						setIntensityText('#intensityToText', parseInt($('#slider-2').val()));

						$('#slider-2').change(function() {

							setIntensityText('#intensityToText', parseInt($('#slider-2').val()));
						});
						$('#intensityToText').show();
						/*
						 $('#slider-2').val().change(function(){
						 alert('change');
						 //$('#quantity').html('Intensity'+ $('#slider-2').value());
						 });*/
					}
					if ($('#startButton')) {
						$('#startButton').remove();
					}
					var startEventButton = $('<A data-rel="back" id="startButton" type CLASS="ui-btn ui-shadow ui-corner-all">' + "Start" + '</A>');

					$('#start2').append(startEventButton);
					startEventButton.click(function() {

						var timeAndDate = $('#mydate').val() + " " + $('#mytime').val()
						var unixTime = Date.parse(timeAndDate).getTime();

						if (eventType === 'food') {
							addFoodEventInstance($('#startEventName').html(), $('#slider-2').val(), unixTime);
							listCurrentEvents();
							//refresh list of current events
						} else {
							addActivityEventInstance($('#startEventName').html(), $('#slider-2').val(), unixTime);
							listCurrentEvents();
							//refresh list of current events
						}
						return;

					});
				});

			}
		} else {
			//nothing in db
			$('#startHelpText').html('Event list empty. Please press + to add a new event.');
			$('#searchEventsInputForm').hide();
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
				editEvent(bd.id, bd.type);
	
				
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

					editEvent(bd.id, bd.type);
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

				if (confirm("Are you sure you want to delete this event?") === true) {
					var selectedTabIndex = $(document).data('selectedTabIndex2');
					var selectedTab = selectedTabIndex === undefined ? null : selectedTabIndex.eventType;
					//type of tab selected all, food, or activity

					var eventID = parseInt($(this).find('#eventID').text());

					if ($(this).find('#eventType').text() === 'Activity') {
						deleteActivity(eventID);
						if (endedActivity === 'false') {
							listCurrentEvents();

						} else {

							listHistoryEvents(selectedTab);
						}
					} else {

						deleteFoodEvent(eventID);

						listHistoryEvents(selectedTab);
					}

				}

			});
		});

	}

	function addFoodEventInstance(event, amount, beginTime) {
		//could not manage to keep the db connection global, so connection need to
		//be openned for every call
		var db = openDatabase(shortName, version, displayName, maxSize);

		db.transaction(function(transaction) {
			transaction.executeSql('INSERT INTO FoodEventInstance(event, amount, beginTime) VALUES (?,?,?)', [event, amount, beginTime], nullHandler, errorHandler);
		});
		//alert('Event added');
		sendDbData();
	}

	function addActivityEventInstance(event, intensity, beginTime) {
		//could not manage to keep the db connection global, so connection need to
		//be openned for every call
		var db = openDatabase(shortName, version, displayName, maxSize);

		db.transaction(function(transaction) {
			transaction.executeSql('INSERT INTO ActivityEventInstance(event, intensity, beginTime) VALUES (?,?,?)', [event, intensity, beginTime], nullHandler, errorHandler);
		});
		sendDbData();

	}

	function addEvent(eventName, eventType) {
		//i could not manage to keep the db connection global, so connection need to
		//be openned every call
		var db = openDatabase(shortName, version, displayName, maxSize);

		db.transaction(function(transaction) {
			transaction.executeSql('INSERT INTO Event(name, eventType) VALUES (?,?)', [eventName, eventType], nullHandler, errorHandler);
		});
		sendDbData();
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

				restClient.add('http://localhost:8080/api/v1/event', eventObject, function(data, textStatus, request){
					if(textStatus === 'success'){
						//row successfully sent, now row has to be updated with beenSent = 1

						var db = openDatabase(shortName, version, displayName, maxSize);
						db.transaction(function(transaction) {
							transaction.executeSql('UPDATE Event SET beenSent = 1 WHERE name = ?', [row.name], nullHandler, errorHandler);
						});
					}
				});
			}
		}
	}

	function sendFoodEventInstance(transaction, result){
		if (result !== null && result.rows !== null) {

			for (var i = 0; i < result.rows.length; i++) {

				var row = result.rows.item(i);
				var eventObject = {
						'event' : row.event,
						'owner': '1',
						'beginTime': row.beginTime,
						'amount' : row.amount

				};

				restClient.add('http://localhost:8080/api/v1/foodEventInstanceFull', eventObject, function(data, textStatus, request){
					if(textStatus === 'success'){
						//row successfully sen, now row has to be updated with beenSent = 1

						var db = openDatabase(shortName, version, displayName, maxSize);
						db.transaction(function(transaction) {
							transaction.executeSql('UPDATE FoodEventInstance SET beenSent = 1 WHERE id = ?', [row.id], nullHandler, errorHandler);
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
						//row successfully sen, now row has to be updated with beenSent = 1

						var db = openDatabase(shortName, version, displayName, maxSize);
						db.transaction(function(transaction) {
							transaction.executeSql('UPDATE ActivityEventInstance SET beenSent = 1 WHERE id = ?', [row.id], nullHandler, errorHandler);
						});
					}
				});

			}
		}
	}
	

	function setHeader(xhr) {

		xhr.setRequestHeader('x-molgenis-token', token);

	}

	// this is called when an error happens in a transaction
	function errorHandler(transaction, error) {
		alert('Error: ' + error.message + ' code: ' + error.code);

	}

	// this is called when a successful transaction happens
	function successCallBack() {
	}

	function nullHandler() {
	}

	;

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
	$('#slider-3').val(bd.intensity).slider('refresh');

	if (bd.type === 'activity') {
		//activity has an endtime
		$('#endTimeField').show();
		$('#endTime').val(bd.endTime);
		$('#quantity2').text('Intensity');
		$('#intensityToText2').show();
		setIntensityText('#intensityToText2', parseInt(bd.intensity));

		$('#slider-3').change(function() {
			setIntensityText('#intensityToText2', parseInt($('#slider-3').val()));

		});

	} else {
		$('#intensityToText2').hide();
		$('#endTimeField').hide();
		$('#quantity2').text('Amount');

	}

}

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
		html += '<a href="#" class="deleteEvent ui-btn ui-btn-icon-notext ui-icon-delete" title="Delete"><p id="eventID" style="display: none">' + row.id + '</p><p id="eventType" style="display: none">' + type + '</p></a>';
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