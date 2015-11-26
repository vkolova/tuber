$( document ).ready(function() {
    var request = gapi.client.youtube.subscriptions.list();   
	request.execute(function(response){
		$('#subs-panel').append(response);

	});
});