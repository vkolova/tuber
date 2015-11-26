$( document ).ready(function() {
    var request = gapi.client.youtube.subscriptions.list({
		mine: true, part: 'id, contentDetails, statistics, snippet, brandingSettings'});   
	request.execute(function(response){
		$('#subs-panel').append(response)

	});
});