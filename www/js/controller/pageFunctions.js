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
		
		showSelectedEvents();
	}
});

$(document).on('pageshow', '#login-page', function(){

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

$(document).on('pageshow', '#settings-page', function(){
	df.getUserInfo(function(transaction,result){
		if(result.rows.length > 0 && result.rows.item(0).email){

			$('#settingsPageAccount').html(result.rows.item(0).email);
			$('#pumpSerial').val(result.rows.item(0).pumpId);
		}
		else{

		}
	});
});

$(document).on('pageshow', '#home-page', function() {
	
	if($(document).data(TOURMODE)){
		//app is in tour modus
		
		homeScreenTour();
	}
	else{
		
		df.getCurrentFoodEventInstances(PLUSMINRANGEFOODEVENT, showCurrentEventInstanceFood);
		df.showCurrentActivityEventInstances(showCurrentEventInstanceActivity);
		
		
	}
});

$(document).on('pageshow', '#history-event-instance-page', function() {
	if($(document).data(TOURMODE)){
		//app is in tour modus
		
		historyEventInstancePageTour();
	}
	else{
		
		selectHistoryTabMenu();
		//db.showCurrentActivityEventInstances();
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

$(document).on('pageshow', '#report-page', function(){
	
		   ifrm = document.createElement("IFRAME"); 
		   ifrm.setAttribute("src", SERVER_URL+"?molgenis-token="+token); 
		   ifrm.style.width = 640+"px"; 
		   ifrm.style.height = 480+"px"; 
		   console.log("no m")
		   console.log(ifrm)
		   $('#iFrameDiv').html(ifrm);
		   //document.body.appendChild(ifrm); 
		
	
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


$(document).on('pageshow', '#pumpSettings', function(){
	
});
