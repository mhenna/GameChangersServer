import expressJwt from 'express-jwt';
import express from 'express';
import validate from 'express-validation';
import config from '../../../config/config';
import { isRegistrationDeadlineReached, validateMailDomain, validateLocation } from './Config/user.middlewares';
import { getAllDeadlines } from '../Admin/AdminManager';
import {

  _login, _register, _forgotPassword, _resetPassword

} from './Config/user.validations';
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getUser,
  authenticate,
  getAnotherUser,
  getTeamStatus
} from './UserManager';


const router = express.Router(); // eslint-disable-line new-cap

/** POST /users/login - Returns token if correct username and password is provided */
router.route('/login')
  .post(validate(_login), loginUser);

/** POST /users/signup - Regiester new user */
router.route('/signup')
  .post(validate(_register), isRegistrationDeadlineReached,
    validateMailDomain, validateLocation, registerUser);
router.route('/register')
  .post(registerUser);
router.route('/deadlines')
  .get(getAllDeadlines);
/** GET /users/user - Get the current user object */
router.route('/user')
  .get(expressJwt({ secret: config.jwtSecret }), getUser);

/** GET /users/team - Get the current user's team status object */
router.route('/team')
  .get(expressJwt({ secret: config.jwtSecret }), getTeamStatus);

/** POST /users/forgot-password - Send a mail to reset the password of a user */
router.route('/forgot-password')
  .post(validate(_forgotPassword), forgotPassword);

/** POST /users/reset-password - Reset the password of the user */
router.route('/reset-password')
  .post(validate(_resetPassword), resetPassword);
/** GET /users/protected-route - Example of how to protect an endpoint */

router.route('/authenticate')
  .post(authenticate);

router.route('/protected-route')
  .get(expressJwt({ secret: config.jwtSecret }), (req, res) => {
    /**
     * You can access the authenticated user object using req.user
     * This is the payload of the created token
     */
    res.send('AUTHORIZED');
  });

router.route('/:id')
  .get(expressJwt({ secret: config.jwtSecret }), getAnotherUser);
export default router;
