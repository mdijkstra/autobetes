
var synchronise = function(){
	
	var timeStampThisSync = new Date().getTime();

	if(canMakeAjaxCall()){
		//device is not synchronising or logging in yet
		$(document).data(IS_SYNCHRONISING, true);
		//setTimeout(function() {
		
		dbHandler.getLastUpdateTimeStamp(function(transaction, result){
			
			var currentTime = new Date().getTime();
			var row = result.rows.item(0);
			var lastUpdateTimeStamp = row.lastchanged;
			var arrayEntities = [];
			var requestData = [];
			requestData.push({'timeStampLastSync': (lastUpdateTimeStamp- TIMESTAMPPENALTY)+""});


			var pushEntitiesInArray = function(result, callback){
				for (var i = 0; i < result.rows.length+1; i++) {
					if(i < result.rows.length){
						var row = result.rows.item(i);
						requestData.push(row);
					}
					else{
						callback();
					}
				}

			}

			var callback1 = function(data, textStatus, response){
				$(document).data(IS_SYNCHRONISING, false);
				console.log(JSON.stringify(data));
				iterateArrayRecursively(0, data);
				dbHandler.updateLastUpdateTimeStamp(timeStampThisSync);
				//now syncing is done it is time to send unsent exception records to server
				dbHandler.getUnsentExceptionRecords(function(transaction,result){
					for (var i = 0; i < result.rows.length; i++) {
						var row = result.rows.item(i);
						var record = {exception : row.exception, clientDateAndTime: row.clientDataAndTime, query: row.query};
						
						restClient.add(SERVER_URL+SERVER_CLIENT_EXCEPTION_LOG_URL, record, function(data, textStatus, response){

							dbHandler.setClientExceptionRecordAsBeenSent(row.id);
						}, function(){});
					}
				});
				
			}

			var errorHandler = function(request, textStatus, error){
				$(document).data(IS_SYNCHRONISING, false);
				if(error === UNAUTHORIZED){
					controller.login();
				}
				console.log(JSON.stringify(request));
				console.log(JSON.stringify(textStatus));
				console.log(JSON.stringify(error));
			}

			dbHandler.getEventsAfterTimeStamp(lastUpdateTimeStamp- TIMESTAMPPENALTY, function(transaction,result){

				pushEntitiesInArray(result, function(){
					dbHandler.getActivityEventInstancesAfterTimeStamp(lastUpdateTimeStamp- TIMESTAMPPENALTY, function(transaction,result){

						pushEntitiesInArray(result, function(){
							dbHandler.getFoodEventInstancesAfterTimeStamp(lastUpdateTimeStamp- TIMESTAMPPENALTY, function(transaction,result){
								pushEntitiesInArray(result, function(){
									//console.log(JSON.stringify(requestData))
									restClient.update(SERVER_URL+SYNCHRONISE_URL, requestData, callback1, errorHandler);
								});
							});
						});


					});
				});

			});

		});
		//}, 5000);
	}
}

var iterateArrayRecursively = function(index, data){
	//setTimeout(function() {
	if(index < data.length){

		var entity = data[index];
		
		//console.log(JSON.stringify(entity));
		var entityType;//event or instance
		//convert boolean to integer, because sqlite cannot handle booleans
		if(entity.deleted === true){
			//console.log("deleted is true");
			entity.deleted = 1;
		}
		else{
			//console.log("deleted is false");
			entity.deleted = 0;
		}
		if(entity.estimationCarbs === true){
			//console.log("deleted is true");
			entity.estimationCarbs = 1;
		}
		else{
			//console.log("deleted is false");
			entity.estimationCarbs = 0;
		}
		//check entity type
		if(entity.name){
			entityType = EVENT;
		}
		else{
			entityType = INSTANCE;
		}
		if(entity.name){
			dbHandler.serverProcessEvent(entity, function(){
				iterateArrayRecursively(index+1, data);
			});
		}
		else{
			dbHandler.serverProcessEventInstance(entity, function(){
				iterateArrayRecursively(index+1, data);
			});
		}
	}
	else{
		//index is equal to list, whole array has been iterated
		//reload list
		var currentPage = $.mobile.activePage[0].id;
		if(currentPage === HOMEPAGE){
			
			setTimeout(function() {
			dbHandler.showCurrentActivityEventInstances();
			},1000);
		}

	}
	//}, 50);

}



var canMakeAjaxCall = function(){
	var isSynchronising = $(document).data(IS_SYNCHRONISING);
	var isLoggingIn = $(document).data(IS_SYNCHRONISING);
	if(restClient.getToken() === null){

		//there is no token
		controller.checkIfUserExists();
		return false;
	}
	else if(isSynchronising || isLoggingIn ){

		//device allready synchronising, logging in
		return false;
	}
	else{

		//can make ajax call
		return true;
	}
}
