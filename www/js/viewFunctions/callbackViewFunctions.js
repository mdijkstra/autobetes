function callbackView() {
	//add functions to object
	this.showEventList = showEventList;
	this.showCurrentEventInstanceActivity = showCurrentEventInstanceActivity;
	this.showCurrentEventInstanceFood = showCurrentEventInstanceFood;
	this.showEventInstanceList = showEventInstanceList;

	/*
	 * This method presents list of events retrieved from db
	 */
	function showEventList(transaction, result) {
		//if user edits or adds an event it will be shown on top of the list in green.
		//in the onclick(#addOrEditEvent) function the name will be set in the hidden span #eventnameOfAddedOrEditedEvent. 
		//Once that name corresponds with the event in showlist it will set in the green button. The text in #eventnameOfAddedOrEditedEvent
		//will be removed in order to hide the green button after the list is shown.
		if($('#eventnameOfAddedOrEditedEvent').text() === ''){
			//text is empty, ensure that button is hidden
			$('#recentlyAddedEvent').hide();
		}

		if (result !== null && result.rows !== null) {
			var rows = [];
			//iterate events
			for (var i = 0; i < result.rows.length; i++) {
				var row = result.rows.item(i);

				
				if($('#eventnameOfAddedOrEditedEvent').text() === row.name ){
					//new event has been made, name corresponds with name of this row item.
					//the item need to be presented as a special button on top of the list, not in the list itself

					//show new event in button on top of the list
					$('#recentAddedEventButton').html(row.name);
					var id = row.id;
					$('#recentAddedEventButton').unbind();
					$('#recentAddedEventButton').click(function(){
						view.setAddOrEditScreen(id);
					});

					//ensure next call this button is not presented
					$('#eventnameOfAddedOrEditedEvent').text('');

				}
				else{
					//push button in array
					if(row.id.indexOf(ADMINIDPREPOSITION) > -1){
						//event is standard event, add param common=true
						row.standard = true;
					}
					
					if(row.id.indexOf(IDPAUSETRACKING) > -1){
						//this is the event t
						rows.unshift(row);
					}
					else{
					rows.push(row);
					}
				}

			}
			
			//get template
			var source = $("#event-list-template").html();
			//compile to hanlebars template
			var template = Handlebars.compile(source);
			//fill template with events and add screen to page
			$("#event-list").html(template(rows));

		} 
		if($('#editModeButton').val() ==="on"){
			//edit mode is on, switch background of buttons
			$('.eventButtons').attr("style","background: "+COLOR_EDIT_MODE+" !important");

		}



	}
	/*
	 * This method present list of current activities retrieved from db at the home screen
	 */
	function showCurrentEventInstanceActivity(inputType, result) {

		var buttons = [];
		for (var i = 0; i < result.rows.length; i++) {
			
			var row = result.rows.item(i);
			var intensityTextAndColor = controller.convertIntensityIntToTextAndColor(row.intensity);
			//console.log(row);
			var date = new Date(row.beginTime);
			var minutes = parseInt(date.getMinutes());
			if (minutes < 10) {
				//show minutes correct
				minutes = "0" + minutes;
			}
			var button = {
					name : row.name,
					intensityValue: row.intensity,
					intensityText: intensityTextAndColor.text,
					intensityColorInterpretation: intensityTextAndColor.color,
					beginHours : date.getHours(),
					beginMinutes : minutes,
					beginDay : date.getDate(),
					beginMonth : (date.getMonth() + 1),
					beginYear : date.getFullYear(),
					id : row.id,
					eventType: row.eventType
			}
			
			var endMinutes = null;
			var endHours = null;
			if(row.endTime != null){
				var endDate = new Date(row.endTime);
				endMinutes = parseInt(endDate.getMinutes());
				endHours = parseInt(endDate.getHours());
				if (endMinutes < 10) {
					//show minutes correct
					endMinutes = "0" + endMinutes;
				}
				button.endMinutes = endMinutes;
				button.endHours = endHours;
			}
			
			if(row.eventId === IDPAUSETRACKING)
				{
					//pause tracking event needs special color
					button.pausetracking = "yes";
				}
			//add button to array
			buttons.push(button);

		}
		//check if there are events, if not hide current-activity-event-list
		if(buttons.length > 0){
			
			$('#current-activity-event-list').show();
			//get template
			var source = $("#current-activity-event-list-template").html();
			//compile to hanlebars template
			var template = Handlebars.compile(source);	
			//fill template with events and add screen to page
			$('#current-activity-event-list').html(template(buttons));	
		}
		else{
			$('#current-activity-event-list').hide();
		}
	}
	/*
	 * This method present list of current food events retrieved from db at the home screen
	 */
	function showCurrentEventInstanceFood(inputType, result) {
		var timeFirstEventExpires = null;
		var foodInstances = [];
		var total = 0;
		var unknownContent = false;
		var estimatedContent = false;
		var currentTime = new Date().getTime();
		if(0< result.rows.length){

			for (var i = 0; i < result.rows.length; i++) {
				//progress results
				var row = result.rows.item(i);
				
				var timeThisEventExpires = (row.beginTime-currentTime)+ PLUSMINRANGEFOODEVENT;
				if(timeFirstEventExpires !==null){
					if(timeFirstEventExpires > timeThisEventExpires){
						timeFirstEventExpires = timeThisEventExpires;
					}
				}
				else{
					timeFirstEventExpires = timeThisEventExpires;
				}
				//get insulin units
				var insulin = getInsulinForAmountOfCarbs(row.carbs*row.amount);
				
				if(row.carbs){
					if(row.estimationCarbs === 0){
						estimatedContent = true;
						foodInstances.push({id: row.id, name : row.name, amount : row.amount, carbs:(row.carbs*row.amount), estimationCarbs : true, insulin : insulin});
					}
					else{
						foodInstances.push({id: row.id, name : row.name, amount : row.amount, carbs:(row.carbs*row.amount), insulin : insulin});
					}
					total = total+(row.carbs*row.amount);
				}
				else{
					unknownContent = true;
					foodInstances.push({id: row.id, name:row.name, amount:row.amount});
				}
				

			}
		}
		//check if there are events, if not hide current-food-event-list
		if(foodInstances.length > 0){	
			setTimeout(function(){
				dbHandler.getCurrentFoodEventInstances(PLUSMINRANGEFOODEVENT, callbackView.showCurrentEventInstanceFood);
			}, timeFirstEventExpires)
			
			var sumObject = {total:total};
			
			// if(unknownContent){
			// 	//carb intake not precise
			// 	sumObject.total = sumObject.total;
			//
			// }
			if (estimatedContent)
			{
				sumObject.estimatedContent = true;
			}
			
			sumObject.unsure = estimatedContent || unknownContent;
			
			// inject from-to times
			var consumedFrom = 	new Date(currentTime - PLUSMINRANGEFOODEVENT);
			var consumedTo = 	new Date(currentTime + PLUSMINRANGEFOODEVENT);
			sumObject.from = consumedFrom.getHours() + ":" + ('0' + consumedFrom.getMinutes()).slice(-2);
			sumObject.to = consumedTo.getHours() + ":" + ('0' + consumedTo.getMinutes()).slice(-2);			
			foodInstances.unshift(sumObject);
			
			//get template
			var source = $("#current-food-event-list-template").html();
			//compile to hanlebars template
			var template = Handlebars.compile(source);	
			//fill template with events and add screen to page
			$('#current-food-event-list').html(template(foodInstances));
			
			getCurrentFoodTableInsulin(sumObject.total, view.showFoodTableInsulin);
		}
		else{
			//clear table
			$('#current-food-event-list').html("");
		}
	}

	function showEventInstanceList(inputType, result) {
		var eventInstances = [];
		for (var i = 0; i < result.rows.length; i++) {
			//process results
			
			var row = result.rows.item(i);
			var date = new Date(row.beginTime);
			var minutes = parseInt(date.getMinutes());
			if (minutes < 10) {
				//show minutes correct
				minutes = "0" + minutes;
			}
			//ensure carbs is null if it is undefined
			var carbs;
			if(row.carbs !== null){
				carbs = parseInt(Math.round(Number(row.carbs*row.amount)));
			}
			else{
				carbs = null;
			}
			if(row.eventType === FOOD){
				//push food button object to list
				eventInstances.push({
					amount : row.amount,
					name : row.name,
					beginHours : date.getHours(),
					beginMinutes : minutes,
					beginDay : date.getDate(),
					beginMonth : (date.getMonth() + 1),
					beginYear : date.getFullYear(),
					id : row.id,
					eventType: row.eventType,
					carbs : carbs
				})
			}
			else{
				//push activity button object to list
				var intensityTextAndColor = controller.convertIntensityIntToTextAndColor(row.intensity);
				//push button object to list
				var button ={
					name : row.name,
					beginHours : date.getHours(),
					beginMinutes : minutes,
					beginDay : date.getDate(),
					beginMonth : (date.getMonth() + 1),
					beginYear : date.getFullYear(),
					id : row.id,
					eventType: row.eventType,
					intensityText: intensityTextAndColor.text,
					intensityColorInterpretation: intensityTextAndColor.color
					
				};
				if(row.endTime){
					var endDate = new Date(row.endTime);
					var endMinutes = parseInt(endDate.getMinutes());
					if (endMinutes < 10) {
						//show minutes correct
						endMinutes = "0" + endMinutes;
					}
					button.endHours = endDate.getHours();
					button.endMinutes = endMinutes;
				}
				if(row.eventId === IDPAUSETRACKING){
					button.pausetracking = "yes";
				}
				eventInstances.push(button);
			}

		}
		//get template
		var source = $("#history-event-instance-list-template").html();
		//compile to hanlebars template
		var template = Handlebars.compile(source);
		//fill template with events and add screen to page
		$('#history-event-instance-list').html(template(eventInstances));
	}
}
