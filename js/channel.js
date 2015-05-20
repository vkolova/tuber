var channelId, subscriberCount, totalUploadViews, channelTitle,
	thumbnailImage, bannerImageUrl, publishedAt, totalUploadViews,
	viewCount, videoCount, description, playlistId, nextPageToken, prevPageToken;


function loadUserChannel() {
	var request = gapi.client.youtube.channels.list({
		mine: true, part: 'id, contentDetails, statistics, snippet, brandingSettings'});   
	request.execute(displayChannel);
}

function displayChannel(response) {
	if ('error' in response) {
		displayMessage(response.error.message);
	} else {
		channelTitle = response.items[0].snippet.title;
		description = response.items[0].brandingSettings.channel.description;
		subscriberCount = response.items[0].statistics.subscriberCount;
		publishedAt = response.items[0].snippet.publishedAt;
		totalUploadViews = response.items[0].statistics.totalUploadViews;
		viewCount = response.items[0].statistics.viewCount;
		videoCount = response.items[0].statistics.videoCount;
		thumbnailImage = response.items[0].snippet.thumbnails.high.url;
		bannerImageUrl = response.items[0].brandingSettings.image.bannerMobileExtraHdImageUrl;

		$('h1').html(channelTitle);
		$('.page-header').css("background-image", "url(" + bannerImageUrl + ")");
		$('#channelThumbnail').attr("src", thumbnailImage);
		$('#channelThumbnail').css({"border-radius": "50px"});
		
		uploadsLoad();
	}
}

function uploadsLoad() {
	$('#uploads').addClass("active");
	$('#playlists').removeClass("active");
	$('#about').removeClass("active");
	
	$('#video-container').html('');
	$('#playlist-container').html('');
	$('#about-container').html('');
	
	playlistId = response.result.items[0].contentDetails.relatedPlaylists.uploads;
	requestVideoPlaylist(playlistId);
}

function requestVideoPlaylist(playlistId, pageToken) {
	$('#video-container').html('');
	$('#playlist-container').html('');
	$('#about-container').html('');
	
	var requestOptions = {
		playlistId: playlistId,
		part: 'snippet',
		maxResults: 10
	};
	if (pageToken) {
		requestOptions.pageToken = pageToken;
	}
	var request = gapi.client.youtube.playlistItems.list(requestOptions);
	request.execute(function(response) {
	// Only show pagination buttons if there is a pagination token for the
	// next or previous page of results.
	
		nextPageToken = response.result.nextPageToken;
		var nextDis = nextPageToken ? '' : 'disabled';
		$('.next').css('class', "next" + nextDis);
		
		prevPageToken = response.result.prevPageToken
		var prevDis = prevPageToken ? '' : 'disabled';
		$('.previous').css('class', "previous" + prevDis);

		var playlistItems = response.result.items;
		if (playlistItems) {
			$.each(playlistItems, function(index, item) {
				displayResult(item.snippet);
			});
		} else {
		$('#video-container').html('<div class="alert alert-info" role="alert">Sorry, you have no uploaded videos :(</div>');
		}
	});

	$('#video-container').html('<nav><ul class="pager"><li class="previous"><a onclick="previousPage();"><span aria-hidden="true">&larr;</span> Older</a></li><li class="next disabled"><a onclick="nextPage();">Newer <span aria-hidden="true">&rarr;</span></a></li></ul></nav>');
}

function displayResult(videoSnippet) {
	var title = videoSnippet.title;
	var videoId = videoSnippet.resourceId.videoId;
	
	
}

function nextPage() {
	requestVideoPlaylist(playlistId, nextPageToken);
}

function previousPage() {
	requestVideoPlaylist(playlistId, prevPageToken);
}

function loadPlaylists() {
	$('#uploads').removeClass("active");
	$('#playlists').addClass("active");
	$('#about').removeClass("active");
	
	$('#video-container').html('');
	$('#playlist-container').html('');
	$('#about-container').html('');
	
}

function loadAbout() {
	$('#uploads').removeClass("active");
	$('#playlists').removeClass("active");
	$('#about').addClass("active");
	
	$('#video-container').html('');
	$('#playlist-container').html('');
	$('#about-container').html('');
	
	if (description != undefined) {
		$('#about-container').append('<p>' + description + '</p>')
	;}
	$('#about-container').append('<p>' + subscriberCount + ' subscribers' + '</p>');
	$('#about-container').append('<p>' + videoCount + ' uploaded videos' + '</p>');
	$('#about-container').append('<p>' + viewCount + ' views' + '</p>');
	$('#about-container').append('<p>' + "Joined " + publishedAt + '</p>');
}