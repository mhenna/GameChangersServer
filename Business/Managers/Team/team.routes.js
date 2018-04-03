const express = require('express');
const TeamManager = require('./TeamManager');
const teamValidation = require('./Config/team.validations');
const validate = require('express-validation');
import expressJwt from 'express-jwt';
import config from '../../../config/config'



const router = express.Router(); // eslint-disable-line new-cap

router.route('/new')
  .post(validate(teamValidation.new),TeamManager.createTeam);

router.route('/delete/member')
  .post(validate(teamValidation.delete), TeamManager.deleteTeamMember);

router.route('/add/member')
  .post(validate(teamValidation.add), TeamManager.addTeamMember);

router.route('/view/member')
  .get(TeamManager.viewTeamMembers);

router.route('/view/team')
  .get(expressJwt({ secret: config.jwtSecret }), TeamManager.viewTeam);

module.exports = router;
