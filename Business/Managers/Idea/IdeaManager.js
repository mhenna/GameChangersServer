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
  if (req.user.isAdmin || req.user.isJudge || `${req.user.teamMember}.${mime.extension(mime.lookup(req.body.file))}` == req.body.file) {
    gridfs.read(req, res);
  } 
  else 
  return Utils.sendResponse(res, httpStatus.UNAUTHORIZED, httpStatus.getStatusText(httpStatus.UNAUTHORIZED), 
    null, [{message: 'couldn\'t fetch corresponding team to create the idea'}]);
}

function createIdea(req, res) {
  try {
    Idea.findOne({ teamName: req.user.teamMember }, (err, ret) => {
      if (err) {
        return Utils.sendResponse(res, httpStatus.BAD_REQUEST, httpStatus.getStatusText(httpStatus.BAD_REQUEST),
          null, [{message: err}]);
      }
      if (ret) {
        return Utils.sendResponse(res, httpStatus.BAD_REQUEST, httpStatus.getStatusText(httpStatus.BAD_REQUEST),
          null, [{message: 'This team has already submitted an idea'}]);
      }
      if (req.user.teamMember !== req.user.creatorOf) {
        return Utils.sendResponse(res, httpStatus.UNAUTHORIZED, httpStatus.getStatusText(httpStatus.UNAUTHORIZED),
          null, [{message: 'Only the creator can add the idea'}]);
      }
  
      gridfs.replace(req, res);
    });
  } catch (err) {
    return Utils.sendResponse(res, httpStatus.BAD_REQUEST, httpStatus.getStatusText(httpStatus.BAD_REQUEST), 
      null, [{message: 'couldn\'t fetch corresponding team to create the idea'}]);
  }
}

function editIdea(req, res) {
  try{
    Idea.findOne({ teamName: req.user.teamMember }, (err, ret) => {
      if (err) {
        return Utils.sendResponse(res, httpStatus.BAD_REQUEST, httpStatus.getStatusText(httpStatus.BAD_REQUEST), 
        null, [{message: err}]);
      }
      if (!ret) {
        return Utils.sendResponse(res, httpStatus.BAD_REQUEST, httpStatus.getStatusText(httpStatus.BAD_REQUEST), 
        null, [{message: 'This team does not have an idea yet.'}]);
      }
      if (req.user.teamMember !== req.user.creatorOf) {
        return Utils.sendResponse(res, httpStatus.UNAUTHORIZED, httpStatus.getStatusText(httpStatus.UNAUTHORIZED), 
        null, [{message: 'Only the creator can edt the idea.'}]);
      }
      if (req.files) {
        gridfs.replace(req, res);
      } else {
        try {
          Idea.update({ teamName: req.user.teamMember }, 
            { 
              title: req.body.title, 
              teamName: req.user.teamMember, 
              description: req.body.description, 
              category: req.body.challenge 
            }, { new: true, upsert: true }, (err, doc) => {
            if (err) {
              return Utils.sendResponse(res, httpStatus.BAD_REQUEST, httpStatus.getStatusText(httpStatus.BAD_REQUEST), 
              null, [{message: err}]);
            }
            return Utils.sendResponse(res, httpStatus.OK, httpStatus.getStatusText(httpStatus.OK),{idea: doc})
          });
        } catch (err) {
          return Utils.sendResponse(res, httpStatus.BAD_REQUEST, httpStatus.getStatusText(httpStatus.BAD_REQUEST), 
            null, [{message: 'couldn\'t update database'}]);
        }
      }
    });
  } catch (err) {
    return Utils.sendResponse(res, httpStatus.BAD_REQUEST, httpStatus.getStatusText(httpStatus.BAD_REQUEST), 
      null, [{message: 'couldn\'t fetch idea of the corresponding team from database'}])
  }
}
function getIdea(req, res) {
  console.log('teamName:  ', req.params.teamName);
  console.log('TeamName:  ', req.params.TeamName);
  console.log('teamMember:  ', req.user.teamMember);
  let teamName = req.params.TeamName ? req.params.TeamName : req.params.teamName;
  teamName = teamName == undefined ? req.user.teamMember : teamName;
  console.log(teamName);
  if (teamName == -1) {
    return Utils.sendResponse(res, httpStatus.BAD_REQUEST,
      httpStatus.getStatusText(httpStatus.BAD_REQUEST),
      null, [{ message: 'You do not have a team' }]);
  }
  try {
    Idea.find({ teamName }, (err, idea) => {
      if (err) {
        return Utils.sendResponse(res, httpStatus.BAD_REQUEST, httpStatus.getStatusText(httpStatus.BAD_REQUEST), 
              null, [{message: err}]);
      }
      console.log(idea);
      if (idea.length == 0) {
        return Utils.sendResponse(res, httpStatus.NOT_FOUND,
          httpStatus.getStatusText(httpStatus.NOT_FOUND),
          null, [{ message: 'No ideas found' }]);
      }
      let index = 0;
      const list = [];
      idea.forEach((value) => {
        try {
          const query = Team.findOne({ name: value.teamName });
          query.exec((err, team) => {
            if (err) {
              return Utils.sendResponse(res, httpStatus.BAD_REQUEST, httpStatus.getStatusText(httpStatus.BAD_REQUEST), 
                null, [{message: err}]);
            }
            if (team) {
              try{
                User.findOne({ _id: team.creator }, (err, user) => {
                  if (err) {
                    return Utils.sendResponse(res, httpStatus.BAD_REQUEST, httpStatus.getStatusText(httpStatus.BAD_REQUEST), 
                      null, [{message: err}]);
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
              } catch (err) {
                  return Utils.sendResponse(res, httpStatus.BAD_REQUEST, httpStatus.getStatusText(httpStatus.BAD_REQUEST), 
                    null, [{message: 'couldn\'t fetch user - the creator of team - from database'}]);
              }
            } else {
              index++;
            }
          });
        } catch (err) {
            return Utils.sendResponse(res, httpStatus.BAD_REQUEST, httpStatus.getStatusText(httpStatus.BAD_REQUEST), 
              null, [{message: 'couldn\'t fetch team from database'}]);
        }
      });
    });
  } catch (err) {
      return Utils.sendResponse(res, httpStatus.BAD_REQUEST, httpStatus.getStatusText(httpStatus.BAD_REQUEST), 
        null, [{message: 'couldn\'t fetch idea of the corresponding team'}]);
  }
}


function getAllIdeas(req, res) {
  try {
    Idea.find({teamName: {$ne: '-1'}}, (err, idea) => {
      if (err) {
        console.log('err: ', err.message);
        return Utils.sendResponse(res, httpStatus.BAD_REQUEST, httpStatus.getStatusText(httpStatus.BAD_REQUEST), 
          null, [{message: err}]);
      }
      if (!idea || idea.length == 0) {
        console.log('err2: ', 'not idea');
        return  Utils.sendResponse(res, httpStatus.NOT_FOUND, httpStatus.getStatusText(httpStatus.NOT_FOUND), 
          null, [{message: 'No ideas found'}]);
      }
      let index = 0;
      const list = [];
      idea.forEach((value) => {
        try{
            Team.findOne({ name: value.teamName }, (err, team) => {
              if (err) {
                return Utils.sendResponse(res, httpStatus.BAD_REQUEST, httpStatus.getStatusText(httpStatus.BAD_REQUEST), 
                  null, [{message: err}]);
              }
              if (team==null){
                return  Utils.sendResponse(res, httpStatus.NOT_FOUND, httpStatus.getStatusText(httpStatus.NOT_FOUND), 
                  null, [{message: 'Team not found'}]);;
              }
              try{
                User.findOne({ _id: team.creator }, (err, user) => {
                  if (err) {
                    return Utils.sendResponse(res, httpStatus.BAD_REQUEST, httpStatus.getStatusText(httpStatus.BAD_REQUEST), 
                      null, [{message: err}]);
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
              } catch (err) {
                  return Utils.sendResponse(res, httpStatus.BAD_REQUEST, httpStatus.getStatusText(httpStatus.BAD_REQUEST), 
                    null, [{message: 'couldn\'t fetch user - the creator of team - from database'}]);
              }
            });

        } catch (err) {
            return Utils.sendResponse(res, httpStatus.BAD_REQUEST, httpStatus.getStatusText(httpStatus.BAD_REQUEST), 
              null, [{message: 'couldn\'t fetch team from database'}]);
        }
      });
    });
  } catch (err) {
      return Utils.sendResponse(res, httpStatus.BAD_REQUEST, httpStatus.getStatusText(httpStatus.BAD_REQUEST), 
        null, [{message: 'couldn\'t fetch ideas from database'}]);
  }
}
function getAllChallenges(req, res) {
  try {
    Challenge.find({}, (err, challenges) => {
      if (err) {
        console.log('err: ', err);
        return Utils.sendResponse(res, httpStatus.BAD_REQUEST, httpStatus.getStatusText(httpStatus.BAD_REQUEST), 
          null, [{message: err}]);;
      }
      return res.status(200).json({
        status: '200',
        message: 'Success',
        body: challenges
      });
    });
  } catch (err) {
      return Utils.sendResponse(res, httpStatus.BAD_REQUEST, httpStatus.getStatusText(httpStatus.BAD_REQUEST), 
        null, [{message: 'couldn\'t fetch categories from database'}]);
  }
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
