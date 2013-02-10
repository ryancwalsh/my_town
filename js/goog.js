function generateAutocomplete(center){    
    var radius = 2000;//meters
    var circle = new google.maps.Circle({
        center: center, 
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

        var result = {
            name : place.name,
            website : place.website,            
            rating : place.rating,
            address_components : place.address_components,
            icon : place.icon,
            lat : place.geometry.location.Ya,
            lng : place.geometry.location.Za
        };
        saveGoogResultToSpot(1, result);
    });
}

function initializeMap(center, zoom, mapTypeId) {
    var mapOptions = {
        center: center,
        zoom: zoom,
        mapTypeId: mapTypeId
    };
    var map = new google.maps.Map(document.getElementById("map_canvas"),
        mapOptions);
    return map;
}

function addMarker(lat, lng, title, map){
    var myLatlng = new google.maps.LatLng(lat, lng);
    var marker = new google.maps.Marker({
        position: myLatlng,
        map: map,
        title: title
    });
    return marker;
}