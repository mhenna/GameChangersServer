const express = require('express');
const adminManager = require('./AdminManager');
const ideaManager = require('../Idea/IdeaManager');
const adminValidation = require('./Config/admin.validations');
const validate = require('express-validation');
import expressJwt from 'express-jwt';

const router = express.Router(); // eslint-disable-line new-cap

router.get('/test', (req,res)=>{
    res.send("OK");
})
router.route('/users')
  .get(adminManager.getAllUsers);

router.route('/domains')
  .get(adminManager.getAllDomains)
  .post(adminManager.createDomain);

  router.route('/domains/:name')
  .delete(adminManager.removeDomain)
  .put(adminManager.updateDomain); 

module.exports = router;