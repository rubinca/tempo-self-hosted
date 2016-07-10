var express = require('express');
var router = express.Router();
var YouTube = require('youtube-node');

var youTube = new YouTube();
youTube.setKey('AIzaSyB1OOSpTREs85WUMvIgJvLTZKye4BVsoFU');

var SC = require('node-soundcloud');

var SpotifyWebApi = require('spotify-web-api-node');

// credentials are optional
var spotifyApi = new SpotifyWebApi({
  clientId : process.env.SPOTIFY_CLIENT_ID,
  clientSecret : process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri : 'http://localhost:3000/'
});
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
  res.render('index', {
    clientId: process.env.CLIENT_ID
  });
});

router.get('/callback', function(req, res, next) {
  res.send("RANDOM");
});


router.post('/', function(req, res, next) {
  var results = [];
  // console.log("REQBODY", req.body.search)
  var callback = function(error, result) {
    if(error) {
      console.log(error)
      return next(error);
    }
    else {
      results.push(result);

      if(results.length === 3) {
        var youtube = [];
        var soundcloud = [];
        var spotify = [];
        console.log("RESULTS", results)
        for( var i = 0; i < results.length; i++) {
          //console.log("RESULTS", results)
          if (results[i][0]) {
            if(results[i][0].kind === "track") {
              soundcloud = soundcloud.concat(results[i])
            }
          }
          else if(results[i].kind === "youtube#searchListResponse") {
            youtube = youtube.concat(results[i]["items"])

          }
          else if(results[i].body.tracks) {
            spotify = spotify.concat(results[i].body.tracks.items)
          }
          else {
            console.log("IDK", results)
          }
        }
        console.log("SPOTIFY RESULTS", spotify)
        res.render('index', {
          youtube: youtube,
          soundcloud: soundcloud,
          spotify: spotify
        })
      }
    }
  }

  spotifyApi.searchTracks(req.body.search)
    .then(callback.bind(null, null), function(error) {
      console.log("PROMISE ERROR", error);
      next(error)
    });

  youTube.search(req.body.search, 2, callback);
	SC.get('/tracks', { title: req.body.search, limit: 3}, callback);
})

module.exports = router;
