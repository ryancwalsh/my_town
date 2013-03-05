var hashSpotInfo = [];
var map;
var recentInfowindow = false;
//------------------------------------------------------------------------------
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
//------------------------------------------------------------------------------
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
//------------------------------------------------------------------------------
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
//------------------------------------------------------------------------------
function mapPopup(spotId){
    var marker = hashSpotInfo[spotId]['marker'];
    map.setZoom(15);
    map.setCenter(marker.getPosition());
    if (recentInfowindow) {
        recentInfowindow.close();
    }
    $('.richMarker').popover('destroy').remove();
    
    var richMarker = new RichMarker({
        //http://google-maps-utility-library-v3.googlecode.com/svn/trunk/richmarker/docs/reference.html
        map: map,
        position: marker.getPosition(),
        draggable: false,
        flat: true,
        anchor: RichMarkerPosition.MIDDLE,
        content: '<div class="richMarker">' + '</div>'
    });
    google.maps.event.addDomListener(richMarker, 'ready', function() {
        var notes = mySpots[spotId].get('notes') ? mySpots[spotId].get('notes') : '(Add notes here)';
        $('.richMarker').popover({
            title: mySpots[spotId].get('name'),
            content: notes + ' <div class="editPopup" data-id="' + spotId + '">Edit</div>',
            html: true,
            placement: 'top'
        //,container: '#mainContent'
        }).popover('show');
    });
    recentInfowindow = hashSpotInfo[spotId]['infowindow'];
}
//------------------------------------------------------------------------------
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
            new google.maps.Point(10, -5),// anchor (the base of the flagpole)
            new google.maps.Size(20, 20)//scaledSize (width, height)
            )
    });
    
    hashSpotInfo[spot.id] = {
        'marker': marker
    };
    google.maps.event.addListener(marker, 'click', function() {
        mapPopup(spot.id);     
    });
    return marker;
}
//------------------------------------------------------------------------------