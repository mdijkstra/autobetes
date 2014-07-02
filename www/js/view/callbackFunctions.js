
function showEventList(transaction, result) {
	if (result !== null && result.rows !== null) {

		for (var i = 0; i < result.rows.length; i++) {
			var row = result.rows.item(i);

			if($('#presentBoolean').text() === 'show' && $('#eventNameToBePrivileged').text() === row.name ){
				//the item need to be presented as a special button on top of the list, not in the list itself
				var buttonText = '<span id="name">' + row.name + '</span><span id="eventType" style="display: none">'+row.eventType+'</span><span id="eventID" style="display: none">'+row.cid+'</span>';
				//show new event in button on top of the list
				$('#recentAddedEventButton').html(buttonText);
				$('#recentAddedEventButton').val(row.eventType);


				//ensure next call this button is not presented
				$('#presentBoolean').text('hide');

			}
			else{
				
				//item does not need to be special treated
				var eventButton = $('<A CLASS="eventButtons ui-btn ui-shadow ui-corner-all"><span id="name">' + row.name + '</span><span id="eventType" style="display: none">'+row.eventType+'</span><span id="eventID" style="display: none">'+row.cid+'</span></A>');
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

function showCurrentEventInstanceActivity(inputType, result) {
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
		html += makeEventInstanceButton(row, 'running');
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

	
		$('.endEvent').click(function() {

			var bd = new parseButtonData(this);
			//button data object

			setEditEventInstanceScreen(bd);


			//remove startbutton wich can be present
			if ($('#startButton2')) {
				$('#startButton2').remove();
			}
			var editEventButton = $('<A data-rel="back" id="startButton2" type CLASS="ui-btn ui-shadow ui-corner-all">' + "Save" + '</A>');

			$('#edit-event-instance-page').append(editEventButton);
			editEventButton.click(function() {
				//edit event

				updateEventInstance(bd.id, bd.type);


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
			type = FOOD;
		}

		//there are three types of events that are relevant for creating the list
		//food activity, current event and ended event

		//add button to html
		html += makeEventInstanceButton(row, 'ended');
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

	
		$('.editEvent').click(function() {

			var bd = new parseButtonData(this);
			//button data object

			setEditEventInstanceScreen(bd);

			//remove startbutton wich can be present
			if ($('#startButton2')) {
				$('#startButton2').remove();
			}
			var editEventButton = $('<A data-rel="back" id="startButton2" type CLASS="ui-btn ui-shadow ui-corner-all">' + "Save" + '</A>');

			$('#edit-event-instance-page').append(editEventButton);
			editEventButton.click(function() {
				//edit event
				updateEventInstance(bd.id, bd.type);

				//refresh the right list


			});

		});
	

	
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
				
					df.deleteEventInstance(eventID);
					df.listHistoryEvents(selectedTab);
				
			});


		});
	

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

				if(textStatus === 'success'){
					var location = response.getResponseHeader('Location');//Api returns new resource location when creating a new entity

					var sid = parseInt(location.substr(location.lastIndexOf('/')+1));
					df.setBeenSentEvent(row.cid);
					df.setSidEvent(sid, row.cid)

				}
			}, callbackError);

		}
	}
}

function sendFoodEventInstance(transaction, result){

	if (result !== null && result.rows !== null) {

		for (var i = 0; i < result.rows.length; i++) {

			var row = result.rows.item(i);

			if(row.eventSID !== null){
				//make sure foreign key ref(Event) is present
				//var location = '/api/v1/event/'+row.sID;
				if(row.instanceSID === null){
					//instance not been sent before, create resource
					console.log('sendRow');

					console.log(row);
					var eventObject = {
							'owner': '1',
							'beginTime': '1991-02-12 18:00:00',
							'amount' : row.amount,
							'event' : row.eventSID+""

					};
					var date = new Date(row.beginTime);
					console.log(date);

					restClient.add('http://localhost:8080/api/v1/FoodEventInstance', eventObject, function(data, textStatus, response){
						if(textStatus === 'success'){
							//row successfully sent, now row has to be updated with beenSent = 1
							var location = response.getResponseHeader('Location');//Api returns new resource location when creating a new entity
							var sid = parseInt(location.substr(location.lastIndexOf('/')+1));
							console.log("rowid is: "+row.cid);
							df.setBeenSentEventInstance(row.cid);
							df.setSidEventInstance(sid, row.cid);

						}
					});

				}
				else{
					//instance been sent before, update resource
					console.log('update Row');
					var url = 'http://localhost:8080/api/v1/FoodEventInstance/'+row.eventSID;
					console.log(row);
					var eventObject = {
							'owner': '1',
							'beginTime': '1991-02-12 18:00:00',
							'amount' : row.amount,
							'event' : row.eventSID+""

					};

					restClient.update(url, eventObject, function(data, textStatus, response){
						if(textStatus === 'success'){
							//row successfully sent, now row has to be updated with beenSent = 1

							df.setBeenSentEventInstance(row.cid);

						}
					});
				}
			}
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
					var sid = parseInt(location.substr(location.lastIndexOf('/')+1));
					df.setBeenSentActivityEventInstance(sid, row.cid);
				}
			});

		}
	}
}

function callbackError(request, textStatus, error){
	console.log(request);
	console.log(textStatus);
	console.log(error);
}


function successCallBack(transaction, results){

}

// this is called when an error happens in a transaction
function errorHandler(transaction, error) {
	alert('Error: ' + error.message + ' code: ' + error.code);
	console.log(error);

}

function nullHandler() {
}
