/*
 * This method gets called when an event button is clicked. When the edit mode is on
 * the screen in where the user can modify the event will be set. When de edit mode
 * is not on, the start-event-instance-page screen will be set.
 */
function setAddOrEditScreen(eventId){
	
	if($('#editModeButton').val() ==="on"){
		//include delete button so user can delete event
		console.log("edit eventd")
		$('#deleteEvent').show();
		//edit mode is on, the screen newEvent will be used
		window.location.href = '#make-new-event-page';
		populateEditEventScreen(eventId);

	}
	else{

		$('#deleteEvent').hide();
		//edit mode is off. open start-event-instance-page screen
		window.location.href = '#start-event-instance-page';
		populateStartEventInstanceScreen(eventId);
	}
}
function populateEditEventInstancePage(cId, eventType) {
	df.getParticularEventInstance(cId, eventType, function(transaction, result){

		if(result.rows.length=== 1){
			var row = result.rows.item(0);
			var dateAndTime = convertTimestampToTimeAndDate(row.beginTime);
			$('#edit-event-instance-cId').html(row.cId);
			$('#edit-event-instance-eventType').html(row.eventType);
			$('#edit-event-instance-name').html(row.name);
			$('#edit-event-instance-page-begin-date-field').val(dateAndTime.date);
			$('#edit-event-instance-page-begin-time-field').val(dateAndTime.time);

			if (row.eventType === ACTIVITY) {
				//activity has an endtime
				var endDateAndTime;
				if(row.endTime === null){
					//no endtime in row, set current time as endtime
					var curTimestamp = new Date();
					endDateAndTime = convertTimestampToTimeAndDate(curTimestamp);
				}
				else{
					endDateAndTime = convertTimestampToTimeAndDate(row.endTime);
				}

				$('#endTimeField').show();
				$('#edit-event-instance-page-end-time-field').val(endDateAndTime.time);
				$('#edit-event-instance-page-end-date-field').val(endDateAndTime.date);
				$('#edit-event-instance-food-quantity-slider-label').hide();
				$('#edit-event-instance-activity-quantity-slider-label').show();
				$('#edit-event-instance-quantity-slider').attr('step', STEP_VALUE_ACTIVITY_QUANTITY_SLIDER);
				$('#edit-event-instance-quantity-slider').attr('min', MIN_VALUE_ACTIVITY_QUANTITY_SLIDER);
				$('#edit-event-instance-quantity-slider').val(row.intensity).slider('refresh');

				setIntensityTextInScreen('#intensity-slider-label-intensity-indication', parseInt(row.intensity));

				$('#edit-event-instance-quantity-slider').change(function() {
					//if user slides the #intensity-slider-label-intensity-indication changes accordingly
					setIntensityTextInScreen('#intensity-slider-label-intensity-indication', parseInt($('#edit-event-instance-quantity-slider').val()));

				});

			} else {
				$('#edit-event-instance-quantity-slider').attr('step', STEP_VALUE_FOOD_QUANTITY_SLIDER);
				$('#edit-event-instance-quantity-slider').attr('min', MIN_VALUE_FOOD_QUANTITY_SLIDER);
				$('#edit-event-instance-quantity-slider').val(row.amount).slider('refresh');
				$('#edit-event-instance-activity-quantity-slider-label').hide();
				$('#edit-event-instance-food-quantity-slider-label').show();
				$('#endTimeField').hide();


			}

		}
	});

}

function populateEditEventScreen(eventId){
	df.getParticularEvent(eventId, function(transaction, result){
		$("#radio-choice-h-2a").checkboxradio('disable');
		$("#radio-choice-h-2b").checkboxradio('disable');

		if(result.rows.length === 1){
			var row = result.rows.item(0);
			//set eventID
			$('#cid').text(row.cId);
			//set header name
			$('#make-new-event-page').find("#headerName").text(EDIT);
			//set name of event 
			$('#make-new-event-page').find('#newEventName').val(row.name);

			//set the fieldset right
			if(row.eventType === FOOD){
				$('#make-new-event-page').find('#newEventPagePower').val("");
				$('#make-new-event-page').find('#newEventPageCarbs').val(row.carbs);
				$('#make-new-event-page').find('#newEventPageAlcoholicUnits').val(row.alcoholicUnits);

				$("#radio-choice-h-2a").prop("checked", true);
				$("#radio-choice-h-2b").prop("checked",false);
				$("input[type='radio']").checkboxradio("refresh");
				$('#newEventPageActivityInput').hide();
				$('#newEventPageFoodInput').show();
			}
			else{
				$('#make-new-event-page').find('#newEventPagePower').val(row.power);
				$('#make-new-event-page').find('#newEventPageCarbs').val("");
				$('#make-new-event-page').find('#newEventPageAlcoholicUnits').val("");

				$("#radio-choice-h-2b").prop("checked", true);
				$("#radio-choice-h-2a").prop("checked", false);
				$("input[type='radio']").checkboxradio("refresh");
				$('#newEventPageFoodInput').hide();
				$('#newEventPageActivityInput').show();

			}
		}

	});
}

/*
 * This method gets called when the user wants to start an event intstance. It retrieves the context,
 * which is the context of clicked button, and the eventID which is the primary
 * key to the event.
 */
function populateStartEventInstanceScreen(eventID){
	df.getParticularEvent(eventID, function(transaction, result){

		if(result.rows.length === 1){
			var row = result.rows.item(0);
			//set the eventID which is the primary key of the event
			$('#start-event-instance-page-event-cId').text(row.cId);
			//set event name
			$('#startEventName').html(row.name);
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

			$('#start-event-instance-page-eventType').text(row.eventType);
			if (row.eventType === FOOD) {
				$('#start-event-instance-activity-quantity-slider-label').hide();
				$('#start-event-instance-food-quantity-slider-label').show();
				$('#start-event-instance-quantity-slider').attr('min', MIN_VALUE_FOOD_QUANTITY_SLIDER);
				$('#start-event-instance-quantity-slider').attr('step', STEP_VALUE_FOOD_QUANTITY_SLIDER);
				$('#start-event-instance-quantity-slider').val(DEFAULT_VALUE_FOOD_QUANTITY_SLIDER).slider('refresh');

			} else {

				$('#start-event-instance-food-quantity-slider-label').hide();
				$('#start-event-instance-activity-quantity-slider-label').show();
				$('#start-event-instance-quantity-slider').attr('min', MIN_VALUE_ACTIVITY_QUANTITY_SLIDER);
				$('#start-event-instance-quantity-slider').attr('step', STEP_VALUE_ACTIVITY_QUANTITY_SLIDER);
				$('#start-event-instance-quantity-slider').val(DEFAULT_VALUE_ACTIVITY_QUANTITY_SLIDER).slider('refresh');
				setIntensityTextInScreen('#intensityToText', parseInt($('#start-event-instance-quantity-slider').val()));


				$('#start-event-instance-quantity-slider').change(function() {

					setIntensityTextInScreen('#intensityToText', parseInt($('#start-event-instance-quantity-slider').val()));
				});


			}
		}
	})

}

function convertIntensityIntToTextAndColor(value){
	var textAndColor;
	switch(value) {
	case 1:
		textAndColor = {color:'#CCFF33',text:'Very easy'};

		break;
	case 2:
		textAndColor = {color:'#99FF33',text:'Somewhat easy'};
		break;
	case 3:
		textAndColor = {color:'#33CC33',text:'Moderate'};
		break;
	case 4:
		textAndColor = {color:'#FF9933',text:'Somewhat hard'};
		break;
	case 5:
		textAndColor = {color:'#FF6600',text:'Moderately hard'};
		break;
	case 6:
		textAndColor = {color:'#FF0000',text:'Hard'};
		break;
	case 7:
		textAndColor = {color:'#FF0000',text:'Hard'};
		break;
	case 8:
		textAndColor = {color:'#CC0000',text:'Very hard'};
		break;
	case 9:
		textAndColor = {color:'#A31919',text:'Very, very hard'};
		break;
	case 10:
		textAndColor = {color:'#721212',text:'Maximal'};
		break;

	}
	return textAndColor;
}

/*
 * Sets the right interpretation of the given value, in the DOM element(selector)
 */
function setIntensityTextInScreen(selector, value) {
	var textAndColor = convertIntensityIntToTextAndColor(value);

	$(selector).css({
		'color' : textAndColor.color
	});
	$(selector).text(textAndColor.text);
}


function showEvents(eventType) {
	if (eventType !== null && eventType !== undefined) {

		df.listEventsOfEventType(eventType);

	}
	else{
		df.showEvents();
	}
	//if user edits or adds an event it will be shown on top of the list in green.
	//in the onclick(#addOrEditEvent) function the name will be set in the hidden span #eventnameOfAddedOrEditedEvent. 
	//Once that name corresponds with the event in showlist it will set in the green button. The text in #eventnameOfAddedOrEditedEvent
	//will be removed in order to hide the green button after the list is shown.
	if($('#eventnameOfAddedOrEditedEvent').text() === ''){
		//text is empty, ensure that button is hidden
		$('#recentlyAddedEvent').hide();
	}
	

}


