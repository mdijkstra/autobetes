function deleteEvent(eventName, eventId, eventType){
//user need to confirm before event be deleted(inactivated), therefore a confirm dialog appears on screen(delete button has href="#deleteDialog")
	//set text in dialog
	$('#dialogText').html(ARE_YOU_SURE_DELETE+ eventName+'?');
	
	$('#deleteEventInstanceDialogConfirmButton').click(function() {
		//user confirms
		//delete instance
		df.deleteEventInstance(eventID);
		//refresh list in history
		var selectedTabIndex = $(document).data('selectedTabIndex2');
		var selectedTab = selectedTabIndex === undefined ? null : selectedTabIndex.eventType;
		df.listHistoryEvents(selectedTab);

	});
}
/*
 * Converts unix timestamp to aproppriate date and timestring
 */
function convertTimestampToTimeAndDate(timestamp){
	var date = new Date(timestamp);
	var month = (date.getMonth() + 1);
	var day = date.getDate();
	var year = date.getFullYear();
	var hours = date.getHours();
	var minutes = date.getMinutes();

	if (minutes < 10) {
		minutes = "0" + minutes;
	}
	if(hours < 10){

		hours = "0"+ hours;
	}
	if (parseInt(month) < 10) {
		month = "0" + month;
	}

	if (parseInt(day) < 10) {
		day = "0" + day;
	}
	if (parseInt(hours) < 10) {
		beginTime = "0" + beginTime;
	}

	var time = hours + ":" + minutes;
	var date2 = year + "-" + month + '-' + day;

	return {date: date2,
		time: time}
}

/*
 * Method gets called in edit-event-instance-page when user clicks the save button
 */
function updateEventInstance() {
	//extract values from DOM
	var cId = $("#edit-event-instance-cId").text();
	var eventType = $("#edit-event-instance-eventType").text();
	var beginTimeAndDate = $('#mydate2').val() + " " + $('#beginTime').val();
	//convert to unix timestamp
	var unixBeginTime = Date.parse(beginTimeAndDate).getTime();
	//same with end time
	var endTimeAndDate = $('#mydate2').val() + " " + $('#endTime').val();

	var unixEndTime = Date.parse(endTimeAndDate).getTime();

	//correct endtime if necessary(when end date is actually one day later
	//convert to date objects for comparison
	var beginDate = new Date(unixBeginTime);
	var endDate = new Date(unixEndTime);

	if (beginDate.getHours() > endDate.getHours()) {
		//end time is before begin time, so we automatically suppose that
		//end time is next day
		unixEndTime += 86400000;
		//add one day in milliseconds
	} else if (beginDate.getHours() === endDate.getHours() && beginDate.getMinutes() > endDate.getMinutes()) {
		//same case as the if statement
		unixEndTime += 86400000;
		//add one day in milliseconds
	}
	//update event instance in database
	df.updateEventInstance(eventType, $('#edit-event-instance-quantity-slider').val(),unixBeginTime,unixEndTime, cId);

}

function showEvents(eventType) {
	if (eventType !== null && eventType !== undefined) {

		df.listEventsOfEventType(eventType);

	}
	else{
		df.showEvents();
	}
	//if user edits or adds an event it will be shown on top of the list in green.
	//in the onclick(#addOrEditEvent) function the name will be set in the hidden span #eventnameOfAddedOrEditedEvent. 
	//Once that name corresponds with the event in showlist it will set in the green button. The text in #eventnameOfAddedOrEditedEvent
	//will be removed in order to hide the green button after the list is shown.
	if($('#eventnameOfAddedOrEditedEvent').text() === ''){
		//text is empty, ensure that button is hidden
		$('#recentlyAddedEvent').hide();
	}
	

}
/*
 * When user clicks an eventType in the startEventNavbar, this method gets called to 
 * find out the eventType and call showEvents.
 */
function showSelectedEvents() {
	//get tab index
	var selectedTabIndex = $(document).data('selectedTabIndex');
	//if nothing is selected take 0 as index
	var index = selectedTabIndex === undefined ? 0 : selectedTabIndex.index;
	//get eventType take null if nothing is selected
	var eventType = selectedTabIndex === undefined ? null : selectedTabIndex.eventType;
	//unhighlight all buttons
	$('[name=startEventTypeSelected]').removeClass('ui-btn-active');
	//highlight the button that is selected
	$('[name=startEventTypeSelected]:eq(' + index + ')').addClass('ui-btn-active');
	
	showEvents(eventType);

}
/*
 * Same as above but now with event instances in history page
 */
function selectHistoryTabMenu() {

	var selectedTabIndex = $(document).data('selectedTabIndex2');
	var index = selectedTabIndex === undefined ? 0 : selectedTabIndex.index;
	var eventType = selectedTabIndex === undefined ? null : selectedTabIndex.eventType;
	$('[name=historyEventTypeSelected]').removeClass('ui-btn-active');
	$('[name=historyEventTypeSelected]:eq(' + index + ')').addClass('ui-btn-active');

	df.listHistoryEvents(eventType);
}
/*
 * This method gets called on booth. When user exists it calls the login method or else it opens login page
 */
function checkIfUserExists(){
	var checkCallBack = function(transaction,result){


		if(result.rows.length > 0 && result.rows.item(0).email){
			//user exists
			login();
		}
		else{
			//user does not exist
			//open dialog
			var currentPage = $.mobile.activePage[0].id;
			if(currentPage === LOGINDIALOG || currentPage === REGISTRATIONDIALOG){
				//allready registering logging in, do nothing
			}else{
				window.location.href =  LOGINPAGE;

			}

		}
	}
	df.getUserInfo(checkCallBack);
}
/*
 * This method gets called on booth and when token is expired
 */
function login(){

	if($(document).data(IS_LOGGING_IN) === false){
		//ensure that app is not logging in multiple times simultaneously
		$(document).data(IS_LOGGING_IN, true);
		df.getUserInfo(transaction,result){

			if(result.rows.length > 0){
				var row = result.rows.item(0);
				//try to log in with data
				restClient.login(row.email, row.password, {
					success: function(result){

						$(document).data(IS_LOGGING_IN, false);
						token = result.token;
						synchronise();

						var currentPage = $.mobile.activePage[0].id;
						if(currentPage === LOGINDIALOG){
							toastMessage(SUCCESSFULLY_LOGGED_IN);
							$.mobile.back();//go to previous page
						}
					}

				}, callBackLoginError);
			}


		}

	}
	else{
	}
}