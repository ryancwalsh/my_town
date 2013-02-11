
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
    var textFields = ['id', 'name', 'notes', 'website', 'yelp', 'menu', 'icon'];
    $.each(textFields, function(k, v){
        var val = typeof spot[v] == 'undefined' ? spot.get(v) : spot[v];//TODO: pull ID out of textFields array (handle separately)
        form.find('input[name="' + v + '"]').val(val);
    });
    
    if(spot.get('been_there')){//TODO: handle in loop
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
    spot.set('name', form.find('input[name="name"]').val());//TODO: handle in loop
    spot.set('notes', form.find('input[name="notes"]').val());
    spot.set('website', form.find('input[name="website"]').val());
    spot.set('yelp', form.find('input[name="yelp"]').val());
    spot.set('menu', form.find('input[name="menu"]').val());
    spot.set('icon', form.find('input[name="icon"]').val());
    spot.set('been_there', form.find('input[name="been_there"]').val());//TODO: set as 1 or 0 based on 'checked'
    spot.set('would_go_again', form.find('input[name="would_go_again"]').val());//TODO: set as 1 or 0 based on 'checked'
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