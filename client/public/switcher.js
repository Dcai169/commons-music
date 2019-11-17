function toggleButtonState(){
    var button = $('#skip-btn');
    if (button.hasClass('btn-primary')){
        button.removeClass('btn-primary');
        button.addClass('btn-secondary');
    } else {
        button.removeClass('btn-secondary');
        button.addClass('btn-primary');
    }
}

function getButtonState(){
    return !$('#skip-btn').hasClass('btn-primary');
}