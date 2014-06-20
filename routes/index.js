exports.index = function(req, res){
  res.render('index', { title: 'Search historical NBA point spread database' });
};

exports.search = function(req, res){
  res.render('search', { title: 'Search historical NBA point spread database' });
};

exports.map = function(req, res){
  res.render('map', { title: 'Search historical NBA point spread database' });
};

exports.submitSearch = function(req, res) {
	var mysqlQuery  = buildQuery(req);
	connection.query(mysqlQuery, function(err, rows) {
	  if (err) {
	  	console.log(err);
	  } else {
	  	res.send(rows);
	  }
	});
};

function getSeasonDate(year, start) {
	var day = (start === "start") ? "10/27/" + year : "7/17/" + year;
	return new Date(day).getTime()/1000; //unix timestamp
}

function buildQuery(req) {
	var data = req.body;
	var home_location = data.home_location;
	var team = data.team;
	var opp = data.opp;
	var season_start = getSeasonDate(data.season_start.split('-')[0], "start");
	var season_end = getSeasonDate(data.season_end.split('-')[1], "end");
	var min_Spread = data.min_Spread;
	var max_Spread = data.max_Spread;
	var mysqlQuery  = (team =='All Teams') ? "SELECT * FROM `t2` WHERE `Team`<>''" : "SELECT * FROM `t2` WHERE `Team`='" + team  + "'";
	mysqlQuery += (home_location === 'Both') ? '' : (home_location === 'Home') ? " AND `hc`='Home'" : " AND `hc`='Away'";
	mysqlQuery += (opp === 'All Teams') ? '' : " AND `opp`='" + opp + "'";
	mysqlQuery += " AND `timestamp` >=" + season_start + " AND `timestamp` <=" + season_end;
	mysqlQuery += " AND `spread` >=" + min_Spread + " AND `spread` <=" + max_Spread;
	console.log(mysqlQuery);
	return mysqlQuery;
}