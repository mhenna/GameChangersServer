import redis from '../../../../config/redis.config';
import utils from '../../utils';

async function isJudgmentDeadlineReached(req, res, next) {
  const now = new Date();
  const judgmentDeadline = await redis.get('judge');
  if (now > new Date(judgmentDeadline)) {
    utils.send400('deadline reached', res);
    return;
  }
  next();
}

module.exports = {
  isJudgmentDeadlineReached
};
