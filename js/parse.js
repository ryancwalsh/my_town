Parse.$ = jQuery;

// Initialize Parse with your Parse application javascript keys
Parse.initialize("yaH11lzPCB3w9ExzINJfcRq34YK1u7yRuUgOPko3", "uNYybtZweTwox5bW1ETykpkNdZhvHaaQCn0BFpTU");

//-----------------------------------------------------------------------------------
//TODO: replace this temporary section
var tempUserObj;
Parse.User.logIn('rcwalsh', 'parse', {
    success: function(user) {
        tempUserObj = user;
        console.log(tempUserObj);
    },

    error: function(user, error) {
         
    }
});
//-----------------------------------------------------------------------------------


// "Spot" Model
// ----------  
var Spot = Parse.Object.extend("Spot", {
    // Default attributes.
    defaults: {
    //content: "...",
    //done: false
    },

    // Ensure that each Spot created has `content`.
    initialize: function() {
        if (!this.get("content")) {
        //this.set({"content": this.defaults.content});
        }
    },

    // Toggle the `done` state of this Spot item.
    toggle: function() {
    //this.save({done: !this.get("done")});
    }
});

// Spot Collection
// ---------------
var SpotList = Parse.Collection.extend({

    // Reference to this collection's model.
    model: Spot,
    
    // Filter down the list of all Spot items that are finished.
    done: function() {
    //return this.filter(function(spot){ return spot.get('done'); });
    },

    // Filter down the list to only Spot items that are still not finished.
    remaining: function() {
    //return this.without.apply(this, this.done());
    },

    // We keep the Spots in sequential order, despite being saved by unordered
    // GUID in the database. This generates the next order number for new items.
    nextOrder: function() {
    //if (!this.length) return 1;
    //return this.last().get('order') + 1;
    },

    // Spots are sorted by their original insertion order.
    comparator: function(spot) {
        return spot.get('order');
    }

});

function getSpotsForUser(user, map){
    var mySpots = {};
    var query = new Parse.Query(Spot);
    query.equalTo("user", user);
    query.find({
        success: function(results) {
            $.each(results, function(k, v){
                addSpotToShownListAndMap(v, map);
                mySpots[v.id] = v;
            });
        },
        error: function(error) {
            console.log("Error: " + error.code + " " + error.message);            
        }
    });
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
    spot.set('lat', result.lat);
    spot.set('lng', result.lng);
    spot.save(null, {
        success: function(spot) {
            // The object was saved successfully.
            addSpotToShownListAndMap(spot, map);
            mySpots[spot.id] = spot;
            $('#searchTextField').val('');
        },
        error: function(spot, error) {
        // The save failed.
        // error is a Parse.Error with an error code and description.
        }
    });
} 
