Parse.$ = jQuery;

// Initialize Parse with your Parse application javascript keys
Parse.initialize("yaH11lzPCB3w9ExzINJfcRq34YK1u7yRuUgOPko3", "uNYybtZweTwox5bW1ETykpkNdZhvHaaQCn0BFpTU");

function logErr(data, error) {                
    console.log("Error: " + error.code + " " + error.message);
    console.log(data);
}
//-----------------------------------------------------------------------------------
//TODO: replace this temporary section
var tempUserObj;
Parse.User.logIn('rcwalsh', 'parse', {}).then(function(user) {
    tempUserObj = user;
    console.log(tempUserObj);
}, logErr);
//-----------------------------------------------------------------------------------


// "Spot" Model
// ----------  
var Spot = Parse.Object.extend("Spot", {

    });

// "Tag" Model
// ----------  
var Tag = Parse.Object.extend("Tag", {
    
    });

function getSpotsForUser(user, map){//TODO: this isn't the way to handle an async func call
    var mySpots = {};
    var query = new Parse.Query(Spot);
    query.equalTo("user", user);
    query.find().then(function(results) {
        $.each(results, function(k, v){
            addSpotToShownListAndMap(v, map);
            mySpots[v.id] = v;
        });
    },
    logErr);
    return mySpots;
}

function saveGoogResultToSpot(user, result, map){    
    console.log(result);
    var spot = new Spot();
    spot.set('user', user);
    spot.set('ACL', new Parse.ACL(user));
    spot.set('name', result.name);
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
        $('#searchTextField').val('');
    },
    logErr
    );
}

function handleTags(spot, tagValues, user){
    var relation = spot.relation("tags");    
    relation.query().find().then(function(results){
        $.each(results, function(k, v){//Loop through all Tags related to this Spot in the db.
            console.log(v.get('value'));
            if ($.inArray(v.get('value'), tagValues) === -1){
                console.log('remove');
                relation.remove(v);//Remove Tag from Spot if no longer in input field.
            //TODO: if this Tag is no longer related to any Spots, delete the Tag completely.
            }
        });
    }, logErr).then(function(){
        var tagsAlreadyInDb = [];
        var query = new Parse.Query(Tag);
        query.equalTo("user", user);
        query.find().then(function(results) {//Find all Tags of this User (not just for this Spot) in the db and put them into tagsAlreadyInDb array.
            $.each(results, function(k, v){
                tagsAlreadyInDb.push(v);
            });
        }, logErr).then(function(){            
            $.each(tagValues, function(k, v){//Loop through each of the Tag values provided in the input box.
                console.log(tagsAlreadyInDb);
                var tag = getTag(v, tagsAlreadyInDb);
                if(tag) {//If Tag already exists in db, just add relation to Spot.
                    //Add the relation of the Tag to this Spot.                
                    console.log('Tag already existed, so adding relation.');
                    relation.add(tag);
                } else {
                    //If this Tag does not yet exist for this user, create it. (We'll soon add a relation to the Spot.)
                    tag = new Tag();
                    tag.set('user', user);
                    tag.set('ACL', new Parse.ACL(user));
                    tag.set('value', v);
                    console.log('Created new Tag.');
                    tag.save().then(function() {
                        //Add the relation of the Tag to this Spot.                
                        console.log('Saved Tag. Adding relation.');
                        relation.add(tag);//TODO: figure out how to postpone save of Spot until this save of Tag is finished.
                    }, logErr);
                }                
            });
        }, logErr).then(function(){
            console.log(spot);
            spot.save().then(function(data) {                    
                console.log('Saved Spot.');
            }, logErr);
        });
    });
}