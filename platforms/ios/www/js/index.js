
var df = new dbHandler('autoB', '1.0', 'Autobetes', 1000000);
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
        
        var token;
        var SERVER_URL = 'http://localhost:8080';
        var SERVER_EVENT_URL = '/api/v1/event';
        var SERVER_ACTIVITY_EVENT_INSTANCE_URL = '/api/v1/activityEventInstanceFull';
        var SERVER_FOOD_EVENT_INSTANCE_URL  = '/api/v1/FoodEventInstance/';
        var FOOD = 'Food';
        var ACTIVITY = 'Activity';
        var ALL = 'All';
        var EVENT_ALREADY_EXISTS = 'Event allready exists';
        var TIME_ADDED_TEXT_ON_HOME_SCREEN = 4000;
        
        //onDeviceReady();
     
        // Wait for PhoneGap to load
        // 
        document.addEventListener("deviceready", onDeviceReady, false);
        //window.location.data-rel ="dialog";
        
        //'<a href="#deleteDialog" class="deleteEvent ui-btn ui-btn-icon-notext ui-icon-delete" data-rel="dialog" data-transition="slidedown" title="Delete"><p id="eventName" style="display: none">'
        // PhoneGap is loaded and it is now safe to make calls PhoneGap methods
        //
        
        
         function onDeviceReady() {
             
            checkIfUserExists();
            getToken();
            
             document.addEventListener("offline", function(e) {
                 alert("offline");
             }, false);
                                       
             document.addEventListener("online", function(e) {
            	 db.sendDbData();
                 alert("online");
             }, false);
             
             document.addEventListener("pause", function(e){
            	 restClient.logout()
             }, false);
             
             document.addEventListener("resume", function(e){
            	 alert("reserumes");
            	 restClient.login('admin', 'admin', {
                     success: function(result){
                        
                     token = result.token;
						
                     }
             
         });
             }, false);
            
        }
    
    function getToken(){
    	
       restClient.login('admin', 'admin', {
                        success: function(result){
                            
                        token = result.token;
						
                        }
                
            });
            
       }
