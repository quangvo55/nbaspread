app.controller('mapCtrl', function($scope, $http, apiService) {
  $scope.teams;
  $http.get('nbaStadiumAddresses.json').then(function(res) {
    $scope.teams = res.data.Teams;
  });
  $scope.getDist = function() {
    var olat = $scope.star.lat, 
    olong = $scope.star.lon, 
    dlat = $scope.end.lat, 
    dlong = $scope.end.lon,
    origin1 = new google.maps.LatLng(olat, olong), 
    destination1 = new google.maps.LatLng(dlat, dlong), 
    destinationIcon = 'https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=D|FF0000|000000', 
    originIcon = 'https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=O|FFFF00|000000';
    calculateDistances(origin1, destination1);

    function calculateDistances(origin1, destination1) {
      var service = new google.maps.DistanceMatrixService();
      service.getDistanceMatrix(
        {
          origins: [origin1],
          destinations: [destination1],
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.IMPERIAL,
          avoidHighways: false,
          avoidTolls: false
        }, callback);
    }

    function callback(response, status) {
      if (status != google.maps.DistanceMatrixStatus.OK) {
        alert('Error was: ' + status);
      } else {
        var origins = response.originAddresses;
        var destinations = response.destinationAddresses;
        var outputDiv = document.getElementById('outputDiv');
        outputDiv.innerHTML = '';
        clearMap();

        for (var i = 0; i < origins.length; i++) {
          var results = response.rows[i].elements;
          fitBounds(origins[i], false);
          for (var j = 0; j < results.length; j++) {
            fitBounds(destinations[j], true);
            outputDiv.innerHTML += results[j].distance.text + '<br>';
          }
        }
        addRoute();
        addMarks();
      }
    }

    function addRoute() {
      flightPlanCoordinates = [
        new google.maps.LatLng(olat, olong),
        new google.maps.LatLng(dlat, dlong)
      ];

      var flightPath = new google.maps.Polyline({
        path: flightPlanCoordinates,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
      });

      lines.push(flightPath);
      for (var i=0; i < lines.length; i++) {
        lines[i].setMap(map);
      }
    }

    function addMarks() {
      var streetView = map.getStreetView();
      streetView.setPov(({
        heading: 265,
        pitch: 0
      }));

      var m1 = new google.maps.Marker({
          position: origin1,
          map: map,
          icon: originIcon
      });

      google.maps.event.addListener(m1, 'click', function() {
        streetView.setPosition(origin1);
        streetView.setVisible(true);
      });

      var m2 = new google.maps.Marker({
          position: destination1,
          map: map,
          icon: destinationIcon
      });

      google.maps.event.addListener(m2, 'click', function() {
        streetView.setPosition(destination1);
        streetView.setVisible(true);
      });
      markersArray.push(m1,m2);
    }

    function fitBounds(location, isDestination) {
      geocoder.geocode({'address': location}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          bounds.extend(results[0].geometry.location);
          map.fitBounds(bounds);
        }
      });
    }

    function clearMap() {
      for (var i = 0; i < lines.length; i++) {
        lines[i].setMap(null);
      }
      lines = [];
      
      for (var i = 0; i < markersArray.length; i++) {
        markersArray[i].setMap(null);
      }
      markersArray = [];
    }
  };
});


