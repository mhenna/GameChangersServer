import { Router } from 'express';
import validate from 'express-validation';
import {
  getAllUsers, getStats, download, viewIdea, viewUser, getTopIdeas, getAllTeams,
  addTeamMember, deleteTeamMember, getAllDomains, createDomain, removeDomain, updateDomain,
  createChallenge, removeChallenge, updateChallenge, getAllDeadlines, createDeadline,
  updateDeadline, getMail, updateMail, getAllJudges, isJudge, getJudge, createJudge,
  saveQuestions, addRegion, addChapter, deleteChapter
} from './AdminManager';
import {
  createDomain as _createDomain, removeDomain as _removeDomain, updateDomain as _updateDomain,
  createChallenge as _createChallenge, removeChallenge as _removeChallenge,
  updateChallenge as _updateChallenge, createDeadline as _createDeadline,
  updateDeadline as _updateDeadline, addTeamMember as _addTeamMember,
  deleteTeamMember as _deleteTeamMember, saveQuestions as _saveQuestions,
  updateMail as _updateMail, createJudge as _createJudge
} from './Config/admin.validations';

import { getAllIdeas } from '../Idea/IdeaManager';
import { validateMailDomain } from '../User/Config/user.middlewares';

const router = Router(); // eslint-disable-line new-cap

router.get('/test', (_, res) => {
  res.json({ message: 'OK' });
});

router.route('/users')
  .get(getAllUsers);

router.route('/stats')
  .get(getStats);


router.route('/user/viewIdea/download')
  .post(download);

router.route('/user/viewIdea/:email')
  .get(viewIdea);

router.route('/user/:email')
  .get(viewUser);

router.route('/topideas')
  .get(getTopIdeas);

router.route('/teams')
  .get(getAllTeams);

router.route('/addTeamMember/:teamName')
  .put(validate(_addTeamMember), addTeamMember);

router.route('/deleteTeamMember/:teamName')
  .put(validate(_deleteTeamMember), deleteTeamMember);
router.route('/edit-questions')
  .post(validate(_saveQuestions), saveQuestions);
router.route('/domains')
  .get(getAllDomains)
  .post(validate(_createDomain), createDomain);

router.route('/domains/:name')
  .delete(validate(_removeDomain), removeDomain)
  .put(validate(_updateDomain), updateDomain);

router.route('/challenges')
  // .get(getAllCategories)
  .post(validate(_createChallenge), createChallenge);

router.route('/challenges/:name')
  .delete(validate(_removeChallenge), removeChallenge)
  .put(validate(_updateChallenge), updateChallenge);

router.route('/deadlines')
  .get(getAllDeadlines)
  .post(validate(_createDeadline), createDeadline)
  .put(validate(_updateDeadline), updateDeadline);

router.route('/mail')
  .get(getMail)
  .put(validate(_updateMail), updateMail);
router.route('/judges/:judgeId')
  .get(getJudge);
router.route('/createNewJudge')
  .post(validate(_createJudge), createJudge);
router.route('/judges')
  .get(getAllJudges);
router.route('/users/:email/isJudge')
  .get(isJudge);
router.route('/ideas')
  .get(getAllIdeas);
router.route('/region')
  //.get(getAllRegions)
  .post(addRegion);
router.route('/chapter')
//   .get(getAllChapters)
  .post(addChapter)
  .delete(deleteChapter);
export default router;
