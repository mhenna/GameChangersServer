import httpStatus from 'http-status-codes';
import Utils from '../../utils';

export function isAdmin(req, res, next) { // eslint-disable-line import/prefer-default-export
  if (req.user.isAdmin === true) {
    return next();
  }
  return Utils.sendResponse(res, httpStatus.UNAUTHORIZED,
    httpStatus.getStatusText(httpStatus.UNAUTHORIZED));
}
