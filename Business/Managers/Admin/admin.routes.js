const express = require('express');
const adminManager = require('./AdminManager');
const ideaManager = require('../Idea/IdeaManager');
const adminValidation = require('./Config/admin.validations');
const validate = require('express-validation');
import config from '../../../config/config'
import expressJwt from 'express-jwt';
import midddlewares from './Config/admin.midddlewares';

const router = express.Router(); // eslint-disable-line new-cap

router.get('/test', expressJwt({ secret: config.jwtSecret }),midddlewares.isAdmin,(req,res)=>{
    res.json({message: "OK"})
})

router.route('/users')
  .get(expressJwt({ secret: config.jwtSecret }),midddlewares.isAdmin,adminManager.getAllUsers);
module.exports = router;