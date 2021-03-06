function view() {
	//add functions to object
	this.showMessageDialog = showMessageDialog;
	this.toastMessage = toastMessage;
	this.toastShortMessage = toastShortMessage;
	this.setAddOrEditScreen = setAddOrEditScreen;
	this.populateEditEventInstancePage = populateEditEventInstancePage;
	this.populateEditEventScreen = populateEditEventScreen;
	this.populateStartEventInstanceScreen = populateStartEventInstanceScreen;
	this.setIntensityTextInScreen = setIntensityTextInScreen;
	this.setNewEventScreen = setNewEventScreen;
	this.emptyDefineEventPage = emptyDefineEventPage;
	this.showLoadingWidget = showLoadingWidget;
	this.hideLoadingWidget = hideLoadingWidget;
	this.showAdviceTable = showAdviceTable;
	this.showFoodTableInsulin = showFoodTableInsulin;


	function showFoodTableInsulin(data)
	{
		if(isNaN(data)){
			$('#current-food-event-list-bolus').hide();
			$('#current-food-event-list-bolus-div').hide();
		}
		else{
			$('#current-food-event-list-bolus-div').show();
			$('#current-food-event-list-bolus').show();
			$('#current-food-event-list-bolus').html(data);
		}
	}

	function showAdviceTable(type, data) {
		if(type=== "HbA1C"){
			$('#HbA1cAdvice').show();
			$('#HbA1cAdvice').html(data.hba1c);
			$('#HbA1cAdviceDate').html(data.date);
		}
		else{
			$('#advice-container').show();
			$('#HbA1cAdvice').hide();
			var source = $("#advice-table-header-template").html();
			var headerTemplate = Handlebars.compile(source);
			var tableData;
			var tableHeader;
			
			if(type ==="Basal"){
				tableData = data.Basal;
				tableHeader = headerTemplate([{Basal:"o"}]);
			}
			
			else if(type ==="Sensitivity"){
				tableData = data.Sensitivity;
				tableHeader = headerTemplate([{Sensitivity:"o"}]);
			}
			
			else if(type ==="Carbs"){
				tableData = data.Carbs;
				tableHeader = headerTemplate([{Carbs:"o"}]);
			}

			//get template
			source = $("#advice-table-template").html();
			//compile to hanlebars template
			var template = Handlebars.compile(source);
			//fill template with events and add screen to page
			$(".advice-table").html(tableHeader+ template(tableData));
			//$('.ui-table-columntoggle-btn').hide();
		}
	}

	function showLoadingWidget(){
		$.mobile.loading( 'show', {
			theme: 'z',
			html: ""
		});
	}
	function hideLoadingWidget(){
		$.mobile.loading( 'hide', {
			theme: 'z',
			html: ""
		});
	}

	/*
	 * Show dialog with message text
	 */
	function showMessageDialog(headerText, messageText){
		$("#messageDialogHeader").html(headerText);
		$("#messageDialogText").html(messageText);
		$.mobile.changePage( "#messageDialog", { role: "dialog" } );
	}
	/*
	 * Toast message for 5 seconds
	 */
	function toastMessage(messageText){

		if(MOBILE_DEVICE){
			//it is a mobile device
			window.plugins.toast.showLongBottom(messageText, null, null);
		}
		else{
			//no toast for normal browser, add message to console
			console.log(messageText);
		}
	}
	/*
	 * Toast message for 3 seconds
	 */
	function toastShortMessage(messageText){
		if(MOBILE_DEVICE){
			window.plugins.toast.showShortBottom(messageText, null, null);
		}
		else{
			console.log(messageText);
		}
	}

	/*
	 * This method gets called when an event button is clicked. When the edit mode is on
	 * the screen in where the user can modify the event will be set. When de edit mode
	 * is not on, the start-event-instance-page screen will be set.
	 */
	function setAddOrEditScreen(eventId){
		if($('#editModeButtonFlip').val() ==="on"){
			//include delete button so user can delete event
			$('#addOrEditFoodEvent').html("Edit");
			$('#deleteEvent').show();
			$('#addOrSaveFoodEvent').show();
			$('#addOrEditEventAndStart').hide();
			//edit mode is on, the screen define-event-page will be used
			$.mobile.changePage('#define-event-page');
			populateEditEventScreen(eventId);
		}
		else{
			//edit mode is off. open start-event-instance-page screen
			$.mobile.changePage('#start-event-instance-page');
			populateStartEventInstanceScreen(eventId);
		}
	}
	/*
	 * Given the id and eventType, this method calls the dbhandler to retrieve event of interest
	 * and populates edit event instance screen.
	 */
	function populateEditEventInstancePage(id, eventType) {
		dbHandler.getParticularEventInstance(id, eventType, function(transaction, result){

			if(result.rows.length=== 1){
				//found event instance
				//get entity
				var row = result.rows.item(0);

				//fill fields
				var dateAndTime = controller.convertTimestampToTimeAndDate(row.beginTime);
				$('#edit-event-instance-cId').html(row.id);
				$('#edit-event-instance-eventType').html(row.eventType);
				$('#edit-event-instance-name').html(row.name);
				$('#edit-event-instance-page-begin-date-field').val(dateAndTime.date);
				$('#edit-event-instance-page-begin-time-field').val(dateAndTime.time);

				if (row.eventType === ACTIVITY) {
					$('#editEventPortionSize').hide();
					//activity has an endtime
					var endDateAndTime;
					if(row.endTime === null){
						//no endtime in row, set current time as endtime
						var curTimestamp = new Date();
						endDateAndTime = controller.convertTimestampToTimeAndDate(curTimestamp);
					}
					else{
						endDateAndTime = controller.convertTimestampToTimeAndDate(row.endTime);
					}
					
					
						$("#edit-event-instance-slider-div").show();
						//set slider for activity
						$('#endTimeField').show();
						$('#edit-event-instance-page-end-time-field').val(endDateAndTime.time);
						$('#edit-event-instance-page-end-date-field').val(endDateAndTime.date);
						$('#edit-event-instance-food-quantity-slider-label').hide();
						$('#edit-event-instance-activity-quantity-slider-label').show();
						$('#edit-event-instance-quantity-slider').attr('step', STEP_VALUE_ACTIVITY_QUANTITY_SLIDER);
						$('#edit-event-instance-quantity-slider').attr('min', MIN_VALUE_ACTIVITY_QUANTITY_SLIDER);
						$('#edit-event-instance-quantity-slider').val(row.intensity).slider('refresh');
						$('#edit-event-instance-page-begin-time-text').show();

						setIntensityTextInScreen('#intensity-slider-label-intensity-indication', parseInt(row.intensity));
					
						if(row.eventId === IDPAUSETRACKING){
							//no degree for pause tracking
							$("#edit-event-instance-slider-div").hide();
							$('#edit-event-instance-quantity-slider').val("");
						}


				} else {
					$("#edit-event-instance-slider-div").show();
					// if(row.portionsize){
					// 	$('#editEventPortionSize').html("Serving size: "+ row.portionsize+" gram");
					// }
					// else{
					// 	$('#editEventPortionSize').html("Serving size: unknown");
					// }
					$('#editEventPortionSize').show();
					//set slider for food
					$('#edit-event-instance-quantity-slider').attr('step', STEP_VALUE_FOOD_QUANTITY_SLIDER);
					$('#edit-event-instance-quantity-slider').attr('min', MIN_VALUE_FOOD_QUANTITY_SLIDER);
					$('#edit-event-instance-quantity-slider').val(row.amount).slider('refresh');
					$('#edit-event-instance-activity-quantity-slider-label').hide();
					$('#edit-event-instance-food-quantity-slider-label').show();
					$('#endTimeField').hide();
					$('#edit-event-instance-page-begin-time-text').hide();

				}

				//unbind previous functions on this slider 
				$('#edit-event-instance-quantity-slider').unbind();
				//the only digits function is now unbind as well. 
				//bind function again 
				onlyDigits();//allow only digits as input on slider

				$('#edit-event-instance-quantity-slider').change(function() {
					//if user slides the #intensity-slider-label-intensity-indication changes accordingly

					var intensity = parseFloat($('#edit-event-instance-quantity-slider').val());

					if(row.carbs){
						if(row.estimationCarbs === 0){
							//amount of carbs is an estimation
							$('#edit-event-instance-amount-of-grams-text').html('Carbs: <span class="boldAndOrange">' +parseInt(Math.round(Number(row.carbs*intensity)))+' gram</span> (estimated)' );
						}
						else{
							$('#edit-event-instance-amount-of-grams-text').html('Carbs: <span class="boldAndOrange">' +parseInt(Math.round(Number(row.carbs*intensity)))+' gram</span>' );
						}

					}
					if(row.intensity){
						setIntensityTextInScreen('#intensity-slider-label-intensity-indication', parseInt(intensity));
					}
				});
				//show and hide the right elements according to event type
				if(row.carbs){

					$('#start-event-instance-amount-of-grams-text').show();
					if(row.estimationCarbs === 0){
						//amount of carbs is an estimation
						$('#edit-event-instance-amount-of-grams-text').html('Carbs: <span class="boldAndOrange">' +parseInt(Math.round(Number(row.carbs*row.amount)))+' gram</span> (estimated)' );
					}
					else{
						$('#edit-event-instance-amount-of-grams-text').html('Carbs: <span class="boldAndOrange">' +parseInt(Math.round(Number(row.carbs*row.amount)))+' gram</span>' );
					}
					$('#edit-event-instance-amount-of-grams-text').show();

				}
				else if(row.amount){
					$('#edit-event-instance-amount-of-grams-text').html('Carbs: ' +'unknown' );
				}
				else{
					$('#edit-event-instance-amount-of-grams-text').hide();
				}

			}
		});

	}
	/*
	 * Given the id of the event, this method retrieves the event of interest from db and populates 
	 * edit event screen
	 */
	function populateEditEventScreen(id){
		dbHandler.getParticularEvent(id, function(transaction, result){

			if(result.rows.length === 1){
				//found event
				var row = result.rows.item(0);
				$('#define-event-page').find("#headerName").text(EDIT);
				$('#foodId').text(row.id);
				//set the fieldset right
				if(row.eventType === FOOD){
					//set eventID

					//set header name
					$("#newEventPageFoodInput").show();
					//set name of event 
					$('#define-event-page').find('#newEventName').val(row.name);

					$('#define-event-page').find('#newEventPagePower').val("");
					$('#define-event-page').find('#newEventPageCarbs').val(row.carbs);
					$('#define-event-page').find('#newEventPageAlcoholicUnits').val(row.alcoholicUnits);
					$('#define-event-page').find('#newEventPortionSize').val(row.portionsize);

					if(row.estimationCarbs === 0){
						//0 stands for true
						//uncheck checkbox
						$('#newEventEstimationCarbs').prop('checked', true);

					}
					else{
						//check checkbox
						$('#newEventEstimationCarbs').prop('checked', false); 
					}
					$('#newEventEstimationCarbs').checkboxradio('refresh');
					// $('#addOrEditEventAndStart').html("Save and 'consume'");
				}
				else{
					$("#newEventPageFoodInput").hide();
					$('#define-event-page').find('#newEventName').val(row.name);
					// $('#addOrEditEventAndStart').html("Save and start");
					/*
				$('#make-new-event-page').find('#newEventPagePower').val(row.power);
				$('#make-new-event-page').find('#newEventPageCarbs').val("");
				$('#make-new-event-page').find('#newEventPageAlcoholicUnits').val("");

				$("#radio-choice-h-2b").prop("checked", true);
				$("#radio-choice-h-2a").prop("checked", false);
				$("input[type='radio']").checkboxradio("refresh");
				$('#newEventPageFoodInput').hide();
				$('#newEventPageActivityInput').show();
					 */

				}
			}

		});
	}

	/*
	 * This method gets called when the user wants to start an event intstance. It retrieves the context,
	 * which is the context of clicked button, and the eventID which is the primary
	 * key to the event.
	 */
	function populateStartEventInstanceScreen(id){

		dbHandler.getParticularEvent(id, function(transaction, result){

			if(result.rows.length === 1){
				var row = result.rows.item(0);
				//set the eventID which is the primary key of the event
				$('#start-event-instance-page-event-cId').text(row.id);
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

				// if(row.portionsize){
				// 	$('#startEventPortionSize').html("Serving size: "+ row.portionsize+" gram");
				// }
				// else{
				// 	$('#startEventPortionSize').html("Serving size: unknown");
				// 	$('#startEventPortionSize').show();
				// }

				//add event screen varies by event type
				$('#start-event-instance-page-eventType').text(row.eventType);
				if (row.eventType === FOOD) {
					$("#startEventQuantitySliderField").show();
					$('#startEventInstanceHeader').text("Consume");
					$('#start-event-instance-activity-quantity-slider-label').hide();
					$('#start-event-instance-food-quantity-slider-label').show();
					$('#start-event-instance-quantity-slider').attr('min', MIN_VALUE_FOOD_QUANTITY_SLIDER);
					$('#start-event-instance-quantity-slider').attr('step', STEP_VALUE_FOOD_QUANTITY_SLIDER);
					$('#start-event-instance-quantity-slider').val(DEFAULT_VALUE_FOOD_QUANTITY_SLIDER).slider('refresh');

				} else {
					if(id === IDPAUSETRACKING)
					{
						//pause tracking event has no degree
						$("#startEventQuantitySliderField").hide();
						$('#start-event-instance-quantity-slider').val("");
					}
					else{
						$("#startEventQuantitySliderField").show();

						$('#startEventPortionSize').hide();
						$('#startEventInstanceHeader').text("Start event");
						$('#start-event-instance-food-quantity-slider-label').hide();
						$('#start-event-instance-activity-quantity-slider-label').show();
						$('#start-event-instance-quantity-slider').attr('min', MIN_VALUE_ACTIVITY_QUANTITY_SLIDER);
						$('#start-event-instance-quantity-slider').attr('step', STEP_VALUE_ACTIVITY_QUANTITY_SLIDER);
						$('#start-event-instance-quantity-slider').val(DEFAULT_VALUE_ACTIVITY_QUANTITY_SLIDER).slider('refresh');
						setIntensityTextInScreen('#intensityToText', parseInt($('#start-event-instance-quantity-slider').val()));
					}
				}
				$('#start-event-instance-quantity-slider').unbind();
				onlyDigits();//after unbind add the only digits function to slider
				$('#start-event-instance-quantity-slider').change(function() {
					//perform action if value of quantity slider changes
					var intensity = parseFloat($('#start-event-instance-quantity-slider').val());

					if(row.carbs){
						//calculate amount of carbs
						if(row.estimationCarbs === 0){
							//amount of carbs is an estimation
							$('#start-event-instance-amount-of-grams-text').html('Carbs: <span class="boldAndOrange">' + parseInt(Math.round(Number(row.carbs*intensity)))+' gram </span>(estimated)' );
						}
						else{
							$('#start-event-instance-amount-of-grams-text').html('Carbs: <span class="boldAndOrange">' + parseInt(Math.round(Number(row.carbs*intensity)))+' gram</span>' );
						}

					}
					else if(row.amount){
						//carbs not defined, amount is unknown
						$('#start-event-instance-amount-of-grams-text').html('Carbs: ' +'unknown' );
					}
					if(intensity){
						setIntensityTextInScreen('#intensityToText', parseInt(intensity));
					}
				});

				if(row.carbs){
					$('#start-event-instance-amount-of-grams-text').show();
					if(row.estimationCarbs === 0){
						//amount of carbs is an estimation
						$('#start-event-instance-amount-of-grams-text').html('Carbs: <span class="boldAndOrange">' +parseInt(Math.round(Number(row.carbs*DEFAULT_VALUE_FOOD_QUANTITY_SLIDER)))+' gram</span> (estimated)' );
					}
					else{
						$('#start-event-instance-amount-of-grams-text').html('Carbs: <span class="boldAndOrange">' +parseInt(Math.round(Number(row.carbs*DEFAULT_VALUE_FOOD_QUANTITY_SLIDER)))+' gram</span>' );
					}

				}
				else if(row.amount){
					$('#start-event-instance-amount-of-grams-text').html('Carbs: ' +'unknown' );
				}
				else{
					$('#start-event-instance-amount-of-grams-text').hide();
				}
			}
		})

	}


	/*
	 * Sets the right interpretation of the given value, in the DOM element(selector)
	 */
	function setIntensityTextInScreen(selector, value) {
		var textAndColor = controller.convertIntensityIntToTextAndColor(value);

		$(selector).css({
			'color' : textAndColor.color
		});
		$(selector).text(textAndColor.text);
	}


	/*
	 * This method adjusts make-new-event-page according to the event type selected of selectedTabIndex
	 */
	function setNewEventScreen(){
		//empty fields
		emptyDefineEventPage();

		if(EventListType === FOOD){
			//Set screen according to Food event type
			$('#headerName').text('New food');
			$('#newEventPageActivityInput').hide();
			$('#newEventPageFoodInput').show();
			// $('#addOrEditEventAndStart').html("Save and 'eat'")
			$("#newEventPageFoodInput").show();
		}
		else{
			//Set screen according to Activity event type
			$('#headerName').text('New special event');
			$('#newEventPageFoodInput').hide();
			$('#newEventPageActivityInput').show();
			// $('#addOrEditEventAndStart').html("Save and start")
		}

		$('#addOrEditEvent').text('Add');
		$('#addOrEditEvent').attr('class', 'ui-btn ui-corner-all ui-shadow ui-btn-inline ui-icon-plus ui-btn-icon-left');
		$('#newEventName').val($('#filterControlgroup-input').val());

		$('#addOrSaveFoodEvent').hide();
		$('#addOrEditEventAndStart').show();
	}

	function emptyDefineEventPage(){
		$('#deleteEvent').hide()//ensure delete button is hidden
		$('#newEventName').val('');
		$('#newEventPageCarbs').val('');
		$('#foodId').html('');
		$('#newEventPageAlcoholicUnits').val(0);
		$('#newEventPortionSize').val('');
		$('#newEventEstimationCarbs').prop('checked', false); 
		$('#newEventEstimationCarbs').checkboxradio('refresh');
	}

}
