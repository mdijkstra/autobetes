
$('[name=event-list-navbar-buttons]').click(function() {
	//get event type that user clicked
	var eventType = $(this).html() === 'All' ? null : $(this).html();
	//get index (necessary for highlighting clicked button)
	var index = 0;
	if (eventType === FOOD)
		index = 1;
	else if (eventType === ACTIVITY)
		index = 2;
	//set index
	$(document).data('selectedTabIndex', {
		'index': index,
		'eventType': eventType
	});
	$('[name=event-list-navbar-buttons]').removeClass('ui-btn-active');
	//highlight the button that is selected
	$('[name=event-list-navbar-buttons]:eq(' + index + ')').addClass('ui-btn-active');
	//show list of events with certain eventType
	dbHandler.getEvents(eventType, callbackView.showEventList);
});


$('[name=history-event-instance-list-navbar-buttons]').click(function() {
	//get event type
	var eventType = $(this).html() === 'All' ? null : $(this).html();
	//get index
	var index = 0;
	if (eventType === FOOD)
		index = 1;
	else if (eventType === ACTIVITY)
		index = 2;
	$(document).data('selectedTabIndex2', {
		'index': index,
		'eventType': eventType
	});

	$('[name=history-event-instance-list-navbar-buttons]').removeClass('ui-btn-active');
	//highlight the button that is selected
	$('[name=history-event-instance-list-navbar-buttons]:eq(' + index + ')').addClass('ui-btn-active');

	dbHandler.listHistoryEvents(eventType, callbackView.showEventInstanceList);

});

$('#newEventPageEventType').change(function(){
	//user clicked a radio button
	//show different input fields
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
	//get values
	var cannotAddOrEdit = false;
	var eventName = $('#newEventName').val();
	var eventType = controller.setNullIfFieldIsEmpty($('[name="radio-choice-h-2"]:checked').val());
	var carbs = controller.setNullIfFieldIsEmpty($('#newEventPageCarbs').val());
	var alcoholicUnits = controller.setNullIfFieldIsEmpty($('#newEventPageAlcoholicUnits').val());
	var power = controller.setNullIfFieldIsEmpty($('#newEventPagePower').val());
	//check if eventname is empty
	if(eventName === ""){
		view.toastShortMessage("Please define the event name");

	}

	else{
		//show div
		$('#recentlyAddedEvent').show();
		//tag certain event to be presented on top. The method showlist handles
		//this privilege
		$('#eventnameOfAddedOrEditedEvent').text(eventName);
		
		//go back to event list page
		$.mobile.changePage('#'+EVENTLISTPAGE);
		//wait till window is loaded
		$(window).ready(function(){

			if($('#addOrEditEvent').text() === 'Add'){
				//add event
				dbHandler.addEvent(eventName, eventType, carbs, alcoholicUnits, power);
			}
			else{
				//edit event 
				var id = $('#cid').text();
				dbHandler.updateEvent(id, eventName, eventType, carbs, alcoholicUnits, power);


			}
		});
	}


});

$('#deleteEvent').click(function(){
	//get name 
	var eventName = $('#newEventName').val();
	//insert name in dialog text
	$('#deleteEventDialogText').html(ARE_YOU_SURE_DELETE+ eventName+'?');

	$('#deleteEventDialogConfirmButton').click(function() {
		//user confirmed deleting event
		//go back to event list page
		$.mobile.changePage('#'+EVENTLISTPAGE);
		//wait till window is loaded
		$(window).ready(function(){
			//delete event
			dbHandler.deleteEvent($('#cid').text());

			view.toastMessage("deleted " + eventName);
		})
	});
	$('#deleteEventDialogNoButton').click(function() {
		view.populateEditEventScreen($('#cid').text());
	});

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
	//check if the fields are empty
	if($('#mydate').val() === ""){
		view.toastShortMessage("Please define the begin date");
	}
	else if($('#mytime').val() === ""){
		view.toastShortMessage("Please define the begin time");
	}
	else{
		//back to home page
		$.mobile.changePage('#'+HOMEPAGE);
		//wait till page is loaded
		$(window).ready(function(){
			//get values
			var timeAndDate = controller.setNullIfFieldIsEmpty($('#mydate').val()) + " " + controller.setNullIfFieldIsEmpty($('#mytime').val());
			var unixTime = controller.setNullIfFieldIsEmpty(Date.parse(timeAndDate).getTime());
			var eventId = controller.setNullIfFieldIsEmpty($('#start-event-instance-page-event-cId').text());
			var quantity = controller.setNullIfFieldIsEmpty($('#start-event-instance-quantity-slider').val());
			var eventType = controller.setNullIfFieldIsEmpty($('#start-event-instance-page-eventType').text());
			//add instance
			dbHandler.addEventInstance(quantity, unixTime, eventType, eventId);
			//set added text regarding which event is added
			var addedText = "Added "+$('#startEventName').html();
			
			view.toastMessage(addedText);
			//refresh list of current events
			dbHandler.showCurrentActivityEventInstances();
		});
	}


});


$('#loginDialogOkButton').click(function(){
	view.toastShortMessage("Login")
	//window.location.href =  '#home-page';
	var email = controller.setNullIfFieldIsEmpty($('#loginEmail').val());
	var password = controller.setNullIfFieldIsEmpty($('#loginPassword').val());
	//check if user switched account
	dbHandler.getUserInfo(function(transaction, result){
		if(result.rows.length > 0 && result.rows.item(0).email !== email){
			//user switched account, so now reset db

			dbHandler.resetDBExceptUserTable();
			restClient.setToken("");//ensure that no token is saved of other account

		}
		dbHandler.updateEmailAndPassword(email, password, function(){
			controller.login();
			//window.location.href =  '#home-page';
		});

	})


});

$('#registrationDialogOkButton').click(function(){
	//console.log("start registering");
	//get values
	var email = controller.setNullIfFieldIsEmpty($('#registerEmail').val());
	var pumpId = controller.setNullIfFieldIsEmpty($('#registerPumpId').val());
	var password = controller.setNullIfFieldIsEmpty($('#registerPassword').val());
	var confirmPassword = controller.setNullIfFieldIsEmpty($('#registerConfirmPassword').val());

	//add tests to values
	//validate email 
	var validationPattern = /^.+@.+.[a-zA-Z]{2,3}$/;
	if(validationPattern.test(email)){
		//validate password
		if(password === confirmPassword){
			//reset db to ensure that data from another account not will end up in this account, 
			dbHandler.resetDBExceptUserTable();

			var userData = {
					email: email,
					password: password
			}

			view.toastShortMessage(CONNECT_TO_SERVER);

			var registerCallbackError = function(response, textStatus, error){

				if(response.responseText === ""){
					//could not connect to server
					view.showMessageDialog('Failed', SERVER_CONNECTION_FAIL+". "+TRY_AGAIN_LATER);

				}
				else{
					//console.log(response.responseText)
					view.toastShortMessage(response.responseText);
				}
			};

			var registerCallbackSuccess = function(data, textStatus, response){
				if(response.responseJSON.success){
					dbHandler.updateUser(email, pumpId, password);
					$.mobile.back();//go to previous page
					//alert(response.responseJSON.message);
					setTimeout(function() {
						//without this timeout the messageDialog appears only a fraction of a second before loginDialog,
						//with this timeout it appears after loginDialog is loaded
						view.showMessageDialog(SUCCEEDED, response.responseJSON.message + PLEASE_SYNC_WITH_PUMP);
					}, 500)
					//alert("Please synchronise the time settings of your insulin pump with those of your app!").

				}
				else{
					view.showMessageDialog(FAILED, response.responseJSON.message);
				}
				//alert(data.message);

				$("#messageText").html(data.message);
				$( "#messageDialog" ).dialog();



			};

			console.log("execute restclient.register");
			restClient.register(SERVER_URL+REGISTER_URL , userData,	registerCallbackSuccess, registerCallbackError);
		}
		else{
			view.showMessageDialog('', PASSWORDS_NOT_THE_SAME);


		}

	}
	else{
		view.showMessageDialog('', INVALID_EMAIL);

	}

});