function loadUpload() {
	$('#uploads').removeClass("active");
	$('#playlists').removeClass("active");
	$('#about').removeClass("active");
	$('#upload').addClass("active");
	
	$('#video-container').html('');
	$('#playlist-container').html('');
	$('#about-container').html('');
	$('#upload-container').html('');
	
//	$('#upload-container').append('<label for="title">Title:</label><input id="title" type="text" value="Default Title">');
	
	$().append('<div class="input-group">' +
				  '<input type="text" class="form-control" placeholder="Title" id="title" aria-describedby="basic-addon1">' +
				'</div>');
	
//	$('#upload-container').append('<label for="description">Description:</label><textarea id="description">Default description</textarea>');
	$('#upload-container').append('<div class="input-group">' +
							  '<input type="text" class="form-control" id="description" placeholder="description" aria-describedby="basic-addon1">' +
							'</div>');
	
//	$('#upload-container').append('<label for="privacy-status">Privacy Status:</label><select id="privacy-status"><option>public</option><option>unlisted</option><option>private</option></select>');
	
	$('#upload-container').append('<select class="form-control">' +
									  '<option>public</option>' +
									  '<option>unlisted</option>' +
									  '<option>private</option>' +
									'</select>');
	

//	$('#upload-container').append('<input input type="file" id="file" class="button" accept="video/*">
//<button id="button">Upload Video</button>');
	
	$('#upload-container').append('<input class="btn btn-default" id="file" type="file" value="Submit" accept="video/*">');
	$('#upload-container').append('<input class="btn btn-default" id="button" type="submit" value="Upload Video">');
	
	uploadVideo();
}

function uploadVideo() {
	var uploadVideo = new UploadVideo();
	var res = uploadVideo.ready(accessToken);
}

var STATUS_POLLING_INTERVAL_MILLIS = 60 * 1000; // One minute.

var UploadVideo = function() {

  this.tags = ['youtube-cors-upload'];

  this.categoryId = 22;

  this.videoId = '';

  this.uploadStartTime = 0;
};


UploadVideo.prototype.ready = function(accessToken) {
  this.accessToken = accessToken;
  this.gapi = gapi;
  this.authenticated = true;
  this.gapi.client.request({
    path: '/youtube/v3/channels',
    params: {
      part: 'snippet',
      mine: true
    },
    callback: function(response) {
      if (response.error) {
        console.log(response.error.message);
      } else {
        $('#channel-name').text(response.items[0].snippet.title);
        $('#channel-thumbnail').attr('src', response.items[0].snippet.thumbnails.default.url);

        $('.pre-sign-in').hide();
        $('.post-sign-in').show();
      }
    }.bind(this)
  });
  $('#button').on("click", this.handleUploadClicked.bind(this));
};


UploadVideo.prototype.uploadFile = function(file) {
	
  var metadata = {
    snippet: {
      title: $('#title').val(),
      description: $('#description').text(),
      tags: this.tags,
      categoryId: this.categoryId
    },
    status: {
      privacyStatus: $('#privacy-status option:selected').text()
    }
  };

	var percentageComplete = 0;
	$('#upload-container').append('<div class="progress">' +
							'<div class="progress-bar" id="upload-progress" role="progressbar" aria-valuenow="' +
								percentageComplete + 
								'" aria-valuemin="0" aria-valuemax="100" style="min-width: 2em; width: 40%;">' +
								percentageComplete + '%' +
							  '</div>' +
							'</div>');
  
  var uploader = new MediaUploader({
    baseUrl: 'https://www.googleapis.com/upload/youtube/v3/videos',
    file: file,
    token: this.accessToken,
    metadata: metadata,
    params: {
      part: Object.keys(metadata).join(',')
    },
    onError: function(data) {
      var message = data;
      // Assuming the error is raised by the YouTube API, data will be
      // a JSON string with error.message set. That may not be the
      // only time onError will be raised, though.
      try {
        var errorResponse = JSON.parse(data);
        message = errorResponse.error.message;
      } finally {
        alert(message);
      }
    }.bind(this),
    onProgress: function(data) {
		var currentTime = Date.now();
		var bytesUploaded = data.loaded;
		var totalBytes = data.total;
		// The times are in millis, so we need to divide by 1000 to get seconds.
		var bytesPerSecond = bytesUploaded / ((currentTime - this.uploadStartTime) / 1000);
		var estimatedSecondsRemaining = (totalBytes - bytesUploaded) / bytesPerSecond;
		percentageComplete = Math.round((bytesUploaded * 100) / totalBytes);

      $('#upload-progress').attr('valuenow', percentageComplete);
	  $('#upload-progress').html(percentageComplete + '%');

      $('.during-upload').show();
    }.bind(this),
    onComplete: function(data) {
      var uploadResponse = JSON.parse(data);
      this.videoId = uploadResponse.id;
      $('#video-id').text(this.videoId);
      $('.post-upload').show();
      this.pollForVideoStatus();
    }.bind(this)
  });
  // This won't correspond to the *exact* start of the upload, but it should be close enough.
  this.uploadStartTime = Date.now();
  uploader.upload();
};

UploadVideo.prototype.handleUploadClicked = function() {
  $('#button').attr('disabled', true);
  this.uploadFile($('#file').get(0).files[0]);
};

UploadVideo.prototype.pollForVideoStatus = function() {
  this.gapi.client.request({
    path: '/youtube/v3/videos',
    params: {
      part: 'status,player',
      id: this.videoId
    },
    callback: function(response) {
      if (response.error) {
        // The status polling failed.
        console.log(response.error.message);
        setTimeout(this.pollForVideoStatus.bind(this), STATUS_POLLING_INTERVAL_MILLIS);
      } else {
        var uploadStatus = response.items[0].status.uploadStatus;
        switch (uploadStatus) {
          // This is a non-final status, so we need to poll again.
          case 'uploaded':
            $('#post-upload-status').append('<li>Upload status: ' + uploadStatus + '</li>');
            setTimeout(this.pollForVideoStatus.bind(this), STATUS_POLLING_INTERVAL_MILLIS);
            break;
          // The video was successfully transcoded and is available.
          case 'processed':
            $('#player').append(response.items[0].player.embedHtml);
            $('#post-upload-status').append('<li>Final status.</li>');
            break;
          // All other statuses indicate a permanent transcoding failure.
          default:
            $('#post-upload-status').append('<li>Transcoding failed.</li>');
            break;
        }
      }
    }.bind(this)
  });
};