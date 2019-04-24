import httpStatus from 'http-status-codes';
import redis from '../../../../config/redis.config';
import utils from '../../utils';

export async function isRegistrationDeadlineReached(req, res, next) {
  const now = new Date();
  const registrationDeadline = await redis.get('registration');
  if (now > new Date('2022-05-28')) {
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

export async function validateLocation(req, res, next) {
  const validChapter = await utils.checkChapter(req.body.chapter)
  const validRegion = await utils.checkRegion(req.body.region)
  if (!validRegion && !validChapter){
    utils.sendResponse(res, httpStatus.BAD_REQUEST, 
      httpStatus.getStatusText(httpStatus.BAD_REQUEST), null,
    [{ message: 'Invalid region and chapter' }]);
    return;
  }
  if (!validRegion){
    utils.sendResponse(res, httpStatus.BAD_REQUEST, 
      httpStatus.getStatusText(httpStatus.BAD_REQUEST), null,
    [{ message: 'Invalid region' }]);
    return;
  }
  if (!validChapter){
    console.log(' chapter')
    utils.sendResponse(res, httpStatus.BAD_REQUEST, 
      httpStatus.getStatusText(httpStatus.BAD_REQUEST), null,
    [{ message: 'Invalid chapter' }]);
    return;
  }
  console.log('woot woot!!')
  next();
}