
function showEventList(transaction, result) {
	if (result !== null && result.rows !== null) {
		var rows = [];
		for (var i = 0; i < result.rows.length; i++) {
			var row = result.rows.item(i);
			
			
			if($('#presentBoolean').text() === 'show' && $('#eventNameToBePrivileged').text() === row.name ){
				//new event has been made, name corresponds with name of this row item.
				//the item need to be presented as a special button on top of the list, not in the list itself
				var buttonText = '<span id="name">' + row.name + '</span><span id="eventType" style="display: none">'+row.eventType+'</span><span id="eventID" style="display: none">'+row.cId+'</span>';
				//show new event in button on top of the list
				$('#recentAddedEventButton').html(buttonText);
				$('#recentAddedEventButton').val(row.eventType);
				//ensure next call this button is not presented
				$('#presentBoolean').text('hide');

			}
			else{
				//push button in array
				rows.push(row);
			}
			
		}
		var source = $("#event-list-template").html();
		console.log(source);
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
		var date = new Date(row.beginTime);
		var minutes = parseInt(date.getMinutes());
		if (minutes < 10) {
			//show minutes correct
			minutes = "0" + minutes;
		}
		var intensityTextAndColor = getIntensityText(row.intensity);
		var button = {
				name : row.name,
				intensityText: intensityTextAndColor.text,
				intensityColorInterpretation: intensityTextAndColor.color,
				beginHours : date.getHours(),
				beginMinutes : minutes,
				beginDay : date.getDate(),
				beginMonth : (date.getMonth() + 1),
				beginYear : date.getFullYear(),
				cId : row.cId,
				eventType: row.eventType
				
		}
		
		//add button to array
		buttons.push(button);
		
	}
	
	var source = $("#current-activity-event-list-template").html();
	var template = Handlebars.compile(source);	
	$('#current-activity-event-list').html(template(buttons));
	
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
		if(row.eventType === FOOD){
			eventInstances.push({
				amount : row.amount,
				name : row.name,
				beginHours : date.getHours(),
				beginMinutes : minutes,
				beginDay : date.getDate(),
				beginMonth : (date.getMonth() + 1),
				beginYear : date.getFullYear(),
				cId : row.cId,
				eventType: row.eventType
			})
		}
		else{
			var intensityTextAndColor = getIntensityText(row.intensity);
			var endDate = new Date(row.beginTime);
			var endMinutes = parseInt(date.getMinutes());
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
				cId : row.cId,
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

