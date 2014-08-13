
var df = new dbHandler('autoB', '1.0', 'Autobetes', 10000000);

var token;
var SERVER_URL = 'http://localhost:8080';
var SERVER_EVENT_URL = '/api/v1/event';
var SERVER_ACTIVITY_EVENT_INSTANCE_URL = '/api/v1/activityEventInstanceFull';
var SERVER_FOOD_EVENT_INSTANCE_URL  = '/api/v1/FoodEventInstance/';
var SYNCHRONISE_URL = '/plugin/anonymous/sync';
var REGISTER_URL = "/plugin/anonymous/registerUser";
var FOODEVENTINSTANCE = "FoodEventInstance";
var ACTIVITYEVENTINSTANCE = "ActivityEventInstance";
var UNAUTHORIZED = "Unauthorized";
var FOOD = 'Food';
var EVENT = "Event";
var INSTANCE = "Instance";
var ACTIVITY = 'Activity';
var RUNNING = "running";
var SAVE = "Save";
var ALL = 'All';
var TRUE = 'True';
var ENDED = 'ended';
var EDIT = "Edit";
var EVENT_ALREADY_EXISTS = 'Event allready exists';
var TIME_ADDED_TEXT_ON_HOME_SCREEN = 4000;
var LOGINDIALOG = "loginDialog";
var REGISTRATIONDIALOG = "registrationDialog";
var DEFAULT_VALUE_ACTIVITY_QUANTITY_SLIDER = 3;
var DEFAULT_VALUE_FOOD_QUANTITY_SLIDER = 1;
var MIN_VALUE_ACTIVITY_QUANTITY_SLIDER = 1;
var MIN_VALUE_FOOD_QUANTITY_SLIDER = 0.25;
var STEP_VALUE_ACTIVITY_QUANTITY_SLIDER = 1;
var STEP_VALUE_FOOD_QUANTITY_SLIDER = 0.25;
var IS_SYNCHRONISING =  'isSynchronising';
var IS_LOGGING_IN = "IsLoggingIn";
var TIMESTAMPPENALTY = 3600000;
var TIMESTAMP_LAST_SYNC = 'timeStampLastSync';
var COLOR_EDIT_MODE = "#8df3e6";
var ALLREADY_EXISTS = " allready exists"
var USERISDISABLEDREGEX= /User is disabled/;
var BADCREDENTIALSREGEX= /Bad credentials/;
var REGISTRATIONSUCCESSFULREGEX = /Registration successful/;
var REGISTRATIONFAILREGEX = /Registration failed/;
var UNKNOWNUSERREGEX = /unknown user/;
var CANNOT_OPEN_DATABASE = "Cannot open database";
var CONNECTED_TO_INTERNET = "Connection";
var ACTIVATE_ACOUNT_HEADER = "Inactive account";
var ACTIVATE_ACOUNT_TEXT = "Your account is currently inactive, please click the link in the email to activate your account";

var BAD_CREDENTIALS_HEADER = "Bad credentials";
var BAD_CREDENTIALS_TEXT = "Wrong email and password combination";
var ERROR_HEADER = "Error";
var ERROR_TEXT = "An error occurred: ";
var PASSWORDS_NOT_THE_SAME = 'Passwords are not the same';
var INVALID_EMAIL = "Invalid email";
var PLEASE_SYNC_WITH_PUMP = "Please synchronise the time settings of your insulin pump with those of your app!";
var SERVER_CONNECTION_FAIL = "Currently unable to connect to server";
var TRY_AGAIN_LATER = "Please try again later";
var SUCCESSFULLY_LOGGED_IN = "Succesfully logged in";
var CONNECT_TO_SERVER = "Connect to server";
var SUCCEEDED = "Succeeded";
var FAILED = "Failed";
var ARE_YOU_SURE_DELETE = 'Are you sure you want to delete ';
var TOURMODE = "App is in guide tour modus";
var LOGINPAGE = '#loginDialog';
$(document).data(IS_SYNCHRONISING, false);
$(document).data(IS_LOGGING_IN, false);
$(document).data(CONNECTED_TO_INTERNET, false);
$(document).data(TOURMODE, false);

var restClient = new top.molgenis.RestClient();
//workaround to enable setting the value of the slider programmatically 
$('#edit-event-instance-page').page();
$('#editScreenActivity').page();
$('#start-event-instance-page').page();
$('#newEvent').page();
//workaround for the input field at the sliders, this ensures that input ar only integers with or without
//digits
jQuery('.numbersOnly').keyup(function () { 
	this.value = this.value.replace(/[^0-9\.]/g,'1');
});
//workaround for the bug that caused misplacement of the header and footer after the keyboards pop up
$(document).on('blur', 'input, textarea', function() {
	setTimeout(function() {
		window.scrollTo(document.body.scrollLeft, document.body.scrollTop);
	}, 0);
});

onDeviceReady();

// Wait for PhoneGap to load
// 
document.addEventListener("deviceready", onDeviceReady, false);
//window.location.data-rel ="dialog";

//'<a href="#deleteDialog" class="deleteEvent ui-btn ui-btn-icon-notext ui-icon-delete" data-rel="dialog" data-transition="slidedown" title="Delete"><p id="eventName" style="display: none">'
// PhoneGap is loaded and it is now safe to make calls PhoneGap methods
//

function showMessageDialog(headerText, messageText){
	
	$("#messageDialogHeader").html(headerText);
	$("#messageDialogText").html(messageText);
	$.mobile.changePage( "#messageDialog", { role: "dialog" } );
}
function toastMessage(messageText){
	console.log(messageText)
	window.plugins.toast.showLongBottom(messageText, null, null);
}
function toastShortMessage(messageText){
	console.log(messageText)
	window.plugins.toast.showShortBottom(messageText, null, null);
}

function onDeviceReady() {
	
	checkIfUserExists();

	document.addEventListener("offline", function(e) {
		//alert("offline");
		$(document).data(CONNECTED_TO_INTERNET, false);
	}, false);

	document.addEventListener("online", function(e) {
		$(document).data(CONNECTED_TO_INTERNET, true);
		synchronise();
		
	}, false);

	document.addEventListener("pause", function(e){
		restClient.logout();
	}, false);

	document.addEventListener("resume", function(e){
		synchronise();
	}, false);

}

