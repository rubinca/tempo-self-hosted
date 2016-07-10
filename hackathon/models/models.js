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

// <<<<<<< HEAD
userSchema.virtual('name.full').get(function() {
  return this.name.first + ' ' + this.name.last
});
// =======
// userSchema.methods.getFollows = function (id, callback){
// // >>>>>>> master

userSchema.virtual('location.full').get(function() {
  return this.location.city + ', ' + this.location.state + '; ' +
  this.location.country
})
module.exports = {
  User: mongoose.model('User', userSchema)
}
