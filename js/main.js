
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

function inArrayCaseInsensitive(needle, haystackArray){
    //Iterates over an array of items to return the index of the first item that matches the provided val ('needle') in a case-insensitive way.  Returns -1 if no match found.
    var defaultResult = -1;
    var result = defaultResult;
    $.each(haystackArray, function(index, value) { 
        if (result == defaultResult && value.toLowerCase() == needle.toLowerCase()) {
            result = index;
        }
    });
    return result;
}

function convertSpotToForm(spot, form){
    spot.relation("tags").query().find().then(function(results){
        console.log(results);
        var tags = [];
        $.each(results, function(k, v){
            tags.push(v.get('value'));
        });
        tags.sort();
        var commaList = tags.join(', ');
        form.find('input[name="tags"]').importTags(commaList);
    }, logErr);
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

function getTag(tagValue, tags){
    var matchingTag = false;
    $.each(tags, function(k, v){
        if(v.get('value').toUpperCase() == tagValue.toUpperCase()){
            matchingTag = v;
        }
    });
    return matchingTag;
}

$(document).ready(function(){
    
    $('#federatedSignupLogin').click(function(){
        //Prompt visitor to provide federated login credentials:
        console.log('Prompt visitor');
        GO2.getToken(function(acToken){                        
            console.log(acToken);
            $.ajax({
                url: 'https://www.googleapis.com/oauth2/v1/userinfo?access_token=' + acToken,
                data: null,
                success: function(federatedLoginUser) {
                    federatedLoginUser.photo = 'https://plus.google.com/s2/photos/profile/' + federatedLoginUser.id + '?sz=100';
                    console.log(federatedLoginUser);
                    //Try to log in. If login fails, we'll sign up the new user.
                    Parse.User.logIn(federatedLoginUser.email, getPassword(federatedLoginUser), {
                        success: function(user) {
                            console.log(user);
                        },
                        error: function (data, error) {                
                            console.log("Error: " + error.code + " " + error.message);
                            console.log(data);
                            if(101 == error.code){
                                var user = new Parse.User();
                                user.set("username", federatedLoginUser.email);
                                user.set("password", getPassword(federatedLoginUser));
                                user.set("email", federatedLoginUser.email);
                                user.set("photo", federatedLoginUser.photo);
                                user.signUp(null, {
                                    success: function(user) {
                                        window.location.reload(false);
                                    },
                                    error: logErr
                                });
                            }
                        }
                    });
                },
                dataType: "jsonp"
            });
        }); 
    });

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
        var tagValues = form.find('input[name="tags"]').val().split(',');
        updateTagRelationsToSpot(spot, tagValues, currentUser);
    });
    
    $('#addSpot').click(function(){
        $(this).hide();
        $('#searchTextField').show().focus();
    });
        
});//end doc ready