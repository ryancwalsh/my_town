
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
        var user = tempUserObj;
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
                //TODO: if this Tag is no longer related to any Spots, delete the Tag completely.
                }
            });
        },
        function(error) {
            console.log("Error: " + error.code + " " + error.message);
        }).then(function(){
            var tags = [];
            var query = new Parse.Query(Tag);
            query.equalTo("user", user);
            query.find().then(function(results) {
                $.each(results, function(k, v){
                    tags.push(v);
                });
                console.log(tags);
            }, standardError).then(function(){
                //Add Tags to Spot if Tag exists in input field but not Spot:
                $.each(tagValues, function(k, v){
                    console.log(tags);
                    var tag = getTag(v, tags);
                    if(tag) {
                        //Add the relation of the Tag to this Spot.                
                        console.log('Tag already existed, so adding relation.');
                        relation.add(tag);
                    } else {
                        //If this Tag does not yet exist for this user, create it.
                        tag = new Tag();
                        tag.set('user', user);
                        tag.set('ACL', new Parse.ACL(user));
                        tag.set('value', v);
                        console.log('Created new Tag.');
                        tag.save().then(function(tag) {
                            //Add the relation of the Tag to this Spot.                
                            console.log('Saved Tag. Adding relation.');
                            relation.add(tag);
                        }, standardError);
                    }                
                });
            }, standardError).then(function(){
                console.log(spot);
                spot.save().then(function(data) {                    
                    console.log('Saved Spot.');
                }, standardError);
            });
        });
    });
    
    function getTag(tagValue, tags){
        var matchingTag = false;
        $.each(tags, function(k, v){
            if(v.get('value').toUpperCase() == tagValue.toUpperCase()){
                matchingTag = v;
            }
        });
        return matchingTag;
    }
    
});//end doc ready