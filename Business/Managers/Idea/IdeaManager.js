import httpStatus from 'http-status-codes';

const express = require('express');
const fileUpload = require('express-fileupload');
const Utils = require('../utils');
const gridfs = require('../../../db/grid-fs');

const app = express();
const Idea = require('../Idea/Models/idea');
const Team = require('../Team/Models/team');
const User = require('../User/Models/user');
const Challenge = require('../Admin/Models/challenge.model');

const mime = require('mime-types');

app.use(fileUpload());

function upload(req, res) {
  if (!req.files) return res.status(400).send('No files were uploaded.');
  gridfs.write(req, res);
}

function download(req, res) {
  if (req.user.isAdmin || req.user.isJudge || `${req.user.teamMember}.${mime.extension(mime.lookup(req.body.file))}` == req.body.file) gridfs.read(req, res);
  else Utils.send400('Unauthorized', res);
}

function createIdea(req, res) {
  Idea.findOne({ teamName: req.user.teamMember }, (err, ret) => {
    if (err) {
      Utils.send400(err, res);
      return;
    }
    if (ret) {
      Utils.send400('This team has already submitted an idea', res);
      return;
    }
    gridfs.replace(req, res);
  });
}

function editIdea(req, res) {
  Idea.findOne({ teamName: req.user.teamMember }, (err, ret) => {
    if (err) {
      Utils.send400(err, res);
      return;
    }
    if (!ret) {
      Utils.send400('This team does not have an idea yet.', res);
      return;
    }

    if (req.files) {
      gridfs.replace(req, res);
    } else {
      Idea.update({ teamName: req.user.teamMember }, { title: req.body.title, teamName: req.user.teamMember, description: req.body.description, category: req.body.challenge }, { new: true, upsert: true }, (err, doc) => {
        if (err) {
          Utils.send400('Cannot perform operation.', res);
          return;
        }
        res.status(200).json({
          status: '200',
          statustext: 'Ok',
          idea: doc
        });
      });
    }
  });
}
function getIdea(req, res) {
  console.log('teamName:  ',req.params.teamName)
  console.log('TeamName:  ',req.params.TeamName)
  console.log('teamMember:  ',req.user.teamMember)
  let teamName = req.params.TeamName ? req.params.TeamName : req.params.teamName;
  teamName = teamName == undefined ? req.user.teamMember : teamName;
  console.log(teamName)
  if (teamName == -1) {
    return Utils.sendResponse(res, httpStatus.BAD_REQUEST,
      httpStatus.getStatusText(httpStatus.BAD_REQUEST),
      null, [{ message: 'You do not have a team' }]);
  }
  Idea.find({ teamName }, (err, idea) => {
    if (err) {
      Utils.send400(err.message, res);
      return;
    }
    console.log(idea)
    if (idea.length == 0) {
      return Utils.sendResponse(res, httpStatus.NOT_FOUND,
        httpStatus.getStatusText(httpStatus.NOT_FOUND),
        null, [{ message: 'No ideas found' }]);
    }
    let index = 0;
    const list = [];
    idea.forEach((value) => {
      const query = Team.findOne({ name: value.teamName });
      query.exec((err, team) => {
        if (err) {
          Utils.send400(err.message, res);
          return;
        }
        if (team) {
          User.findOne({ _id: team.creator }, (err, user) => {
            if (err) {
              Utils.send400(err.message, res);
              return;
            }
            if (user) {
              const val = value.toObject();
              val.location = user.location;
              list.push(val);
            }
            index++;
            if (index == idea.length) {
              return res.status(200).json({
                status: '200',
                message: 'Success',
                body: list[0]
              });
            }
          });
        } else {
          index++;
        }
      });
    });
  });
}


function getAllIdeas(req, res) {
  Idea.find({}, (err, idea) => {
    if (err) {
      console.log('err: ', err.message);
      Utils.send400(err.message, res);
      return;
    }
    if (!idea || idea.length == 0) {
      console.log('err2: ', 'not idea');
      Utils.send400('Internal server error', res);
      return;
    }
    let index = 0;
    const list = [];
    idea.forEach((value) => {
      Team.findOne({ name: value.teamName }, (err, team) => {
        if (err) {
          Utils.send400(err.message, res);
        }
        User.findOne({ _id: team.creator }, (err, user) => {
          if (err) {
            Utils.send400(err.message, res);
          }
          if (user) {
            const val = value.toObject();
            val.location = user.location;
            list.push(val);
          }
          index++;
          if (index == idea.length) {
            return res.status(200).json({
              status: '200',
              message: 'Success',
              body: list
            });
          }
        });
      });
    });
  });
}
function getAllChallenges(req, res) {
  Challenge.find({}, (err, challenges) => {
    if (err) {
      console.log('err: ', err.message);
      Utils.send400(err.message, res);
      return;
    }
    return res.status(200).json({
      status: '200',
      message: 'Success',
      body: challenges
    });
  });
}
module.exports = {
  upload,
  download,
  createIdea,
  getIdea,
  editIdea,
  getAllIdeas,
  getAllChallenges
};
