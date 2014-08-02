
$('[name=startEventTypeSelected]').click(function() {
	var eventType = $(this).html() === 'All' ? null : $(this).html();
	var index = 0;
	if (eventType === FOOD)
		index = 1;
	else if (eventType === ACTIVITY)
		index = 2;
	$(document).data('selectedTabIndex', {
		'index': index,
		'eventType': eventType
	});

	showEvents(eventType);
});

$('[name=historyEventTypeSelected]').click(function() {
	var eventType = $(this).html() === 'All' ? null : $(this).html();
	var index = 0;
	if (eventType === FOOD)
		index = 1;
	else if (eventType === ACTIVITY)
		index = 2;
	$(document).data('selectedTabIndex2', {
		'index': index,
		'eventType': eventType
	});

	$('.event-list2').html('');
	df.listHistoryEvents($(this).html());

});


$('#addOrEditEvent').click(function() {
	//alert('start adding');
	var eventName = $('#newEventName').val();
	var eventType = $('[name="radio-choice-h-2"]:checked').val();
	console.log('te typs:'+eventType);
	if($('#addOrEditEvent').text() === 'Add'){
		//add event

		df.addEvent(eventName, eventType);
	}
	else{
		//edit event 
		var eventID = $('#eventID').text();
		df.updateEvent(eventID, eventName, eventType);
	}

	//present the edited button on top of the list with a green background
	//indicate that the green button on top needs to be shown
	$('#presentBoolean').text('show');
	//show div
	$('#recentlyAddedEvent').show();
	//tag certain event to be presented on top. The method showlist handles
	//this privilege
	$('#eventNameToBePrivileged').text(eventName);

});
$('#historyButton').click(function() {
	
	$(document).removeData('selectedTabIndex2');
	selectHistoryTabMenu();
	$('.event-list2').html('');//empty list

});

$('#editModeButton').click(function(){
	if($('#editModeButton').val() ==="on"){
		//editmode was on, now need to be turned off
		$('#editModeButton').val('off');
		$('#editModeButton').attr("style","");
		$('.eventButtons').attr("style","");

		//change buttontext to Add on newEvent screen
		$('#addOrEditEvent').text('Add');
		$('#addOrEditEvent').attr('class', 'ui-btn ui-corner-all ui-shadow ui-btn-inline ui-icon-plus ui-btn-icon-left');
	}
	else{
		//editmode was off, now need to be turned on
		$('#editModeButton').val('on');
		$('#editModeButton').attr("style","background: #8df3e6 !important");
		$('.eventButtons').attr("style","background: #8df3e6 !important");

		//change buttontext to Edit on newEvent screen
		$('#addOrEditEvent').text('Save');
		$('#addOrEditEvent').attr('class', 'ui-btn ui-corner-all ui-shadow ui-btn-inline');


	}


});


$('#startEventInstanceButton').click(function() {
	
	var timeAndDate = $('#mydate').val() + " " + $('#mytime').val()
	var unixTime = Date.parse(timeAndDate).getTime();
	var eventId = $('#eventID').text();
	var quantity = $('#start-event-instance-quantity-slider').val();
	var eventType = $('#eventType2').text();

	df.addEventInstance(quantity, unixTime, eventId, eventType);
	df.showCurrentActivityEventInstances();
	//refresh list of current events
	
	//set text on home screen, regarding which event is added

	var addedText = "Added "+$('#startEventName').html();

	if(addedText === $('#addedText').html()){
		//alter the added text in order to apply only the last intverval function
		addedText = addedText+' ';
		$('#addedText').html(addedText);

	}
	else{
		$('#addedText').html(addedText);
	}
	window.setTimeout(function(){
		if($('#addedText').html() === addedText){
			//the added text has been unaltered on the screen for the intervaltime 
			$('#addedText').html(' ')
		}
	}, TIME_ADDED_TEXT_ON_HOME_SCREEN);

	return;

});

$('#newEventButton').click(function(){
	$('#addOrEditEvent').text('Add');
	$('#addOrEditEvent').attr('class', 'ui-btn ui-corner-all ui-shadow ui-btn-inline ui-icon-plus ui-btn-icon-left');
	$('#headerName').text('New Event');

	/*
        	Autoselect 'Food' or 'Activity' when adding new event, based on selection 
        	that was active in 'Event view' (blue bars in top of screen)
	 */
	var selectedTabIndex = $(document).data('selectedTabIndex');
	var index = selectedTabIndex === undefined ? 0 : selectedTabIndex.index;

	if(index === 0 || index === 1){

		$("#radio-choice-h-2a").prop("checked", true);
		$("#radio-choice-h-2b").prop("checked",false);
		$("input[type='radio']").checkboxradio("refresh");
	}
	else{

		$("#radio-choice-h-2b").prop("checked", true);
		$("#radio-choice-h-2a").prop("checked", false);
		$("input[type='radio']").checkboxradio("refresh");
	}
});
$('#recentAddedEventButton').click(function(){
	 synchronise();
	setAddOrEditScreen(this);
});

$('#loginDialogOkButton').click(function(){
	//window.location.href =  '#home';
	
	var email = $('#loginEmail').val();
	var password = $('#loginPassword').val();
	
	var callbackFunction = function(){
		console.log("email and password set, now try to log in");
		login();
		window.location.href =  '#home';
	}
	
	df.updateUser(email, password, callbackFunction);
	
});

$('#registrationDialogOkButton').click(function(){
	//get values
	var email = $('#registerEmail').val();
	var pumpId = $('#registerPumpId').val();
	var password = $('#registerPassword').val();
	var confirmPassword = $('#registerConfirmPassword').val();

	//add tests to values
	//validate email 
	var validationPattern = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
	if(validationPattern.test(email)){
		//validate password
		if(password === confirmPassword){
			df.addUser(email, pumpId, password);
			window.location.href =  '#home';
			var userData = {
					email: email,
					password: password
			}
			restClient.register(SERVER_URL+REGISTER_URL , userData,	function(data, textStatus, response){
					//alert(data.message);
					console.log(textStatus.message);
					$("#messageText").html(data.message);
					$( "#messageDialog" ).dialog();
					
					console.log(response);
				
			}, callbackError);
		}
		else{
			alert('Passwords are not the same');
			
		}
		
	}
	else{
		alert('invalid email adres');
		
	}
	
});