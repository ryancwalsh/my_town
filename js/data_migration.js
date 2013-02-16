

function migration(spots){
    console.log('migration');
    $.each(spots, function(k, spot){
        console.log(spot);
        spot.set('geoPoint', new Parse.GeoPoint({latitude: spot.get('lat'), longitude: spot.get('lng')}));
        spot.save(null, {
            success: function(spot) {
                // The object was saved successfully.
                console.log(spot);
            },
            error: function(spot, error) {
            // The save failed.
            // error is a Parse.Error with an error code and description.
            }
        });
        
    });
}