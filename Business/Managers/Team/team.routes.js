const express = require('express');
const TeamManager = require('./TeamManager');
const teamValidation = require('./Config/team.validations');
const validate = require('express-validation');



const router = express.Router(); // eslint-disable-line new-cap

router.route('/new')
  .post(validate(teamValidation.new),TeamManager.createTeam);
module.exports = router;
