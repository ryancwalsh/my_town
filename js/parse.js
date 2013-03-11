Parse.$ = jQuery;

// Initialize Parse with your Parse application javascript keys
Parse.initialize("yaH11lzPCB3w9ExzINJfcRq34YK1u7yRuUgOPko3", "uNYybtZweTwox5bW1ETykpkNdZhvHaaQCn0BFpTU");

function logErr(data, error) {
    console.log("Error: " + error.code + " " + error.message);
    console.log(data);
}
var tagsInputAutocompleteArray = [];
var tagsAlreadyInDb = [];
// "Spot" Model
// ----------  
var Spot = Parse.Object.extend("Spot", {
    });

// "Tag" Model
// ----------  
var Tag = Parse.Object.extend("Tag", {
    });
//-----------------------------------------------------------------------------------

function saveGoogResultToSpot(user, result, map) {
    console.log(result);
    var spot = new Spot();
    spot.set('user', user);
    var acl = new Parse.ACL(user);
    acl.setPublicReadAccess(true);
    spot.set('ACL', acl);
    spot.set('name', result.name);
    spot.set('notes', result.notes);
    spot.set('website', result.website);
    spot.set('rating', result.rating);
    spot.set('address_components', result.address_components);
    spot.set('icon', result.icon);
    spot.set('geoPoint', new Parse.GeoPoint({
        latitude: result.lat,
        longitude: result.lng
    }));
    spot.save().then(function(spot) {
        addSpotToShownListAndMap(spot, map);
        mySpots[spot.id] = spot;
        sortSpots($('.mySpots .spot'));
        $('.mySpots .instructions').remove();
        $('#searchTextField').val('');
    }, logErr);
}

function getTagsForUser(user) {
    var query = new Parse.Query(Tag);
    query.equalTo("user", user);
    return query.find();//Find all Tags of this User (not just for this Spot) in the db and put them into tagsAlreadyInDb array.
}

function getSpotsOfTag(tag) {
    var query = new Parse.Query(Spot);
    query.equalTo("tags", tag);
    return query.find();
}

function updateTagRelationsToSpot(spot, tagValuesFromInputBox, user) {
    var relation = spot.relation("tags");
    relation.query().find().then(function(results) {
        $.each(results, function(k, v) {//Loop through all Tags related to this Spot in the db.
            console.log(v.get('value'));
            if (inArrayCaseInsensitive(v.get('value'), tagValuesFromInputBox) === -1) {
                console.log('remove');
                relation.remove(v);//Remove Tag from Spot if no longer in input field.
            //TODO: if this Tag is no longer related to any Spots, delete the Tag completely.
            }
        });
    }, logErr).then(function() {
        return getTagsForUser(user);
    }, logErr).then(function(tagsAlreadyInDb) {
        console.log(tagsAlreadyInDb);
        var tagsFinishedSaving = [];
        $.each(tagValuesFromInputBox, function(k, v) {//Loop through each of the Tag values provided in the input box.
            if (v) {
                var tag = getTag(v, tagsAlreadyInDb);
                if (tag) {//If Tag already exists in db, just add relation to Spot.                
                    console.log('Tag already existed, so adding relation.');
                    relation.add(tag);//Add the relation of the Tag to this Spot.
                } else {
                    var savedTagPromise = new Parse.Promise();
                    createNewTag(user, v, relation, savedTagPromise);//If this Tag does not yet exist for this user, create it. (We'll soon add a relation to the Spot.)
                    tagsFinishedSaving.push(savedTagPromise);
                }
            }
        });
        return tagsFinishedSaving;
    }, logErr).then(function(tagsFinishedSaving) {
        Parse.Promise.when(tagsFinishedSaving).then(function() {
            spot.save().then(function(data) {
                console.log('Saved Spot.');
            }, logErr);
        }, logErr);
    }, logErr);

}

function createNewTag(user, tagValue, relation, savedTagPromise) {
    var tag = new Tag();
    tag.set('user', user);
    var acl = new Parse.ACL(user);
    acl.setPublicReadAccess(true);
    tag.set('ACL', acl);
    tag.set('value', tagValue);
    console.log('Saving new Tag "' + tagValue + '"...');
    tag.save().then(function() {
        relation.add(tag);//Add the relation of the Tag to this Spot.
        savedTagPromise.resolve(true);
        tagsInputAutocompleteArray.push(tagValue);
        tagsInputAutocompleteArray.sort();
    }, logErr);
    $('#tagsContainer').show();
}

function isFirstTime(user){
    return (user.get('firstName') == '' || user.get('locationName') == '' || user.get('geoPoint') == '');
}

function getNewUserTemplate(federatedLoginUser) {
    var user = new Parse.User();
    user.set("username", federatedLoginUser.email);
    user.set("password", getPassword(federatedLoginUser));
    user.set("email", federatedLoginUser.email);
    user.set("photo", federatedLoginUser.photo);    
    user.set('ACL', new Parse.ACL());
    return user;
}

var MainView = Parse.View.extend({
    initialize: function() {
        console.log('render LoggedInView');
        $('#app .content').html(_.template($("#main-template").html()));        
        generateMapAndLists();
    }
});

var IntroView = Parse.View.extend({
    initialize: function() {
        console.log('render LoggedOutView');
        $('#app .content').html(_.template($("#intro-template").html()));
    }
});

var GetStartedView = Parse.View.extend({
    initialize: function() {
        console.log('render GetStartedView');
        $('#app .content').html(_.template($("#get-started-template").html()));
    }
});

$(function() {
    var currentUser = Parse.User.current();
    if (currentUser) {
        if(isFirstTime(currentUser)){
            new GetStartedView();
        } else {
            new MainView();
        }
    } else {
        new IntroView();
    }    
});