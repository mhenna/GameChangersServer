import judgmentMiddlewares from './Config/judgement.middlewares';
import { isAdmin } from '../Admin/Config/admin.midddlewares';

const express = require('express');
const validate = require('express-validation');
const JudgeManager = require('./JudgeManager');
const judgmentValidations = require('./Config/judgment.validations');
const judgeMiddelwares = require('./Config/judge.middlewares');


const router = express.Router(); // eslint-disable-line new-cap

// router.route('/ideas/edit-judgements')
//   .post(JudgeManager.editIdeaJudgements);

router.route('/ideas')
  .get(JudgeManager.getIdeas);


router.route('/ideas/:teamName')
  .get(judgeMiddelwares.isJudge, JudgeManager.getIdea);

router.route('/submit')
  .post(validate(judgmentValidations.submit),
    judgeMiddelwares.isJudge, JudgeManager.submitJudgment);

router.route('/assign-judge')
  .post(validate(judgmentValidations.assign), isAdmin, JudgeManager.assignIdeatoJudge);

router.route('/get-questions')
  .get(JudgeManager.getQuestions);

module.exports = router;
