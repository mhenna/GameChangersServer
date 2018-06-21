const express = require('express');
const adminManager = require('./AdminManager');
const ideaManager = require('../Idea/IdeaManager');
const adminValidation = require('./Config/admin.validations');
const validate = require('express-validation');
import config from '../../../config/config'
import expressJwt from 'express-jwt';
import midddlewares from './Config/admin.midddlewares';

const router = express.Router(); // eslint-disable-line new-cap

router.get('/test', (req, res) => {
  res.json({ message: "OK" })
})

router.route('/users')
  .get(adminManager.getAllUsers);

router.route('/domains')
  .get(adminManager.getAllDomains)
  .post(validate(adminValidation.createDomain), adminManager.createDomain);

router.route('/domains/:name')
  .delete(validate(adminValidation.removeDomain), adminManager.removeDomain)
  .put(validate(adminValidation.updateDomain), adminManager.updateDomain);

router.route('/challenges')
  // .get(adminManager.getAllCategories)
  .post(validate(adminValidation.createChallenge), adminManager.createChallenge);

router.route('/challenges/:name')
  .delete(validate(adminValidation.removeChallenge), adminManager.removeChallenge)
  .put(validate(adminValidation.updateChallenge), adminManager.updateChallenge);
module.exports = router;