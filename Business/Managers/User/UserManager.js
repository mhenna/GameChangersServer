import httpStatus from 'http-status-codes';
import jwt from 'jsonwebtoken';
import config from '../../../config/config';
import User from './Models/user';
import Utils from '../utils';

export async function registerUser(req, res) {
  const user = new User(req.body);
  if (req.body.password === req.body.passConf) {
    try {
      const newUser = await user.save();
      if (!newUser) {
        Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR,
          httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR), null,
          [{ message: 'Cannot register at this time, please try again later.' }]);
        return;
      }
      // MailService.sendEmail(req.body.email, 'Account Creation for Game Changers',
      //     'Your account for game changers has been created with the following credentials:\nemail: ' + req.body.email + '\npassword: '+ req.body.password + '\nYou can login at: http://ias00nan5eba.corp.emc.com/gamechanger/');

      Utils.sendResponse(res, httpStatus.OK,
        httpStatus.getStatusText(httpStatus.OK),
        newUser._id);
    } catch (err) {
      Utils.sendResponse(res, httpStatus.CONFLICT,
        httpStatus.getStatusText(httpStatus.CONFLICT), null,
        [{ message: 'User already exist' }]);
    }
  } else {
    Utils.sendResponse(res, httpStatus.BAD_REQUEST,
      httpStatus.getStatusText(httpStatus.BAD_REQUEST), null,
      [{ message: 'password and password confirmation  mismatches' }]);
  }
}

export async function authenticate(req, res) {
  try {
    const user = await User.findByIdAndUpdate(req.body.userId, { isAuthenticated: true });
    Utils.sendResponse(res, httpStatus.OK, httpStatus.getStatusText(httpStatus.OK), user);
    return;
  } catch (error) {
    Utils.sendResponse(res, httpStatus.NOT_FOUND, httpStatus.getStatusText(
      httpStatus.NOT_FOUND
    ), null, [{ message: 'User not found' }]);
  }
}


export async function loginUser(req, res) {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      Utils.sendResponse(res, httpStatus.UNAUTHORIZED, httpStatus.getStatusText(
        httpStatus.UNAUTHORIZED
      ), null, [{ message: 'Wrong email or password' }]);
    } else {
      try {
        const isMatch = await user.comparePassword(req.body.password);
        if (isMatch) {
          const token = jwt.sign(user.toJSON(), config.jwtSecret);
          const isAdmin = !!user.toJSON().isAdmin;
          Utils.sendResponse(res, httpStatus.OK, httpStatus.getStatusText(httpStatus.OK),
            {
              message: 'Authentication successful', token, isJudge: user.toJSON().isJudge, isAdmin
            });
        } else {
          Utils.sendResponse(res, httpStatus.UNAUTHORIZED, httpStatus.getStatusText(
            httpStatus.UNAUTHORIZED
          ), null, [{ message: 'Wrong email or password' }]);
        }
      } catch (error) {
        Utils.sendResponse(res, httpStatus.UNAUTHORIZED, httpStatus.getStatusText(
          httpStatus.UNAUTHORIZED
        ), null, [{ message: 'Wrong email or password' }]);
      }
    }
  } catch (error) {
    Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(
      httpStatus.INTERNAL_SERVER_ERROR
    ), null, [{ message: 'couldn\'t connect to the database' }]);
  }
}

export async function getUser(req, res) {
  try {
    const user = await User.findOne({ email: req.user.email });
    Utils.sendResponse(res, httpStatus.OK, httpStatus.getStatusText(httpStatus.OK),
      user);
  } catch (error) {
    Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(
      httpStatus.INTERNAL_SERVER_ERROR
    ), null, [{ message: 'couldn\'t connect to the database' }]);
  }
}

export async function forgotPassword(req, res) {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      Utils.sendResponse(res, httpStatus.NOT_FOUND, httpStatus.getStatusText(
        httpStatus.NOT_FOUND
      ), null, [{ message: 'User not found' }]);
      return;
    }
    try {
      const token = await Utils.getRandomToken();
      try {
        await User.findByIdAndUpdate({ _id: user._id },
          { resetPasswordToken: token, resetPasswordExpires: Date.now() + 86400000 },
          { upsert: true, new: true });
        /**
       * TODO send a mail to the user containing the token.
       */
        //   let body = `Dear ${user.name} ,
        //     Please follow this link to reset your password
        // ${config.frontEndUrl}/reset-password?token=${token}
        // Regards,
        //   `;

        // mailService.sendEmail(user.email, "Password reset", body)
        //   .then(message => res.status(200).json({ message, token }))
        //   .catch(error => res.status(500).json({ message: error }));
        // if (process.env.ENVIRONMENT === 'testing') {
        //   Utils.sendResponse(res, httpStatus.OK, httpStatus.getStatusText(httpStatus.OK),
        //     token);
        //   return;
        // }
        Utils.sendResponse(res, httpStatus.OK, httpStatus.getStatusText(httpStatus.OK), token);
      } catch (error) {
        Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(
          httpStatus.INTERNAL_SERVER_ERROR
        ), null, [{ message: 'couldn\'t connect to the database' }]);
      }
    } catch (error) {
      Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(
        httpStatus.INTERNAL_SERVER_ERROR
      ), null, [{ message: 'couldn\'t create password reset token, please try again later' }]);
    }
  } catch (error) {
    Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(
      httpStatus.INTERNAL_SERVER_ERROR
    ), null, [{ message: 'couldn\'t connect to the database' }]);
  }
}

export async function resetPassword(req, res) {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.body.token,
      resetPasswordExpires: {
        $gt: Date.now()
      }
    });
    if (!user) {
      Utils.sendResponse(res, httpStatus.PRECONDITION_FAILED, httpStatus.getStatusText(
        httpStatus.PRECONDITION_FAILED
      ), null, [{ message: 'Password reset token is invalid or has expired.' }]);
      return;
    }
    if (req.body.newPassword === req.body.verifyPassword) {
      /* eslint no-param-reassign:
      ["error", { "props": true, "ignorePropertyModificationsFor": ["user"] }] */
      user.password = req.body.newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      try {
        await user.save();
        Utils.sendResponse(res, httpStatus.OK, httpStatus.getStatusText(httpStatus.OK),
          {
            message: 'Password reset success'
          });
      } catch (error) {
        Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(
          httpStatus.INTERNAL_SERVER_ERROR
        ), null, [{ message: 'couldn\'t connect to the database' }]);
      }
    } else {
      Utils.sendResponse(res, httpStatus.BAD_REQUEST, httpStatus.getStatusText(
        httpStatus.BAD_REQUEST
      ), null, [{ message: 'Passwords do not match' }]);
    }
  } catch (error) {
    Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(
      httpStatus.INTERNAL_SERVER_ERROR
    ), null, [{ message: 'couldn\'t connect to the database' }]);
  }
}

export async function getTeamStatus(req, res) {
  try {
    const user = await User.findOne({ email: req.user.email });
    Utils.sendResponse(res, httpStatus.OK, httpStatus.getStatusText(httpStatus.OK),
      {
        success: true,
        message: 'Authentication successfully',
        teamMember: user.teamMember
      });
  } catch (error) {
    Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(
      httpStatus.INTERNAL_SERVER_ERROR
    ), null, [{ message: 'couldn\'t connect to the database' }]);
  }
}

export async function getAnotherUser(req, res) {
  try {
    const user = await User.findOne({ _id: req.body.id });
    if (user) {
      Utils.sendResponse(res, httpStatus.OK, httpStatus.getStatusText(httpStatus.OK),
        user);
      return;
    }
    Utils.sendResponse(res, httpStatus.NOT_FOUND, httpStatus.getStatusText(
      httpStatus.NOT_FOUND
    ), null, [{ message: 'User doesn\'t exist' }]);
  } catch (error) {
    Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(
      httpStatus.INTERNAL_SERVER_ERROR
    ), null, [{ message: 'couldn\'t connect to the database' }]);
  }
}
