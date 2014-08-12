function homeScreenTour(){
	console.log("homeScreenTour");
	$('#homeScreenTour').joyride({
		autoStart : true,
		postRideCallback : function (index, tip) {
			
			window.location.href =  '#start';
			//$(this).joyride({autoStart : false});
		    $(this).joyride("destroy");
		    
		}
		
	});
}

function startEventScreenTour(){
	console.log("startEventScreenTour");
	//make All button in navbar active
	$('[name=startEventTypeSelected]:eq(0)').addClass('ui-btn-active');
	//mock event list
	$('#event-list').html("");
	var eventButton = $('<A CLASS="eventButtons ui-btn ui-shadow ui-corner-all"><span id="name">Cycling</span></A>');
	$('#event-list').append(eventButton);
	eventButton = $('<A CLASS="eventButtons ui-btn ui-shadow ui-corner-all"><span id="name">Hamburger</span></A>');
	$('#event-list').append(eventButton);
	
	$('#startEventScreenTour').joyride({
		
		autoStart : true,
		postRideCallback : function(){
			window.location.href =  '#newEvent';
			$(this).joyride("destroy");
		},
		
		preStepCallback : function(index, tip){
			if(index === 3){
				//$(this).joyride("setNubPositionTopRight");
				$(this)[0].nubPosition = "top-right";
				console.log($(this)[0]);
			}
		}
	});
}
//nubPosition : 'top-right',
function newEventScreenTour(){
	console.log("new event tour");
	$('#newEventScreenTour').joyride({
		autoStart : true,
		postRideCallback : function(){
			//window.location.href =  '#newEvent';
			$(this).joyride("destroy");
		}
	});
}
