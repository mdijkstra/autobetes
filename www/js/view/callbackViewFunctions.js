
function showEventList(transaction, result) {
	if (result !== null && result.rows !== null) {
		var rows = [];
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
					setAddOrEditScreen(id);
				});
				
				//ensure next call this button is not presented
				$('#eventnameOfAddedOrEditedEvent').text('');

			}
			else{
				//push button in array
				rows.push(row);
			}

		}
		var source = $("#event-list-template").html();
		var template = Handlebars.compile(source);
		$("#event-list").html(template(rows));
		
	} 
	if($('#editModeButton').val() ==="on"){
		//edit mode is on, switch background of buttons
		$('.eventButtons').attr("style","background: "+COLOR_EDIT_MODE+" !important");

	}
}

function showCurrentEventInstanceActivity(inputType, result) {

	var buttons = [];
	for (var i = 0; i < result.rows.length; i++) {
		//progress results
		var row = result.rows.item(i);
		//console.log(row);
		var date = new Date(row.beginTime);
		var minutes = parseInt(date.getMinutes());
		if (minutes < 10) {
			//show minutes correct
			minutes = "0" + minutes;
		}
		var intensityTextAndColor = convertIntensityIntToTextAndColor(row.intensity);
		var button = {
				name : row.name,
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

		//add button to array
		buttons.push(button);

	}
	if(buttons.length > 0){
		$('#current-activity-event-list').show();
		var source = $("#current-activity-event-list-template").html();
		var template = Handlebars.compile(source);	
		$('#current-activity-event-list').html(template(buttons));
	}
	else{
		$('#current-activity-event-list').hide();
	}

}

function showCurrentEventInstanceFood(inputType, result) {

	var foodInstances = [];
	var total = 0;
	for (var i = 0; i < result.rows.length; i++) {
		//progress results
		var row = result.rows.item(i);
		
		//check if name is allready in foodInstances, if so add this instance to it
		var allreadyInFoodInstances = false;
		/*
		for(var i = 0; i < foodInstances.length; i++){
			var instance = foodInstances[i];
			
			if(instance.name === row.name){
				
				if(row.carbs){
					allreadyInFoodInstances = true;
					instance.amount = instance.amount+row.amount;
					instance.carbs = instance.carbs+ (row.amount*row.carbs);
					total = total+(row.carbs*row.amount);
				}
			}
		}*/
		if(allreadyInFoodInstances === false){
		if(row.carbs){
			foodInstances.push({name : row.name, amount : row.amount, carbs:(row.carbs*row.amount)});
			total = total+(row.carbs*row.amount);
		}
		else{
			foodInstances.push({name:row.name, amount:row.amount});
		}
		}
	}
	if(foodInstances.length > 0){
		$('#current-food-event-list').show();
	foodInstances.unshift({total:total});
	console.log("joepi: "+JSON.stringify(foodInstances));
	var source = $("#current-food-event-list-template").html();
	var template = Handlebars.compile(source);	
	console.log(template(foodInstances));
	$('#current-food-event-list').html(template(foodInstances));
	}
	else{
		$('#current-food-event-list').hide();
	}
}

function showEventInstanceList(inputType, result) {

	var eventInstances = [];
	for (var i = 0; i < result.rows.length; i++) {
		//process results
		
		var row = result.rows.item(i);
		//console.log(JSON.stringify(row));
		var date = new Date(row.beginTime);
		var minutes = parseInt(date.getMinutes());
		if (minutes < 10) {
			//show minutes correct
			minutes = "0" + minutes;
		}
		var carbs;
		if(row.carbs !== null){
			carbs = parseInt(Math.round(Number(row.carbs*row.amount)));
		}
		else{
			carbs = null;
		}
		if(row.eventType === FOOD){
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
			var intensityTextAndColor = convertIntensityIntToTextAndColor(row.intensity);
			var endDate = new Date(row.endTime);
			var endMinutes = parseInt(endDate.getMinutes());
			if (endMinutes < 10) {
				//show minutes correct
				endMinutes = "0" + endMinutes;
			}
			eventInstances.push({
				name : row.name,
				beginHours : date.getHours(),
				beginMinutes : minutes,
				beginDay : date.getDate(),
				beginMonth : (date.getMonth() + 1),
				beginYear : date.getFullYear(),
				id : row.id,
				eventType: row.eventType,
				intensityText: intensityTextAndColor.text,
				intensityColorInterpretation: intensityTextAndColor.color,
				endHours : endDate.getHours(),
				endMinutes : endMinutes
			});
		}

	}
	var source = $("#history-event-instance-list-template").html();
	var template = Handlebars.compile(source);
	$('#history-event-instance-list').html(template(eventInstances));

}

