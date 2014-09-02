function homeScreenTour(){
	console.log("homeScreenTourSecondStop");
	//guide tour stops multiple times at home screen. Index indicates which next stop will be
	var index_stop = $(document).data(GUIDE_TOUR_HOMESCREEN_STOP_INT);
	console.log("index is:"+index_stop)
	if(index_stop === 0){
		$('#homeScreenTourFirstStop').joyride({
			autoStart : true,
			modal:true,
			expose: true,
			postRideCallback : function (index, tip) {
				
				$(document).data(GUIDE_TOUR_HOMESCREEN_STOP_INT, 1)
				window.location.href =  '#event-list-page';
				//$(this).joyride({autoStart : false});
				$(this).joyride("destroy");

			}

		});
	}
	else if(index_stop === 1){
		var buttons = [{
				name : "Football",
				intensityText: 'Moderate',
				intensityColorInterpretation: '#33CC33',
				beginHours : "14",
				beginMinutes : "40",
				beginDay : "12",
				beginMonth : "02",
				beginYear : "2015",
				cId : "1",
				eventType: "Activity"

		}];
		var source = $("#current-activity-event-list-template").html();
		var template = Handlebars.compile(source);	
		$('#current-activity-event-list').html(template(buttons));
		$('#homeScreenTourSecondStop').joyride({
			autoStart : true,
			modal:true,
			expose: true,
			postRideCallback : function (index, tip) {

				window.location.href =  '#edit-event-instance-page';
				//$(this).joyride({autoStart : false});
				$(this).joyride("destroy");

			},
			preStepCallback : function(index, tip){
				if(index === 1){
					//$(this).joyride("setNubPositionTopRight");
					$(this)[0].nubPosition = "top-right";

				}
			}

		});
		
	}
	
}

function startEventScreenTour(){
	console.log("startEventScreenTour");
	//make All button in navbar active
	$('[name=event-list-navbar-buttons]:eq(0)').addClass('ui-btn-active');
	//mock event list
	$('#event-list').html("");
	var eventButton = $('<A CLASS="eventButtons ui-btn ui-shadow ui-corner-all"><span id="name">Cycling</span></A>');
	$('#event-list').append(eventButton);
	eventButton = $('<A CLASS="eventButtons ui-btn ui-shadow ui-corner-all"><span id="name">Hamburger</span></A>');
	$('#event-list').append(eventButton);

	$('#startEventScreenTour').joyride({
		modal:true,
		expose: true,
		autoStart : true,
		postRideCallback : function(){
			window.location.href =  '#make-new-event-page';
			$(this).joyride("destroy");
		},

		preStepCallback : function(index, tip){
			if(index === 3){
				//$(this).joyride("setNubPositionTopRight");
				$(this)[0].nubPosition = "top-right";

			}
		}
	});
}
//nubPosition : 'top-right',
function newEventScreenTour(){
	$("#radio-choice-h-2a").prop("checked", true);
	$("#radio-choice-h-2b").prop("checked",false);
	$("input[type='radio']").checkboxradio("refresh");

	$('#newEventPageActivityInput').hide();
	$('#newEventPageFoodInput').show();

	$('#newEventScreenTour').joyride({
		autoStart : true,
		modal:true,
		expose: true,
		postRideCallback : function(){
			//window.location.href =  '#make-new-event-page';
			window.location.href =  '#start-event-instance-page';
			$(this).joyride("destroy");
		},
		preStepCallback : function(index, tip){
			if(index === 4){
				$("#radio-choice-h-2b").prop("checked", true);
				$("#radio-choice-h-2a").prop("checked",false);
				$("input[type='radio']").checkboxradio("refresh");
				$('#newEventPageFoodInput').hide();
				$('#newEventPageActivityInput').show();


			}
		}
	});
}

function startEventInstancePageTour(){
	$('#startEventName').html("Pizza");

	//get current time
	var curTime = new Date();
	var month = curTime.getMonth() + 1;
	var day = curTime.getDate();
	//make date string for the jquery datepicker plugin, to select
	//the current time.
	if (month < 10) {
		//ensure month consist of 2 digits(necessary in jquery plugin
		month = "0" + month;
	}
	if (day < 10) {
		day = "0" + day;//same as for month
	}
	var dateStringForMyDate = curTime.getFullYear() + "-" + month + '-' + day;
	//set the current time
	$('#mydate').val(dateStringForMyDate);
	//make time string in the same fashion as the date string
	var currentMinutes = curTime.getMinutes();
	if (parseInt(currentMinutes) < 10) {
		currentMinutes = "0" + currentMinutes;
	}
	var currentHours = curTime.getHours();
	if (parseInt(currentHours) < 10) {
		currentHours = "0" + currentHours;
	}
	var timeStringForMyTime = currentHours + ":" + currentMinutes;
	$('#mytime').val(timeStringForMyTime);

	$('#start-event-instance-activity-quantity-slider-label').hide();
	$('#start-event-instance-food-quantity-slider-label').show();
	$('#start-event-instance-quantity-slider').attr('min', MIN_VALUE_FOOD_QUANTITY_SLIDER);
	$('#start-event-instance-quantity-slider').attr('step', STEP_VALUE_FOOD_QUANTITY_SLIDER);
	$('#start-event-instance-quantity-slider').val(DEFAULT_VALUE_FOOD_QUANTITY_SLIDER).slider('refresh');

	$('#startEventInstancePageTour').joyride({
		autoStart : true,
		modal:true,
		expose: true,
		postRideCallback : function(){
			console.log("go home")
			window.location.href =  '#home-page';
			$(this).joyride("destroy");
		},
		preStepCallback : function(index, tip){
			if(index === 3){
				$('#startEventName').html("Football");
				$('#start-event-instance-food-quantity-slider-label').hide();
				$('#start-event-instance-activity-quantity-slider-label').show();
				$('#start-event-instance-quantity-slider').attr('min', MIN_VALUE_ACTIVITY_QUANTITY_SLIDER);
				$('#start-event-instance-quantity-slider').attr('step', STEP_VALUE_ACTIVITY_QUANTITY_SLIDER);
				$('#start-event-instance-quantity-slider').val(DEFAULT_VALUE_ACTIVITY_QUANTITY_SLIDER).slider('refresh');
				setIntensityTextInScreen('#intensityToText', parseInt($('#start-event-instance-quantity-slider').val()));
			}
		}
	});
}

function editEventInstancePage(){
	$('#edit-event-instance-name').text('Football');
	
	$('#edit-event-instance-page-begin-time-field').val('14:40');
	$('#edit-event-instance-page-begin-date-field').val('2015-02-14');
	
	$('#endTimeField').show();
	$('#edit-event-instance-page-end-time-field').val('15:40');
	$('#edit-event-instance-page-end-date-field').val('2015-02-14');
	
	$('#edit-event-instance-food-quantity-slider-label').hide();
	$('#edit-event-instance-activity-quantity-slider-label').show();
	$('#edit-event-instance-quantity-slider').attr('min', MIN_VALUE_ACTIVITY_QUANTITY_SLIDER);
	$('#edit-event-instance-quantity-slider').attr('step', STEP_VALUE_ACTIVITY_QUANTITY_SLIDER);
	$('#edit-event-instance-quantity-slider').val(DEFAULT_VALUE_ACTIVITY_QUANTITY_SLIDER).slider('refresh');
	$('#intensity-slider-label-intensity-indication').css({color:'#33CC33'});
	$('#intensity-slider-label-intensity-indication').text('Moderate');
	
	$('#editEventInstancePageTour').joyride({
		autoStart : true,
		modal:true,
		expose: true,
		postRideCallback : function(){
			
			window.location.href =  '#history-event-instance-page';
			$(this).joyride("destroy");
		}
	});
}

function historyEventInstancePageTour(){
	$('[name=history-event-instance-list-navbar-buttons]:eq(0)').addClass('ui-btn-active');
		//mock data
		var eventInstances = [{
			amount : 1,
			name : "Pizza",
			beginHours : "18",
			beginMinutes : "23",
			beginDay : "18",
			beginMonth : "02",
			beginYear : "2015",
			cId : "1",
			eventType: "Food"
		},{
			name : "Football",
			intensityText: 'Moderate',
			intensityColorInterpretation: '#33CC33',
			beginHours : "14",
			beginMinutes : "40",
			beginDay : "12",
			beginMonth : "02",
			beginYear : "2015",
			cId : "1",
			eventType: "Activity",
			endHours : "15",
			endMinutes : "40"
			
		}];
		
		var source = $("#history-event-instance-list-template").html();
		var template = Handlebars.compile(source);
		$('#history-event-instance-list').html(template(eventInstances));
		
		$('#historyEventPageTour').joyride({
			autoStart : true,
			modal:true,
			expose: true,
			postRideCallback : function(){
				
				window.location.href =  '#home-page';
				$(this).joyride("destroy");
				$(document).data(TOURMODE, false);
				$(document).data(GUIDE_TOUR_HOMESCREEN_STOP_INT, 0);
			}
		});
}



