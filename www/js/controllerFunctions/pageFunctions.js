$(document).on('pageshow', '#event-list-page', function() {
	//set tab index on the "All" tab when the page will be showed
	$(document).data('selectedTabIndex', {
		'index': 0,
		'eventType': null
	});

	if($(document).data(TOURMODE)){
		//app is in tour modus
		startEventScreenTour();
	}
	else{
		
		//get tab index
		var selectedTabIndex = $(document).data('selectedTabIndex');
		//if nothing is selected take 0 as index
		var index = selectedTabIndex === undefined ? 0 : selectedTabIndex.index;
		//get eventType take null if nothing is selected
		var eventType = selectedTabIndex === undefined ? null : selectedTabIndex.eventType;
		//unhighlight all buttons
		$('[name=event-list-navbar-buttons]').removeClass('ui-btn-active');
		//highlight the button that is selected
		$('[name=event-list-navbar-buttons]:eq(' + index + ')').addClass('ui-btn-active');
		
		dbHandler.getEvents(eventType, callbackView.showEventList);
	}
});

$(document).on('pageshow', '#login-page', function(){

	dbHandler.getUserInfo(function(transaction,result){


		if(result.rows.length > 0 && result.rows.item(0).email){
			//user exists
			$('#loginEmail').val(result.rows.item(0).email);
			$('#loginPassword').val(result.rows.item(0).password)
		}
		else{
			$('#loginEmail').val('');
			$('#loginPassword').val('');
		}



	});
});

$(document).on('pageshow', '#settings-page', function(){
	//fill settings page
	//get user info
	dbHandler.getUserInfo(function(transaction,result){
		if(result.rows.length > 0 && result.rows.item(0).email){
			//fill page
			$('#settingsPageAccount').html(result.rows.item(0).email);
			$('#pumpSerial').val(result.rows.item(0).pumpId);
		}
		else{

		}
	});
	/*
	restClient._get(SERVER_URL+SERVER_USER_INFO_URL, "", function(data){
		console.log(JSON.stringify(data));
	});
	 $("#settings-page-recordingEventsButton").prop("disabled",true);
	 */
	 
});

$(document).on('pageshow', '#home-page', function() {
	
	if($(document).data(TOURMODE)){
		//app is in tour modus
		
		homeScreenTour();
	}
	else{
		//get current food and activity instances and present on screen
		dbHandler.getCurrentFoodEventInstances(PLUSMINRANGEFOODEVENT, callbackView.showCurrentEventInstanceFood);
		dbHandler.showCurrentActivityEventInstances(callbackView.showCurrentEventInstanceActivity);
	}
});

$(document).on('pageshow', '#history-event-instance-page', function() {
	//highlight right tab
	//get tab index
	var selectedTabIndex = $(document).data('selectedTabIndex2');
	var index = selectedTabIndex === undefined ? 0 : selectedTabIndex.index;
	//get event type
	var eventType = selectedTabIndex === undefined ? null : selectedTabIndex.eventType;
	$('[name=history-event-instance-list-navbar-buttons]').removeClass('ui-btn-active');
	$('[name=history-event-instance-list-navbar-buttons]:eq(' + index + ')').addClass('ui-btn-active');

	if($(document).data(TOURMODE)){
		//app is in tour modus
		
		historyEventInstancePageTour();
	}
	else{
		
		dbHandler.listHistoryEvents(eventType, callbackView.showEventInstanceList);

	}
});

$(document).on('pagehide', '#make-new-event-page', function(){
	if($(document).data(TOURMODE)){

	}else{

		
		//empty eventname field
		$('#newEventName').val('');
		$('#newEventPageCarbs').val('');
		$('#newEventPageAlcoholicUnits').val('');
		$('#newEventPagePower').val('');
		//checkbox might have been disabled
		$("#radio-choice-h-2a").checkboxradio('enable');
		$("#radio-choice-h-2b").checkboxradio('enable');
	}

});

$(document).on('pageshow', '#make-new-event-page', function(){
	//console.log("show new event");
	if($(document).data(TOURMODE)){
		newEventScreenTour();
	}
})

$(document).on('pagehide', '#event-list-page', function(){
	if($(document).data(TOURMODE)){

	}else{
		$('#filterControlgroup-input').val('');
		//ensure the button with the new event(in green) will be hidden
		$('#recentlyAddedEvent').hide();
		//get out of edit mode
		$('#editModeButton').val('off');
		$('#editModeButton').attr("style","");
		$('.eventButtons').attr("style","");
	}
});

function minAgo(now, ts) { // both seconds
	return Math.round((now - ts) / 60);
}

// TODO FIX token
$(document).on('pageshow', '#report-page', function(){
	
	if (0 === timestamp_last_seen_server) {
		// we have never had contact with the server before
		var never = 'never';
		$('#server-last-seen-span').html(never);
		$('#raspberry-last-seen-span').html(never);
		$('#sensor-last-seen-span').html(never);		
	} else {
		var now =  new Date().getTime() / 1000; // convert to s
		$('#server-last-seen-span').html(minAgo(now, timestamp_last_seen_server) + ' min. ago');
		$('#raspberry-last-seen-span').html(minAgo(now, timestamp_last_seen_raspberry) + ' min. ago');
		$('#sensor-last-seen-span').html(minAgo(now, timestamp_last_seen_sensor) + ' min. ago');		
	}
	
	$.getJSON( TEST_SERVER_URL + CONNECTION_STATS_URL + '?molgenis-token=permanent', function(data) {
		var now =  new Date().getTime() / 1000; // convert to s
		timestamp_last_seen_server = now;
		timestamp_last_seen_raspberry = data.RPiLastSeen; 
		timestamp_last_seen_sensor = data.lastSensorRecordSeen;

		var date = new Date;
		$('#connection-stats-time').html('(' + date.getHours() + ':' + (date.getMinutes()<10?'0':'') + date.getMinutes() + ' h.)');

		var serv_min	= minAgo(now, timestamp_last_seen_server);
		var rasp_min	= minAgo(now, timestamp_last_seen_raspberry);
		var sens_min	= minAgo(now, timestamp_last_seen_sensor);

		$('#server-last-seen-span').html(serv_min + ' min. ago');
		$('#raspberry-last-seen-span').html(rasp_min + ' min. ago');
		$('#sensor-last-seen-span').html(sens_min + ' min. ago');		

		view.toastMessage('Server ' + serv_min + ' min. ago\nRaspberry ' + rasp_min + ' min. ago\nSensor ' + sens_min + ' min. ago\n');
	});

});
$(document).on('pageshow', '#start-event-instance-page', function(){
	if($(document).data(TOURMODE)){
		startEventInstancePageTour();
	}
	
});

$(document).on('pageshow', '#edit-event-instance-page', function(){
	if($(document).data(TOURMODE)){
		editEventInstancePage();
	}
	
});

