
$('[name=event-list-navbar-buttons]').click(function() {
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


$('[name=history-event-instance-list-navbar-buttons]').click(function() {
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

	df.listHistoryEvents($(this).html());

});

$('#newEventPageEventType').change(function(){

	var eventType = $('[name="radio-choice-h-2"]:checked').val();
	if(eventType === FOOD){
		$('#newEventPageActivityInput').hide();
		$('#newEventPageFoodInput').show();

	}
	else{

		$('#newEventPageFoodInput').hide();
		$('#newEventPageActivityInput').show();
	}

});


$('#addOrEditEvent').click(function() {
	//alert('start adding');
	var eventName = $('#newEventName').val();
	var eventType = $('[name="radio-choice-h-2"]:checked').val();
	var carbs = $('#newEventPageCarbs').val();
	var alcoholicUnits = $('#newEventPageAlcoholicUnits').val();
	var power = $('#newEventPagePower').val();


	if($('#addOrEditEvent').text() === 'Add'){
		//add event
		df.addEvent(eventName, eventType, carbs, alcoholicUnits, power);
	}
	else{
		//edit event 
		var eventID = $('#cid').text();
		df.updateEvent(eventID, eventName, eventType, carbs, alcoholicUnits, power);


	}

	
	//show div
	$('#recentlyAddedEvent').show();
	//tag certain event to be presented on top. The method showlist handles
	//this privilege
	$('#eventnameOfAddedOrEditedEvent').text(eventName);

});

$('#deleteEvent').click(function(){
	var eventName = $('#newEventName').val();
	$('#deleteEventDialogText').html(ARE_YOU_SURE_DELETE+ eventName+'?');

	$('#deleteEventDialogConfirmButton').click(function() {
		df.deleteEvent($('#cid').text());
		console.log("delete event:"+$('#cid').text() )
		toastMessage("delete " + eventName);
	});
	$('#deleteEventDialogNoButton').click(function() {
		populateEditEventScreen($('#cid').text());
	});

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

		//change buttontext to Add on make-new-event-page screen
		$('#addOrEditEvent').text('Add');
		$('#addOrEditEvent').attr('class', 'ui-btn ui-corner-all ui-shadow ui-btn-inline ui-icon-plus ui-btn-icon-left');
	}
	else{
		//editmode was off, now need to be turned on
		$('#editModeButton').val('on');
		$('#editModeButton').attr("style","background: #8df3e6 !important");
		$('.eventButtons').attr("style","background: #8df3e6 !important");

		//change buttontext to Edit on make-new-event-page screen
		$('#addOrEditEvent').text('Save');
		$('#addOrEditEvent').attr('class', 'ui-btn ui-corner-all ui-shadow ui-btn-inline');


	}


});


$('#startEventInstanceButton').click(function() {

	var timeAndDate = $('#mydate').val() + " " + $('#mytime').val()
	var unixTime = Date.parse(timeAndDate).getTime();
	var eventId = $('#start-event-instance-page-event-cId').text();
	var quantity = $('#start-event-instance-quantity-slider').val();
	var eventType = $('#start-event-instance-page-eventType').text();

	df.addEventInstance(quantity, unixTime, eventId, eventType);
	df.showCurrentActivityEventInstances();
	//refresh list of current events

	//set text on home screen, regarding which event is added

	var addedText = "Added "+$('#startEventName').html();

	toastMessage(addedText)

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

		$('#newEventPageActivityInput').hide();
		$('#newEventPageFoodInput').show();


	}
	else{

		$("#radio-choice-h-2b").prop("checked", true);
		$("#radio-choice-h-2a").prop("checked", false);
		$("input[type='radio']").checkboxradio("refresh");

		$('#newEventPageFoodInput').hide();
		$('#newEventPageActivityInput').show();
	}
});

$('#loginDialogOkButton').click(function(){
	//window.location.href =  '#home-page';
	var email = $('#loginEmail').val();
	var password = $('#loginPassword').val();
	//check if user switched account
	df.getUserInfo(function(transaction, result){
		if(result.rows.length > 0 && result.rows.item(0).email !== email){
			//user switched account, so now reset db

			df.resetDBExceptUserTable();
			restClient.setToken(null);//ensure that no token is saved of other account

		}
		df.updateEmailAndPassword(email, password, function(){
			login();
			//window.location.href =  '#home-page';
		});

	})


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
			//reset db to ensure that data from another account not will end up in this account, 
			df.resetDBExceptUserTable();

			var userData = {
					email: email,
					password: password
			}

			toastShortMessage(CONNECT_TO_SERVER);

			var registerCallbackError = function(response, textStatus, error){

				if(response.responseText === ""){
					//could not connect to server
					showMessageDialog('Failed', SERVER_CONNECTION_FAIL+". "+TRY_AGAIN_LATER);

				}
				else{
					toastShortMessage(response.responseText);
				}
			};

			var registerCallbackSuccess = function(data, textStatus, response){
				if(response.responseJSON.success){
					df.updateUser(email, pumpId, password);
					$.mobile.back();//go to previous page
					//alert(response.responseJSON.message);
					setTimeout(function() {
						//without this timeout the messageDialog appears only a fraction of a second before loginDialog,
						//with this timeout it appears after loginDialog is loaded
						showMessageDialog(SUCCEEDED, response.responseJSON.message + PLEASE_SYNC_WITH_PUMP);
					}, 500)
					//alert("Please synchronise the time settings of your insulin pump with those of your app!").

				}
				else{
					showMessageDialog(FAILED, response.responseJSON.message);
				}
				//alert(data.message);

				$("#messageText").html(data.message);
				$( "#messageDialog" ).dialog();



			};


			restClient.register(SERVER_URL+REGISTER_URL , userData,	registerCallbackSuccess, registerCallbackError);
		}
		else{
			showMessageDialog('', PASSWORDS_NOT_THE_SAME);


		}

	}
	else{
		showMessageDialog('', INVALID_EMAIL);

	}

});