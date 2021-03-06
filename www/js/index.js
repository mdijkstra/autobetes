//declare all global variables
var dbHandler = new dbHandler('autoB', '0.1', 'Autobetes', 10000000);
var callbackView = new callbackView();
var view = new view();
var controller = new controller();
var restClient = new top.molgenis.RestClient();
var token;
var DEBUG = false;
var MOLGENIS_TOKEN_URL_DASH = 'molgenis-token';
var MOLGENIS_TOKEN_URL = 'molgenisToken';
//currently only test server in use
//var SERVER_IP = "195.169.22.238";//production server is: "195.169.22.227", change this variable to change server to connect to
var SERVER_IP = "195.169.22.227";
var MOVES_REDIRECT_URI = "http%3A//"+SERVER_IP+"//plugin/moves/connect%3Ftoken%3D"
var SERVER_URL = (DEBUG) ? 'http://localhost:8080' : 'http://'+SERVER_IP;
var TEST_SERVER_URL = (DEBUG) ? 'http://localhost:8080' : 'http://'+SERVER_IP;

//get connection statistics
var CONNECTION_STATS_URL =  SCRIPTS_URL+'raspberry-connection/run'
	var timestamp_last_seen_server		= 0 // ms since 1970 in GMT0; 0 means never seen
	var timestamp_last_seen_raspberry	= 0 // ms since 1970 in GMT0; 0 means never seen
	var timestamp_last_seen_sensor		= 0 // ms since 1970 in GMT0; 0 means never seen

//	color stuff
	var COLOR_EDIT_MODE = "#CCFFFF"; // is same as in autobetes theme-a
//TODO group colors here so we can easily change?
var MOVES_CONNECTED_CHECK_URL = '/plugin/moves/checkIfMovesIsConnected';
var UNABLE_TO_LOGIN = "Unable to login";
var SERVER_EVENT_URL = '/api/v1/event';
var SERVER_CLIENT_EXCEPTION_LOG_URL = "/api/v1/clientexceptionlog";
var SERVER_LOGIN_URL = '/plugin/anonymous/login'
var SERVER_LOGOUT_URL = '/api/v1/logout';
var SERVER_USER_INFO_URL = '/api/v1/userInfo';
var SERVER_ACTIVITY_EVENT_INSTANCE_URL = '/api/v1/activityEventInstanceFull';
var SERVER_FOOD_EVENT_INSTANCE_URL  = '/api/v1/FoodEventInstance/';
var SYNCHRONISE_URL = '/plugin/anonymous/sync';
var SCRIPTS_URL = '/plugin/anonymous/scripts/';
var SYNCHRONISE_USER_INFO_URL =  '/plugin/anonymous/syncUserInfo';
var REGISTER_URL = "/plugin/anonymous/registerUser";
var FOODEVENTINSTANCE = "FoodEventInstance";
var ACTIVITYEVENTINSTANCE = "ActivityEventInstance";
var UNAUTHORIZED = "Unauthorized";
var FOOD = 'Food';
var EVENT = "Event";
var SPECIAL = "Special";
var INSTANCE = "Instance";
var ACTIVITY = 'activity';
var RUNNING = "running";
var SAVE = "Save";
var ALL = 'All';
var TRUE = 'True';
var ENDED = 'ended';
var EDIT = "Edit";
var PAUSE_TRACKING = "Pause tracking";
var EVENT_ALREADY_EXISTS = 'Event already exists';
var TIME_ADDED_TEXT_ON_HOME_SCREEN = 4000;
var LOGINDIALOG = "login-page";
var HOMEPAGE = "home-page";
var EVENTLISTPAGE = "event-list-page";
var REGISTRATIONDIALOG = "registrationDialog";
var MESSAGEDIALOG = "messageDialog";
var DEFAULT_VALUE_ACTIVITY_QUANTITY_SLIDER = 3;
var DEFAULT_VALUE_FOOD_QUANTITY_SLIDER = 1;
var MIN_VALUE_ACTIVITY_QUANTITY_SLIDER = 1;
var MIN_VALUE_FOOD_QUANTITY_SLIDER = 0.25;
var STEP_VALUE_ACTIVITY_QUANTITY_SLIDER = 1;
var STEP_VALUE_FOOD_QUANTITY_SLIDER = 0.25;
var PLUSMINRANGEFOODEVENT = 1800000;
var IS_SYNCHRONISING =  'isSynchronising';
var IS_LOGGING_IN = "IsLoggingIn";
var TIMESTAMPPENALTY = 86400000;
var TIMESTAMP_LAST_SYNC = 'timeStampLastSync';
var ALLREADY_EXISTS = " already exists"
	var USERISDISABLEDREGEX= /User is disabled/;
var CHECKONLYDIGITSREGEXPATTERN = /[^0-9\.\,]/;
var BADCREDENTIALSREGEX= /Bad credentials/;
var REGISTRATIONSUCCESSFULREGEX = /Registration successful/;
var REGISTRATIONFAILREGEX = /Registration failed/;
var UNKNOWNUSERREGEX = /unknown user/;
var CANNOT_OPEN_DATABASE = "Cannot open database";
var CONNECTED_TO_INTERNET = "Connection";
var ACTIVATE_ACOUNT_HEADER = "Inactive account";
var ACTIVATE_ACOUNT_TEXT = "Your account is currently inactive, please click the link in the email to activate your account";
var ENDTIMEBEFOREBEGINTIME = "End time cannot be before begin time";
var BAD_CREDENTIALS_HEADER = "Bad credentials";
var BAD_CREDENTIALS_TEXT = "Wrong email and password combination";
var ERROR_HEADER = "Error";
var ERROR_TEXT = "An error occurred: ";
var PASSWORDS_NOT_THE_SAME = 'Passwords are not the same';
var ONLYDIGITSMESSAGE = "Please only insert digits";
var INVALID_EMAIL = "Invalid email";
var PLEASE_SYNC_WITH_PUMP = "Please synchronise the time settings of your insulin pump with those of your app!";
var SERVER_CONNECTION_FAIL = "Currently unable to connect to server";
var TRY_AGAIN_LATER = "Please try again later";
var SUCCESSFULLY_LOGGED_IN = "Succesfully logged in";
var CONNECT_TO_SERVER = "Connect to server";
var SUCCEEDED = "Succeeded";
var FAILED = "Failed";
var ARE_YOU_SURE_DELETE = 'Are you sure you want to delete ';
var SYNCHRONISE = "Synchronise with server";
var TOURMODE = "App is in guide tour modus";
var LOGINPAGE = '#login-page';
var GUIDE_TOUR_HOMESCREEN_STOP_INT = "Start guide tour";
var LINKTOMOVES = 'moves://';
var LINKTOMOVESPLAYSTORE = "https://play.google.com/store/apps/details?id=com.protogeo.moves";//link to the android play store
var LINKTOMOVESAPPSTORE = "http://itunes.com/apps/protogeo/moves";//link to the itunes app store
var LINKTOMOVESWEBSITE = "https://www.moves-app.com";
var OS;
var ANDROID = "Android";
var IOS = "iOS";
var LOGIN = "Login";
var MY_APP_TESTFAIRY_TOKEN= "f731f3cd56b4434dbe63eb86020641ea40ee858b";
var EVENTALLREADYEXISTS = "event already exists";
var ADMINIDPREPOSITION = "adminsdf7897dfjgjfug8dfug89ur234sdf";//ids of common events yield this string
var IDPAUSETRACKING = ADMINIDPREPOSITION+"2";
var MOBILE_DEVICE = true;//TODO something to determine by appAvailability plugin, but for now keep it true
var MOVES_INSTSTALLED = false;
var IS_REGISTERING = false;
var EventListType = FOOD;
var intervalUpdateSensorPlot;
var currentGuideTour;//current guide tour is in this object
var currentlyGuiding = false;
var HBA1C = "HbA1C";

var settingsFromServer;
var hba1cData;
var settingsData;

$(document).data(IS_SYNCHRONISING, false);
$(document).data(IS_LOGGING_IN, false);
$(document).data(CONNECTED_TO_INTERNET, false);

$(document).data(TOURMODE, false);
$(document).data(GUIDE_TOUR_HOMESCREEN_STOP_INT, 1);


//workaround to enable setting the value of the slider programmatically 
$('#edit-event-instance-page').page();
$('#editScreenActivity').page();
$('#start-event-instance-page').page();
$('#make-new-event-page').page();
$('#home-page').page();
$("input[type='radio']").checkboxradio();
$("input[type='checkbox']").checkboxradio();


var initialScreenSize = window.innerHeight;
var initialScreenWidth = window.innerWidth;

$(function() {
	$('#food-table-home-page').width(.85 * initialScreenWidth, 0);
	$('#event-table-home-page').width(.85 * initialScreenWidth, 0);
	var listVoedingsDagboek = $("#voedingsDagboekMeals");
	$('#voedingsdagboek-dialog').bind({

		popupafterclose: function(event, ui) { 
			//popup closes
			listVoedingsDagboek.html('');
			$('#voedingsDagboekSearch').val('');
		}

	});
	$("#voedingsDagboekSearch").on("input", function(e) {
		var text = $(this).val();
		if(text.length < 2) {
			listVoedingsDagboek.html("");
			listVoedingsDagboek.listview("refresh");
		} else {
			//dbHandler.getEventsWithNameRegexpInput(text, function(transaction, result) {
			listVoedingsDagboek.html("");
			var str = "";
			var language = $('#flip-language').val();
			for (var i in vdData) {
				var row = vdData[i];
				var productname;
				if(language === 'en'){
					productname = row.enName;
				}
				else{
					productname = row.nlName;
				}
				if(productname.toUpperCase().indexOf(text.toUpperCase()) > -1){
					//if(row.servingSize)
					if(row.servingSize !== ""){
						/*
						 *  carbs / 100 (g) : is row.carbs 
   								carbs /serving : (row.servingsize/100)*row.carbs
						 */
						var carbsPerServing = (parseInt(row.servingSize)/100)*parseInt(row.carbs);

						var carbsAndServings = "carbs= "+row.carbs+" /100g, servingsize= " +row.servingSize+"g, carbs per serving= "+carbsPerServing+"g"; 
						str += '<li><a onclick="view.toastMessage('+"'"+ carbsAndServings +"'" + ')">'+productname+"</a></li>";	
					}
					else{

						str += '<li><a onclick="view.toastMessage('+"'carbs:"+ row.carbs +"/100g'" + ')">'+productname+"</a></li>";	

					}
				}
			}

			listVoedingsDagboek.html(str);
			listVoedingsDagboek.listview("refresh");

			// },"json");

			//});
		}
	});
});


//workaround for the input field at the sliders, this ensures that input are only integers with or without
//digits
function onlyDigits(){
	$('.numbersOnly').keyup(function() { 
		this.value = this.value.replace(/[^0-9\.]/,"");
	});
}
onlyDigits();



//workaround for the bug that caused misplacement of the header and footer after the keyboards pop up
$(document).on('blur', 'input, textarea', function() {
	setTimeout(function() {
		window.scrollTo(document.body.scrollLeft, document.body.scrollTop);
	}, 0);
});
/*
$("#sensorPlotSlider").change(function(){
	// setTimeout is a workaround, fixes problem if slider is slided quickly subsequently the plot is not correctly hidden/closed.
	setTimeout(function(){
		dbHandler.setUpdatingSensorPlot($("#sensorPlotSlider").val());
		startOrStopUpdatingSensorPlot($("#sensorPlotSlider").val());

	}, 2000);
});*/
/*
function startOrStopUpdatingSensorPlot(onOrOff){
	if(onOrOff ==="on"){
		startUpdatingSensorPlot();
		$('#sensor-plot').show();
	}
	else{
		stopUpdatingSensorPlot();
		$('#sensor-plot').hide();
	}
}

function stopUpdatingSensorPlot(){

	clearInterval(intervalUpdateSensorPlot);

}
 */

/*
 * This method checks if the broser is from a mobile phone
 */
function checkMobileBrowser() {
	var check = false;
	(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
	return check; 
}

function handleOpenURL(url) {
	setTimeout(function() {
		//alert("received url: " + url);
	}, 0);
}

function tokenUrl()
{
	var token = restClient.getToken();
	return( MOLGENIS_TOKEN_URL_DASH + '=' + token + '&' + MOLGENIS_TOKEN_URL + '=' + token );
}

function getMsSinceMidnight()
{
	d = new Date();
	var e = new Date(d);
	return ( d - e.setHours(0,0,0,0) );
}

function getCurrentCarbRatio(callback)
{
	view.showLoadingWidget();
	loadCurrentSettings(function(data){
		view.hideLoadingWidget();
		
		// get current time in ms since 0:00 AM today.
		var now	= getMsSinceMidnight();
		var ts	= data.CarbRatioTS.from;
		var i	= 0;
		while (i < ts.length && ts[i] < now)
		{
			i++;
		}
		i--;
		
		callback( data.CarbRatioTS.value[i] );

	}, function(request, textStatus, error){
		view.hideLoadingWidget();
		view.toastMessage(error);
	});
}
function getInsulinForAmountOfCarbs(carbs)
{
	if(typeof(settingsData) === "undefined" )
	{
		return 0;
		alert('nul');
	}
	else
	{
		// get current time in ms since 0:00 AM today.
		var now	= getMsSinceMidnight();
		var ts	= settingsData.CarbRatioTS.from;
		var i	= 0;
		while (i < ts.length && ts[i] < now)
		{
			i++;
		}
		i--;
	
		return( carbs / settingsData.CarbRatioTS.value[i] );
	}
}

function getCurrentFoodTableInsulin(totalCarbs, callback)
{
	// view.showLoadingWidget();
	loadCurrentSettings(function(data){
		// view.hideLoadingWidget();
		
		// get current time in ms since 0:00 AM today.
		var now	= getMsSinceMidnight();
		var ts	= data.CarbRatioTS.from;
		var i	= 0;
		while (i < ts.length && ts[i] < now)
		{
			i++;
		}
		i--;
	
		callback( (Math.round(totalCarbs / data.CarbRatioTS.value[i] * 10 ) / 10).toFixed(1) );	
		
	}, function(request, textStatus, error){
		// view.hideLoadingWidget();
		view.toastMessage(error);
	});
}

function loadCurrentSettings(callback, callbackError)
{
	if(typeof(settingsData) === "undefined")
	{
		var url = SERVER_URL + SCRIPTS_URL+'get-settings/run?' + tokenUrl();
		restClient.get(url, function(data, textStatus, response){
			//success callback
			settingsData = {BasalTS: [], SensitivityTS: [], CarbRatioTS: [], Basal :[], Sensitivity:[], Carbs: []}
			settingsFromServer = JSON.parse(data);
		
			settingsData.BasalTS		= {from: settingsFromServer.Basal.startTime,		value: settingsFromServer.Basal.rate};
			settingsData.SensitivityTS	= {from: settingsFromServer.Sensitivity.startTime,	value: settingsFromServer.Sensitivity.amount};
			settingsData.CarbRatioTS	= {from: settingsFromServer.Carbs.startTime,		value: settingsFromServer.Carbs.amount};
			settingsData.Basal = convertServerdata(settingsFromServer.Basal.startTime, settingsFromServer.Basal.rate);
			settingsData.Sensitivity = convertServerdata(settingsFromServer.Sensitivity.startTime, settingsFromServer.Sensitivity.amount);
			settingsData.Carbs = convertServerdata(settingsFromServer.Carbs.startTime, settingsFromServer.Carbs.amount);

			callback(settingsData);
		}, callbackError)	
	}
	else{
		callback(settingsData);
	}
}

function loadHbA1c(callback, callbackError)
{
	var url_hba1c = SERVER_URL + SCRIPTS_URL+'HbA1c/run?' + tokenUrl();
	restClient.get(url_hba1c, function(data, textStatus, response){
		//success callback
		hba1cData = JSON.parse(data);
		callback(hba1cData)
	}, callbackError);	
}

function loadAdvice(callback, callbackError){
	loadCurrentSettings(callback, callbackError);
	loadHbA1c(function(){}, callbackError);
}

function convertServerdata(startTimes, currentSettings)
{
	var returnObject = [];
	for(var i = 0; i < startTimes.length ; i++){
		var from = startTimes[i];
		var to;
		if(i === startTimes.length-1)
		{
			to = startTimes[0]
		}
		else
		{
			to = startTimes[i+1]
		}
		from = convertTimestampToTime(from);
		to = convertTimestampToTime(to);
		
		var row = {from: from, to:to, currentSetting: currentSettings[i]};
		returnObject.push(row);
	}
	return returnObject;
}
function convertTimestampToTime(timestamp)
{
	var hours = Math.floor(timestamp/1000/60/60);
	var minutes = Math.floor((timestamp/1000/60)%60);
	if(hours<10)hours = "0"+hours;
	if(minutes<10)minutes = "0"+minutes;
	return (hours+":"+minutes);
}
function updateSensorPlot() {
	gmt_offset = - new Date().getTimezoneOffset() * 60; // offset in seconds
	var token = restClient.getToken();
	var tokenUrl = MOLGENIS_TOKEN_URL_DASH + '=' + token + '&' + MOLGENIS_TOKEN_URL + '=' + token;
	var img_url = TEST_SERVER_URL + SCRIPTS_URL+'plot-sensor/run?gmtoff=' + gmt_offset + '&' + tokenUrl;
	//load immage async using ajax
	$.ajax({ 
		url : img_url, 
		cache: true,
		processData : false,
		async : true,
	}).always(function(){
		//set attributes once loading completes
		$('#sensor-plot').attr('width', .90 * window.innerWidth);
		$("#sensor-plot").attr("src", img_url).fadeIn();
	});   

}

/*
 * This method performs required functions once device is ready with loading all scripts
 */
function onDeviceReady() {
	setTimeout(function(){
		//the functions that call the database are in this timeout of 500 millisec to be sure that the database is made before
		controller.checkIfUserExists();
		dbHandler.getLastUpdateTimeStamp(function(transaction, result){
			var currentPage = $.mobile.activePage[0].id;
			var row = result.rows.item(0);
			var lastUpdateTimeStamp = row.lastchanged;

			if(lastUpdateTimeStamp !== 0){
				window.location.href =  "#"+HOMEPAGE;
				$.mobile.changePage("#"+HOMEPAGE);
			}

		});


		//check if user is in same timezone as last startup
		//if not update timezone in db
		dbHandler.getUserInfo(function(transaction, result){
			//get timezone from db and current tz from device
			var dbTimeOffset = result.rows.item(0).timeOffset;
			var curTimeOffset = new Date().getTimezoneOffset();
			//convert to Time offset (h) added to UTC (= GMT0).
			curTimeOffset = -(curTimeOffset/60);
			if(dbTimeOffset !== curTimeOffset){
				//not the same...update
				dbHandler.updateParticularFieldInUserInfo("timeOffset", curTimeOffset);
			}
		})
		/*
		dbHandler.getUpdatingSensorPlot(function(transaction,result){
			if ( result.rows.length > 0 && result.rows !== null) {
				startOrStopUpdatingSensorPlot(result.rows.item(0).isUpdating);
				//set slider to on or off
				$("#sensorPlotSlider").val(result.rows.item(0).isUpdating);
			}
			else{
				dbHandler.addSensorPlot();
			}

		});*/

	}, 500);
	// increase font of all h1's
	$('h1').attr('style','font-size:1.3em;');

	//check if moves is installed on device
	if(typeof appAvailability !== 'undefined'){
		appAvailability.check(
				LINKTOMOVES, // URI Scheme
				function() {  // Success callback
					//alert('Moves is available');
					MOVES_INSTSTALLED = true;
					$('#movesNotInstalled').hide();
				},
				function() {  // Error callback
					//alert('Moves is not available');
					MOVES_INSTSTALLED = false;
					$('#movesNotInstalled').show();
				}
		);
	}
	MOBILE_DEVICE = checkMobileBrowser();
	TestFairy.begin(MY_APP_TESTFAIRY_TOKEN);
	loadAdvice(function(){},function(){})
	//add event listeners
	document.addEventListener("offline", function(e) {
		$(document).data(CONNECTED_TO_INTERNET, false);
	}, false);

	document.addEventListener("online", function(e) {
		$(document).data(CONNECTED_TO_INTERNET, true);
		synchronise();

	}, false);

	document.addEventListener("pause", function(e){
		console.log("pause");
		TestFairy.pause();
		synchronise();
		//restClient.logout(SERVER_URL+SERVER_LOGOUT_URL); logout performed before synchronise, which explains the fail in the synchronisation. 
		//Logout not really necessary because logging in multiple times is possible and tokens expire within 2 hours.
	}, false);

	document.addEventListener("resume", function(e){
		TestFairy.resume();
		synchronise();
	}, false);

	synchronise();


	setInterval(function() {
		//update current activity list and food event list
		dbHandler.getCurrentFoodEventInstances(PLUSMINRANGEFOODEVENT, callbackView.showCurrentEventInstanceFood);
		dbHandler.showCurrentActivityEventInstances(callbackView.showCurrentEventInstanceActivity);
	}, 10000); 

}

//onDeviceReady();
//document.addEventListener("deviceready", onDeviceReady, false);

if (navigator.userAgent.match(/(iPhone|iPod|iPad)/)) {
	OS =  IOS;
	LINKTOMOVES = "moves://";
	document.addEventListener("deviceready", onDeviceReady, false);
} 
else if(navigator.userAgent.match(/(Android)/)){
	OS = ANDROID;
	LINKTOMOVES = "com.protogeo.moves";
	document.addEventListener("deviceready", onDeviceReady, false);
}
else {
	onDeviceReady();
}

function recalculateTotal(checkboxInstance, amount){
	var total = parseFloat($("#current-food-event-list-bolus").text());
	if(checkboxInstance.is(':checked')==true){
		total += parseFloat(amount);
	}
	else{
		total -= parseFloat(amount);
	}
	total = (Math.round(10 * total) / 10).toFixed(1);	
	$("#current-food-event-list-bolus").text(total);
};

//document.addEventListener("deviceready", onDeviceReady, false);//event listener, calls onDeviceReady once phonegap is loaded
/*
//if it is a mobile device, than it has to wait till phonegap is loaded
if(MOBILE_DEVICE === true){
	document.addEventListener("deviceready", onDeviceReady, false);//event listener, calls onDeviceReady once phonegap is loaded
}
else{
	//no waiting for phonegap needed
	onDeviceReady();
}
 */
