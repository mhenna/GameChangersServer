import expressJwt from 'express-jwt';
import express from 'express';
import validate from 'express-validation';
import config from '../../../config/config';
import { isTeamDeadlineReached, validateMembersMailDomain, validateChallenge } from './Config/team.middlewares';
import {
  deleteTeamMember, createTeam, searchUsers, addTeamMember, teamCreated,
  viewTeam, viewInvitations, respondToInvitation, joinTeam, getAllTeams
} from './TeamManager';
import {
  _deleteTeamMember, _addTeamMember, _createTeam, _respondToInvitation, _joinTeam
} from './Config/team.validations';
import { validateMailDomain } from '../User/Config/user.middlewares';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/join')
  .post(expressJwt({ secret: config.jwtSecret }), validate(_joinTeam), joinTeam)

router.route('/allTeams')
    .get(getAllTeams);
router.route('/search/:email')
  .get(searchUsers);
router.route('')
  .post(expressJwt({ secret: config.jwtSecret }),
    validate(_createTeam), isTeamDeadlineReached,
    validateMembersMailDomain, createTeam);
router.route('/invitations')
  .get(expressJwt({ secret: config.jwtSecret }), viewInvitations);
router.route('/invitations/:teamName')
  .put(expressJwt({ secret: config.jwtSecret }), validate(_respondToInvitation),
    isTeamDeadlineReached, respondToInvitation);
router.route('/self/members/:email')
  .delete(expressJwt({ secret: config.jwtSecret }),
    validate(_deleteTeamMember), isTeamDeadlineReached, validateMailDomain, deleteTeamMember);
router.route('/self/members')
  .post(expressJwt({ secret: config.jwtSecret }),
    validate(_addTeamMember), isTeamDeadlineReached, validateMailDomain, addTeamMember);
router.route('/self')
  .get(expressJwt({ secret: config.jwtSecret }), teamCreated);
router.route('/:teamName')
  .get(expressJwt({ secret: config.jwtSecret }), viewTeam);
export default router;
