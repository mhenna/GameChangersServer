const User = require('../User/Models/user');
const jwt = require('jsonwebtoken');
import async from 'async';
import crypto from 'crypto';
import config from '../../../config/config';
import bcrypt from 'bcrypt';

function registerUser(req, res) {
  var user = new User(req.body);
  user.save((err, user) =>{
    if(err)
    {
      return res.status(409).json({
        status: '409',
        message: 'User already exists'
      })
    }
    if(!user) 
    {
      return res.status(500).json({
        status: '500',
        message: 'Internal server error'
      })
    }
    else {
        return res.status(200).json({
        status : '200',
        message: 'Success',
        body: user._id
      })
    }
  })
}
function authenticate(req, res) {
 User.findByIdAndUpdate(req.body.userId, {isAuthenticated : true}, (callback) => {
   return res.status(200).json({
     status:'200',
     body: callback
   })
  }, (err) => {
    res.status(404).json({
      status: '404',
      statustext: "User not found"
    })
  })
}
function loginUser(req, res, next) {
  User.findOne({
    email: req.body.email
  }, (err, user) => {
    if (err) throw err;
    if (!user) {
      res.status(401).json({
        sattus: '401',
        statustext: 'Unauthorized',
        errors: [{
          messages: [
            'Wrong email or password'
          ]
        }]
      });
    } else {
            // Check if password matches
      user.comparePassword(req.body.password, (err, isMatch) => {
        if (isMatch && !err) {
          //authenticate user, if it's his first login
                    // Create token if the password matched and no error was thrown
          const token = jwt.sign(user.toJSON(), config.jwtSecret);
          res.status(200).json({
            success: true,
            message: 'Authentication successfull',
            token
          });
        } else {
          res.status(401).json({
            sattus: '401',
            statustext: 'Unauthorized',
            errors: [{
              messages: [
                'Wrong email or password'
              ]
            }]
          });
        }
      });
    }
  });
}

function getUser(req, res, err) {
  res.send(req.user);
}

function forgotPassword(req, res, next) {
  async.waterfall([
    (done) => {
      User.findOne({
        email: req.body.email
      }).exec((err, user) => {
        if (user) {
          done(err, user);
        } else {
          done('User not found.');
        }
      });
    },
    (user, done) => {
      // create the random token
      crypto.randomBytes(20, (err, buffer) => {
        let token = buffer.toString('hex');
        done(err, user, token);
      });
    },
    (user, token, done) => {
      // set token expiry date to 1 day = 86400000 ms
      User.findByIdAndUpdate({ _id: user._id }, { resetPasswordToken: token, resetPasswordExpires: Date.now() + 86400000 }, { upsert: true, new: true }).exec((err, new_user) => {
        done(err, token, new_user);
      });
    },
    (token, user, done) => {
      /**
       * TODO send a mail to the user containing the token.
       */
      return res.status(200).json({ message: "TODO send the token to user's email", token });
    }
  ], (err) => {
    return res.status(422).json({ message: err });
  });
}

function resetPassword(req, res, next) {
  User.findOne({
    resetPasswordToken: req.body.token,
    resetPasswordExpires: {
      $gt: Date.now()
    }
  }).exec((err, user) => {
    if (!err && user) {
      if (req.body.newPassword === req.body.verifyPassword) {
        user.password = req.body.newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.save((err) => {
          if (err) {
            return res.status(422).json({
              message: err
            });
          }
          return res.status(200).json({
            message: "Password reset success"
          })
        });
      } else {
        return res.status(422).json({
          message: 'Passwords do not match'
        });
      }
    } else {
      return res.status(400).json({
        message: 'Password reset token is invalid or has expired.'
      });
    }
  });
}

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  loginUser,
  getUser,
  authenticate
};
