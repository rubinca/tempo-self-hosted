var express = require('express');
var router = express.Router();

// soundcloud authentification
var SC = require('node-soundcloud');

// Initialize client
SC.init({
  id: process.env.CLIENT_ID,
  secret: 'universe',
  uri: 'http://localhost:3000/'
});

// Connect user to authorize application
var initOAuth = function(req, res) {
  var url = SC.getConnectUrl();
  res.writeHead(301, "http://localhost:3000/");
  res.end();
};

/* GET home page. */
router.get('/', function(req, res, next) {
  // TODO ADD IN WHATEVER INFO SERENA NEEDS TO RENDER THE PAGE
  res.render('index');
});

router.post('/', function(req, res, next) {
	SC.get('/tracks', { title: req.body.search }, function(error, tracks) {
	res.render('index', {
		tracks: tracks
	})
  });
})

module.exports = router;
