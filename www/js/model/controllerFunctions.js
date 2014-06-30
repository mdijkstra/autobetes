	
/*
 * 
 */
function editEventInstance(id, type) {
	//extract time and date from html
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
	df.updateEventInstance(type, $('#slider-3').val(),unixBeginTime,unixEndTime, id);
	//send db data to server
	df.sendDbData();
}



function parseButtonData(context) {
	//extract values
	this.eventName = $(context).children("h3:first").text();
	this.id = $(context).children('p:first').text();
	
	this.month = $(context).find('#month').text();
	this.day = $(context).find('#day').text();
	this.year = $(context).find('#year').text();
	this.hours = $(context).find('#beginHours').text();
	this.minutes = $(context).find('#beginMinutes').text();
	this.beginTime = this.hours + ":" + this.minutes;

	if ($(context).find('#intensityInt').text() === '') {
		//food event
		this.intensity = $(context).find('#amount').text();
		this.type = 'food';
	} else {
		//activity event
		this.intensity = $(context).find('#intensityInt').text();
		
		this.type = 'activity';
	}
	//modify data to make it compatible for jquery widgets
	if (parseInt(this.month) < 10) {
		this.month = "0" + this.month;
	}

	if (parseInt(this.day) < 10) {
		this.day = "0" + this.day;
	}
	if (parseInt(this.hours) < 10) {
		this.beginTime = "0" + this.beginTime;
	}

	this.dateStringForMyDate = this.year + "-" + this.month + '-' + this.day;

	if ($(context).find('#endHours').text() === '') {
		//button has no end time, so activity is still going, current time
		//will be used as end time

		var curTimePoint = new Date();
		var curMinutes = parseInt(curTimePoint.getMinutes());
		var curHour = parseInt(curTimePoint.getHours());
		//modify data to make it compatible for jquery widgets
		if (curMinutes < 10) {
			curMinutes = "0" + curMinutes;
		}
		if (curHour < 10) {
			curHour = "0" + curHour;
		}

		this.endTime = curHour + ":" + curMinutes;

	} else {
		//button has end time, so activity has allready ended
		//parse end time string
		this.endTime = $(context).find('#endHours').text() + ":" + $(context).find('#endMinutes').text();

		if (parseInt($(context).find('#endHours').text()) < 10) {
			endTime = "0" + this.endTime;
		}
	}
}


/*
 * 
 */
function editEventInstance(id, type) {
	//extract time and date from html
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
	df.updateEventInstance(type, $('#slider-3').val(),unixBeginTime,unixEndTime, id);
	//send db data to server
	df.sendDbData();
}


function getEvents(eventType) {
	$('#event-list').html('');
    if (eventType !== null && eventType !== undefined) {
        
        df.listEventsOfEventType(eventType.toLowerCase());
        
    }
    else{
        df.listAllEvents();
    }
  //hide the green button on top of the list
	if($('#presentBoolean').text() === 'hide'){
		$('#recentlyAddedEvent').hide();
	}
    
}

function selectTabMenu() {
    
    var selectedTabIndex = $(document).data('selectedTabIndex');
    var index = selectedTabIndex === undefined ? 0 : selectedTabIndex.index;
    var eventType = selectedTabIndex === undefined ? null : selectedTabIndex.eventType;
    $('[name=startEventTypeSelected]').removeClass('ui-btn-active');
    $('[name=startEventTypeSelected]:eq(' + index + ')').addClass('ui-btn-active');
    //console.log('in selectTabMenu, eventType: ' + eventType);
    
    getEvents(eventType);
  
}

function selectHistoryTabMenu() {

var selectedTabIndex = $(document).data('selectedTabIndex2');
var index = selectedTabIndex === undefined ? 0 : selectedTabIndex.index;
var eventType = selectedTabIndex === undefined ? null : selectedTabIndex.eventType;
$('[name=historyEventTypeSelected]').removeClass('ui-btn-active');
$('[name=historyEventTypeSelected]:eq(' + index + ')').addClass('ui-btn-active');
//empty list
$('.event-list2').html('');
df.listHistoryEvents(eventType);
}