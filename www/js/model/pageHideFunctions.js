$(document).on('pagehide', '#start', function(){
	//ensure the button with the new event(in green) will be hidden
	$('#recentlyAddedEvent').hide();
	//get out of edit mode
	$('#editModeButton').val('off');
	$('#editModeButton').attr("style","");
	$('.eventButtons').attr("style","");

});