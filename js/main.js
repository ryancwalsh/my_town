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

function get_gravatar(email, size) {
 
    // MD5 (Message-Digest Algorithm) by WebToolkit
    // 
 
    var MD5=function(s){function L(k,d){return(k<<d)|(k>>>(32-d))}function K(G,k){var I,d,F,H,x;F=(G&2147483648);H=(k&2147483648);I=(G&1073741824);d=(k&1073741824);x=(G&1073741823)+(k&1073741823);if(I&d){return(x^2147483648^F^H)}if(I|d){if(x&1073741824){return(x^3221225472^F^H)}else{return(x^1073741824^F^H)}}else{return(x^F^H)}}function r(d,F,k){return(d&F)|((~d)&k)}function q(d,F,k){return(d&k)|(F&(~k))}function p(d,F,k){return(d^F^k)}function n(d,F,k){return(F^(d|(~k)))}function u(G,F,aa,Z,k,H,I){G=K(G,K(K(r(F,aa,Z),k),I));return K(L(G,H),F)}function f(G,F,aa,Z,k,H,I){G=K(G,K(K(q(F,aa,Z),k),I));return K(L(G,H),F)}function D(G,F,aa,Z,k,H,I){G=K(G,K(K(p(F,aa,Z),k),I));return K(L(G,H),F)}function t(G,F,aa,Z,k,H,I){G=K(G,K(K(n(F,aa,Z),k),I));return K(L(G,H),F)}function e(G){var Z;var F=G.length;var x=F+8;var k=(x-(x%64))/64;var I=(k+1)*16;var aa=Array(I-1);var d=0;var H=0;while(H<F){Z=(H-(H%4))/4;d=(H%4)*8;aa[Z]=(aa[Z]|(G.charCodeAt(H)<<d));H++}Z=(H-(H%4))/4;d=(H%4)*8;aa[Z]=aa[Z]|(128<<d);aa[I-2]=F<<3;aa[I-1]=F>>>29;return aa}function B(x){var k="",F="",G,d;for(d=0;d<=3;d++){G=(x>>>(d*8))&255;F="0"+G.toString(16);k=k+F.substr(F.length-2,2)}return k}function J(k){k=k.replace(/rn/g,"n");var d="";for(var F=0;F<k.length;F++){var x=k.charCodeAt(F);if(x<128){d+=String.fromCharCode(x)}else{if((x>127)&&(x<2048)){d+=String.fromCharCode((x>>6)|192);d+=String.fromCharCode((x&63)|128)}else{d+=String.fromCharCode((x>>12)|224);d+=String.fromCharCode(((x>>6)&63)|128);d+=String.fromCharCode((x&63)|128)}}}return d}var C=Array();var P,h,E,v,g,Y,X,W,V;var S=7,Q=12,N=17,M=22;var A=5,z=9,y=14,w=20;var o=4,m=11,l=16,j=23;var U=6,T=10,R=15,O=21;s=J(s);C=e(s);Y=1732584193;X=4023233417;W=2562383102;V=271733878;for(P=0;P<C.length;P+=16){h=Y;E=X;v=W;g=V;Y=u(Y,X,W,V,C[P+0],S,3614090360);V=u(V,Y,X,W,C[P+1],Q,3905402710);W=u(W,V,Y,X,C[P+2],N,606105819);X=u(X,W,V,Y,C[P+3],M,3250441966);Y=u(Y,X,W,V,C[P+4],S,4118548399);V=u(V,Y,X,W,C[P+5],Q,1200080426);W=u(W,V,Y,X,C[P+6],N,2821735955);X=u(X,W,V,Y,C[P+7],M,4249261313);Y=u(Y,X,W,V,C[P+8],S,1770035416);V=u(V,Y,X,W,C[P+9],Q,2336552879);W=u(W,V,Y,X,C[P+10],N,4294925233);X=u(X,W,V,Y,C[P+11],M,2304563134);Y=u(Y,X,W,V,C[P+12],S,1804603682);V=u(V,Y,X,W,C[P+13],Q,4254626195);W=u(W,V,Y,X,C[P+14],N,2792965006);X=u(X,W,V,Y,C[P+15],M,1236535329);Y=f(Y,X,W,V,C[P+1],A,4129170786);V=f(V,Y,X,W,C[P+6],z,3225465664);W=f(W,V,Y,X,C[P+11],y,643717713);X=f(X,W,V,Y,C[P+0],w,3921069994);Y=f(Y,X,W,V,C[P+5],A,3593408605);V=f(V,Y,X,W,C[P+10],z,38016083);W=f(W,V,Y,X,C[P+15],y,3634488961);X=f(X,W,V,Y,C[P+4],w,3889429448);Y=f(Y,X,W,V,C[P+9],A,568446438);V=f(V,Y,X,W,C[P+14],z,3275163606);W=f(W,V,Y,X,C[P+3],y,4107603335);X=f(X,W,V,Y,C[P+8],w,1163531501);Y=f(Y,X,W,V,C[P+13],A,2850285829);V=f(V,Y,X,W,C[P+2],z,4243563512);W=f(W,V,Y,X,C[P+7],y,1735328473);X=f(X,W,V,Y,C[P+12],w,2368359562);Y=D(Y,X,W,V,C[P+5],o,4294588738);V=D(V,Y,X,W,C[P+8],m,2272392833);W=D(W,V,Y,X,C[P+11],l,1839030562);X=D(X,W,V,Y,C[P+14],j,4259657740);Y=D(Y,X,W,V,C[P+1],o,2763975236);V=D(V,Y,X,W,C[P+4],m,1272893353);W=D(W,V,Y,X,C[P+7],l,4139469664);X=D(X,W,V,Y,C[P+10],j,3200236656);Y=D(Y,X,W,V,C[P+13],o,681279174);V=D(V,Y,X,W,C[P+0],m,3936430074);W=D(W,V,Y,X,C[P+3],l,3572445317);X=D(X,W,V,Y,C[P+6],j,76029189);Y=D(Y,X,W,V,C[P+9],o,3654602809);V=D(V,Y,X,W,C[P+12],m,3873151461);W=D(W,V,Y,X,C[P+15],l,530742520);X=D(X,W,V,Y,C[P+2],j,3299628645);Y=t(Y,X,W,V,C[P+0],U,4096336452);V=t(V,Y,X,W,C[P+7],T,1126891415);W=t(W,V,Y,X,C[P+14],R,2878612391);X=t(X,W,V,Y,C[P+5],O,4237533241);Y=t(Y,X,W,V,C[P+12],U,1700485571);V=t(V,Y,X,W,C[P+3],T,2399980690);W=t(W,V,Y,X,C[P+10],R,4293915773);X=t(X,W,V,Y,C[P+1],O,2240044497);Y=t(Y,X,W,V,C[P+8],U,1873313359);V=t(V,Y,X,W,C[P+15],T,4264355552);W=t(W,V,Y,X,C[P+6],R,2734768916);X=t(X,W,V,Y,C[P+13],O,1309151649);Y=t(Y,X,W,V,C[P+4],U,4149444226);V=t(V,Y,X,W,C[P+11],T,3174756917);W=t(W,V,Y,X,C[P+2],R,718787259);X=t(X,W,V,Y,C[P+9],O,3951481745);Y=K(Y,h);X=K(X,E);W=K(W,v);V=K(V,g)}var i=B(Y)+B(X)+B(W)+B(V);return i.toLowerCase()};
 
    var size = size || 30;
    return 'http://www.gravatar.com/avatar/' + MD5(email) + '.jpg?d=identicon&s=' + size;
}

function imgError(image){
    image.src = get_gravatar(image.alt);
    //TODO: add click handler and tooltip saying to click here to update Google photo
    //http://support.google.com/plus/bin/answer.py?hl=en&answer=1057172
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
        $('#userPhoto').attr('alt', currentUser.get('email')).attr('src', currentUser.get('photo'));
        $('#federatedSignupLogin').hide();
        $('.fillInTheBlank.location').html(currentUser.get('locationName'));
        $('.fillInTheBlank.userFirstName').html(currentUser.get('firstName'));
        getTagsForUser(currentUser).then(function(tags){
            $.each(tags, function(k, v){
                tagsInputAutocompleteArray.push(v.get('value'));
            });
            tagsInputAutocompleteArray.sort();
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
            height: 40
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