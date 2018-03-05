const express = require('express');
const validate = require('express-validation');
import expressJwt from 'express-jwt';
const userValidation = require('../User/Config/user.validations');
const UserManager = require('./UserManager');
import config from '../../../config/config'

const router = express.Router(); // eslint-disable-line new-cap

/** POST /users/login - Returns token if correct username and password is provided */
router.route('/login')
  .post(validate(userValidation.login), UserManager.loginUser);

<<<<<<< HEAD
router.route('/signup')
  .post(validate(userValidation.register),UserManager.registerUser);
=======
router.route('/protected-route')
  .get(expressJwt({ secret: config.jwtSecret }), (req,res)=>{
    /**
     * You can access the authenticated user object using req.user
     * This is the payload of the created token
     */
    res.send("AUTHORIZED");
  });

>>>>>>> 021861473aa9c62a6aa67c98c26808e08d6246be
module.exports = router;
