/*
var template;
$(function(){
	template = Handlebars.compile($("#entry-template").html());
});
*/
	

function showEventList(transaction, result) {
	if (result !== null && result.rows !== null) {

		for (var i = 0; i < result.rows.length; i++) {
			var row = result.rows.item(i);

			if($('#presentBoolean').text() === 'show' && $('#eventNameToBePrivileged').text() === row.name ){
				//the item need to be presented as a special button on top of the list, not in the list itself
				var buttonText = '<span id="name">' + row.name + '</span><span id="eventType" style="display: none">'+row.eventType+'</span><span id="eventID" style="display: none">'+row.cId+'</span>';
				//show new event in button on top of the list
				$('#recentAddedEventButton').html(buttonText);
				$('#recentAddedEventButton').val(row.eventType);


				//ensure next call this button is not presented
				$('#presentBoolean').text('hide');

			}
			else{
				
				//item does not need to be special treated
				var eventButton = $('<A CLASS="eventButtons ui-btn ui-shadow ui-corner-all"><span id="name">' + row.name + '</span><span id="eventType" style="display: none">'+row.eventType+'</span><span id="eventID" style="display: none">'+row.cId+'</span></A>');
				$('#event-list').append(eventButton);
				//set click function
				eventButton.click(function() {

					setAddOrEditScreen(this);
				});

			}
		}
	} else {
		//nothing in db
	}
	if($('#editModeButton').val() ==="on"){
		//edit mode is on, background needs to be changed to make that clear
		//to the user
		$('.eventButtons').attr("style","background: "+COLOR_EDIT_MODE+" !important");

	}
}

function showCurrentEventInstanceActivity(inputType, result) {
	//html tags for the opening of the list
	
	$('.event-list3').html("");
	
	var html = '<ul class="ui-listview" data-role="listview" data-icon="false" data-split-icon="delete">';
	//open list
	//var html = template(result);
	
	
	html += '<li class="ui-li-has-alt ui-first-child">';
	//open list item
	var type;
	var endedActivity = 'false';

	var arrayLength = result.rows.length;

	for (var i = 0; i < arrayLength; i++) {
		//progress results
		var row = result.rows.item(i);
		
		
		//add button to html
		html += makeEventInstanceButton(row, RUNNING);
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
			var editEventButton = $('<A data-rel="back" id="startButton2" type CLASS="ui-btn ui-shadow ui-corner-all">' + SAVE + '</A>');

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
	
	var endedActivity = 'false';

	

	for (var i = 0; i < result.rows.length; i++) {
		//process results
		var row = result.rows.item(i);
		
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
		html += makeEventInstanceButton(row, ENDED);
		//end list item
		html += '</li>';
		if (i + 1 < result.rows.length) {
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

