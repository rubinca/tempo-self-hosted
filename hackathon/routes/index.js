var express = require('express');
var router = express.Router();

// soundcloud authentification
// var SC = require('soundcloud');
//
// // Initialize client
// SC.init({
//   id: process.env,
//   secret: 'universe',
//   uri: 'http://localhost:3000/'
// });
//
// // Connect user to authorize application
// var initOAuth = function(req, res) {
//   var url = SC.getConnectUrl();
//
//   res.writeHead(301, "http://localhost:3000/");
//   res.end();
// };

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    clientId: process.env.CLIENT_ID
  });
});

router.get('/callback', function(req, res, next) {
  res.send("RANDOM");
});


router.post('/', function(req, res, next) {
	SC.get('/tracks', { title: req.body.title }, function(tracks) {
	res.render('index', {
		tracks: tracks
	})
  //  $(tracks).each(function(index, track) {
  //    $('#results').append($('<li></li>').html(track.title + ' - ' + track.genre));
  //  });
  });
})

module.exports = router;
