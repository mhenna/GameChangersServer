const Team = require('../Team/Models/team');
const User = require('../User/Models/user');
const MailService = require('../../../Services/MailServer');
const Utils = require('../utils')

function createTeam(req, res, next) {

    if(req.body.members.length > 5)
    {
        Utils.send400('Maximum team size is 6', res);
        return;
    }
    let team = new Team({ name: req.body.teamName, creator: req.user._id, members: req.body.members });
    
    team.save(function (err){
      if(err) {
        const uniqueColumnKey = Object.keys(err.errors)[0];
        Utils.send400(err.errors[uniqueColumnKey].message, res);
        return;
      }else {
        // TODO: send proper email title and body
        for (let i = 0; i < req.body.members.length; i++) {
          MailService.sendEmail(req.body.members[i].email, '*title*', '*body*');
        }
        User.findOneAndUpdate({ _id: req.user._id }, { $set: { creatorOf: req.body.teamName } }, { new: true } , function(err, doc) {
          if (err) {
            Utils.send400("ERROR UPDATING USER");
          }
          else {
            res.status(200).json({
              status: '200',
              statustext: 'Ok'
            });
          }
        });
      }
    });
  }

  // req has --> email of the user to be deleted from the team
  function deleteTeamMember(req, res, next) {
    Team.findOne({ creator: req.user._id }, (err, team) => {
      if (err) { 
        Utils.send400('User does not have a team.', res); 
        return;
      }
      let newMembers = []
      for (let i = 0; i < team.members.length; i++) { 
        if(team.members[i].email != req.body.email)
          newMembers.push(team.members[i]);
      }
      if(team.members.length == newMembers.length)
      {
        Utils.send400('Team does not contain the required user.', res);
        return;
      }
      if(newMembers < 1)
      {
        Utils.send400('A team cannot have less than two members.',res);
        return
      } 
      Team.findOneAndUpdate({ creator: req.user._id }, { $set: { members: newMembers } }, { new: true }, function(err, doc){
        if(err){
            Utils.send400('Cannot perform operation -delete member from team-.', res);
            return;
        }
        User.findOneAndUpdate({ email: req.body.email }, { $set: { teamMember: 0 } }, function(err, user) {
          if(err) {
            Utils.send400('Cannot perform operation -default value for team member-.', res);
            return;
          }
        });
        res.status(200).json({
          status: '200',
          statustext: 'Ok',
          team: doc
        });
      });
    });
  }

  function addTeamMember(req, res, next) {
    Team.findOne({ creator: req.user._id }, (err, team) => {
      if (err) { 
        Utils.send400('User does not have a team.', res); 
        return;
      }

      // check the numbe of members, if 5 then return
      if (team.members.length >= 5) {
        Utils.send400('Maximum of 5 members is allowed per team.', res); 
        return;
      }
      team.members.push({ email: req.body.email, accepted: false });

      Team.findOneAndUpdate({ creator: req.user._id }, { $set: { members: team.members } }, { new: true }, function(err, doc){
        if(err){
            Utils.send400('Cannot perform operation -add member to team-.', res);
            return;
        }
        // TODO: send proper email title and body
        MailService.sendEmail(req.body.email, 'Sa3eeda', 'Sa3eeda Body from https://www.google.com');
        res.status(200).json({
          status: '200',
          statustext: 'Ok',
          team: doc
        });
      });
    });
  }

  function viewTeamMembers(req, res, next) {
    Team.findOne({ creator: req.user._id }, (err, team) => {
      if (err) { 
        Utils.send400('User does not have a team.', res); 
        return;
      }
      res.status(200).json({
        status: '200',
        statustext: 'Ok',
        team: team
      });
    })
  }

  function viewTeam(req, res, next) {
    Team.findOne({ name: req.user.teamMember }, (err, team) => {
      if (err) { 
        Utils.send400('User does not have a team.', res); 
        return;
      }
      res.status(200).json({
        status: '200',
        statustext: 'Ok',
        team: team
      });
    })
  }

  module.exports = {
    createTeam,
    deleteTeamMember,
    addTeamMember,
    viewTeamMembers,
    viewTeam
  };
