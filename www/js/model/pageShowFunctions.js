$(document).on('pageshow', '#start', function() {
	//set tab index on the "All" tab when the page will be showed
	$(document).data('selectedTabIndex', {
		'index': 0,
		'eventType': null
	});


	selectTabMenu();
});



$(document).on('pageshow', '#home', function() {
	$('.event-list3').html('');
	df.listCurrentEvents();
});

$(document).on('pageshow', '#history', function() {
	selectHistoryTabMenu();
	//db.listCurrentEvents();
});

$(document).on('pagehide', '#newEvent', function(){
	//empty eventname field
	$('#newEventName').val('');
});
