var client_id = '307764999314.apps.googleusercontent.com';
var scope = 'https://www.googleapis.com/auth/userinfo.email';//Could also ask for https://www.googleapis.com/auth/userinfo.profile with a space between it and the email scope URL.
GO2.init(client_id, scope);
function getPassword(federatedLoginUser){
    return federatedLoginUser.id;//TODO: see http://stackoverflow.com/questions/3715920/about-password-hashing-system-on-client-side and http://stackoverflow.com/questions/4121629/password-encryption-at-client-side
}

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

function imgError(image){
    image.style.display = 'none';
}

function sortSpots(selector){
    var sort_by_name = function(a, b) {
        return a.innerHTML.toLowerCase().localeCompare(b.innerHTML.toLowerCase());
    }

    var list = selector.get();
    list.sort(sort_by_name);
    for (var i = 0; i < list.length; i++) {
        list[i].parentNode.appendChild(list[i]);
    }
}

$(document).ready(function(){
    
    $('#federatedSignupLogin').click(function(e){        
        //Prompt visitor to provide federated login credentials:
        console.log('Prompt visitor');
        GO2.getToken(function(acToken){                        
            console.log(acToken);
            $.ajax({
                url: 'https://www.googleapis.com/oauth2/v1/userinfo?access_token=' + acToken,
                data: null,
                success: function(federatedLoginUser) {
                    federatedLoginUser.photo = 'https://www.google.com/s2/photos/profile/' + federatedLoginUser.id + '?sz=100';
                    console.log(federatedLoginUser);
                    //Try to log in. If login fails, we'll sign up the new user.
                    Parse.User.logIn(federatedLoginUser.email, getPassword(federatedLoginUser), {
                        success: function(user) {
                            afterSigningIn();
                        },
                        error: function (data, error) {                
                            console.log("Error: " + error.code + " " + error.message);
                            console.log(data);
                            if(101 == error.code){
                                //Logging in failed with these credentials, so we'll create a new user.
                                var user = getNewUserTemplate(federatedLoginUser, 'Ryan', 32.79503, -117.24142, 'San Diego');
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
        e.preventDefault();
    });
    
    
    var federatedLoginUser;
    if (currentUser) {
        afterSigningIn();
    }
    
    function afterSigningIn(){
        currentUser = Parse.User.current();
        $('#mainContent, #signOut, #userPhoto').show();
        $('#userPhoto').attr('src', currentUser.get('photo'));
        $('#federatedSignupLogin').hide();
        $('.fillInTheBlank.location').html(currentUser.get('locationName'));
        $('.fillInTheBlank.userFirstName').html(currentUser.get('firstName'));
        getTagsForUser(currentUser).then(function(tags){
            if(tags.length){
                $.each(tags, function(k, v){
                    tagsInputAutocompleteArray.push(v.get('value'));
                });            
                tagsInputAutocompleteArray.sort();
                $.each(tagsInputAutocompleteArray, function(k, v){
                    $('#tags').append('<span class="tag"><span>' + v + '</span></span>');
                });
            } else {
                $('#tagsContainer').hide();
            }
        }, logErr);
        var geoPoint = currentUser.get('geoPoint');
        var center = new google.maps.LatLng(geoPoint.latitude, geoPoint.longitude);
        var autocomplete = generateAutocomplete(center);
        var zoom = 13;//0 = out to earth level, 18 is very close in
        var mapTypeId = google.maps.MapTypeId.ROADMAP;//ROADMAP, SATELLITE, HYBRID, TERRAIN
        var map = initializeMap(center, zoom, mapTypeId);
        addAutocompleteListener(autocomplete, map);
        mySpots = getSpotsForUser(currentUser, map);
        $('input[name="tags"]').tagsInput({
            width: 400,
            height: 40,
            defaultText: 'Tags (comma-separated)'
        });
        $('div.tagsinput input').typeahead({//http://twitter.github.com/bootstrap/javascript.html#typeahead
            source: tagsInputAutocompleteArray
        });
    }

    $('#signOut').click(function(){
        Parse.User.logOut();
        window.location.reload(false);
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
    
    $('#searchMySpots').typeahead({//http://twitter.github.com/bootstrap/javascript.html#typeahead
        //http://www.webmaster-source.com/2012/11/07/getting-more-from-twitter-bootstraps-typeahead-library/
        source: tagsInputAutocompleteArray,//TODO: should be either an array or a function that generates an array of Spot/Tag names and notes etc
        updater: function (item) {
            console.log(item);//TODO: should filter the list of Spots down to the matches.
            return item;
        },
        sorter: function (items) {
            return items;
        }
    });
        
});//end doc ready