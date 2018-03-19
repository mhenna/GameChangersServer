const express = require('express');
const IdeaManager = require('./IdeaManager');
const ideaValidation = require('./Config/idea.validations');
const validate = require('express-validation');
const fileUpload = require('express-fileupload');

const router = express.Router(); // eslint-disable-line new-cap
router.use(fileUpload());
router.route('/upload')
  .post(IdeaManager.upload);

  router.route('/download')
  .post(validate(ideaValidation.download), IdeaManager.download);

  router.route('/new')
  .post(IdeaManager.createIdea);

  router.route('/')
  .get(IdeaManager.getIdea);
  module.exports = router;