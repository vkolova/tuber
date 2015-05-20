var channelId, subscriberCount, totalUploadViews, channelTitle,
	thumbnailImage, bannerImageUrl, publishedAt, totalUploadViews,
	viewCount, videoCount, description, playlistId, nextPageToken, prevPageToken, response;


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
		$('.page-header').css("height", "26vw");
		$('#channelThumbnail').attr("src", thumbnailImage);
		$('#channelThumbnail').css({"border-radius": "50px"});
		
		uploadsLoad(response);
	}
}

function uploadsLoad(response) {
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
		part: 'snippet, contentDetails',
		maxResults: 10
	};
	if (pageToken) {
		requestOptions.pageToken = pageToken;
	}
	var request = gapi.client.youtube.playlistItems.list(requestOptions);
	request.execute(function(response) {
	// Only show pagination buttons if there is a pagination token for the
	// next or previous page of results.


		var playlistItems = response.result.items;
		if (playlistItems) {
			
			$('#video-container').append('<div class="media"><div class="media-left"><div><div class="media-body"></div></div>')
			
			$.each(playlistItems, function(index, item) {
				displayResult(item.snippet);
			});

			$('#video-container').html('<nav><ul class="pager"><li class="previous"><a onclick="previousPage();"><span aria-hidden="true">&larr;</span> Older</a></li><li class="next disabled"><a onclick="nextPage();">Newer <span aria-hidden="true">&rarr;</span></a></li></ul></nav>');
		
			nextPageToken = response.result.nextPageToken;
			var nextDis = nextPageToken ? '' : 'disabled';
			$('.next').css('class', "next" + nextDis);
			
			prevPageToken = response.result.prevPageToken
			var prevDis = prevPageToken ? '' : 'disabled';
			$('.previous').css('class', "previous" + prevDis);
		} else {
			$('#video-container').html('<div class="alert alert-info" role="alert">Sorry, you have no uploaded videos :(</div>');
		}
	});
}

function displayResult(videoSnippet) {
	$('.media-left').append('<a><img class="media-object" src="' + videoSnippet.thumbnails.high.url + '"></a>');
	$('.media-body').append('<h4 class="media-heading">' + videoSnippet.title + '</h4>');
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
	
	var requestOptions = {
		channelId: channelId,
		mine: true,
		part: 'snippet, contentDetails, status, contentDetails',
		maxResults: 10
	};
	
	var request = gapi.client.youtube.playlists.list(requestOptions);
	
	request.execute(function(response) {

		var playlistList = response.result.items;

		if (playlistList) {
			$('#playlists-container').append('<div class="media"><div class="media-left"><div><div class="media-body"></div></div>')
			
			$.each(playlistList, function(index, item) {
				$('.media-left').append('<a><img class="media-object" src="' + item.snippet.thumbnails.high.url + '"></a>');
				$('.media-body').append('<h4 class="media-heading">' + item.snippet.title + '</h4>');
				switch(item.status.privacyStatus) {
					case "private":
						$('.media-heading').append(' <span class="label label-danger">private</span>');
						break;
					case "unlisted":
						$('.media-heading').append(' <span class="label label-default">unlisted</span>');
						break;
					default:
						$('.media-heading').append(' <span class="label label-success">public</span>');
				}
				$('.media-body').append(item.contentDetails.itemCount + " videos");
			});
			for (var i = 0; i < playlistList.length; i++) {
				document.getElementById('playlist-container').innerHTML += "<p>" + playlistList[i].snippet.title + "</p>";
				document.getElementById('playlist-container').innerHTML += '<img src="' + playlistList[i].snippet.thumbnails.medium.url + '" />';
				document.getElementById('playlist-container').innerHTML += "<p>" + playlistList[i].status.privacyStatus + "</p>";
				document.getElementById('playlist-container').innerHTML += "<p>" + playlistList[i].contentDetails.itemCount + " videos" + "</p>";
			}
			} else {
				document.getElementById('playlist-container').innerHTML += 'Sorry, you have no video playlists :(';
			}
	});

	
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