import httpStatus from 'http-status-codes';
import redis from '../../../../config/redis.config';
import utils from '../../utils';
import Challenge from '../../Admin/Models/challenge.model';

export async function isTeamDeadlineReached(req, res, next) {
  const now = new Date();
  const teamDeadline = await redis.get('teams');
  if (now >= new Date(teamDeadline)) {
    utils.sendResponse(res, httpStatus.BAD_REQUEST,
      httpStatus.getStatusText(httpStatus.BAD_REQUEST),
      null, [{ message: 'Registering Team deadline has been reached.' }]);
    return;
  }
  next();
}
export async function validateMembersMailDomain(req, res, next) {
  const regex = new RegExp(`^[a-zA-Z0-9_.+-]+@(?:(?:[a-zA-Z0-9-]+.)?[a-zA-Z]+.)?(${await utils.getEmailDomainsAsRegex()}).com$`);
  let err = false;
  req.body.members.forEach((member, index) => {
    if (!member.email.match(regex) && !err) {
      err = true;
      utils.sendResponse(res, httpStatus.BAD_REQUEST,
        httpStatus.getStatusText(httpStatus.BAD_REQUEST), null,
        [{
          members: {
            index,
            message: `email with value '${member.email}' failed to match the required pattern ${regex}`
          }
        }]);
    }
  });
  if (err) {
    return;
  }
  next();
}

export async function validateChallenge(req, res, next) {
  try {
    const challenge = await Challenge.findOne({ name: req.body.challenge });
    if (!challenge) {
      utils.sendResponse(res, httpStatus.NOT_FOUND, httpStatus.getStatusText(httpStatus.NOT_FOUND), null, [{ message: `${req.body.challenge} challenge not found.` }]);
      return;
    }
  } catch (err) {
    utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR), null, [{ message: 'Error validating challenge' }]);
    return;
  }
  next();
}
