//declare all global variables
var dbHandler = new dbHandler('autoB', '1.0', 'Autobetes', 10000000);
var callbackView = new callbackView();
var view = new view();
var controller = new controller();
var restClient = new top.molgenis.RestClient();

var token;
var DEBUG = false;
var SERVER_URL = (DEBUG) ? 'http://localhost:8080' : 'http://195.169.22.242';
var TEST_SERVER_URL = (DEBUG) ? 'http://localhost:8080' : 'http://195.169.22.237';

// get connection statistics
var CONNECTION_STATS_URL = '/scripts/raspberry-connection/run'
var timestamp_last_seen_server		= 0 // ms since 1970 in GMT0; 0 means never seen
var timestamp_last_seen_raspberry	= 0 // ms since 1970 in GMT0; 0 means never seen
var timestamp_last_seen_sensor		= 0 // ms since 1970 in GMT0; 0 means never seen

// color stuff
var COLOR_EDIT_MODE = "#8df3e6"; // is same as in autobetes theme-a
// TODO group colors here so we can easily change?

var SERVER_EVENT_URL = '/api/v1/event';
var SERVER_CLIENT_EXCEPTION_LOG_URL = "/api/v1/clientexceptionlog";
var SERVER_LOGIN_URL = '/api/v1/login'
var SERVER_LOGOUT_URL = '/api/v1/logout';
var SERVER_USER_INFO_URL = '/api/v1/userInfo';
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
var LOGINDIALOG = "login-page";
var HOMEPAGE = "home-page";
var EVENTLISTPAGE = "food-event-list-page";
var REGISTRATIONDIALOG = "registrationDialog";
var DEFAULT_VALUE_ACTIVITY_QUANTITY_SLIDER = 3;
var DEFAULT_VALUE_FOOD_QUANTITY_SLIDER = 1;
var MIN_VALUE_ACTIVITY_QUANTITY_SLIDER = 1;
var MIN_VALUE_FOOD_QUANTITY_SLIDER = 0.25;
var STEP_VALUE_ACTIVITY_QUANTITY_SLIDER = 1;
var STEP_VALUE_FOOD_QUANTITY_SLIDER = 0.25;
var PLUSMINRANGEFOODEVENT = 1200000;
var IS_SYNCHRONISING =  'isSynchronising';
var IS_LOGGING_IN = "IsLoggingIn";
var TIMESTAMPPENALTY = 86400000;
var TIMESTAMP_LAST_SYNC = 'timeStampLastSync';
var ALLREADY_EXISTS = " allready exists"
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
var MOBILE_DEVICE = false;
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
$("input[type='radio']").checkboxradio();


	
    var availableTags = [
      "ActionScript",
      "AppleScript",
      "Asp",
      "BASIC",
      "C",
      "C++",
      "Clojure",
      "COBOL",
      "ColdFusion",
      "Erlang",
      "Fortran",
      "Groovy",
      "Haskell",
      "Java",
      "JavaScript",
      "Lisp",
      "Perl",
      "PHP",
      "Python",
      "Ruby",
      "Scala",
      "Scheme"
    ];
    $(function() {
    	
   	 var sugList = $("#suggestions");

   	    $("#newEventName").on("input", function(e) {
   	        var text = $(this).val();
   	        if(text.length < 1) {
   	            sugList.html("");
   	            sugList.listview("refresh");
   	        } else {
   	        	dbHandler.getEventsWithNameRegexpInput(text, function(transaction, result) {
   	        		sugList.html("");
   	        	var str = "";
   	        	console.log(text);
   	        	for (var i = 0; i < result.rows.length; i++) {
   					var row = result.rows.item(i);
   					
   					if(row.name.toUpperCase().indexOf(text.toUpperCase()) > -1){
   					str += "<li>"+row.name+"</li>";
   					}
   	        	}
   	                
   	                sugList.html(str);
   	                sugList.listview("refresh");
   	               
   	           // },"json");
   	        
   	          });
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
 * This method checks if the broser is from a mobile phone
 */
function checkMobileBrowser() {
	var check = false;
	(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
	return check; 
}

function handleOpenURL(url) {
	  setTimeout(function() {
	    alert("received url: " + url);
	  }, 0);
}

// TODO: Fix token!
function updateSensorPlot() {
	gmt_offset = - new Date().getTimezoneOffset() * 60; // offset in seconds

	var img_url = TEST_SERVER_URL + '/scripts/plot-sensor/run?gmtoff=' + gmt_offset + '&molgenis-token=permanent';
    var sensor_plot_preload = new Image(),
		sensor_plot = $('#sensor-plot');
    sensor_plot_preload.onload = function() {
		$('#sensor-plot').attr("src", sensor_plot_preload.src);
		$('#sensor-plot').attr('width', .90 * window.innerWidth);
		$('#sensor-plot').attr('style', 'visibility: visible;');
    };

    sensor_plot_preload.src = img_url;
	// $('#sensor-plot').css('width', .90 * window.innerWidth);
	// $('#sensor-plot').attr("src", img_url );
}

/*
 * This method performs required functions once device is ready with loading all scripts
 */
function onDeviceReady() {

	MOBILE_DEVICE = checkMobileBrowser();

	controller.checkIfUserExists();
	
	//add event listeners
	document.addEventListener("offline", function(e) {
		//alert("offline");
		$(document).data(CONNECTED_TO_INTERNET, false);
	}, false);

	document.addEventListener("online", function(e) {
		$(document).data(CONNECTED_TO_INTERNET, true);
		synchronise();

	}, false);

	document.addEventListener("pause", function(e){
		synchronise();
		restClient.logout(SERVER_URL+SERVER_LOGOUT_URL);
	}, false);

	document.addEventListener("resume", function(e){
		synchronise();
	}, false);

	synchronise();
		
	$('#sensor-plot').attr('style', 'visibility:hidden'); // hide plot first time
	updateSensorPlot(); 	// and then auto refresh sensor-plot
	setInterval(function() {
		updateSensorPlot();
		//update current activity list and food event list
		dbHandler.getCurrentFoodEventInstances(PLUSMINRANGEFOODEVENT, callbackView.showCurrentEventInstanceFood);
		dbHandler.showCurrentActivityEventInstances(callbackView.showCurrentEventInstanceActivity);
	}, 10000); // ask server every 10s for new sensor plot

}

if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
    document.addEventListener("deviceready", onDeviceReady, false);
} else {
    onDeviceReady();
}

// document.addEventListener("deviceready", onDeviceReady, false);//event listener, calls onDeviceReady once phonegap is loaded
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
