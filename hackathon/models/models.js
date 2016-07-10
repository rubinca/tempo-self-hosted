var mongoose = require('mongoose');

// Step 0: Remember to add your MongoDB information in one of the following ways!
var connect = process.env.MONGODB_URI;
mongoose.connect(connect);

//do we need this new??
var userSchema = new mongoose.Schema({
  name: {
    first: {
      type: String,
      required: true
    },
    last: {
      type: String,
      required: true
    }
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

userSchema.virtual('name.full').get(function() {
  return this.name.first + ' ' + this.name.last
});


// userSchema.virtual('location.full').get(function() {
//   return this.location.city + ', ' + this.location.state + '; ' +
//   this.location.country
// })

var playlistSchema = new mongoose.Schema({
  user: mongoose.Schema.Types.ObjectId,
  name: String,
  songs: [{
    id: mongoose.Schema.Types.ObjectId,
  }]
})

module.exports = {
  User: mongoose.model('User', userSchema),
  Playlist: mongoose.model('Playlist', playlistSchema)
}
