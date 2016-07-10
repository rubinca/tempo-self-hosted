var express = require('express');
var router = express.Router();
var YouTube = require('youtube-node');
var mp3 = require('youtube-mp3');

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
          else if(results[i].body) {
            if(results[i].body.tracks) {
              spotify = spotify.concat(results[i].body.tracks.items)
            }
          }
          else {
            console.log("IDK", results)
          }
        }
        spotify = spotify.splice(0, 3);
        console.log("SPOTIFY RESULTS", spotify)
        res.render('index', {
          youtube: youtube,
          soundcloud: soundcloud,
          spotify: spotify,
          query: req.body.search
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
	SC.get('/tracks', { q: req.body.search, limit: 3}, callback);

})
router.get('/download', function(req, res, next) {
  console.log('made request')
  console.log('https://www.youtube.com/watch?v=' + req.query.v)
	mp3.download('https://www.youtube.com/watch?v=' + req.query.v, 'LXJS 2013 Keynote', function(err) {
	    if(err) return console.log(err);
	    console.log('Download completed!');

	});
})

router.get('/soundcloud', function(req, res) {
	SC.get('/tracks', { q: req.query.search, limit: 10}, function(err, track) {
    if(err) {
      console.log(err)
      return next(err);
    }
    else {
      res.render('solo', {
        soundcloud: track
      })
    }
  });
})

router.get('/youtube', function(req, res) {
  youTube.search(req.query.search, 10, function(err, result) {
    if(err) {
      console.log(err)
      return next(err);
    }
    else {
      res.render('solo', {
        youtube: result["items"]
      })
    }
  })
})

router.get('/spotify', function(req, res) {
  spotifyApi.searchTracks(req.query.search)
    .then(function(data) {
      res.render('solo', {
        spotify: data.body.tracks.items
      }) }, function(error) {
      console.log("PROMISE ERROR", error);
      next(error)
    });
})
router.use(function(req, res, next){
  res.redirect('/')
});

router.get('/account', function(req, res, next) {
  if(req.user) {
	res.render('account');
  }
});


module.exports = router;
