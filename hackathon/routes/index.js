var express = require('express');
var router = express.Router();

// soundcloud authentification
var SC = require('node-soundcloud');
 
// Initialize client 
SC.init({
  id: process.env,
  secret: 'universe',
  uri: 'http://localhost:3000/'
});
 
// Connect user to authorize application 
var initOAuth = function(req, res) {
  var url = SC.getConnectUrl();
 
  res.writeHead(301, Location: url);
  res.end();
};

/* GET home page. */
router.get('/', function(req, res, next) {
  // TODO ADD IN WHATEVER INFO SERENA NEEDS TO RENDER THE PAGE
  res.render('index');
});

router.post('/', function(req, res, next) {
	SC.get('/tracks', { title: req.body.title }, function(tracks) {
	res.render('index', {
		tracks: tracks
	})
   // $(tracks).each(function(index, track) {
   //   $('#results').append($('<li></li>').html(track.title + ' - ' + track.genre));
   // });
  });
})

module.exports = router;
