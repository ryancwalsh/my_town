function generateAutocomplete(){
    var latLng = new google.maps.LatLng(32.79503, -117.24142);//San Diego
    var radius = 2000;//meters
    var circle = new google.maps.Circle({
        center: latLng, 
        radius: radius
    });
    var defaultBounds= circle.getBounds();

    var input = document.getElementById('searchTextField');
    var options = {
        bounds: defaultBounds
    //,types: ['establishment']
    };

    var autocomplete = new google.maps.places.Autocomplete(input, options);
            
    google.maps.event.addListener(autocomplete, 'place_changed', function() {
        var place = autocomplete.getPlace();
        if (!place.geometry) {
            // Inform the user that a place was not found and return.
            return;
        }

        //console.log(place);
        var result = {
            name : place.name,
            icon : place.icon,
            rating : place.rating,
            website : place.website
        };
        console.log(result);
    });
}