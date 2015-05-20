function loadUpload() {
	$('#uploads').removeClass("active");
	$('#playlists').removeClass("active");
	$('#about').removeClass("active");
	$('#upload').addClass("active");
	
	$('#video-container').html('');
	$('#playlist-container').html('');
	$('#about-container').html('');
	$('#upload-container').html('');
	
//	$('#upload-container').append('	<div>        <img id="channel-thumbnail">        <span id="channel-name"></span>      </div>      <div>        <label for="title">Title:</label>        <input id="title" type="text" value="Default Title">      </div>      <div>        <label for="description">Description:</label>        <textarea id="description">Default description</textarea>      </div>      <div>        <label for="privacy-status">Privacy Status:</label>        <select id="privacy-status">          <option>public</option>          <option>unlisted</option>          <option>private</option>        </select>      </div>      <div>        <input input type="file" id="file" class="button" accept="video/*">        <button id="button">Upload Video</button>      <div class="during-upload">        <p><span id="percent-transferred"></span>% done (<span id="bytes-transferred"></span>/<span id="total-bytes"></span> bytes)</p>        <progress id="upload-progress" max="1" value="0"></progress>      </div>      <div class="post-upload">        <p>Uploaded video with id <span id="video-id"></span>. Polling for status...</p>        <ul id="post-upload-status"></ul>        <div id="player"></div>      </div>');
	
	
	
	$('#upload-container').append('      <span          class="g-signin"          data-callback="oauth2Callback"          data-clientid="212806473548-m32vtj5f0fm077g6jrttic3hgodvs1og.apps.googleusercontent.com"data-cookiepolicy="single_host_origin"          data-scope="https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.upload"></span>    </span>    <div class="post-sign-in">      <div>        <img id="channel-thumbnail">        <span id="channel-name"></span>      </div><form id="upload-form">        <div>          <label for="title">Title:</label>          <input id="title" type="text" value="Default Title">        </div>        <div>          <label for="description">Description:</label>          <textarea id="description">Default description.</textarea>        </div>        <div>          <input id="file" type="file">        </div>        <input id="submit" type="submit" value="Upload"></form>      <div class="during-upload">        <p><span id="percent-transferred"></span>% done (<span id="bytes-transferred"></span>/<span id="total-bytes"></span> bytes)</p><progress id="upload-progress" max="1" value="0"></progress>      </div>      <div class="post-upload">        <p>Uploaded video with id <span id="video-id"></span>. Polling for status...</p>        <ul id="post-upload-status"></ul>        <div id="player"></div>      </div>    </div>');
}

var signinCallback = function (result){
  if(result.access_token) {
    var uploadVideo = new UploadVideo();
    uploadVideo.ready(result.access_token);
  }
};

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
      var percentageComplete = (bytesUploaded * 100) / totalBytes;

      $('#upload-progress').attr({
        value: bytesUploaded,
        max: totalBytes
      });

      $('#percent-transferred').text(percentageComplete);
      $('#bytes-transferred').text(bytesUploaded);
      $('#total-bytes').text(totalBytes);

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