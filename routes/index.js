var db = require('../routes/database');

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
	db.getRecords(req, function(err, results) {
		if (err) { 
			res.send(500, "Server Error"); 
			return; 
		}
		res.send(results);
	});
};


