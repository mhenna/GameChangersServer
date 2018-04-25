const User = require('../User/Models/user');
const Judgment = require('../Judge/Models/judgment')
const jwt = require('jsonwebtoken');
const MailService = require('../../../Services/MailServer');
import async from 'async';
import crypto from 'crypto';
import config from '../../../config/config';
import bcrypt from 'bcrypt';
import mailService from '../../../Services/MailServer';
const Utils = require('../utils')

function registerUser(req, res) {
  var user = new User(req.body);
  user.save((err, user) =>{
    if(err)
    {
      console.log(err)
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
        // MailService.sendEmail(req.body.email, 'Account Creation for Game Changers',
        //     'Your account for game changers has been created with the following credentials:\nemail: ' + req.body.email + '\npassword: '+ req.body.password + '\nYou can login at: http://ias00nan5eba.corp.emc.com/gamechanger/');
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
            token,
            isJudge: user.toJSON().isJudge
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

// function getTeamStatus(req, res, err) {
//   console.log
//   res.send(req.user);
// }

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
      let body = `Dear ${user.name} ,
        Please follow this link to reset your password ${config.frontEndUrl}/reset-password?token=${token}
    Regards,
      `;
      mailService.sendEmail(user.email, "Password reset", body)
        .then(message => res.status(200).json({ message }))
        .catch(error => res.status(500).json({ message: error }));
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

function getAnotherUser(req, res, next) {
  User.findOne({ _id: req.body.id }, (err, user) => {
    if (err) {
      send400("User does not exist.");
      return;
    }
    res.status(200).json({
      success: true,
      message: 'Authentication successfull',
      user: user
    });
  })
}

function createJudge(req, res, next) {

  console.log("Is Admin in create Judge?:", req.user.email, req.user.email != config.admin)
  if(req.user.email != config.admin) {
    Utils.send400("Unauthorized", res);
    return;
  }
  let password = makePassword();
  var user = new User();
  user.email = req.body.email;
  user.name = req.body.email;
  user.location = "JUDGE";
  user.region = "JUDGE";
  user.password = password;
  user.isJudge = true;
  user.position = "Judge"
  user.previousParticipation = "no"
  
  user.save((err, user) =>{
    if(err)
    {
      console.log(err)
      return res.status(409).json({
        status: '409',
        message: 'Judge already exists'
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
  //  MailService.sendEmail(req.body.email, 'Account Creation for Game Changers',
  //           'Your account for game changers has been created with the following credentials:\nemail: ' + user.email + '\npassword: '+ password + '\nYou can login at: http://ias00nan5eba.corp.emc.com/gamechanger/');
       
      var judgment = new Judgment({judgeId: user._id, ideasID: []});
      judgment.save( (err, judgment) => {
        if(err) {
          console.log(err);
          Utils.send400("Internal Server Error " + err.message, res);
          return;
        }
        if(!judgment) {
          return res.status(500).json({
            status: '500',
            message: 'Internal server error'
          })
        }else {
          return res.status(200).json({
            status : '200',
            message: 'Success',
            body: user._id
          })
        }
      });
    }
  });
}

function makePassword() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 10; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function getJudgeById(req, res) {
  console.log("Is admin?: ", req.user.email, req.user.email != config.admin)
  if(req.user.email != config.admin) {
      Utils.send400("Unauthorized", res);
      return;
  }

  User.findById(req.query.judgeId, 'name isJudge email', (err, user) => {
    if(err) {
      console.log("err: ", err.message);
      Utils.send400(err.message, res);
      return
    }
    if(!user) {
      console.log("err2: ", "not user");
      Utils.send400("Internal server error", res);
      return
    }

    if(!user.isJudge) {
      Utils.send400("This User is not a judge", res);
      return
    }

    return res.status(200).json({
      status : '200',
      message: 'Success',
      body: user
    })
  })
}

function getAllJudges(req, res) {
  console.log("Is admin?: ", req.user.email, req.user.email != config.admin)
  if(req.user.email != config.admin) {
      Utils.send400("Unauthorized", res);
      return;
  }

  User.find({isJudge: true}, 'name isJudge email', (err, user) => {
    if(err) {
      console.log("err: ", err.message);
      Utils.send400(err.message, res);
      return
    }
    if(!user) {
      console.log("err2: ", "not user");
      Utils.send400("Internal server error", res);
      return
    }
    return res.status(200).json({
      status : '200',
      message: 'Success',
      body: user
    })
  })
}

function isJudge(req,res){
  if(req.user.email != config.admin) {
    Utils.send400("Unauthorized", res);
    return;
}

User.find({email: req.params.email}, (err, user) => {
  if(err) {
    console.log("err: ", err.message);
    Utils.send400(err.message, res);
    return
  }
  if(user.length == 0) {
    return res.status(200).json({
      status : '200',
      message: 'Success',
      state: false,
      judgeId: "null"
    })
  }
  return res.status(200).json({
    status : '200',
    message: 'Success',
    state: true,
    judgeId: user[0]._id,
    isJudge: user[0].isJudge,
    isUser: true
  })
})
}

function makeAuserAJudge(req, res){
  console.log("Is admin?: ", req.user.email, req.user.email != config.admin)
  if(req.user.email != config.admin) {
      Utils.send400("Unauthorized", res);
      return;
  }

  User.find({email: req.params.email}, (err, user) => {
    if(err) {
      console.log("err: ", err.message);
      Utils.send400(err.message, res);
      return
    }
    user[0].isJudge = true;
    user[0].save((err, user) =>{
      console.log(user);
      if(err)
      {
        console.log(err)
        return res.status(409).json({
          status: '409',
          message: 'Judge already exists'
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
        var judgment = new Judgment({judgeId: user._id, ideasID: []});
        judgment.save( (err, judgment) => {
          if(err) {
            console.log(err);
            Utils.send400("Internal Server Error " + err.message, res);
            return;
          }
          if(!judgment) {
            return res.status(500).json({
              status: '500',
              message: 'Internal server error'
            })
          }else {
            return res.status(200).json({
              status : '200',
              message: 'Success',
              body: user._id
            })
          }
        });
      }
    });
  })

}
module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  loginUser,
  getUser,
  authenticate,
  getAnotherUser,
  createJudge,
  getJudgeById,
  getAllJudges,
  isJudge,
  makeAuserAJudge
};

