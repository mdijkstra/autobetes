$('#connectToMoves').click(function(){

	var link = 'moves://app/authorize?client_id=Da6TIHoVori74lacfuVk9QxzlIM5xy9E&scope=activity&redirect_uri=http%3A//195.169.22.237//plugin/moves/connect%3Ftoken%3D'+restClient.getToken();
	console.log(link);
	window.open(link, '_system' ,'');

	/*
	if(MOVES_INSTSTALLED){

		if(restClient.getToken() !== null){
			//console.log("token is: "+ restClient.getToken());
			window.open('moves://app/authorize?client_id=Da6TIHoVori74lacfuVk9QxzlIM5xy9E&scope=activity&redirect_uri=http://autobetes.nl?token='+restClient.getToken(), '_system' ,'location=no');
		}
		else{
			view.toastMessage("You are currently not logged in, please make sure that your account is logged in");
		}
	}
	else{

		//moves is not installed on device
		//link to the website
		window.open(LINKTOMOVESWEBSITE, '_system' ,'location=no');
		/*
	 * OPTIMALIZATION link to the play/app store directly. This code works for android but not for
	 *  not for ios, might be due to the lack of the app store app in the simulator
		if(OS === ANDROID){
			//os is android
			//open moves in play store
			window.open(LINKTOMOVESPLAYSTORE, '_system' ,'location=no');
		}
		else if(OS === IOS){
			//os is iOS
			//open moves in app store
			view.toastShortMessage("link to appstore");
			window.open(LINKTOMOVESAPPSTORE, '_system' ,'location=no');
		}
	 */
	//}

});


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
	if(eventType ===SPECIAL){
		eventType = ACTIVITY;//first it was activity now special
	}

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


$('#deleteEvent').click(function(){
	//get name 
	var eventName = $('#newEventName').val();
	//insert name in dialog text
	$('#deleteEventDialogEventName').html(eventName);
	//insert id in confirm and no button
	$('#deleteEventDialogConfirmButton').val($('#foodId').html());
	$('#deleteEventDialogNoButton').val($('#foodId').html());

});

$('#deleteEventDialogNoButton').click(function() {

	view.populateEditEventScreen($('#deleteEventDialogNoButton').val());
});

$('#deleteEventDialogConfirmButton').click(function() {
	var eventName = $('#newEventName').val();
	//user confirmed deleting event
	//go back to event list page
	$.mobile.changePage('#'+EVENTLISTPAGE);
	//wait till window is loaded
	$(window).ready(function(){
		//delete event
		dbHandler.deleteEvent($('#deleteEventDialogConfirmButton').val());

		view.toastMessage("deleted "+ $('#deleteEventDialogEventName').html());
	})
});




$('#editModeButton').click(function(){

	if($('#editModeButton').val() ==="on"){

		//editmode was on, now need to be turned off
		$('#editModeButton').val('off');
		// $('#editModeButton').attr("style","");
		$('.eventButtons').attr("style","");

		//change buttontext to Add on make-new-event-page screen
		$('#addOrEditEvent').text('Add');
		$('#addOrEditEvent').attr('class', 'ui-btn ui-corner-all ui-shadow ui-btn-inline ui-icon-plus ui-btn-icon-left');
	}
	else{

		//editmode was off, now need to be turned on
		$('#editModeButton').val('on');
		// $('#editModeButton').attr("style","background: #8df3e6 !important");
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
	view.toastShortMessage(LOGIN);
	view.showLoadingWidget();
	//window.location.href =  '#home-page';
	var email = controller.setNullIfFieldIsEmpty($('#loginEmail').val());
	var password = controller.setNullIfFieldIsEmpty($('#loginPassword').val());
	//check if user switched account
	dbHandler.getUserCredentials(function(transaction, result){
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

$('#saveUserInfoButton').click(function(){

	var idOnPump = $('#pumpSerial').val();
	var gender = controller.setNullIfFieldIsEmpty($('[name="radio-choice-h-2"]:checked').val());
	var bodyWeight = $('#bodyWeight').val();
	var length = $('#length').val();
	var birthYear= $('#yearOfBirth').val();
	dbHandler.updateUserInfo(idOnPump,gender,bodyWeight,length,birthYear);
	controller.syncUserInfo()
	view.toastMessage("Save user info");
	$.mobile.back();//go to previous page
});

$('#registrationDialogOkButton').click(function(){
	//console.log("start registering");
	//get values
	var email = controller.setNullIfFieldIsEmpty($('#registerEmail').val());
	var password = controller.setNullIfFieldIsEmpty($('#registerPassword').val());
	var confirmPassword = controller.setNullIfFieldIsEmpty($('#registerConfirmPassword').val());



	//add tests to values
	//validate email 
	var validationPattern = /^.+@.+.[a-zA-Z]{2,3}$/;
	if(validationPattern.test(email)){
		//validate password
		if(password === confirmPassword){
			//reset db to ensure that data from another account not will end up in this account, 
			if(!IS_REGISTERING){
				IS_REGISTERING = true;//avoid 2 attempts of registering if user clicks 2 times
				dbHandler.resetDBExceptUserTable();
				var idOnPump = $('#registerPumpId').val();
				//var gender = controller.setNullIfFieldIsEmpty($('[name="radio-choice-h-22"]:checked').val());
				var gender = controller.setNullIfFieldIsEmpty($('[name="radio-choice-h-2"]:checked').val());
				var bodyWeight = $('#bodyWeightRegisterScreen').val();
				var length = $('#lengthRegisterScreen').val();
				var birthYear= $('#yearOfBirthRegisterScreen').val();
				dbHandler.updateUserInfo(idOnPump,gender,bodyWeight,length,birthYear);
				var userData = {
						email: email,
						password: password
				}

				view.toastShortMessage(CONNECT_TO_SERVER);
				view.showLoadingWidget();

				var registerCallbackError = function(response, textStatus, error){
					IS_REGISTERING = false;
					view.hideLoadingWidget();
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
					view.hideLoadingWidget();
					IS_REGISTERING = false;
					if(response.responseJSON.success){
						dbHandler.updateUser(email, password);
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

				restClient.register(SERVER_URL+REGISTER_URL , userData,	registerCallbackSuccess, registerCallbackError);
			}
			else{
				console.log('allready registering');
			}
		}
		else{
			view.showMessageDialog('', PASSWORDS_NOT_THE_SAME);


		}

	}
	else{
		view.showMessageDialog('', INVALID_EMAIL);

	}

});