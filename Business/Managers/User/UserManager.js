import { ok } from 'assert';

const User = require('../User/Models/user');
const jwt = require('jsonwebtoken');
import config from '../../../config/config';

function registerUser(req, res) {
  var user = new User(req.body);
  console.log(user);
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
        message: 'Success'
      })
    }
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

module.exports = {
  registerUser,
  loginUser
};
