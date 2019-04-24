import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import elasticsearch from '../../../../Services/elasticsearch';

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
  region: {
    type: String,
    //    required: true
  },
  password: {
    type: String,
    required: true
  },
  chapter: {
    type: String,
    required: true
  },
  // this attributes shows if the user belongs to a team or not
  teamMember: {
    type: String,
    default: '-1'
  },
  // this attribute shows if the user is a creator of a team or not,
  // if yes, the id of the team will be input
  creatorOf: {
    type: String,
    default: '-1'
  },
  isJudge: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  genNextMember: {
    type: Boolean,
    // required: true
  },
  previousParticipation: {
    type: Boolean,
    //required: true
  },
  ideasOrder: {
    // type: String,
    type: [],
    // required: true
  },
  isAuthenticated: {
    type: Boolean,
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
userSchema.pre('save', function encrypt(next) {
  const user = this;
  if (user.isModified('password') || user.isNew) {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        return next(err);
      }
      return bcrypt.hash(user.password, salt, (errBcrypt, hash) => {
        if (errBcrypt) {
          return next(errBcrypt);
        }
        user.password = hash;
        return next();
      });
    });
  } else {
    next();
  }
});

// Compare password input to password saved in database
userSchema.methods.comparePassword = function compare(pw) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(pw, this.password, (err, isMatch) => {
      if (err) {
        reject(err);
      }
      resolve(isMatch);
    });
  });
};

userSchema.post('save', function addToIndex() {
  const user = this.toObject();
  elasticsearch.addToIndex(elasticsearch.userType, user)
    .then(() => {

    })
    .catch(() => {

    });
});

export default mongoose.model('User', userSchema);
