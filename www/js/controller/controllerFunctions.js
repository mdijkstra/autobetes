function deleteEvent(eventName, eventId, eventType){
//	before event be deleted(inactivated) a confirm box pops up
	//to ensure the user 

	$('#dialogText').html(ARE_YOU_SURE_DELETE+ eventName+'?');

	$('#deleteEventInstanceDialogConfirmButton').click(function() {
		var selectedTabIndex = $(document).data('selectedTabIndex2');
		var selectedTab = selectedTabIndex === undefined ? null : selectedTabIndex.eventType;

		df.deleteEventInstance(eventID);
		df.listHistoryEvents(selectedTab);

	});
}

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
 * 
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
	$('#event-list').html('');
    if (eventType !== null && eventType !== undefined) {
        
        df.listEventsOfEventType(eventType);
        
    }
    else{
        df.showEvents();
    }
  //hide the green button on top of the list
	if($('#presentBoolean').text() === 'hide'){
		$('#recentlyAddedEvent').hide();
	}
    
}

function showSelectedEvents() {
    
    var selectedTabIndex = $(document).data('selectedTabIndex');
    var index = selectedTabIndex === undefined ? 0 : selectedTabIndex.index;
    var eventType = selectedTabIndex === undefined ? null : selectedTabIndex.eventType;
    $('[name=startEventTypeSelected]').removeClass('ui-btn-active');
    $('[name=startEventTypeSelected]:eq(' + index + ')').addClass('ui-btn-active');
    //console.log('in selectTabMenu, eventType: ' + eventType);
    
    showEvents(eventType);
  
}

function selectHistoryTabMenu() {

var selectedTabIndex = $(document).data('selectedTabIndex2');
var index = selectedTabIndex === undefined ? 0 : selectedTabIndex.index;
var eventType = selectedTabIndex === undefined ? null : selectedTabIndex.eventType;
$('[name=historyEventTypeSelected]').removeClass('ui-btn-active');
$('[name=historyEventTypeSelected]:eq(' + index + ')').addClass('ui-btn-active');
//empty list
df.listHistoryEvents(eventType);
}

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
				window.location.href =  '#loginDialog';
				
			}
			
		}
	}
	df.getUserInfo(checkCallBack);
}

function login(){

	if($(document).data(IS_LOGGING_IN) === false){
		$(document).data(IS_LOGGING_IN, true);
		var loginCallBack = function(transaction,result){

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

		df.getUserInfo(loginCallBack);
	}
	else{
	}
}