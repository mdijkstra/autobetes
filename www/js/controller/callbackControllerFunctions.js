
function sendEventsToServer(transaction, result){
	if (result !== null && result.rows !== null) {

		for (var i = 0; i < result.rows.length; i++) {

			var row = result.rows.item(i);

			var eventObject = {
					'name' : row.name,
					'owner': '1',
					'eventType': row.eventType
			};

			restClient.add(SERVER_URL+SERVER_EVENT_URL, eventObject,	function(data, textStatus, response){

				if(textStatus === 'success'){
					var location = response.getResponseHeader('Location');//Api returns new resource location when creating a new entity

					var sid = parseInt(location.substr(location.lastIndexOf('/')+1));
					df.setBeenSentEvent(row.cid);
					df.setSidEvent(sid, row.cid)

				}
			}, callbackError);

		}
	}
}

function sendFoodEventInstanceToServer(transaction, result){

	if (result !== null && result.rows !== null) {

		for (var i = 0; i < result.rows.length; i++) {

			var row = result.rows.item(i);

			if(row.eventSID !== null){
				//make sure foreign key ref(Event) is present
				//var location = '/api/v1/event/'+row.sID;
				if(row.instanceSID === null){
					//instance not been sent before, create resource
					console.log('sendRow');

					console.log(row);
					var eventObject = {
							'owner': '1',
							'beginTime': '1991-02-12 18:00:00',
							'amount' : row.amount,
							'event' : row.eventSID+""

					};
					var date = new Date(row.beginTime);
					console.log(date);

					restClient.add(SERVER_URL + SERVER_FOOD_EVENT_INSTANCE_URL, eventObject, function(data, textStatus, response){
						if(textStatus === 'success'){
							//row successfully sent, now row has to be updated with beenSent = 1
							var location = response.getResponseHeader('Location');//Api returns new resource location when creating a new entity
							var sid = parseInt(location.substr(location.lastIndexOf('/')+1));
							console.log("rowid is: "+row.cid);
							df.setBeenSentEventInstance(row.cid);
							df.setSidEventInstance(sid, row.cid);

						}
					});

				}
				else{
					//instance been sent before, update resource
					
					var url = SERVER_URL + SERVER_FOOD_EVENT_INSTANCE_URL+"/" + row.eventSID;
					console.log(row);
					var eventObject = {
							'owner': '1',
							'beginTime': '1991-02-12 18:00:00',
							'amount' : row.amount,
							'event' : row.eventSID+""

					};

					restClient.update(url, eventObject, function(data, textStatus, response){
						if(textStatus === 'success'){
							//row successfully sent, now row has to be updated with beenSent = 1

							df.setBeenSentEventInstance(row.cid);

						}
					});
				}
			}
		}
	}
}

function sendFoodEventInstanceToServer(transaction, result){
	if (result !== null && result.rows !== null) {

		for (var i = 0; i < result.rows.length; i++) {

			var row = result.rows.item(i);

			var eventObject = {
					'event' : row.event,
					'owner': '1',
					'beginTime': row.beginTime,
					'intensity' : row.intensity,
					'endTime' : row.endTime
			};

			restClient.add(SERVER_URL+SERVER_ACTIVITY_EVENT_INSTANCE_URL, eventObject, function(data, textStatus, request){
				if(textStatus === 'success'){
					//row successfully sent, now row has to be updated with beenSent = 1
					var location = response.getResponseHeader('Location');//Api returns new resource location when creating a new entity
					var sid = parseInt(location.substr(location.lastIndexOf('/')+1));
					df.setBeenSentActivityEventInstance(sid, row.cid);
				}
			});

		}
	}
}

function callbackError(request, textStatus, error){
	console.log(request);
	console.log(textStatus);
	console.log(error);
	//check if authorization is the problem. Can be caused by an failed login, or the token is expired

	if(error === UNAUTHORIZED){
		login();
	}
}


function successCallBack(transaction, results){

}

// this is called when an error happens in a transaction
function errorHandler(transaction, error) {
	alert('Error: ' + error.message + ' code: ' + error.code);
	console.log(error);

}

function nullHandler() {
}

function callBackLoginError(request, rextStatus, error){
	if(error === UNAUTHORIZED){
		//login failed, probably due to wrong name and password combination
		//open 
		alert('wrong name and password combination');
		//open login screen
		window.location.href =  '#loginDialog';
	}
}
