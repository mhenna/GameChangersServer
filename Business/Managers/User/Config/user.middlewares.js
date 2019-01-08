import httpStatus from 'http-status-codes';
import redis from '../../../../config/redis.config';
import utils from '../../utils';

export async function isRegistrationDeadlineReached(req, res, next) {
  const now = new Date();
  const registrationDeadline = await redis.get('registration');
  if (now > new Date(registrationDeadline)) {
    utils.send400('deadline reached', res);
    return;
  }
  next();
}

export async function validateMailDomain(req, res, next) {
  const regex = new RegExp(`^[a-zA-Z0-9_.+-]+@(?:(?:[a-zA-Z0-9-]+.)?[a-zA-Z]+.)?(${await utils.getEmailDomainsAsRegex()}).com$`);
  if ((req.body.email && req.body.email.match(regex))
  || (req.params.email && req.params.email.match(regex))) {
    next();
  } else {
    utils.sendResponse(res, httpStatus.BAD_REQUEST,
      httpStatus.getStatusText(httpStatus.BAD_REQUEST), null,
      [{ message: 'Unsupported mail domain' }]);
  }
}
