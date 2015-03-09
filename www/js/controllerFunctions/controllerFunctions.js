function controller() {
	//add functions to object
	this.saveOrEditFoodEvent = saveOrEditFoodEvent;
	this.deleteEventInstance = deleteEventInstance;
	this.convertTimestampToTimeAndDate = convertTimestampToTimeAndDate;
	this.updateEventInstance = updateEventInstance;
	this.setNullIfFieldIsEmpty = setNullIfFieldIsEmpty;
	this.setEmptyStringIfFieldIsUndefined = setEmptyStringIfFieldIsUndefined;
	this.checkIfUserExists = checkIfUserExists;
	this.login = login;
	this.convertIntensityIntToTextAndColor = convertIntensityIntToTextAndColor;
	this.syncUserInfo = syncUserInfo;
	//this.getPrev


	/*
	 * If user defines new or updates food event, this method gets called if user press "save"(andConsume = false) or "save and consume"(andConsume = true).
	 * This method saves the changes and redirects back to the event list(in case user press "save") or to the start event
	 * page (in case user press "save and consume")
	 * 
	 * 
	 */
	function saveOrEditFoodEvent(andConsume){
		//extract values
		var cannotAddOrEdit = false;
		var eventName = $('#newEventName').val();
		var eventType = EventListType;
		var id = $('#foodId').html();
		var carbs = controller.setNullIfFieldIsEmpty($('#newEventPageCarbs').val());
		var alcoholicUnits = controller.setNullIfFieldIsEmpty($('#newEventPageAlcoholicUnits').val());
		var power = controller.setNullIfFieldIsEmpty($('#newEventPagePower').val());
		var portionsize= controller.setNullIfFieldIsEmpty($('#newEventPortionSize').val());
		var newEvent= controller.setNullIfFieldIsEmpty($('#newEventPortionSize').val());
		var estimationCarbs = controller.setNullIfFieldIsEmpty($('#newEventEstimationCarbs').is(':checked'));
		//convert boolean to integer
		if(estimationCarbs === true){
			estimationCarbs = 0;
		}
		else{
			estimationCarbs = 1;
		}
		//check if eventname is empty

		if(eventName === ""){
			//field event name cannot be empty
			view.toastShortMessage("Please define the event name");

		}
		else{
			var callbackFunction;

			if(!andConsume){

				callbackFunction = function(generatedId){
					if(generatedId === EVENTALLREADYEXISTS){
						//allready an undeleted event with the same name in the database
						view.showMessageDialog("", eventName+ ALLREADY_EXISTS);
					}
					else{
						//go back to food event list page
						//this food event need to be shown on top of the list

						$('#recentlyAddedEvent').show();
						//tag certain event to be presented on top. The method showlist handles
						//this privilege
						$('#eventnameOfAddedOrEditedEvent').text(eventName);
						//go back to event list page
						$.mobile.changePage('#'+EVENTLISTPAGE);
						synchronise(); 
						$('#foodId').html(generatedId);
					}

				};

			}
			else{

				callbackFunction = function(generatedId){
					if(generatedId === EVENTALLREADYEXISTS){
						//allready an undeleted event with the same name in the database
						view.showMessageDialog("", eventName+ ALLREADY_EXISTS);
					}
					else{
						$('#foodId').html(generatedId);
						//redirect to start-event-instance-page
						$.mobile.changePage('#start-event-instance-page');
						//timeout is necessary because this callback gets executed just before entity is added
						setTimeout(function(){
							view.populateStartEventInstanceScreen(generatedId);
							synchronise();
						}, 100);
					}
				}



			}
			if(id === ''){
				//add event
				dbHandler.addEvent(eventName, eventType, carbs, alcoholicUnits, power, portionsize, estimationCarbs, callbackFunction);
			}
			else{
				//edit event
				dbHandler.updateEvent(id, eventName, eventType, carbs, alcoholicUnits, power, portionsize, estimationCarbs, callbackFunction);
			}
		}
	}
	/*
	 * Once user wants to delete an event this method gets executed, which in turn calls the dbHandler to flag the entity of interest as deleted
	 */
	function deleteEventInstance(eventName, id, eventType){
//		user need to confirm before event be deleted(inactivated), therefore a confirm dialog appears on screen(delete button has href="#deleteDialog")
		//set text in dialog
		$('#dialogText').html(ARE_YOU_SURE_DELETE+ eventName+'?');
		$('#deleteEventInstanceDialogConfirmButton').unbind();
		$('#deleteEventInstanceDialogConfirmButton').click(function() {
			//user confirms
			//delete instance
			//$.mobile.back();//current page is the dialog, go to previous page. Goes back from where deleted
			//$.mobile.changePage("#history-event-instance-page");
			view.toastMessage("deleted "+ eventName);
			var deletedFrom = $("#delete-from").html();
			if(deletedFrom === "edit-event-instance-page"){
				//if deleted from edit-event-instance-page go back 2 pages, otherwise edit-event-instance-page pops up with the deleted event instance
				window.history.go(-2);
			}
			else{
				window.history.go(-1);
			}
			$(window).ready(function(){

				dbHandler.deleteEventInstance(id);
				//refresh list in history
				var selectedTabIndex = $(document).data('selectedTabIndex2');
				var selectedTab = selectedTabIndex === undefined ? null : selectedTabIndex.eventType;
				dbHandler.listHistoryEvents(selectedTab, callbackView.showEventInstanceList);
			});
		});
	}
	/*
	 * Converts unix timestamp to aproppriate date and timestring
	 */
	function convertTimestampToTimeAndDate(timestamp){
		//get date object
		var date = new Date(timestamp);
		//get values
		var month = (date.getMonth() + 1);
		var day = date.getDate();
		var year = date.getFullYear();
		var hours = date.getHours();
		var minutes = date.getMinutes();
		//ensure date and time string are correct represented
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
		var beginDate = $('#edit-event-instance-page-begin-date-field').val();
		var beginTime = $('#edit-event-instance-page-begin-time-field').val();
		var endDate = $('#edit-event-instance-page-end-date-field').val();
		var endTime = $('#edit-event-instance-page-end-time-field').val();
		//check for empty fields
		if(beginDate === ""){
			view.toastShortMessage("Please define the begin date");
		}
		else if(beginTime === ""){
			view.toastShortMessage("Please define the begin time");
		}
		else if(endDate === "" && endTime !== ""){
			view.toastShortMessage("Please define the end date");
		}
		else if(endDate !== "" && endTime === ""){
			view.toastShortMessage("Please define the end time");
		}

		else{


			//ensure page is loaded
			$(window).ready(function(){

				//extract values from DOM
				var id = setNullIfFieldIsEmpty($("#edit-event-instance-cId").text());
				var eventType = setNullIfFieldIsEmpty($("#edit-event-instance-eventType").text());
				var beginTimeAndDate = setNullIfFieldIsEmpty(beginDate) + " " + setNullIfFieldIsEmpty(beginTime);
				//convert to unix timestamp
				var unixBeginTime = Date.parse(beginTimeAndDate).getTime();
				//same with end time
				var unixEndTime = null;
				if(eventType === ACTIVITY && endDate !== "" && endTime !== ""){
					var endTimeAndDate = setNullIfFieldIsEmpty(endDate) + " " + setNullIfFieldIsEmpty(endTime);

					var unixEndTime = setNullIfFieldIsEmpty(Date.parse(endTimeAndDate).getTime());
					if(unixEndTime < unixBeginTime){
						view.toastShortMessage(ENDTIMEBEFOREBEGINTIME);
					}
					else{
						//console.log("update "+ eventType+"  "+$('#edit-event-instance-quantity-slider').val()+"  "+unixBeginTime+"  "+unixEndTime+"  "+cId)
						//update event instance in database
						dbHandler.updateEventInstance(eventType, $('#edit-event-instance-quantity-slider').val(),unixBeginTime,unixEndTime, id);
						$.mobile.back();//go to previous page
					}
				}
				else{
					//console.log("update "+ eventType+"  "+$('#edit-event-instance-quantity-slider').val()+"  "+unixBeginTime+"  "+unixEndTime+"  "+cId)
					//update event instance in database
					dbHandler.updateEventInstance(eventType, $('#edit-event-instance-quantity-slider').val(),unixBeginTime,unixEndTime, id);
					$.mobile.back();//go to previous page
				}

			});
		}
	}
	/*
	 * Ensure that value will not be set as undefined 
	 */
	function setNullIfFieldIsEmpty(field){
		if(field === undefined || field === ""){
			return null;
		}
		else{
			return field
		}
	}
	function setEmptyStringIfFieldIsUndefined(field){
		if(field === undefined || field === null || field === 'undefined'){
			return "";
		}
		else{
			return field
		}
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
					$.mobile.changePage(LOGINPAGE);

				}

			}
		}
		dbHandler.getUserCredentials(checkCallBack);
	}
	/*
	 * This method provides logging in, it gets called on booth and when token is expired
	 */
	function login(){


		if($(document).data(IS_LOGGING_IN) === false){
			//ensure that app is not logging in multiple times simultaneously
			$(document).data(IS_LOGGING_IN, true);
			dbHandler.getUserCredentials(function(transaction,result){

				if(result.rows.length > 0){
					var row = result.rows.item(0);
					//try to log in with data

					restClient.login(SERVER_URL+SERVER_LOGIN_URL, row.email, row.password, {
						success: function(result){
							view.hideLoadingWidget();
							//successfully logged in
							$("#notLoggedIn").hide();
							synchronise();
							$(document).data(IS_LOGGING_IN, false);
							token = result.token;
							var currentPage = $.mobile.activePage[0].id;
							if(currentPage === LOGINDIALOG){
								//$.mobile.back();//go to previous page
								window.location.href =  "#"+HOMEPAGE;
								view.toastMessage(SUCCESSFULLY_LOGGED_IN);

							}
							syncUserInfo();


						}

					}, callBackLoginError);

				}


			});

		}
		else{
		}
	}


	function syncUserInfo(){
		dbHandler.getUserInfo(function(transaction,result){
			var requestData = [];
			var row = result.rows.item(0);
			requestData.push(row);
			
			restClient.update(SERVER_URL+SYNCHRONISE_USER_INFO_URL, requestData, function(data, textStatus, response){

				dbHandler.serUpdateUserInfo(data.idOnPump,data.gender,data.bodyWeight,data.length, data.birthYear, data.lastchanged)
			}, function(){});
			
		});
	}
	/*
	 * Interprets an integer from 1 till 10, returns an object with html color code and text corresponding
	 * to the integer. Gets used when adding/editing activity event instance and with the activity event
	 * instance buttons.
	 */
	function convertIntensityIntToTextAndColor(value){
		var textAndColor;
		switch(value) {
		case 1:
			textAndColor = {color:'#CCFF33',text:'Very little'};

			break;
		case 2:
			textAndColor = {color:'#99FF33',text:'Very little'};
			break;
		case 3:
			textAndColor = {color:'#33CC33',text:'Little'};
			break;
		case 4:
			textAndColor = {color:'#FF9933',text:'Little'};
			break;
		case 5:
			textAndColor = {color:'#FF6600',text:'Moderate'};
			break;
		case 6:
			textAndColor = {color:'#FF0000',text:'Moderate'};
			break;
		case 7:
			textAndColor = {color:'#FF0000',text:'Much'};
			break;
		case 8:
			textAndColor = {color:'#CC0000',text:'Much'};
			break;
		case 9:
			textAndColor = {color:'#A31919',text:'Very much'};
			break;
		case 10:
			textAndColor = {color:'#721212',text:'Very much'};
			break;

		}
		return textAndColor;
	}

	/*
	 * This method performs the right actions when login fails
	 */
	function callBackLoginError(response, textStatus, error){
	
		view.hideLoadingWidget();
		//get id of current page
		var currentPage = $.mobile.activePage[0].id;

		$(document).data(IS_LOGGING_IN, false);
		if(response.responseText === ""){
			//could not connect to server
			if(currentPage === LOGINDIALOG){
				//only give this notification when user itself is trying to log in. Otherwise this message is practivally
				//shown all the time
				view.toastMessage(SERVER_CONNECTION_FAIL);
			}
		}
		else if(USERISDISABLEDREGEX.test(response.responseText)){
			//User created a new account, account is created on server but currently disabled because user has not verified his
			//email account yet
			view.toastMessage(ACTIVATE_ACOUNT_TEXT)


		}
		else if(BADCREDENTIALSREGEX.test(response.responseText) || UNKNOWNUSERREGEX.test(response.responseText)){
			//login failed, due to bad credentials(email password combination) or unknown account
			//open 
			//set timeout, so message dialog appears after #loginpage is opened
			view.toastMessage(BAD_CREDENTIALS_TEXT);


			//open login screen because currently email and pw are not properly set
			if(currentPage !== LOGINDIALOG){
				$.mobile.changePage(LOGINPAGE);
			}
		}
		else{
			view.toastShortMessage(response.responseText);
		}


	}
}
