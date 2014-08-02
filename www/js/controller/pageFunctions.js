$(document).on('pageshow', '#start', function() {
	 synchronise();
	//set tab index on the "All" tab when the page will be showed
	$(document).data('selectedTabIndex', {
		'index': 0,
		'eventType': null
	});


	showSelectedEvents();
});



$(document).on('pageshow', '#home', function() {
	synchronise();
	$('.event-list3').html('');
	df.showCurrentActivityEventInstances();
});

$(document).on('pageshow', '#history', function() {
	 synchronise();
	selectHistoryTabMenu();
	//db.showCurrentActivityEventInstances();
});

$(document).on('pagehide', '#newEvent', function(){
	 synchronise();
	//empty eventname field
	$('#newEventName').val('');
});


$(document).on('pagehide', '#start', function(){
	 synchronise();
	//ensure the button with the new event(in green) will be hidden
	$('#recentlyAddedEvent').hide();
	//get out of edit mode
	$('#editModeButton').val('off');
	$('#editModeButton').attr("style","");
	$('.eventButtons').attr("style","");

});