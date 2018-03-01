const express = require('express');
const validate = require('express-validation');
const userValidation = require('../User/Config/user.validations');
const UserManager = require('./UserManager');

const router = express.Router(); // eslint-disable-line new-cap

/** POST /users/login - Returns token if correct username and password is provided */
router.route('/login')
  .post(validate(userValidation.login), UserManager.loginUser);


module.exports = router;
