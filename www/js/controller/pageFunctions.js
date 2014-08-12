$(document).on('pageshow', '#start', function() {
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
		synchronise();
		showSelectedEvents();
	}
});

$(document).on('pageshow', '#loginDialog', function(){

	df.getUserInfo(function(transaction,result){
		
		
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

$(document).on('pageshow', '#settings', function(){
	df.getUserInfo(function(transaction,result){
		if(result.rows.length > 0 && result.rows.item(0).email){
			
			$('#settingsPageAccount').html(result.rows.item(0).email);
			$('#pumpSerial').val(result.rows.item(0).pumpId);
		}
		else{
			
		}
	});
});

$(document).on('pageshow', '#home', function() {
	if($(document).data(TOURMODE)){
		//app is in tour modus
		
		homeScreenTour();
	}
	else{
		synchronise();
		
		df.showCurrentActivityEventInstances();
	}
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
	$('#newEventPageCarbs').val('');
	$('#newEventPageAlcoholicUnits').val('');
	$('#newEventPagePower').val('');
	//checkbox might have been disabled
	$("#radio-choice-h-2a").checkboxradio('enable');
	$("#radio-choice-h-2b").checkboxradio('enable');
	
});

$(document).on('pageshow', '#newEvent', function(){
	if($(document).data(TOURMODE)){
		newEventScreenTour();
	}
})

$(document).on('pagehide', '#start', function(){
	 synchronise();
	//ensure the button with the new event(in green) will be hidden
	$('#recentlyAddedEvent').hide();
	//get out of edit mode
	$('#editModeButton').val('off');
	$('#editModeButton').attr("style","");
	$('.eventButtons').attr("style","");

});

$(document).on('pageshow', '#report', function(){
	//toastMessage('show report');
	var ref = window.open('http://google.org', '_self', 'location=no');
	setTimeout(function() {
	
		toastMessage('close screen');
        ref.close();
        window.location.href =  '#home';
    }, 5000);
    
});

$(document).on('pageshow', '#pumpSettings', function(){
	
});
