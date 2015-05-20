var clientId = '212806473548-m32vtj5f0fm077g6jrttic3hgodvs1og.apps.googleusercontent.com';
var apiKey = 'AIzaSyD8rWAXviMi2sFCnVuNNyjHNuIKpwh5tK8';
var scopes = ['https://www.googleapis.com/auth/youtube', 'https://www.googleapis.com/auth/youtube.readonly',
			'https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/youtubepartner',
			'https://www.googleapis.com/auth/youtubepartner-channel-audit', 'https://www.googleapis.com/auth/youtube.force-ssl'];
var grantType = 'authorization_code';
			
function onClientLoad() {
	$('#post-auth').hide();
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
	if (authResult && !authResult.error) {
alert(response.result.access_token);
alert(response.access_token);
alert(authResult.access_token);

		$('#pre-auth').hide();
		$('#post-auth').show();
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
		gapi.client.load('youtubeAnalytics', 'v1', loadUserChannel);
	});
}
