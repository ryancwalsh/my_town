Parse.$ = jQuery;

// Initialize Parse with your Parse application javascript keys
Parse.initialize("yaH11lzPCB3w9ExzINJfcRq34YK1u7yRuUgOPko3", "uNYybtZweTwox5bW1ETykpkNdZhvHaaQCn0BFpTU");

function standardError(data, error) {                
    console.log("Error: " + error.code + " " + error.message);
    console.log(data);
}
//-----------------------------------------------------------------------------------
//TODO: replace this temporary section
var tempUserObj;
Parse.User.logIn('rcwalsh', 'parse', {}).then(function(user) {
    tempUserObj = user;
    console.log(tempUserObj);
}, standardError);
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
    standardError);
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
    spot.save(null, {}).then(function(spot) {
        // The object was saved successfully.
        addSpotToShownListAndMap(spot, map);
        mySpots[spot.id] = spot;
        $('#searchTextField').val('');
    },
    standardError
    );
}