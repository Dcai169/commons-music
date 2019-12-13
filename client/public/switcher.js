function toggleButtonState(){
    let button = $('#skip-btn');
    if (button.hasClass('btn-primary')){
        button.removeClass('btn-primary');
        button.addClass('btn-secondary');
    } else {
        button.removeClass('btn-secondary');
        button.addClass('btn-primary');
    }
}

function getButtonState(){
    return $('#skip-btn').hasClass('btn-primary');
}

function setButtonState(state){
    let button = $('#skip-btn');
    if (state) {
        button.removeClass('btn-primary');
        button.addClass('btn-secondary');
    } else {
        button.removeClass('btn-secondary')
        button.addClass('btn-primary')
    }
}

function setTrackDetails(img_url, title, artists){
    let img = $('#album-art');
    let trackTitle = $('#track-title');
    let trackArtists = $('#track-artists');
    let artistString = "";

    artists.forEach((value, index, array) => {
        artistString += value['name'];
        if (index < array.length-1){
            artistString += ", ";
        }
    });

    img.attr('src', img_url);
    trackTitle.text(title);
    trackArtists.text(artistString);
}


