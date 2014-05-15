function dbHandler(shortName, version, displayName, maxSize){
    
    this.shortName = shortName;
    this.version = version;
    this.displayName = displayName;
    this.maxSize = maxSize;
    
   
   //add methods to objects
    this.listDBValues = listDBValues;
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
 var db = openDatabase(shortName, version, displayName,maxSize);
 
// this line will try to create the table User in the database justcreated/openned
 db.transaction(function(tx){
 
  // you can uncomment this next line if you want the User table to be empty each time the application runs
  // tx.executeSql( 'DROP TABLE User',nullHandler,nullHandler);
 
  // this line actually creates the table User if it does not exist and sets up the three columns and their types
  // note the UserId column is an auto incrementing column which is useful if you want to pull back distinct rows
  // easily from the table.
        /* to drop the table
        tx.executeSql( 'DROP TABLE IF EXISTS Event',
        [],nullHandler,errorHandler);
        */
        tx.executeSql( 'CREATE TABLE IF NOT EXISTS Event(eventName TEXT NOT NULL PRIMARY KEY, eventType TEXT NOT NULL)',
        [],nullHandler,errorHandler);
        
        tx.executeSql( 'CREATE TABLE IF NOT EXISTS FoodEventInstance(id INTEGER PRIMARY KEY AUTOINCREMENT, event TEXT NOT NULL, amount INTEGER NOT NULL, beginTime INTEGER NOT NULL, beenSent INTEGER DEFAULT 0, FOREIGN KEY(event) REFERENCES Event(eventName))',
        [],nullHandler,errorHandler);
        
        tx.executeSql( 'CREATE TABLE IF NOT EXISTS ActivityEventInstance(id INTEGER PRIMARY KEY AUTOINCREMENT, event TEXT NOT NULL, intensity INTEGER NOT NULL, beginTime INTEGER NOT NULL, endTime INTEGER, beenSent INTEGER DEFAULT 0, FOREIGN KEY(event) REFERENCES Event(eventName))',
        [],nullHandler,errorHandler);
        
     },errorHandler,successCallBack);
 
 // list the values in the database
function listDBValues() {
 
 if (!window.openDatabase) {
     
  return;
 }
 
// this next section will select all the content from the User table and then go through it row by row
// appending the UserId  FirstName  LastName to the  #lbUsers element on the page
 db.transaction(function(transaction) {
   transaction.executeSql('SELECT * FROM User;', [],
     function(transaction,result){
         if (result !== null && result.rows !== null) {
           for (var i = 0; i < result.rows.length; i++) {
            var row = result.rows.item(i);
            //alert('<br>' + row.UserId + '. ' +
            //row.FirstName+ ' ' + row.LastName);
        }
      }
     },errorHandler);
 },errorHandler,nullHandler);
        
 return results;
 
}

function listCurrentEvents(){
        db.transaction(function(transaction) {
   transaction.executeSql('SELECT * FROM ActivityEventInstance where endTime IS NULL ORDER BY beginTime DESC;', [],
     function(transaction, result){
             
             //$('#startHelpText').html('Choose event to start:');
             //$('#searchEventsInputForm').show();
             $('#event-list3').html('');
             var html = '<ul id="list" class="ui-listview" data-role="listview" data-icon="false" data-split-icon="delete">';
             html +='<li class="ui-li-has-alt ui-first-child">';
             for (var i = 0; i < result.rows.length; i++) {
             
             html +='<a href="#demo-mail" class="ui-btn">';
             var row = result.rows.item(i);
             var date = new Date(row.beginTime);
             var minutes = parseInt(date.getMinutes());
             if(minutes<10){
                 //show minutes correct
                 minutes = "0"+minutes;
             }
             
             var dateString = date.getDate()+"-"+(date.getMonth()+1)+"-"+ date.getFullYear();
             //var eventButton = $('<A HREF="#demo-mail" CLASS="ui-btn"><h3>' + row.event + '</h3><p>Amount: '+row.amount +'</p><p>'+dateString+'</p></A>');
             
             html += '<h3>'+row.event+'</h3>';
             html += '<p class ="topic"><strong>Intensity: '+row.intensity+'</strong></p>';
             html += '<p>'+dateString+'<p>'
             html += '<p class="ui-li-aside"><strong>'+date.getHours()+":"+minutes+' - </strong></p></a>';
             html += '<a id="endActivities" class="endActivity ui-btn ui-btn-icon-notext ui-icon-delete" title="Delete">'+row.id+'</a></li>';
             //$('#event-list2').append(eventButton);
             if(i+1 <result.rows.length){
                 //there is a next item so new <li> can be set 
                 html +='<li class="ui-li-has-alt">';
             }
         }
            html += "</ul>";
            //html = '<ul id="list" class="ui-listview" data-role="listview" data-icon="false" data-split-icon="delete"><li class="ui-li-has-alt ui-first-child"><a href="#demo-mail" class="ui-btn"><h3>Avery Walker</h3><p class="topic"><strong>Re: Dinner Tonight</strong></p><p>Sure, lets plan on meeting at Highland Kitchen at 8:00 tonight. Cant wait! </p><p class="ui-li-aside"><strong>4:48</strong>PM</p></a><a href="#" class="delete ui-btn ui-btn-icon-notext ui-icon-delete" title="Delete"></a></li><li class="ui-li-has-alt"><a href="#demo-mail" class="ui-btn"><h3>Amazon.com</h3><p class="topic"><strong>4-for-3 Books for Kids</strong></p><p>As someone who has purchased childrens books from our 4-for-3 Store, you may be interested in these featured books.</p><p class="ui-li-aside"><strong>4:37</strong>PM</p></a><a href="#" class="delete ui-btn ui-btn-icon-notext ui-icon-delete" title="Delete"></a></li></ul>';
            $('#event-list3').append(html);
            $(function(){
            $('.endActivity').click(function(){
                //alert($(this).text());
                var id = parseInt($(this).text());
                var currentTime = new Date().getTime();
                endActivity(id, currentTime);
                listCurrentEvents();
            });
            });
     },errorHandler);
    },errorHandler,nullHandler);
}

function listHistoryFoodEvents(){
    var db = openDatabase(shortName, version, displayName,maxSize);
    
    
    db.transaction(function(transaction) {
   transaction.executeSql('SELECT * FROM FoodEventInstance ORDER BY beginTime DESC;', [],
     function(transaction, result){
             //$('#startHelpText').html('Choose event to start:');
             //$('#searchEventsInputForm').show();
             $('#event-list2').html('');
             var html = '<ul id="list" class="ui-listview" data-role="listview" data-icon="false" data-split-icon="delete">';
             html +='<li class="ui-li-has-alt ui-first-child">';
             for (var i = 0; i < result.rows.length; i++) {
             
             html +='<a href="#demo-mail" class="ui-btn">';
             var row = result.rows.item(i);
             var date = new Date(row.beginTime);
             var minutes = parseInt(date.getMinutes());
             if(minutes<10){
                 //show minutes correct
                 minutes = "0"+minutes;
             }
             
             var dateString = date.getDate()+"-"+(date.getMonth()+1)+"-"+ date.getFullYear();
             //var eventButton = $('<A HREF="#demo-mail" CLASS="ui-btn"><h3>' + row.event + '</h3><p>Amount: '+row.amount +'</p><p>'+dateString+'</p></A>');
             
             html += '<h3>'+row.event+'</h3>';
             html += '<p class ="topic"><strong>Amount: '+row.amount+'</strong></p>';
             html += '<p>'+dateString+'<p>'
             html += '<p class="ui-li-aside"><strong>'+date.getHours()+":"+minutes+'</strong></p></a>';
             html += '<a href="#" class="delete ui-btn ui-btn-icon-notext ui-icon-delete" title="Delete"></a></li>';
             //$('#event-list2').append(eventButton);
             if(i+1 <result.rows.length){
                 //there is a next item so new <li> can be set 
                 html +='<li class="ui-li-has-alt">';
             }
         }
            html += "</ul>";
            //html = '<ul id="list" class="ui-listview" data-role="listview" data-icon="false" data-split-icon="delete"><li class="ui-li-has-alt ui-first-child"><a href="#demo-mail" class="ui-btn"><h3>Avery Walker</h3><p class="topic"><strong>Re: Dinner Tonight</strong></p><p>Sure, lets plan on meeting at Highland Kitchen at 8:00 tonight. Cant wait! </p><p class="ui-li-aside"><strong>4:48</strong>PM</p></a><a href="#" class="delete ui-btn ui-btn-icon-notext ui-icon-delete" title="Delete"></a></li><li class="ui-li-has-alt"><a href="#demo-mail" class="ui-btn"><h3>Amazon.com</h3><p class="topic"><strong>4-for-3 Books for Kids</strong></p><p>As someone who has purchased childrens books from our 4-for-3 Store, you may be interested in these featured books.</p><p class="ui-li-aside"><strong>4:37</strong>PM</p></a><a href="#" class="delete ui-btn ui-btn-icon-notext ui-icon-delete" title="Delete"></a></li></ul>';
            $('#event-list2').append(html);
     },errorHandler);
 },errorHandler,nullHandler);
 
}

function listHistoryActivityEvents(){
    var db = openDatabase(shortName, version, displayName,maxSize);
    
    
    db.transaction(function(transaction) {
   transaction.executeSql('SELECT * FROM ActivityEventInstance where endTime IS NOT NULL ORDER BY beginTime DESC;', [],
     function(transaction, result){
             //$('#startHelpText').html('Choose event to start:');
             //$('#searchEventsInputForm').show();
             $('#event-list2').html('');
             var html = '<ul id="list" class="ui-listview" data-role="listview" data-icon="false" data-split-icon="delete">';
             html +='<li class="ui-li-has-alt ui-first-child">';
             for (var i = 0; i < result.rows.length; i++) {
             
             html +='<a href="#demo-mail" class="ui-btn">';
             var row = result.rows.item(i);
             var beginDate = new Date(row.beginTime);
             var endDate = new Date(row.endTime);
             var minutes = parseInt(beginDate.getMinutes());
             var endMinutes = parseInt(endDate.getMinutes());
             //show minutes correctly
             if(minutes<10){
                 minutes = "0"+minutes;
             }
             if(endMinutes <10){
                 endMinutes = "0"+ endMinutes;
             }
             
             var dateString = beginDate.getDate()+"-"+(beginDate.getMonth()+1)+"-"+ beginDate.getFullYear();
             //var eventButton = $('<A HREF="#demo-mail" CLASS="ui-btn"><h3>' + row.event + '</h3><p>Amount: '+row.amount +'</p><p>'+dateString+'</p></A>');
             
             html += '<h3>'+row.event+'</h3>';
             html += '<p class ="topic"><strong>Intensity: '+row.intensity+'</strong></p>';
             html += '<p>'+dateString+'<p>'
             html += '<p class="ui-li-aside"><strong>'+beginDate.getHours()+":"+minutes+' - '+endDate.getHours()+":"+endMinutes+'</strong></p></a>';
             html += '<a href="#" class="delete ui-btn ui-btn-icon-notext ui-icon-delete" title="Delete"></a></li>';
             //$('#event-list2').append(eventButton);
             if(i+1 <result.rows.length){
                 //there is a next item so new <li> can be set 
                 html +='<li class="ui-li-has-alt">';
             }
         }
            html += "</ul>";
            //html = '<ul id="list" class="ui-listview" data-role="listview" data-icon="false" data-split-icon="delete"><li class="ui-li-has-alt ui-first-child"><a href="#demo-mail" class="ui-btn"><h3>Avery Walker</h3><p class="topic"><strong>Re: Dinner Tonight</strong></p><p>Sure, lets plan on meeting at Highland Kitchen at 8:00 tonight. Cant wait! </p><p class="ui-li-aside"><strong>4:48</strong>PM</p></a><a href="#" class="delete ui-btn ui-btn-icon-notext ui-icon-delete" title="Delete"></a></li><li class="ui-li-has-alt"><a href="#demo-mail" class="ui-btn"><h3>Amazon.com</h3><p class="topic"><strong>4-for-3 Books for Kids</strong></p><p>As someone who has purchased childrens books from our 4-for-3 Store, you may be interested in these featured books.</p><p class="ui-li-aside"><strong>4:37</strong>PM</p></a><a href="#" class="delete ui-btn ui-btn-icon-notext ui-icon-delete" title="Delete"></a></li></ul>';
            $('#event-list2').append(html);
     },errorHandler);
 },errorHandler,nullHandler);
 
}


function listAllEvents(){
    var db = openDatabase(shortName, version, displayName,maxSize);
    db.transaction(function(transaction) {
   transaction.executeSql('SELECT * FROM Event ORDER BY eventName ASC;', [],
     showList,errorHandler);
 },errorHandler,nullHandler);
}

function listEventsOfEventType(eventType){
    var db = openDatabase(shortName, version, displayName,maxSize);
    db.transaction(function(transaction) {
   transaction.executeSql('SELECT * FROM Event where eventType = ? ORDER BY eventName ASC;', [eventType],
     showList,errorHandler);
 },errorHandler,nullHandler);
    
}

function showList(transaction,result){
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
                       
                        var eventType = $(this).val();
                        $('#startEventName').html($(this).html());
                        
                        if(eventType === 'Food'){
                            $('#quantity').html('Amount');
                        }else{
                            $('#quantity').html('Intensity');
                            /*
                            $('#slider-2').val().change(function(){
                                alert('change');
                                //$('#quantity').html('Intensity'+ $('#slider-2').value());
                            });*/
                        }
                        if($('#startButton')){
                            $('#startButton').remove();
                        }
                        //<A id="startEventButton" HREF="#" CLASS="ui-btn ui-shadow ui-corner-all">start</A>
                        //after button pushed go to home menu(href="#home") or go back (data-rel="back")
                        var startEventButton = $('<A href="#home" id="startButton" type CLASS="ui-btn ui-shadow ui-corner-all">' + "Start" + '</A>');
                        
                        $('#start2').append(startEventButton);
                        startEventButton.click(function() {
                            //alert($(this).val());
                           // alert('name: '+ $('#startEventName').html()+ " , quantity: "+ $('#slider-2').val()+", date: " + Date.parse($('#mydate').val()).getTime());
                            
                            var timeAndDate = $('#mydate').val()+" "+ $('#mytime').val()
                            var unixTime = Date.parse(timeAndDate).getTime();
                            
                            var date = new Date(unixTime);
                            //alertparseInt($("input[name=america]").val(), 10);
                            var dateString = date.getDate()+"-"+(date.getMonth()+1)+"-"+ date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+"   "+unixTime;
                            //alert(dateString);
                            if(eventType === 'Food'){
                                addFoodEventInstance($('#startEventName').html(), $('#slider-2').val(), unixTime);
                                listCurrentEvents();//refresh list of current events
                            }
                            else{
                                addActivityEventInstance($('#startEventName').html(), $('#slider-2').val(), unixTime);
                                listCurrentEvents();//refresh list of current events
                            }
                            return;
                            /*
                            var eventHistoryObject = {
                                'owner': $('#userId').val(),
                                'event': hrefToId(event.href)
                            };
                            
                            addNewRecord('/api/v1/EventHistory', eventHistoryObject, function() {
                                window.location.href = "#home";
                                alert('Event added!');
                            });*/
                        });
                    });
             
            //alert(row.eventName+"  "+row.eventType);
        }
      }
      else{
          $('#startHelpText').html('Event list empty. Please press + to add a new event.');
          $('#searchEventsInputForm').hide();
      }
     }

function addValueToDB(value1, value2) {
 if (!window.openDatabase) {
   alert('Databases are not supported in this browser.');
   return;
 }
 
// this is the section that actually inserts the values into the User table
 db.transaction(function(transaction) {
   transaction.executeSql('INSERT INTO User(FirstName, LastName) VALUES (?,?)',[value1, value2],
     nullHandler,errorHandler);
   });
 
// this calls the function that will show what is in the User table in the database
 
 return false;
 
}
   
function addFoodEventInstance(event, amount, beginTime){
    //could not manage to keep the db connection global, so connection need to
    //be openned for every call
    //alert('start with writing to db');
    var db = openDatabase(shortName, version, displayName,maxSize);
    
    db.transaction(function(transaction) {
   transaction.executeSql('INSERT INTO FoodEventInstance(event, amount, beginTime) VALUES (?,?,?)',[event, amount, beginTime],
     nullHandler,errorHandler);
   });
   //alert('Event added');
}
function addActivityEventInstance(event, intensity, beginTime){
        //could not manage to keep the db connection global, so connection need to
    //be openned for every call
    //alert('start with writing to db');
    var db = openDatabase(shortName, version, displayName,maxSize);
    
    db.transaction(function(transaction) {
   transaction.executeSql('INSERT INTO ActivityEventInstance(event, intensity, beginTime) VALUES (?,?,?)',[event, intensity, beginTime],
     nullHandler,errorHandler);
   });
   //alert('event is now added to db');
}

function endActivity(id, endUNIXTime){
    
    var db = openDatabase(shortName, version, displayName,maxSize);
    //alert('addEvent : '+ eventName+' , eventType: '+eventType);
    
    db.transaction(function(transaction) {
   transaction.executeSql('UPDATE ActivityEventInstance SET endTime = ? WHERE id = ?',[endUNIXTime, id],
     nullHandler,errorHandler);
   });
   
}

function addEvent(eventName, eventType){
    //i could not manage to keep the db connection global, so connection need to
    //be openned every call
    var db = openDatabase(shortName, version, displayName,maxSize);
    //alert('addEvent : '+ eventName+' , eventType: '+eventType);
    
    db.transaction(function(transaction) {
   transaction.executeSql('INSERT INTO Event(eventName, eventType) VALUES (?,?)',[eventName, eventType],
     nullHandler,errorHandler);
   });
   //alert('event is now added to db');
}
// this is called when an error happens in a transaction
function errorHandler(transaction, error) {
   alert('Error: ' + error.message + ' code: ' + error.code);
 
}
 
// this is called when a successful transaction happens
function successCallBack() {}
 
function nullHandler(){};


}