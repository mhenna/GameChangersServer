import HttpStatus from 'http-status-codes';
import mongoose from 'mongoose';
import config from '../../../config/config';

const User = require('../User/Models/user');
const Idea = require('../Idea/Models/idea');
const Team = require('../Team/Models/team');
const Utils = require('../utils');
const Judgment = require('./Models/judgment');
const IdeaJudgment = require('./Models/ideajudgments');
const Question = require('../Admin/Models/judgment-questions.model');

async function getIdeas(req, res) {
  const body = [];
  let index = 0;
  try {
    const ideas = await Idea.find({ judgments: { $elemMatch: { judgeId: req.user._id } } });


    if (!ideas || ideas.length == 0) {
      return Utils.sendResponse(res, HttpStatus.NOT_FOUND, HttpStatus.getStatusText(HttpStatus.NOT_FOUND), null, [{ message: 'You dont\'t have any ideas assigned.' }]);
    }
    ideas.forEach((idea) => {
      const filtered = idea.judgments.filter(judgment => judgment.judgeId === req.user._id);
      body.push({
        title: idea.title,
        teamName: idea.teamName,
        score: filtered[0].score,
        challenge: idea.category
      });
      index += 1;
      if (index === ideas.length) {
        return Utils.sendResponse(res, HttpStatus.OK,
          HttpStatus.getStatusText(HttpStatus.OK), body);
      }
    });
    /* eslint-enable consistent-return */
  } catch (err) {
    return Utils.sendResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR), null, [{ message: 'error retrieving ideas' }]);
  }
}


async function getIdea(req, res) {
  try {
    const ideajudgment = await IdeaJudgment.findOne({
      teamName: req.params.teamName,
      judge: req.user._id
    });
    if (!ideajudgment) {
      return Utils.sendResponse(res, HttpStatus.NOT_FOUND, HttpStatus.getStatusText(HttpStatus.NOT_FOUND), null, [{ message: 'IdeaJudgment not found.' }]);
    }
    const idea = await Idea.findOne({ teamName: req.params.teamName });
    return res.status(200).json({
      status: '200',
      statustext: 'Ok',
      body: ideajudgment,
      idea
    });
  } catch (error) {
    return res.json({ state: 'error' });
  }
}


async function submitJudgment(req, res) {
  const questions = req.body.questions;
  let score = 0;
  questions.forEach((question) => {
    score += question.currentScore;
  });
  const currJudgeId = req.user._id;


  const body = {
    teamName: req.body.teamName,
    idea: new mongoose.mongo.ObjectId(req.body.ideaId),
    judge: new mongoose.mongo.ObjectId(req.user._id),
    totalScore: score,
    questions
  };
  try {
    const idea = await Idea.findOne({
      _id: req.body.ideaId,
      judgments: { $elemMatch: { judgeId: req.user._id } }
    });
    try {
      await IdeaJudgment.findOneAndUpdate({ judge: currJudgeId, idea: req.body.ideaId },
        body, { upsert: true, new: true, setDefaultsOnInsert: true });
      const judgments = idea.judgments.filter(judgment => judgment.judgeId !== req.user._id);
      judgments.push({
        judgeId: req.user._id,
        judgeEmail: req.user.email,
        judgeName: req.user.name,
        score
      });
      let ideaScore = 0;
      judgments.forEach((judgment) => {
        ideaScore += judgment.score !== -1 ? judgment.score : 0;
      });
      idea.judgments = judgments;
      idea.score = ideaScore / judgments.length;
      try {
        await idea.save();

        return Utils.sendResponse(res, HttpStatus.OK, HttpStatus.getStatusText(HttpStatus.OK), { state: 'OK' });
      } catch (err) {
        return Utils.sendResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR), null, [{ message: 'couldn\'t update idea.' }]);
      }
    } catch (err) {
      return Utils.sendResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR), null, [{ message: 'couldn\'t update/create IdeaJudgment.' }]);
    }
  } catch (err) {
    return Utils.sendResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR), null, [{ message: 'couldn\'t fetch idea.' }]);
  }
}

async function assignIdeatoJudge(req, res) {
  try {
    const idea = await Idea.findOne({ _id: req.body.ideaId });

    if (!idea) {
      Utils.sendResponse(res, HttpStatus.NOT_FOUND, HttpStatus.getStatusText(HttpStatus.NOT_FOUND), null, [{ message: 'Idea not found.' }]);
      return;
    }
    try {
      const judge = await User.findOne({ _id: req.body.judgeId });
      if (!judge) {
        Utils.sendResponse(res, HttpStatus.NOT_FOUND, HttpStatus.getStatusText(HttpStatus.NOT_FOUND), null, [{ message: 'Judge not found.' }]);
        return;
      }
      const judgments = idea.judgments.filter(judgment => judgment.judgeId === req.body.judgeId);
      if (judgments.length > 0) {
        Utils.sendResponse(res, HttpStatus.BAD_REQUEST, HttpStatus.getStatusText(HttpStatus.BAD_REQUEST), null, [{ message: 'Judge has already been assigned to this idea.' }]);
        return;
      }
      idea.judgments.push({
        judgeId: req.body.judgeId,
        judgeName: judge.name,
        judgeEmail: judge.email,
        score: -1
      });
      let ideaScore = 0;

      idea.judgments.forEach((judgment) => {
        ideaScore += judgment.score !== -1 ? judgment.score : 0;
      });
      idea.score = ideaScore / idea.judgments.length;
      try {
        await idea.save();
        
        try {
          const ideajudgment = new IdeaJudgment()
          ideajudgment.teamName = idea.teamName
          ideajudgment.idea = idea._id
          ideajudgment.judge = req.body.judgeId

          await ideajudgment.save()
        } catch (err) {
          Utils.sendResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR), null, [{ message: 'Error assigning judge to idea.' }]);
          return;
        }
        Utils.sendResponse(res, HttpStatus.OK,
          HttpStatus.getStatusText(HttpStatus.OK), { idea }, [{ message: 'judge added' }]);
        return;
      } catch (err) {
        console.log("IDEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", idea)
        console.log("ERRORRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR", err)
        Utils.sendResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR), null, [{ message: 'Error saving idea.' }]);
        return;
      }
    } catch (err) {
      Utils.sendResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR), null, [{ message: 'Error fetching judge.' }]);
      return;
    }
  } catch (err) {
    Utils.sendResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR), null, [{ message: 'Error fetching idea.' }]);
  }
}


async function getQuestions(req, res) {
  const judgmentQuestions = await Question.find({}, 'category question rate');
  return res.status(200).json({
    status: '200',
    message: 'Success',
    body: judgmentQuestions
  });
}

module.exports = {
  getIdeas,
  submitJudgment,
  getIdea,
  assignIdeatoJudge,
  getQuestions,
};
