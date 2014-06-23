var mysql = require('mysql');
var config = require('../config/config');

exports.getRecords = function(req, callback) {
	var env = req.app.get('env');
	var connection = buildConnection(env);
	var mysqlQuery  = buildQuery(req);
	connection.query(mysqlQuery, function(err, rows) {
	  if (err) {
	  	console.log(err);
	  	callback(true); 
	  	return;
	  }
	  callback(false, rows);
	  connection.end();
	});
};

function buildConnection(env) {
	var mysqlConfig = config.mysqlConfig;
	if ('production' == env) {
 		var connection = mysql.createConnection({
			host: mysqlConfig.host,
			user: mysqlConfig.user,
			password: mysqlConfig.password,
			database: mysqlConfig.database
		});
	} else if ('development' == env) {
	 	var connection = mysql.createConnection({
			host : 'localhost',
			user : 'root',
			password: '',
			database: 'test'
		});
	}
	connection.connect(function(err) {
	  if (err) {
	    console.error('error connecting: ' + err.stack);
	    return;
	  } else {
	    console.log('Connection to database successful.');
	  }
	});
	return connection;
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

function getSeasonDate(year, start) {
	var day = (start === "start") ? "10/27/" + year : "7/17/" + year;
	return new Date(day).getTime()/1000; //unix timestamp
}