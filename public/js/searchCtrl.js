var app = angular.module('searchApp', ['components']);
 
app.controller('searchCtrl', function($scope, $http, $sce) {
    $scope.teams = {0: "All Teams", "Atlanta": "Atlanta Hawks",'Boston':'Boston Celtics','Charlotte':'Charlotte Hornets','Chicago':'Chicago Bulls','Cleveland':'Cleveland Cavaliers','Dallas':'Dallas Mavericks','Denver':'Denver Nuggets','Detroit':'Detroit Pistons','GSW':'Golden State Warriors','Houston':'Houston Rockets','Indiana':'Indiana Pacers','LAC':'LA Clippers','LAL':'LA Lakers','Memphis':'Memphis Grizzlies','Miami':'Miami Heat','Milwaukee':'Milwaukee Bucks','Minnesota':'Minnesota Timberwolves','Brooklyn':'Brooklyn Nets','NewOrleans':'New Orleans Pelicans','NewYork':'New York Knicks','OKC':'Oklahoma City Thunder','Orlando':'Orlando Magic','Philadelphia':'Philadelphia Sixers','Phoenix':'Phoenix Suns','Portland':'Portland Trail Blazers','Sacramento':'Sacramento Kings','SAS':'San Antonio Spurs','Toronto':'Toronto Raptors','Utah':'Utah Jazz','Washington':'Washington Wizards'};
    $scope.homeTeams = $scope.teams[0];
    $scope.oppTeams = $scope.teams[0];
    
    $scope.locations = {"Both": "Both", "Home":"Home", "Away":"Away"};
    $scope.homeLoc = $scope.locations.Both;
    $scope.awayLoc = $scope.locations.Both;
    $scope.$watch('homeLoc', function() {
      var homeLoc = $scope.homeLoc;
      var locations = $scope.locations;
        $scope.awayLoc = (homeLoc === "Both") ? locations.Both : (homeLoc === 'Home') ? locations.Away : locations.Home;
    });
    $scope.$watch('awayLoc', function() {
      var awayLoc = $scope.awayLoc;
      var locations = $scope.locations;
      $scope.homeLoc = (awayLoc === "Both") ? locations.Both : (awayLoc === 'Home') ? locations.Away : locations.Home;
    });
    
    $scope.seasons = {2011:"2010-2011",2012:"2011-2012",2013:"2012-2013",2014:"2013-2014"};
    $scope.startSeason = $scope.seasons[2014];
    $scope.endSeason = $scope.seasons[2014];
    $scope.$watch('startSeason', function() {
         if ($scope.endSeason < $scope.startSeason) {
            $scope.endSeason = $scope.startSeason;
        }
    });
    $scope.$watch('endSeason', function() {
         if ($scope.endSeason < $scope.startSeason) {
            $scope.startSeason = $scope.endSeason;
        }
    });

    $scope.searchEntered = false;
    $scope.databaseResult;
    $scope.results_html;
    $scope.search = function() {
        $scope.searchEntered = true;
        var searchData = {};
        searchData.home_location = $scope.homeLoc;
        searchData.team = $scope.homeTeams;
        searchData.opp = $scope.oppTeams;
        searchData.season_start = $scope.startSeason;
        searchData.season_end = $scope.endSeason;
        searchData.min_Spread = $("#slider-range").slider("values", 0);
        searchData.max_Spread = $("#slider-range").slider("values", 1);

        $http.post("/api/search", searchData).success(function(res) {
            $scope.databaseResult = res;
            var html = createTable(res);
            $scope.results_html = html;
            $scope.generateCharts();
        });
    };
    $scope.generateCharts = function() {
        //clear div to draw again
        $("#ats").empty();
        $("#atsaway").empty();
        $("#atshome").empty();
        $("#barAts").empty();

        var atsData = [], atsDataHome = [], atsDataAway = [], barData = {}, barData2 = [], wins =0, losses =0, 
        pushes=0, hcl = 0, hcw = 0, hcp = 0, acl = 0, acw = 0, acp = 0;
        var dataToParse = $scope.databaseResult;

        for (var i=0, len = $scope.databaseResult.length; i< len; i++) {
                //parse pie chart data
                var winLossResult = $scope.databaseResult[i].swl;
                var homeCourt = $scope.databaseResult[i].hc;
                if (winLossResult === "W") {
                    wins++;
                    (homeCourt === "Home") ? hcw++ : acw++;
                } else if (winLossResult ==="L") {
                    losses++;
                    (homeCourt === "Home") ? hcl++ : acl++;
                } else {
                    pushes++;
                    (homeCourt === 'Home') ? hcp++ : acp++;
                }
                //parse bar chart data
                var spread = $scope.databaseResult[i].spread;
                if (!barData[spread]) barData[spread] = {"count":0};
                barData[spread].count++;
        }

        atsData.push({"legendLabel":"wins","magnitude":wins});
        atsData.push({"legendLabel":"losses","magnitude":losses});
        if (pushes > 0) atsData.push({"legendLabel" :"pushes","magnitude":pushes});

        atsDataHome.push({"legendLabel":"wins","magnitude":hcw});
        atsDataHome.push({"legendLabel":"losses","magnitude":hcl});
        if (hcp > 0) atsDataHome.push({"legendLabel" :"pushes","magnitude":hcp});

        atsDataAway.push({"legendLabel":"wins","magnitude":acw});
        atsDataAway.push({"legendLabel":"losses","magnitude":acl});
        if (acp > 0) atsDataAway.push({"legendLabel" :"pushes","magnitude":acp});
        
        //bar
        for (var spread in barData) {
            var count = barData[spread].count;
            barData2.push({"key": spread, "value": count});
        }
        barData2.sort(function(a,b) {return a.key - b.key}); //sort spreads order

        d3Pie(atsData, '#ats');
        d3Pie(atsDataHome, '#atshome');
        d3Pie(atsDataAway, '#atsaway');
        d3Bar(barData2);
      }
})
.filter('to_trusted', ['$sce', function($sce) {
  return function(text) {
    return $sce.trustAsHtml(text);
  };
}]);

function createTable(res) {
    var html = '<table id="resultsTable"><tr><th>Team</th><th>Date</th><th>Game Type</th><th>Home/Away</th><th>Opponent</th><th>Score</th><th>Opp. Score</th><th>Spread</th><th>W/L Spread</th><th>Over/Under</th><th>W/L OU</th></tr>';
    for (var i=0, len = res.length; i < len; i++) {
        html += (i%2 ==0) ? '<tr class="alternate">' : '<tr>';
        html += '<td>'+ res[i].Team +'</td><td>'+ res[i].gamedate +'</td><td>'+ res[i].gametype +'</td><td>'+ res[i].hc +'</td><td>'+ res[i].opp +'</td><td>'+ res[i].score +'</td><td>'+ res[i].oscore +'</td><td>'+ res[i].spread +'</td><td>'+ res[i].swl +'</td><td>'+ res[i].ouspread +'</td><td>'+ res[i].ou +'</td></tr>'
    }
    html += '</table>';
    return html;
}

