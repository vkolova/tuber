var clientId = '212806473548-m32vtj5f0fm077g6jrttic3hgodvs1og.apps.googleusercontent.com';
var apiKey = 'AIzaSyD8rWAXviMi2sFCnVuNNyjHNuIKpwh5tK8';
var scopes = ['https://www.googleapis.com/auth/youtube', 'https://www.googleapis.com/auth/youtube.readonly',
			'https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/youtubepartner',
			'https://www.googleapis.com/auth/youtubepartner-channel-audit', 'https://www.googleapis.com/auth/youtube.force-ssl'];


function onClientLoad() {
	gapi.auth.init(function() {
		window.setTimeout(checkAuth, 1);
	});
}


function checkAuth() {
	gapi.auth.authorize({
		client_id: clientId,
		scope: scopes,
		immediate: true
	}, handleAuthResult);
}

function handleAuthResult(authResult) {
	if (authResult && !authResult.error) {
		$('.pre-auth').hide();
		$('.post-auth').show();
		loadAPIClientInterfaces();
	} else {
		$('#login-link').click(
			checkAuth()
		);
	}
}

function loadAPIClientInterfaces() {
	gapi.client.load('youtube', 'v3', function() {
		handleAPILoaded();
	});
}
