

function callbackError(response, textStatus, error){
	console.log(response);
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
	toastShortMessage(ERROR_TEXT+ error.message);
	console.log(error);
	/*
	showMessageDialog(ERROR_HEADER, ERROR_TEXT+ error.message);
	//alert('Error: ' + error.message + ' code: ' + error.code);
	console.log(error);
	*/
}

function nullHandler() {
}

function callBackLoginError(response, textStatus, error){
	console.log(response);
	console.log(textStatus);
	console.log(error);
	console.log(response.responseText);
	
	var currentPage = $.mobile.activePage[0].id;
	
	
	
	
	$(document).data(IS_LOGGING_IN, false);
	if(response.responseText === ""){
		//could not connect to server
		if(currentPage === LOGINDIALOG){
			//only give this notification when user itself is trying to log in. Otherwise this message is practivally
			//shown all the time
			toastMessage(SERVER_CONNECTION_FAIL);
		}
	}
	else if(USERISDISABLEDREGEX.test(response.responseText)){
		toastMessage(ACTIVATE_ACOUNT_TEXT)
		
		
	}
	else if(BADCREDENTIALSREGEX.test(response.responseText) || UNKNOWNUSERREGEX.test(response.responseText)){
		//login failed, due to bad credentials
		//open 
		//set timeout, so message dialog appears after #logindialog is opened
		toastMessage(BAD_CREDENTIALS_TEXT);
		
		
		//open login screen because currently email and pw are not properly set
		if(currentPage !== LOGINDIALOG){
			window.location.href =  '#loginDialog';
		}
	}
	else{
		toastShortMessage(response.responseText);
	}
	
	
}
