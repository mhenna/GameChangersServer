import redis from '../../../../config/redis.config';
import utils from '../../utils';

async function isSubmissionDeadlineReached(req, res, next) {
  const now = new Date();
  const submissionDeadline = await redis.get('submission');
  if (now > new Date(submissionDeadline)) {
    utils.send400('deadline reached', res);
    return;
  }
  next();
}

module.exports = {
  isSubmissionDeadlineReached
};
