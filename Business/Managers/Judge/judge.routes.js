const express = require('express');
const JudgeManager = require('./JudgeManager');
const validate = require('express-validation');
const judgmentValidations = require('./Config/judgment.validations');



const router = express.Router(); // eslint-disable-line new-cap

router.route('/ideas')
  .get(JudgeManager.getIdeas);

router.route('/ideas/:id')
  .get(JudgeManager.getIdea); 

router.route('/submit')
  .post(validate(judgmentValidations.submit), JudgeManager.submitJudgment);

router.route('/assign-judge')
  .post(validate(judgmentValidations.assign), JudgeManager.assignIdeatoJudge);

module.exports = router;
