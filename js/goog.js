var hashSpotInfo = [];
var map;
var recentInfowindow = false;
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
    return autocomplete;
}

function addAutocompleteListener(autocomplete, map){
    google.maps.event.addListener(autocomplete, 'place_changed', function() {
        var place = autocomplete.getPlace();
        if (!place.geometry) {
            // Inform the user that a place was not found and return.
            return;
        }
        console.log(place);
        var result = {
            name : place.name,
            website : place.website,            
            rating : place.rating,
            address_components : place.address_components,
            icon : place.icon,
            lat : place.geometry.location.lat(),
            lng : place.geometry.location.lng()
        };
        saveGoogResultToSpot(currentUser, result, map);
    });
}

function initializeMap(center, zoom, mapTypeId) {
    var mapOptions = {
        center: center,
        zoom: zoom,
        mapTypeId: mapTypeId
    };
    map = new google.maps.Map(document.getElementById("map_canvas"),
        mapOptions);
    return map;
}

function mapPopup(spotId){
    console.log(spotId);
    console.log(hashSpotInfo);
    var marker = hashSpotInfo[spotId]['marker'];
    map.setZoom(15);
    map.setCenter(marker.getPosition());
    if (recentInfowindow) {
        recentInfowindow.close();
    }
    hashSpotInfo[spotId]['infowindow'].open(map, marker);
    recentInfowindow = hashSpotInfo[spotId]['infowindow'];
}

function addMarker(geoPoint, spot, map){
    var myLatLng = new google.maps.LatLng(geoPoint.latitude, geoPoint.longitude);
    var marker = new google.maps.Marker({
        position: myLatLng,
        map: map,
        title: spot.get('name'),
        icon: new google.maps.MarkerImage(
            spot.get('icon'),      
            new google.maps.Size(71, 71),//size (width, height)
            new google.maps.Point(0,0),//origin      
            new google.maps.Point(0, 32),// anchor (the base of the flagpole at 0,32)
            new google.maps.Size(20, 20)//scaledSize (width, height)
            )
    });
    var infowindow = new google.maps.InfoWindow();
    infowindow.setContent(spot.get('name'));
    hashSpotInfo[spot.id] = {
        'infowindow': infowindow,
        'marker': marker
    };
    google.maps.event.addListener(marker, 'click', function() {
        mapPopup(spot.id);
    });
    return marker;
}