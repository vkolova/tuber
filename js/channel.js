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
		$('.page-header').css("background-image", "url('" + bannerImageUrl + "');");
		$('#channelThumbnail').attr("src", thumbnailImage);
		$('#channelThumbnail').css({-webkit-border-radius: "50px", -moz-border-radius: "50px", border-radius: "50px"});
		
		playlistId = response.result.items[0].contentDetails.relatedPlaylists.uploads;
		requestVideoPlaylist(playlistId);
	}

}
