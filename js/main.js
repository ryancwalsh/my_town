
function addSpotToShownList(spot){
    var div = '<div class="spot" data-id="' + spot.id + '">' + spot.get('name') + '</div>';
    $('.mySpots').prepend(div);
}

function addSpotToShownListAndMap(spot, map){
    addSpotToShownList(spot);
    addSpotToMap(spot, map);
}

function addSpotToMap(spot, map){
    var geoPoint = spot.get('geoPoint');
    return addMarker(geoPoint.latitude, geoPoint.longitude, spot.get('name'), spot.get('icon'), map);
}

function convertSpotToForm(spot, form){
    spot.relation("tags").query().find().then(function(results){
        console.log(results);
        var tags = [];
        $.each(results, function(k, v){
            tags.push(v.get('value'));
        });
        var commaList = tags.join(', ');
        form.find('input[name="tags"]').importTags(commaList);
    },
    function(error) {
        console.log("Error: " + error.code + " " + error.message);
    });
    form.find('input[name="id"]').val(spot['id']);
    var textFields = ['name', 'notes', 'website', 'yelp', 'menu', 'icon'];
    $.each(textFields, function(k, v){
        form.find('input[name="' + v + '"]').val(spot.get(v));
    });
    
    var checkboxes = ['been_there', 'would_go_again'];
    $.each(checkboxes, function(k, v){
        var field = form.find('input[name="' + v + '"]');
        var checked = 'checked';
        if(spot.get(v)){
            field.attr(checked, checked);
        } else {
            field.removeAttr(checked);
        }
    });
}

$(document).ready(function(){
    $('.mySpots .spot').live('click', function(){
        var id = $(this).attr('data-id');
        var form = $('#editSpotForm');
        convertSpotToForm(mySpots[id], form);
        $('#editSpotForm').show();
    });
    
    $('#editSpotForm').submit(function(event){
        event.preventDefault();
        var form = $(this);
        var id = form.find('input[name="id"]').val();
        var spot = mySpots[id];
        var textFields = ['name', 'notes', 'website', 'yelp', 'menu', 'icon'];
        $.each(textFields, function(k, v){
            spot.set(v, form.find('input[name="' + v + '"]').val());
        });
        var checkboxes = ['been_there', 'would_go_again'];
        $.each(checkboxes, function(k, v){
            var field = form.find('input[name="' + v + '"]');        
            var bool = field.is(':checked');
            spot.set(v, bool);
        });
        var relation = spot.relation("tags");
        var tagValues = form.find('input[name="tags"]').val().split(',');
        //Remove Tags from Spot if no longer in input field:
        relation.query().find().then(function(results){
            $.each(results, function(k, v){
                console.log(v.get('value'));
                if ($.inArray(v.get('value'), tagValues) === -1){
                    console.log('remove');
                    relation.remove(v);
                }
            });
        },
        function(error) {
            console.log("Error: " + error.code + " " + error.message);
        }).then(function(){
            //Add Tags to Spot if Tag exists in input field but not Spot:
            $.each(tagValues, function(k, v){
                //var tag = tags[0];
                //relation.add(tag);
                });
        }).then(function(){
            spot.save(null, {
                success: function(data) {
                    // The save was successful.
                    console.log(data);
                },
                error: function(data, error) {
                    // The save failed.  Error is an instance of Parse.Error.
                    console.log(data);
                    console.log(error);
                }
            }
            );
        });        
    });
    
});//end doc ready