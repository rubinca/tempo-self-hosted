var express = require('express');
var router = express.Router();
var YouTube = require('youtube-node');
var mp3 = require('youtube-mp3');
var path = require('path');
var models = require('../models/models');
var User = models.User;
var Playlist = models.Playlist;

var youTube = new YouTube();
youTube.setKey('AIzaSyB1OOSpTREs85WUMvIgJvLTZKye4BVsoFU');

var fs = require('fs');
var youtubedl = require('youtube-dl');


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
  var george = null
  if(req.user) {
    george = true
  }
  res.render('index', {
    clientId: process.env.CLIENT_ID,
    george: george
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
            for(var j = 0; j < results[i]["items"].length; j++) {
              if(results[i]["items"][j].id.kind === "youtube#video")
              youtube = youtube.concat(results[i]["items"])
            }
            console.log("YOUTUBE STUFF YO", youtube)
            //not working still getting channel, manipulate results**

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
        if(req.user) {
          Playlist.find({user: req.user._id}, function(err, playlists) {
            if (err) {
              next(err)
            }
            else {
              var george = null
              if(req.user) {
                george = true
              }
              console.log("THESE ARE THE PLAYLISTS", playlists)
              res.render('index', {
                youtube: youtube,
                soundcloud: soundcloud,
                spotify: spotify,
                query: req.body.search,
                playlists: playlists,
                george: george
              })
            }
          })
        }
        else {
          george = false
          res.render('index', {
            youtube: youtube,
            soundcloud: soundcloud,
            spotify: spotify,
            query: req.body.search,
            george: george
          })
        }
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
youtubedl.exec('http://www.youtube.com/?v=' + req.query.v, ['-x', '--audio-format', 'mp3'], {}, function(err, output) {
  if (err) throw err;
  console.log(output.join('\n'));

  console.log(output)
  var string = '';
  for (var i  = 0; i < output.length; i++) {
    if (output[i].substring(0, 2) === "[f") {
      string += output[i]
    }
  }
  res.download(path.resolve(__dirname + "/../" + output[output.indexOf(string)].substring(output[output.indexOf(string)].indexOf(':') + 2)));
  });
})

router.get('/soundcloud', function(req, res) {
	SC.get('/tracks', { q: req.query.search, limit: 10}, function(err, track) {
    if(err) {
      console.log(err)
      return next(err);
    }
    else {
      var george = null
      if(req.user) {
        george = true
      }
      res.render('solo', {
        soundcloud: track,
        george: george
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
      var george = null
      if(req.user) {
        george = true
      }
      res.render('solo', {
        youtube: result["items"],
        george: george
      })
    }
  })
})

router.get('/spotify', function(req, res) {
  spotifyApi.searchTracks(req.query.search)
    .then(function(data) {
      var george = null
      if(req.user) {
        george = true
      }
      res.render('solo', {
        spotify: data.body.tracks.items,
        george: george
      }) }, function(error) {
      console.log("PROMISE ERROR", error);
      next(error)
    });
})


router.get('/account', function(req, res, next) {
  var george = null
  if(req.user) {
    george = true
    Playlist.find({user: req.user._id}, function(err, playlists) {
      if (err) {
        next(err)
      }
      else {
        playlists.map(function(el) {
          return el.songs.map(function(elem) {
            elem[elem.kind] = true;
          })
        })
        res.render('account', {
          playlists: playlists,
          george: george
        })
      }
    })
  }
  else {
    res.redirect('/login')
  }
});

router.post('/addPlaylist', function(req, res, next) {
  console.log('attempting to add playlist', req.body)
  // get a post request with req.body.title, req.user._id is our user
  // create mongo entry for user with the name of the playlist and an empty array of songs objects
  var c = new Playlist({
    user: req.user._id,
    name: req.body.title,
    songs: [{id: req.body.id,
    kind: req.body.type}]
  }).save(function(err, song) {
    if (err) {
      next(err)
    }
    else {
      res.status(200).send('addedPlaylist');
    }
  })
})

router.post('/addToPlaylist', function(req, res, next) {
  Playlist.findById(req.body.playlist, function(error, playlist) {
    playlist.songs.push({id: req.body.song, kind: req.body.kind})
    playlist.save(function(err, playlist) {
      if (err) {
        next(err)
      }
      else {
        res.status(200).send('updatedPlaylist');
      }
  })
})
})


module.exports = router;
