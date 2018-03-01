const User = require('../User/Models/user');
const jwt = require('jsonwebtoken');

function registerUser(body) {
  console.log(body);
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
          const token = jwt.sign({}, 'mysecretpassword=D');
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
