

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
