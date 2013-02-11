
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

function populateFormWithSpot(spot){
    var form = $('#editSpotForm');
    form.find('input[name="id"]').val(spot.id);
    form.find('input[name="name"]').val(spot.get('name'));    
}

$(document).ready(function(){
    $('.mySpots .spot').live('click', function(){
        var id = $(this).attr('data-id');
        populateFormWithSpot(mySpots[id]);
    });
    
    $('#editSpotForm').submit(function(event){
        event.preventDefault();
        var form = $(this);    
        var id = form.find('input[name="id"]').val();
        var spot = mySpots[id];
        spot.save({
            name: form.find('input[name="name"]').val()
        });
    });

});//end doc ready