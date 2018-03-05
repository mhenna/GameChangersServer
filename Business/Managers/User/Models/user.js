const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    lowercase: true,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  bio: {
    default: 'This used did not add any bio',
    type: String
  },
  position: {
    type: String,
    required: true
  },
    // this attributes shows if the user belongs to a team or not
  teamMember: {
    type: Boolean,
    default: 0
  },
  craetorOf: {
    type: String,
    default: '-1'
  },
  careerLevel: {
    type: String
  },
  isRemote: {
    type: Boolean,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  genNextMember: {
    type: Boolean,
    required: true
  },
  previousParticipation: {
    type: Boolean,
    required: true
  },
  preferences: {
        // type: String,
    type: [],
    required: true
  }
});

// Hash the user's password before inserting a new user
userSchema.pre('save', (next) => {
  const user = this;
  if (this.isModified('password') || this.isNew) {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        return next(err);
      }
      bcrypt.hash(user.password, salt, (err, hash) => {
        if (err) {
          return next(err);
        }
        user.password = hash;
        next();
      });
    });
  } else {
    return next();
  }
});

// Compare password input to password saved in database
userSchema.methods.comparePassword = function (pw, cb) {
  bcrypt.compare(pw, this.password, (err, isMatch) => {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

const User = mongoose.model('User', userSchema);
module.exports = User;
