var clientId = '212806473548-m32vtj5f0fm077g6jrttic3hgodvs1og.apps.googleusercontent.com';
var apiKey = 'AIzaSyD8rWAXviMi2sFCnVuNNyjHNuIKpwh5tK8';
var scopes = ['https://www.googleapis.com/auth/youtube', 'https://www.googleapis.com/auth/youtube.readonly',
			'https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/youtubepartner',
			'https://www.googleapis.com/auth/youtubepartner-channel-audit', 'https://www.googleapis.com/auth/youtube.force-ssl'];
var grantType = 'authorization_code', accessToken, response;
var defaultchannelid = '';
			
function onClientLoad() {
	$('.dropdown-toggle').dropdown()
	gapi.auth.init(function() {
		window.setTimeout(checkAuth, 1);
	});
}


function checkAuth() {
	gapi.auth.authorize({
		client_id: clientId,
		scope: scopes,
		immediate: true,
		grand_type: grantType
	}, handleAuthResult);
}

function handleAuthResult(authResult) {
	accessToken = authResult.access_token;
	response = authResult;
	
	if (authResult && !authResult.error) {
		alert("EVERYTHING'S OKAY! WE'RE OKAY!");
		loadAPIClientInterfaces();
	} else {
		$('#login-link').click(forceAuthCheck());
	}
}

function forceAuthCheck() {
	gapi.auth.authorize({
	client_id: clientId,
	scope: scopes,
	immediate: false
	}, handleAuthResult);
}

function loadAPIClientInterfaces() {
	gapi.client.load('youtube', 'v3', function() {
		gapi.client.load('youtubeAnalytics', 'v1', function(){

var request = gapi.client.youtube.channels.list({
		mine: true, part: 'id, contentDetails, statistics, snippet, brandingSettings'}); 

		request.execute(function(response){

			alert(response.items[0].snippet.title);
		});




		});
	});
}
