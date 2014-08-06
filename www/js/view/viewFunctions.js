	/*
	 * This method gets called when an event button is clicked. When the edit mode is on
	 * the screen in where the user can modify the event will be set. When de edit mode
	 * is not on, the start2(start event) screen will be set.
	 */
	function setAddOrEditScreen(context){
		
		if($('#editModeButton').val() ==="on"){
			
			$('#deleteEvent').show();
			//edit mode is on, the screen newEvent will be used
			window.location.href = '#newEvent';
			//get eventID
			var eventID = $(context).find('#eventID').text();
			//set eventID
			$('#eventID').text(eventID);
			//set header name
			$('#newEvent').find("#headerName").text("Edit");
			//set name of event 
			$('#newEvent').find('#newEventName').val($(context).find("#name").text());
			
			//get event type
			var eventType = $(context).find('#eventType').text();
			//set the fieldset right
			if(eventType === FOOD){
				
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
			$('#deleteEvent').hide();
			//edit mode is off. open start2 screen
			window.location.href = '#start-event-instance-page';
			//set reference id of the event
			var eventID = $(context).find('#eventID').text();
			
			setStartEventInstanceScreen(context, eventID);
		}
	}
	
	/*
	 * This method gets called when the user wants to start an event intstance. It retrieves the context,
	 * which is the context of clicked button, and the eventID which is the primary
	 * key to the event.
	 */
	function setStartEventInstanceScreen(context, eventID){
		//set the eventID which is the primary key of the event
		$('#eventID').text(eventID);
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
		var eventType = $(context).find('#eventType').text();
		$('#eventType2').text(eventType);
		if (eventType === FOOD) {
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
	
	
	function setEditEventInstanceScreen(bd) {
		//insert button data into editscreenActivity
		$('#edit-event-instance-name').html(bd.eventName);
		$('#mydate2').val(bd.dateStringForMyDate);
		$('#beginTime').val(bd.beginTime);
		

		if (bd.type === ACTIVITY) {
			//activity has an endtime
			$('#endTimeField').show();
			$('#endTime').val(bd.endTime);
			
			$('#edit-event-instance-food-quantity-slider-label').hide();
			$('#edit-event-instance-activity-quantity-slider-label').show();
			$('#edit-event-instance-quantity-slider').attr('step', STEP_VALUE_ACTIVITY_QUANTITY_SLIDER);
			$('#edit-event-instance-quantity-slider').attr('min', MIN_VALUE_ACTIVITY_QUANTITY_SLIDER);
			$('#edit-event-instance-quantity-slider').val(bd.intensity).slider('refresh');
			
			setIntensityTextInScreen('#intensity-slider-label-intensity-indication', parseInt(bd.intensity));

			$('#edit-event-instance-quantity-slider').change(function() {
				setIntensityTextInScreen('#intensity-slider-label-intensity-indication', parseInt($('#edit-event-instance-quantity-slider').val()));

			});

		} else {
			$('#edit-event-instance-quantity-slider').attr('step', STEP_VALUE_FOOD_QUANTITY_SLIDER);
			$('#edit-event-instance-quantity-slider').attr('min', MIN_VALUE_FOOD_QUANTITY_SLIDER);
			$('#edit-event-instance-quantity-slider').val(bd.intensity).slider('refresh');
			$('#edit-event-instance-activity-quantity-slider-label').hide();
			$('#edit-event-instance-food-quantity-slider-label').show();
			$('#endTimeField').hide();
			

		}

	}
	
	function getIntensityText(value){
		var specs;
		switch(value) {
		case 1:
			specs = {color:'#CCFF33',text:'Very easy'};

			break;
		case 2:
			specs = {color:'#99FF33',text:'Somewhat easy'};
			break;
		case 3:
			specs = {color:'#33CC33',text:'Moderate'};
			break;
		case 4:
			specs = {color:'#FF9933',text:'Somewhat hard'};
			break;
		case 5:
			specs = {color:'#FF6600',text:'Moderately hard'};
			break;
		case 6:
			specs = {color:'#FF0000',text:'Hard'};
			break;
		case 7:
			specs = {color:'#FF0000',text:'Hard'};
			break;
		case 8:
			specs = {color:'#CC0000',text:'Very hard'};
			break;
		case 9:
			specs = {color:'#A31919',text:'Very, very hard'};
			break;
		case 10:
			specs = {color:'#721212',text:'Maximal'};
			break;

		}
		return specs;
	}
	
	/*
	 * Sets the right interpretation of the given value, in the DOM element(selector)
	 */
	function setIntensityTextInScreen(selector, value) {
		var specs = getIntensityText(value);
		
		$(selector).css({
			'color' : specs.color
		});
		$(selector).text(specs.text);
	}
	
	function makeEventInstanceButton(row, buttonType) {
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
			type = ACTIVITY;
			var specs = getIntensityText(row.intensity);
			
			amountOrIntensityString = '<p class ="topic"><strong>Intensity:<span id="intensityInt" style="display:none">'+row.intensity+'</span> <span id="intensity" style="color:'+specs.color+'">' + specs.text + '</span></strong></p>';
		} else {
			//this event is not an activity
			type = FOOD;
			amountOrIntensityString = '<p class ="topic"><strong>Amount: <span id="amount">' + row.amount + '</span></strong></p>';
		}

		//make html button
		var html = "";
		if(buttonType === "ended"){
			//event has ended so editting will be enabled
			html += '<a href="#edit-event-instance-page" class="editEvent ui-btn"><p style="display: none">' + row.cId + '</p>';
		}
		else{
			//event not ended, so editting is not preferably, button does nothing
			html += '<a class="editEvent ui-btn"><p style="display: none">' + row.cId + '</p>';
		}
		html += '<h3>' + row.name + '</h3>';
		html += amountOrIntensityString;
		html += timeString;
		//html += dateString;
		html += '</a>';
		if(buttonType === "ended"){
			//append delete button
			html += '<a href="#deleteEventInstanceDialog" class="deleteEvent ui-btn ui-btn-icon-notext ui-icon-delete" data-rel="dialog" data-transition="slidedown" title="Delete"><p id="eventName" style="display: none">'+row.name+'</p><p id="eventID" style="display: none">' + row.cId + '</p><p id="eventType" style="display: none">' + type + '</p></a>';
		}
		else{
			
			//append an end button,
			html += '<a href="#edit-event-instance-page" class="endEvent ui-btn ui-icon-stop"  title="End"><p id="eventID" style="display: none">' + row.cId + '</p><p id="eventType" style="display: none">' + type + '</p>';
			html += '<h3 style="display: none">' + row.name + '</h3>';
			html += '<p id="intensityInt" style="display: none">' + row.intensity + '</span>';
			html += '<p style="display: none"><span id="day">' + date.getDate() + '</span>- <span id="month">' + (date.getMonth() + 1) + '</span>- <span id="year">' + date.getFullYear() + '</span></p>';
			html += '<p style="display: none"><span id="beginHours">' + date.getHours() + '</span>:<span id="beginMinutes">' + minutes + '</span></p>';
			html += '</a>';
		}
		return html;
	}
	
