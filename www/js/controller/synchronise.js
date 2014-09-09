var synchronise = null;
var synchronise2 = function(){
	var currentTimeStamp = new Date().getTime();

	if(canMakeAjaxCall()){
		//device is not synchronising or logging in yet
		$(document).data(IS_SYNCHRONISING, true);
		//setTimeout(function() {
		df.getLastUpdateTimeStamp(function(transaction,result){
			var currentTime = new Date().getTime();
			var row = result.rows.item(0);
			var lastUpdateTimeStamp = row.lastchanged;

			var arrayEntities = [];
			var requestData = [];
			requestData.push({'timeStampLastSync': (lastUpdateTimeStamp- TIMESTAMPPENALTY)+""});

			var pushEntitiesInArray = function(result){
				for (var i = 0; i < result.rows.length; i++) {
					var row = result.rows.item(i);
					requestData.push(row);
				}


			}

			var callback1 = function(data, textStatus, response){
				//console.log(JSON.stringify(data))
				iterateArrayRecursively(0, data);
				df.updateLastUpdateTimeStamp(currentTimeStamp);
			}

			var errorHandler1 = function(request, textStatus, error){
				$(document).data(IS_SYNCHRONISING, false);
				if(error === UNAUTHORIZED){
					login();
				}
				console.log(request);
				console.log(textStatus);
				console.log(error);
			}

			df.getEventsAfterTimeStamp(lastUpdateTimeStamp, function(transaction,result){

				pushEntitiesInArray(result);
				//console.log("events");

				df.getActivityEventInstancesAfterTimeStamp(lastUpdateTimeStamp, function(transaction,result){

					pushEntitiesInArray(result);
					//console.log("activity");

					df.getFoodEventInstancesAfterTimeStamp(lastUpdateTimeStamp, function(transaction,result){
						pushEntitiesInArray(result);
						//console.log(JSON.stringify(requestData))
						restClient.update(SERVER_URL+SYNCHRONISE_URL, requestData, callback1, errorHandler1);
					});
				});


			});


			var lastUpdateTimeStampObject = {timestamp: lastUpdateTimeStamp}





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
		if(entity.name){
			entityType = EVENT;
		}
		else{
			entityType = INSTANCE;
		}

		df.getEntityWithSId(entity.sId,entityType, function(transaction, result){
			if(result.rows.length === 0){
				//no entity with same sId found
				if(entity.notInRequestContent === TRUE){
					//entity was not in request content
					//no match on sId(that is the case when an entity has been made on another device
					//and not been send to this device before), so this device can create this entity in db
					//create entity
					df.serverAddEntity(entity);
					iterateArrayRecursively(index+1, data);
				}
				else{
					//entity was in request content and not matched on sId(that is the case when 
					//an entity has not been sent to server before)so entity can be matched based on cId
					//match on cId
					df.getEntityWithCId(entity.cId, entityType, function(transaction, result){

						//double check if entity with cid is found
						if(result.rows.length === 0){
							//no entity found, error!!!
							//console.log("no entity found, error!!!");
						}
						else{
							//entity found
							//console.log("entity found");
							var row = result.rows.item(0);
							
							//double check that server timestamp is equal or higher( timestamp of server should never
							//be less, because then it would have been updated on the server)
							if(entity.lastchanged >= row.lastchanged){
								//console.log("server entity is more recent");
								//server entity is more recent
								//update entity
								df.serverUpdateEntity(entity, row);
							}
						}
						iterateArrayRecursively(index+1, data);
					});

				}
			}
			else{
				var row = result.rows.item(0);
				//a match on sId, entity is on device
				//check if server entity has a higher timestamp
				if(entity.lastchanged >= row.lastchanged){
					//server entity is more recent
					df.serverUpdateEntity(entity, row);
				}
				iterateArrayRecursively(index+1, data);
			}
		});
	}
	else{
		//index is equal to list, whole array has been iterated
		$(document).data(IS_SYNCHRONISING, false);
		//reload list
		var currentPage = $.mobile.activePage[0].id;
		if(currentPage === HOMEPAGE){
			
			setTimeout(function() {
			df.showCurrentActivityEventInstances();
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
		checkIfUserExists();
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