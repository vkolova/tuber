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
		$('.page-header').css("height", "25vw");
		$('#channelThumbnail').attr("src", thumbnailImage);
		$('#channelThumbnail').css({"border-radius": "140px"});
		$('.page-header').css("margin", "0px");
		$('.page-header').css("padding", "0px");
		
		uploadsLoad(response);
	}
}

function uploadsLoad(response) {
	$('#uploads').addClass("active");
	$('#playlists').removeClass("active");
	$('#about').removeClass("active");
	$('#upload').removeClass("active");
	
	$('#video-container').html('');
	$('#playlist-container').html('');
	$('#about-container').html('');
	$('#upload-container').html('');
	
	playlistId = response.result.items[0].contentDetails.relatedPlaylists.uploads;
	requestVideoPlaylist(playlistId);
}

function requestVideoPlaylist(playlistId, pageToken) {

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
		if (playlistItems.length > 0) {
			
			$.each(playlistItems, function(index, item) {
				displayResult(item);
			});

			$('#video-container').append('<nav><ul class="pager"><li class="previous"><a onclick="previousPage();"><span aria-hidden="true">&larr;</span> Older</a></li><li class="next disabled"><a onclick="nextPage();">Newer <span aria-hidden="true">&rarr;</span></a></li></ul></nav>');
		
			nextPageToken = response.result.nextPageToken;
			var nextDis = nextPageToken ? '' : 'disabled';
			$('.next').css('class', "next" + nextDis);
			
			prevPageToken = response.result.prevPageToken
			var prevDis = prevPageToken ? '' : 'disabled';
			$('.previous').css('class', "previous" + prevDis);
		} else {
			$('#video-container').append('<div class="alert alert-info" role="alert"><b>Sorry, you have no uploaded videos :(</b></div>');
		}
	});
}

function displayResult(item) {
//	$('#video-container').append('<a><img class="media-object" src="' + item.snippet.thumbnails.meduim.url + '"></a>');
	$('#video-container').append('<div class="media">' + 
									'<div class="media-left media-top">' + 
										'<a><img class="media-object" src="' + item.snippet.thumbnails.medium.url + '"></a>' + 
									'</div>' +
									'<div class="media-body">' + 
										'<h4 class="media-heading">' + item.snippet.title + '</h4>' + 
									'</div>' +
								'</div>');
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
	$('#upload').removeClass("active");
	
	$('#video-container').html('');
	$('#playlist-container').html('');
	$('#about-container').html('');
	$('#upload-container').html('');
	
	var requestOptions = {
		channelId: channelId,
		mine: true,
		part: 'snippet, contentDetails, status, contentDetails',
		maxResults: 10
	};
	
	var request = gapi.client.youtube.playlists.list(requestOptions);
	
	request.execute(function(response) {

		var playlistList = response.result.items;

		if (playlistList.length > 0) {
				$.each(playlistList, function(index, item) {
					switch(item.status.privacyStatus) {
						case "private":
							status = ' <span class="label label-danger">private</span>';
							break;
						case "unlisted":
							status = ' <span class="label label-default">unlisted</span>';
							break;
						case "public":
							status = ' <span class="label label-success">public</span>';
							break;
					}
					$('#playlist-container').append('<div class="media">' + 
														'<div class="media-left media-top">' + 
															'<a><img class="media-object" src="' + item.snippet.thumbnails.medium.url + '"></a>' + 
														'</div>' +
														'<div class="media-body">' + 
															'<h4 class="media-heading">' + item.snippet.title + status + '</h4>' + 
															item.contentDetails.itemCount + " videos" + 
														'</div>' +
													'</div>');
				});
			} else {
				$('#playlist-container').append('<div class="alert alert-info" role="alert"><b>Sorry, you have no video playlists :(</b></div>');
			}
	});

	
}

function loadAbout() {
	$('#uploads').removeClass("active");
	$('#playlists').removeClass("active");
	$('#about').addClass("active");
	$('#upload').removeClass("active");

	$('#video-container').html('');
	$('#playlist-container').html('');
	$('#about-container').html('');
	$('#upload-container').html('');
	
	if (description != undefined) {
		$('#about-container').append('<p>' + description + '</p>')
	;}
	$('#about-container').append('<p>' + subscriberCount + ' subscribers' + '</p>');
	$('#about-container').append('<p>' + videoCount + ' uploaded videos' + '</p>');
	$('#about-container').append('<p>' + viewCount + ' views' + '</p>');
	$('#about-container').append('<p>' + "Joined " + publishedAt + '</p>');
}