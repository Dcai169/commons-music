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