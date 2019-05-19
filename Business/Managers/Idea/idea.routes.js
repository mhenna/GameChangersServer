import expressJwt from 'express-jwt';
import config from '../../../config/config';
import { isAdmin } from '../Admin/Config/admin.midddlewares';
import ideasMiddlewares from './Config/idea.middlewares';

const express = require('express');
const validate = require('express-validation');
const fileUpload = require('express-fileupload');
const IdeaManager = require('./IdeaManager');
const ideaValidation = require('./Config/idea.validations');


const router = express.Router(); // eslint-disable-line new-cap
router.use(fileUpload());
router.route('/upload')
  .post(IdeaManager.upload);

router.route('/download')
  .post(validate(ideaValidation.download), IdeaManager.download);

router.route('/new')
  .post(ideasMiddlewares.isSubmissionDeadlineReached, IdeaManager.createIdea);

router.route('/self')
  .get(IdeaManager.getIdea);

router.route('/challenges')
  .get(IdeaManager.getAllChallenges);

router.route('/edit')
  .post(ideasMiddlewares.isSubmissionDeadlineReached, IdeaManager.editIdea);

router.route('/allIdeas')
  .get(IdeaManager.getAllIdeas);

router.route('/admin-ideas/:teamName')
  .get(expressJwt({ secret: config.jwtSecret }), isAdmin, IdeaManager.getIdea);

router.route('/admin-ideas')
  .get(expressJwt({ secret: config.jwtSecret }), isAdmin, IdeaManager.getAllIdeas);

router.route('/:TeamName')
  .get(IdeaManager.getIdea);

module.exports = router;
