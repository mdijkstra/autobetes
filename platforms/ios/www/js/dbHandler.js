function dbHandler(shortName, version, displayName, maxSize) {

    this.shortName = shortName;
    this.version = version;
    this.displayName = displayName;
    this.maxSize = maxSize;


    //add methods to objects
    this.addEvent = addEvent;
    this.listEventsOfEventType = listEventsOfEventType;
    this.listAllEvents = listAllEvents;
    this.listHistoryFoodEvents = listHistoryFoodEvents;
    this.listCurrentEvents = listCurrentEvents;
    this.listHistoryActivityEvents = listHistoryActivityEvents;
    if (!window.openDatabase) {
        // not all mobile devices support databases  if it does not, the following alert will display
        // indicating the device will not be albe to run this application
        alert('cannot open database');
        return;
    }

// this line tries to open the database base locally on the device
// if it does not exist, it will create it and return a databaseobject stored in variable db
    var db = openDatabase(shortName, version, displayName, maxSize);
   
// this line will try to create the table User in the database justcreated/openned
    db.transaction(function(tx) {

        


        /* to drop the table
         tx.executeSql( 'DROP TABLE IF EXISTS Event',
         [],nullHandler,errorHandler);
         */
        // tx.executeSql( 'DROP TABLE IF EXISTS FoodEventInstance;',
        //[],nullHandler,errorHandler);

        //tx.executeSql( 'DROP TABLE IF EXISTS ActivityEventInstance;',
        //[],nullHandler,errorHandler);

        //execute queries for creation of the table
        tx.executeSql('CREATE TABLE IF NOT EXISTS Event(eventName TEXT NOT NULL PRIMARY KEY, eventType TEXT NOT NULL)',
                [], nullHandler, errorHandler);

        tx.executeSql('CREATE TABLE IF NOT EXISTS FoodEventInstance(id INTEGER PRIMARY KEY AUTOINCREMENT, event TEXT NOT NULL, amount INTEGER NOT NULL, beginTime INTEGER NOT NULL, beenSent INTEGER DEFAULT 0, deleted INTEGER DEFAULT 0, FOREIGN KEY(event) REFERENCES Event(eventName))',
                [], nullHandler, errorHandler);

        tx.executeSql('CREATE TABLE IF NOT EXISTS ActivityEventInstance(id INTEGER PRIMARY KEY AUTOINCREMENT, event TEXT NOT NULL, intensity INTEGER NOT NULL, beginTime INTEGER NOT NULL, endTime INTEGER, beenSent INTEGER DEFAULT 0, deleted INTEGER DEFAULT 0, FOREIGN KEY(event) REFERENCES Event(eventName))',
                [], nullHandler, errorHandler);


    }, errorHandler, successCallBack);

   

    function listCurrentEvents() {
        
        var db = openDatabase(shortName, version, displayName, maxSize);
        db.transaction(function(transaction) {
            transaction.executeSql('SELECT * FROM ActivityEventInstance where endTime IS NULL and deleted = 0 ORDER BY beginTime DESC;', [],
                    showEventInstanceList, errorHandler);
        }, errorHandler, nullHandler);
    }

    function listHistoryFoodEvents() {
        var db = openDatabase(shortName, version, displayName, maxSize);

        db.transaction(function(transaction) {
            transaction.executeSql('SELECT * FROM FoodEventInstance where deleted = 0 ORDER BY beginTime DESC;', [],
                    showEventInstanceList, errorHandler);
        }, errorHandler, nullHandler);

    }

    function listHistoryActivityEvents() {
        var db = openDatabase(shortName, version, displayName, maxSize);

        db.transaction(function(transaction) {
            transaction.executeSql('SELECT * FROM ActivityEventInstance where endTime IS NOT NULL and deleted = 0 ORDER BY beginTime DESC;', [],
            showEventInstanceList, errorHandler);
        }, errorHandler, nullHandler);

    }

//CREATE TABLE IF NOT EXISTS ActivityEventInstance(id INTEGER PRIMARY KEY AUTOINCREMENT, event TEXT NOT NULL, intensity INTEGER NOT NULL, beginTime INTEGER NOT NULL, endTime INTEGER, beenSent INTEGER DEFAULT 0, deleted INTEGER DEFAULT 0, FOREIGN KEY(event) REFERENCES Event(eventName))
    function editEvent(id, type) {
        var beginTimeAndDate = $('#mydate2').val() + " " + $('#beginTime').val();
        var unixBeginTime = Date.parse(beginTimeAndDate).getTime();

        var endTimeAndDate = $('#mydate2').val() + " " + $('#endTime').val();
        var unixEndTime = Date.parse(endTimeAndDate).getTime();

        //correct endtime if necessary(when end date is actually one day later
        //convert to date objects for comparison
        var beginDate = new Date(unixBeginTime);
        var endDate = new Date(unixEndTime);
        
        if (beginDate.getHours() > endDate.getHours()) {
            //end time is before begin time, so we automatically supose that
            //endt time is next day
            unixEndTime += 86400000;//add one day in milliseconds
        }
        else if (beginDate.getHours() === endDate.getHours() && beginDate.getMinutes() > endDate.getMinutes()) {
            //same case as the if statement
            unixEndTime += 86400000;//add one day in milliseconds
        }
        var db = openDatabase(shortName, version, displayName, maxSize);
        //alert('addEvent : '+ eventName+' , eventType: '+eventType);
        //editActivityEvent(id, $('#startEventName3').text(), $('#slider-4').val(), unixBeginTime, unixEndTime);
        if (type === 'activity') {
            
            db.transaction(function(transaction) {
                transaction.executeSql('UPDATE ActivityEventInstance SET event=?, intensity= ?, beginTime= ?, endTime=?, beenSent = 0 WHERE id = ?', [$('#startEventName2').text(), $('#slider-3').val(), unixBeginTime, unixEndTime, id],
                        nullHandler, errorHandler);
            });
        }
        else {
            
            db.transaction(function(transaction) {
                transaction.executeSql('UPDATE FoodEventInstance SET event=?, amount= ?, beginTime= ?, beenSent = 0 WHERE id = ?', [$('#startEventName2').text(), $('#slider-3').val(), unixBeginTime, id],
                        nullHandler, errorHandler);
            });
        }
    }

    function deleteActivity(id) {

        var db = openDatabase(shortName, version, displayName, maxSize);
        //alert('addEvent : '+ eventName+' , eventType: '+eventType);

        db.transaction(function(transaction) {
            transaction.executeSql('UPDATE ActivityEventInstance SET deleted = 1, beenSent = 0 WHERE id = ?', [id],
                    nullHandler, errorHandler);
        });

    }

    function deleteFoodEvent(id) {

        var db = openDatabase(shortName, version, displayName, maxSize);
        //alert('addEvent : '+ eventName+' , eventType: '+eventType);

        db.transaction(function(transaction) {
            transaction.executeSql('UPDATE FoodEventInstance SET deleted = 1, beenSent = 0 WHERE id = ?', [id],
                    nullHandler, errorHandler);
        });

    }

    function listAllEvents() {
        var db = openDatabase(shortName, version, displayName, maxSize);
        db.transaction(function(transaction) {
            transaction.executeSql('SELECT * FROM Event ORDER BY eventName ASC;', [],
                    showList, errorHandler);
        }, errorHandler, nullHandler);
    }

    function listEventsOfEventType(eventType) {
        var db = openDatabase(shortName, version, displayName, maxSize);
        db.transaction(function(transaction) {
            transaction.executeSql('SELECT * FROM Event where eventType = ? ORDER BY eventName ASC;', [eventType],
                    showList, errorHandler);
        }, errorHandler, nullHandler);

    }

    function showList(transaction, result) {
        if (result !== null && result.rows !== null) {
            $('#startHelpText').html('Choose event to start:');
            $('#searchEventsInputForm').show();
            $('#event-list').html('');
            for (var i = 0; i < result.rows.length; i++) {
                var row = result.rows.item(i);
                var eventButton = $('<A HREF="#start2" CLASS="ui-btn ui-shadow ui-corner-all">' + row.eventName + '</A>');
                eventButton.val(row.eventType);
                
                $('#event-list').append(eventButton);


                eventButton.click(function() {
                    //window.location.href = "#start2";
                    var curTime = new Date();
                    var month = curTime.getMonth()+1;
                    var day = curTime.getDate();
                    if(month < 10){
                        month= "0"+month;
                    }
                    if(day <10){
                        day= "0"+day;
                    }
                    var dateStringForMyDate = curTime.getFullYear() + "-" + month + '-' + day;
                    
                    $('#mydate').val(dateStringForMyDate);
                    var currentMinutes = curTime.getMinutes();
                                  if(parseInt(currentMinutes) < 10){
                                  currentMinutes = "0"+currentMinutes;
                                  }
                     var currentHours = curTime.getHours();
                                  if(parseInt(currentHours) < 10){
                                  currentHours = "0"+currentHours;
                                  }
                    var timeStringForMyTime = currentHours+":"+currentMinutes;
                                  
                    $('#mytime').val(timeStringForMyTime);
                    
                    var eventType = $(this).val();
                    $('#startEventName').html($(this).html());

                    if (eventType === 'Food') {
                        $('#quantity').html('Amount');
                    } else {
                        $('#quantity').html('Intensity');
                        /*
                         $('#slider-2').val().change(function(){
                         alert('change');
                         //$('#quantity').html('Intensity'+ $('#slider-2').value());
                         });*/
                    }
                    if ($('#startButton')) {
                        $('#startButton').remove();
                    }
                    var startEventButton = $('<A data-rel="back" id="startButton" type CLASS="ui-btn ui-shadow ui-corner-all">' + "Start" + '</A>');

                    $('#start2').append(startEventButton);
                    startEventButton.click(function() {

                        var timeAndDate = $('#mydate').val() + " " + $('#mytime').val()
                        var unixTime = Date.parse(timeAndDate).getTime();

                        if (eventType === 'Food') {
                            addFoodEventInstance($('#startEventName').html(), $('#slider-2').val(), unixTime);
                            listCurrentEvents();//refresh list of current events
                        }
                        else {
                            addActivityEventInstance($('#startEventName').html(), $('#slider-2').val(), unixTime);
                            listCurrentEvents();//refresh list of current events
                        }
                        return;

                    });
                });

            }
        }
        else {
            //nothing in db
            $('#startHelpText').html('Event list empty. Please press + to add a new event.');
            $('#searchEventsInputForm').hide();
        }
    }
    
    function showEventInstanceList(transaction, result) {
        //make sure list is empty
        $('.event-list2').html('');
        //html tags for the opening of the list
        var html = '<ul id="list" class="ui-listview" data-role="listview" data-icon="false" data-split-icon="delete">';//open list
        html += '<li class="ui-li-has-alt ui-first-child">';//open list item
        var type;
        var endedActivity = 'false';
        for (var i = 0; i < result.rows.length; i++) {
            //progress results
            var row = result.rows.item(i);
            if(row.intensity){
                type = 'activity';
                if(row.endTime !== null){
                    endedActivity = 'true';
                }
            }
            else{
                type = 'food';
            }
            //there are three types of events that are relevant for creating the list
            //food activity, current event and ended event
            
            //add button to html
            html += makeEventButton(row);
            //end list item
            html += '</li>';
            if (i + 1 < result.rows.length) {
                //there is a next item so new <li> can be set 
                html += '<li class="ui-li-has-alt">';
            }
        }
        //close list tag
        html += "</ul>";

        $('.event-list2').append(html);
        //add functionality to end activity button
        //if button be clicked, data will be extracted, editScreenActivity will be opened
        //and the data will be inserted
        $(function() {
            $('.endActivity').click(function() {


                var bd = new parseButtonData(this);//button data object

                insertDataInEditScreen(bd);


                //remove startbutton wich can be present
                if ($('#startButton2')) {
                    $('#startButton2').remove();
                }
                var editEventButton = $('<A data-rel="back" id="startButton2" type CLASS="ui-btn ui-shadow ui-corner-all">' + "Edit" + '</A>');
                if(endedActivity === 'false' && type==='activity'){
                        //user is about to end the activity, therefor the button displays end instead of edit
                        editEventButton = $('<A data-rel="back" id="startButton2" type CLASS="ui-btn ui-shadow ui-corner-all">' + "End" + '</A>');
                 }
                  
                $('#editScreen').append(editEventButton);
                editEventButton.click(function() {
                    //edit event
                    
                    editEvent(bd.id, type);
                    //refresh the right list
                    if(type ==='activity'){
                        if(endedActivity === 'true'){
                            listHistoryActivityEvents();
                        }
                        else{
                            listCurrentEvents();
                        }
                    }
                    else{
                        listHistoryFoodEvents();
                    }
                    

                });

            });
        });
        $(function() {
            $('.deleteEvent').click(function() {
                if (confirm("Are you sure you want to delete this event?") === true) {
                                   
                                    
                    if(type==='activity'){
                                     deleteActivity(parseInt($(this).text()));
                                    if(endedActivity === 'false'){
                                        listCurrentEvents();
                                    
                                    }
                                    else{
                                        listHistoryActivityEvents();
                                    }
                    }
                    else{
                        
                        deleteFoodEvent(parseInt($(this).text()));
                        listHistoryFoodEvents();
                    }
                    
                }


            });
        });



    }

    function addFoodEventInstance(event, amount, beginTime) {
        //could not manage to keep the db connection global, so connection need to
        //be openned for every call
        var db = openDatabase(shortName, version, displayName, maxSize);

        db.transaction(function(transaction) {
            transaction.executeSql('INSERT INTO FoodEventInstance(event, amount, beginTime) VALUES (?,?,?)', [event, amount, beginTime],
                    nullHandler, errorHandler);
        });
        //alert('Event added');
    }
    function addActivityEventInstance(event, intensity, beginTime) {
        //could not manage to keep the db connection global, so connection need to
        //be openned for every call
        var db = openDatabase(shortName, version, displayName, maxSize);

        db.transaction(function(transaction) {
            transaction.executeSql('INSERT INTO ActivityEventInstance(event, intensity, beginTime) VALUES (?,?,?)', [event, intensity, beginTime],
                    nullHandler, errorHandler);
        });

    }

    function addEvent(eventName, eventType) {
        //i could not manage to keep the db connection global, so connection need to
        //be openned every call
        var db = openDatabase(shortName, version, displayName, maxSize);

        db.transaction(function(transaction) {
            transaction.executeSql('INSERT INTO Event(eventName, eventType) VALUES (?,?)', [eventName, eventType],
                    nullHandler, errorHandler);
        });
    }
// this is called when an error happens in a transaction
    function errorHandler(transaction, error) {
        alert('Error: ' + error.message + ' code: ' + error.code);

    }

// this is called when a successful transaction happens
    function successCallBack() {
    }

    function nullHandler() {
    }
    ;


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
    
    if($(context).find('#intensity').text() === ''){
        //food event
        this.intensity = $(context).find('#amount').text();
        this.type = 'food';
    }
    else{
        //activity event
        this.intensity = $(context).find('#intensity').text();
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
    
    if($(context).find('#endHours').text() === ''){
        //button has no end time, so activity is still going, current time
        //will be used as end time
        
        var curTimePoint = new Date();
        var curMinutes = curTimePoint.getMinutes();
        var curHour = curTimePoint.getHours();
        //modify data to make it compatible for jquery widgets
        if (parseInt(this.curMinutes) < 10) {
            curMinutes = "0" + curMinutes;
        }
        if (parseInt(this.curHour) < 10) {
            curHour = "0" + curHour;
        }
        this.endTime = curHour + ":" + curMinutes;
        
    }
    else{
        //button has end time, so activity has allready ended
        //parse end time string
        this.endTime = $(context).find('#endHours').text() + ":" + $(context).find('#endMinutes').text();

        if (parseInt($(context).find('#endHours').text()) < 10) {
            this.endTime = "0" + this.endTime;
        }
    }
}

function insertDataInEditScreen(bd) {
    //insert button data into editscreenActivity
    $('#startEventName2').html(bd.eventName);
    $('#mydate2').val(bd.dateStringForMyDate);
    $('#beginTime').val(bd.beginTime);
    $('#slider-4').val(bd.intensity).slider('refresh');
    
    if(bd.type ==='activity'){
        //activity has an endtime
        $('#endTimeField').show();
        $('#endTime').val(bd.endTime);
    }
    else{
        $('#endTimeField').hide();
    }

}


function makeEventButton(row) {
    //      
    var date = new Date(row.beginTime);
    var minutes = parseInt(date.getMinutes());
     //make string to display the date
    var dateString = '<p><span id="day">' + date.getDate() + '</span>- <span id="month">' + (date.getMonth() + 1) + '</span>- <span id="year">' + date.getFullYear() + '</span></p>';

    if (minutes < 10) {
        //show minutes correct
        minutes = "0" + minutes;
    }
    //timestring, contains begintime and end time in case of ended activities
    var timeString;
    if(row.endTime === null){
       //going activity, dont display endTime
       timeString = '<p class="ui-li-aside"><strong><span id="beginHours">' + date.getHours() + '</span>:<span id="beginMinutes">' + minutes + '</span></strong></p>';
    }
    else if(row.amount){
        //event is food
        timeString = '<p class="ui-li-aside"><strong><span id="beginHours">' + date.getHours() + '</span>:<span id="beginMinutes">' + minutes + '</span></strong></p>';
    }
    else{
       //ended activity, display endtime to
        var endDate = new Date(row.endTime);
        var endMinutes = parseInt(endDate.getMinutes());
        if (endMinutes < 10) {
            endMinutes = "0" + endMinutes;
        }
        timeString = '<p class="ui-li-aside"><strong><span id="beginHours">' + date.getHours() + '</span>:<span id="beginMinutes">' + minutes + '</span> - <span id="endHours">' + endDate.getHours() + '</span>:<span id="endMinutes">' + endMinutes + '</span></strong></p></a>';

    }
    
    var amountOrIntensityString;
    if (row.intensity) {
        //this event is an activity
        amountOrIntensityString = '<p class ="topic"><strong>Intensity: <span id="intensity">' + row.intensity + '</span></strong></p>';
    }
    else {
        //this event is not an activity
        amountOrIntensityString = '<p class ="topic"><strong>Amount: <span id="amount">' + row.amount + '</span></strong></p>';
    }
 
    //make html button
    var html = '<a href="#editScreen" class="endActivity ui-btn"><p style="display: none">' + row.id + '</p>';
    html += '<h3>' + row.event + '</h3>';
    html += amountOrIntensityString;
    html += dateString;
    html += timeString;
    html += '</a>';
    html += '<a href="#" class="deleteEvent ui-btn ui-btn-icon-notext ui-icon-delete" title="Delete">' + row.id + '</a>';
    return html;
}