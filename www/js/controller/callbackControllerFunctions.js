
//this method is called when an error happens in a transaction
function errorHandler(transaction, error) {
	console.log(error.message);
	console.log(error);
	toastShortMessage(ERROR_TEXT+ error.message);
	console.log(error);
	console.log(transaction);
	
}

function nullHandler() {
}
/*
 * This method performs the right actions when login fails
 */
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
		//User created a new account, account is created on server but currently disabled because user has not verified his
		//email account yet
		toastMessage(ACTIVATE_ACOUNT_TEXT)


	}
	else if(BADCREDENTIALSREGEX.test(response.responseText) || UNKNOWNUSERREGEX.test(response.responseText)){
		//login failed, due to bad credentials(email password combination) or unknown account
		//open 
		//set timeout, so message dialog appears after #loginpage is opened
		toastMessage(BAD_CREDENTIALS_TEXT);


		//open login screen because currently email and pw are not properly set
		if(currentPage !== LOGINDIALOG){
			window.location.href =  LOGINPAGE;
		}
	}
	else{
		toastShortMessage(response.responseText);
	}


}
