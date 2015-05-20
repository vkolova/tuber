function loadUpload() {
	$('#uploads').removeClass("active");
	$('#playlists').removeClass("active");
	$('#about').removeClass("active");
	$('#upload').addClass("active");
	
	$('#video-container').html('');
	$('#playlist-container').html('');
	$('#about-container').html('');
	$('#upload-container').html('');
	
	$('#upload-container').append('<label for="title">Title:</label><input id="title" type="text" value="Default Title">');
	$('#upload-container').append('<label for="description">Description:</label><textarea id="description">Default description</textarea>');
	$('#upload-container').append('<label for="privacy-status">Privacy Status:</label><select id="privacy-status"><option>public</option><option>unlisted</option><option>private</option></select>');
	$('#upload-container').append('<input input type="file" id="file" class="button" accept="video/*"><button id="button">Upload Video</button>');

	uploadVideo();
}

function uploadVideo(response) {
	
	if(result.access_token) {
		var uploadVideo = new UploadVideo();
		uploadVideo.ready(result.access_token);
	}

	
	
}