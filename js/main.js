
function addSpotToShownList(spot){
    var div = '<div class="spot" data-id="' + spot.id + '">' + spot.get('name') + '</div>';
    $('.mySpots').prepend(div);
}

function addSpotToShownListAndMap(spot, map){
    addSpotToShownList(spot);
    addSpotToMap(spot, map);
}

function addSpotToMap(spot, map){    
    return addMarker(spot.get('lat'), spot.get('lng'), spot.get('name'), spot.get('icon'), map);
}

function convertSpotToForm(spot, form){    
    form.find('input[name="id"]').val(spot.id);
    form.find('input[name="name"]').val(spot.get('name'));
    form.find('input[name="notes"]').val(spot.get('notes'));
    form.find('input[name="website"]').val(spot.get('website'));
    form.find('input[name="yelp"]').val(spot.get('yelp'));
    form.find('input[name="menu"]').val(spot.get('menu'));
    form.find('input[name="icon"]').val(spot.get('icon'));
    if(spot.get('been_there')){
        form.find('input[name="been_there"]').attr('checked', 'checked');
    } else {
        form.find('input[name="been_there"]').removeAttr('checked');
    }
    if(spot.get('would_go_again')){
        form.find('input[name="would_go_again"]').attr('checked', 'checked');    
    } else {
        form.find('input[name="would_go_again"]').removeAttr('checked');
    }
}

function convertFormToSpot(form){
    var id = form.find('input[name="id"]').val();
    var spot = mySpots[id];
    spot.set('name', form.find('input[name="name"]').val());
    spot.set('notes', form.find('input[name="notes"]').val());
    spot.set('website', form.find('input[name="website"]').val());
    spot.set('yelp', form.find('input[name="yelp"]').val());
    spot.set('menu', form.find('input[name="menu"]').val());
    spot.set('icon', form.find('input[name="icon"]').val());
    spot.set('been_there', form.find('input[name="been_there"]').val());
    spot.set('would_go_again', form.find('input[name="would_go_again"]').val());
    return spot;
}

$(document).ready(function(){
    $('.mySpots .spot').live('click', function(){
        var id = $(this).attr('data-id');
        var form = $('#editSpotForm');
        convertSpotToForm(mySpots[id], form);
    });
    
    $('#editSpotForm').submit(function(event){
        event.preventDefault();
        var form = $(this);
        var spot = convertFormToSpot(form);
        spot.save();
    });

});//end doc ready