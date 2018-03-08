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
  region:{
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  brief: {
    default: 'This used did not add any bio',
    type: String
  },
  position: {
    type: String,
    required: true
  },
    // this attributes shows if the user belongs to a team or not
  teamMember: {
    type: String,
    default: '-1'
  },
  //this attribute shows if the user is a creator of a team or not, if yes, the id of the team will be input
  creatorOf: {
    type: String,
    default: '-1'
  },
  careerLevel: {
    type: String,
    required: true
  },
  isRemote: {
    type: Boolean,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  otherLocation: {
    type: String,
  },
  genNextMember: {
    type: Boolean,
    required: true
  },
  previousParticipation: {
    type: Boolean,
    required: true
  },
  ideasOrder: {
        // type: String,
    type: [],
    required: true
  },
  isAuthenticated: {
    type : Boolean,
    default: false
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  }
});

// Hash the user's password before inserting a new user
userSchema.pre('save', function (next) {
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
