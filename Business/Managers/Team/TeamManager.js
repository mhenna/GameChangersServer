import mongoose from 'mongoose';
import httpStatus from 'http-status-codes';
import config from '../../../config/config';
import Team from './Models/team';
import User from '../User/Models/user';
// import MailService from '../../../Services/MailServer';
import Utils from '../utils';
import elasticsearch from '../../../Services/elasticsearch';

const esClient = elasticsearch.esClient;


export async function createTeam(req, res) {
  const teams = await Team.find({
    name: req.body.teamName
  });
  if (teams.length > 0) {
    return Utils.sendResponse(res, httpStatus.BAD_REQUEST,
      httpStatus.getStatusText(httpStatus.BAD_REQUEST),
      null, [{ message: 'Team name already exist' }]);
  }
  if (req.body.members.length > 5) {
    return Utils.sendResponse(res, httpStatus.BAD_REQUEST,
      httpStatus.getStatusText(httpStatus.BAD_REQUEST),
      null, [{ message: 'Team cannot have more than 5 members!' }]);
  }
  const members = req.body.members;
  const isAdmin = req.user.isAdmin;
  const emails = [];
  const uniqueMembers = [];
  if (!isAdmin) {
    uniqueMembers.push({ email: req.user.email, accepted: true });
  }
  for (let i = 0; i < members.length; i += 1) {
    const member = members[i];
    try {
      /* eslint-disable no-await-in-loop */
      const tempMemeber = await User.findOne({ email: member.email.toLowerCase() });
      /* eslint-enable no-await-in-loop */
      if (!tempMemeber) {
        return Utils.sendResponse(res, httpStatus.NOT_FOUND, httpStatus.getStatusText(
          httpStatus.NOT_FOUND
        ), null, [{ message: `${member.email} not found.` }]);
      }
      if (tempMemeber.isJudge || tempMemeber.isAdmin) {
        return Utils.sendResponse(res, httpStatus.BAD_REQUEST, httpStatus.getStatusText(
          httpStatus.BAD_REQUEST
        ), null, [{ message: `${member.email} is a judge or an admin.` }]);
      }
      if (!emails.includes(member.email)) {
        if (isAdmin) {
          member.accepted = true;
        }
        uniqueMembers.push(member);
        emails.push(member.email);
      }
      if (tempMemeber.teamMember !== '-1') {
        return Utils.sendResponse(res, httpStatus.BAD_REQUEST, httpStatus.getStatusText(
          httpStatus.BAD_REQUEST
        ), null, [{ message: `${tempMemeber.email} already has a team.` }]);
      }
    } catch (err) {
      return Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(
        httpStatus.INTERNAL_SERVER_ERROR
      ), null, [{ message: 'couldn\'t fetch users from database.' }]);
    }
  }
  const creatorId = new mongoose.mongo.ObjectId(req.user._id);
  const team = new Team({
    name: req.body.teamName,
    members: uniqueMembers,
    creator: creatorId
  });
  try {
    team.save();
    try {
      await User.findByIdAndUpdate({ _id: new mongoose.mongo.ObjectId(req.user._id) },
        { teamMember: req.body.teamName });
    } catch (err) {
      return Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(
        httpStatus.INTERNAL_SERVER_ERROR
      ), null, [{ message: 'couldn\'t update creator\'s teamMember field.' }]);
    }
    if (req.user.isAdmin) {
      for (let i = 0; i < uniqueMembers.length; i += 1) {
        const member = uniqueMembers[i];
        try {
          /* eslint-disable no-await-in-loop */
          const user = await User.findOneAndUpdate({ email: member.email.toLowerCase() },
            { $set: { teamMember: req.body.teamName } }, { new: true });
          /* eslint-enable no-await-in-loop */
          Utils.updateUserIndex(user);
        } catch (err) {
          return Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(
            httpStatus.INTERNAL_SERVER_ERROR
          ), null, [{ message: 'couldn\'t update users teamMember field.' }]);
        }
      }
    }
    if (!isAdmin) {
      const user = await User.findOneAndUpdate({ email: req.user.email },
        { $set: { teamMember: req.body.teamName } }, { new: true });
      /* eslint-enable no-await-in-loop */
      Utils.updateUserIndex(user);
    }
  } catch (err) {
    if (err.message === 'Validation failed') {
      return Utils.sendResponse(res, httpStatus.CONFLICT, httpStatus.getStatusText(
        httpStatus.CONFLICT
      ), null, [{ message: 'Team name already exist' }]);
    }

    return Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(
      httpStatus.INTERNAL_SERVER_ERROR
    ), null, [{ message: 'couldn\'t create team.' }]);
  }
  return Utils.sendResponse(res, httpStatus.OK, httpStatus.getStatusText(httpStatus.OK), { message: 'Team has been created.' });
}

export async function searchUsers(req, res) {
  const email = req.params.email.toLowerCase();
  try {
    const response = await esClient.search({
      index: config.esIndex,
      type: elasticsearch.userType,
      body: {
        size: 10,
        query: {
          bool: {
            must: [
              {
                wildcard: { email: `${email}*` }
              },
              {
                /* eslint-disable no-dupe-keys */
                term: {
                  teamMember: '-1'
                },
                term: {
                  isJudge: false
                },
                term: {
                  isAdmin: false
                }
                /* eslint-enable no-dupe-keys */
              },
            ],
          }
        },
      }
    });
    return Utils.sendResponse(res, httpStatus.OK,
      httpStatus.getStatusText(httpStatus.OK), response.hits.hits);
  } catch (err) {
    return Utils.sendResponse(res, httpStatus.BAD_REQUEST,
      httpStatus.getStatusText(httpStatus.BAD_REQUEST), null, err);
  }
}

export async function respondToInvitation(req, res) {
  const accepted = req.body.accepted;
  if (accepted === true) {
    return acceptInvitation(req, res);
  }
  return rejectInvitation(req, res);
}

async function acceptInvitation(req, res) {
  try {
    const team = await Team.findOneAndUpdate({ name: req.params.teamName },
      { $addToSet: { members: { accepted: true, email: req.user.email } } }, { new: true });
    if (!team) {
      return Utils.sendResponse(res, httpStatus.NOT_FOUND, httpStatus.getStatusText(
        httpStatus.NOT_FOUND
      ), null, [{ message: 'Team not found.' }]);
    }
    try {
      await Team.update({}, {
        $pull:
          {
            members:
              { accepted: false, email: req.user.email }
          }
      }, { multi: true });
      try {
        const user = await User.findOneAndUpdate({ email: req.user.email },
          { $set: { teamMember: req.params.teamName } }, { new: true });
        Utils.updateUserIndex(user);
        return Utils.sendResponse(res, httpStatus.OK,
          httpStatus.getStatusText(httpStatus.OK), { message: `Invitation to ${req.params.teamName} has been accepted!` });
      } catch (err) {
        return Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR,
          httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR), null, [{ message: 'couldn\'t update user\'s team.' }]);
      }
    } catch (err) {
      return Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR,
        httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR), null, [{ message: 'couldn\'t automatically reject other invitations.' }]);
    }
  } catch (err) {
    return Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR,
      httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR), null, [{ message: 'couldn\'t update team.' }]);
  }
}

async function rejectInvitation(req, res) {
  try {
    const team = await Team.findOneAndUpdate({ name: req.params.teamName },
      { $pull: { members: { accepted: false, email: req.user.email } } },
      { new: true });
    if (!team) {
      return Utils.sendResponse(res, httpStatus.NOT_FOUND, httpStatus.getStatusText(
        httpStatus.NOT_FOUND
      ), null, [{ message: 'Team not found.' }]);
    }
    return Utils.sendResponse(res, httpStatus.OK,
      httpStatus.getStatusText(httpStatus.OK), { message: `Invitation to ${req.params.teamName} has been rejected!` });
  } catch (err) {
    return Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR,
      httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR), null, [{ message: 'couldn\'t update team after user has rejected the invitation.' }]);
  }
}

// req has --> email of the user to be deleted from the team
export async function deleteTeamMember(req, res) {
  try {
    const user = await User.findOne({ email: req.params.email.toLowerCase() });
    if (!user) {
      return Utils.sendResponse(res, httpStatus.NOT_FOUND, httpStatus.getStatusText(
        httpStatus.NOT_FOUND
      ), null, [{ message: 'User not found.' }]);
    }
    try {
      const team = req.user.isAdmin ? await Team.findOne({ teamName: req.params.teamName })
        : await Team.findOne({ creator: req.user._id });
      if (!team) {
        return Utils.sendResponse(res, httpStatus.NOT_FOUND, httpStatus.getStatusText(
          httpStatus.NOT_FOUND
        ), null, [{ message: 'Team not found.' }]);
      }
      if (user._id.equals(team.creator)) {
        return Utils.sendResponse(res, httpStatus.BAD_REQUEST,
          httpStatus.getStatusText(httpStatus.BAD_REQUEST), null, [{ message: 'Cannot remove team creator.' }]);
      }
      const newMembers = [];
      for (let i = 0; i < team.members.length; i += 1) {
        if (team.members[i].email !== user.email) {
          newMembers.push(team.members[i]);
        }
      }
      if (team.members.length === newMembers.length) {
        return Utils.sendResponse(res, httpStatus.NOT_FOUND,
          httpStatus.getStatusText(httpStatus.NOT_FOUND), null, [{ message: 'Team does not contain the required user.' }]);
      }
      if (newMembers.length < 2) {
        return Utils.sendResponse(res, httpStatus.BAD_REQUEST,
          httpStatus.getStatusText(httpStatus.BAD_REQUEST), null, [{ message: 'Team must at least have 2 members.' }]);
      }
      team.members = newMembers;
      try {
        await team.save();
        user.teamMember = '-1';
        try {
          await user.save();
          Utils.updateUserIndex(user);
          return Utils.sendResponse(res, httpStatus.OK,
            httpStatus.getStatusText(httpStatus.OK), { team });
        } catch (err) {
          return Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR,
            httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR), null, [{ message: 'couldn\'t update user please try again!' }]);
        }
      } catch (err) {
        return Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR,
          httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR), null, [{ message: 'couldn\'t update team members please try again!' }]);
      }
    } catch (err) {
      return Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR,
        httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR), null, [{ message: 'couldn\'t fetch team please try again!' }]);
    }
  } catch (err) {
    return Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR,
      httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR), null, [{ message: 'couldn\'t fetch user please try again!' }]);
  }
}

export async function addTeamMember(req, res) {
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (!user) {
      return Utils.sendResponse(res, httpStatus.NOT_FOUND, httpStatus.getStatusText(
        httpStatus.NOT_FOUND
      ), null, [{ message: 'User not found.' }]);
    }
    if (user.teamMember !== '-1') {
      return Utils.sendResponse(res, httpStatus.BAD_REQUEST, httpStatus.getStatusText(
        httpStatus.BAD_REQUEST
      ), null, [{ message: 'User already has a team.' }]);
    }
    if (user.isJudge || user.isAdmin) {
      return Utils.sendResponse(res, httpStatus.BAD_REQUEST, httpStatus.getStatusText(
        httpStatus.BAD_REQUEST
      ), null, [{ message: `${user.email} is a judge or an admin.` }]);
    }
    try {
      const team = req.user.isAdmin ? await Team.findOne({ teamName: req.params.teamName })
        : await Team.findOne({ creator: req.user._id });
      if (!team) {
        return Utils.sendResponse(res, httpStatus.NOT_FOUND, httpStatus.getStatusText(
          httpStatus.NOT_FOUND
        ), null, [{ message: 'Team not found.' }]);
      }
      if (team.members.length >= 5) {
        return Utils.sendResponse(res, httpStatus.BAD_REQUEST, httpStatus.getStatusText(
          httpStatus.BAD_REQUEST
        ), null, [{ message: 'Team cannot have more than 5 members!' }]);
      }
      if (req.user.isAdmin) {
        team.members.push({ email: req.body.email, accepted: true });
        try {
          await Team.update({}, {
            $pull: {
              members: { $in: [{ accepted: false, email: req.user.email }] }
            }
          }, { multi: true });
          try {
            user.teamMember = team.name;
            await user.save();
            Utils.updateUserIndex(user);
          } catch (err) {
            return Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR,
              httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR), null, [{ message: 'couldn\'t update user please try again!' }]);
          }
        } catch (err) {
          return Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR,
            httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR), null, [{ message: 'couldn\'t automatically reject other invitations.' }]);
        }
      } else {
        team.members.push({ email: req.body.email, accepted: false });
      }
      try {
        await team.save();
        return Utils.sendResponse(res, httpStatus.OK,
          httpStatus.getStatusText(httpStatus.OK), { team });
      } catch (err) {
        return Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR,
          httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR), null, [{ message: 'couldn\'t save team please try again!' }]);
      }
    } catch (err) {
      return Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR,
        httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR), null, [{ message: 'couldn\'t fetch team please try again!' }]);
    }
  } catch (err) {
    return Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR,
      httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR), null, [{ message: 'couldn\'t fetch user please try again!' }]);
  }
}

export async function teamCreated(req, res) {
  try {
    const team = await Team.findOne({ creator: req.user._id }).populate('creator', 'email name').exec();
    if (!team) {
      return Utils.sendResponse(res, httpStatus.NOT_FOUND,
        httpStatus.getStatusText(httpStatus.NOT_FOUND), null, [{ message: 'You have not created a team!' }]);
    }
    return Utils.sendResponse(res, httpStatus.OK,
      httpStatus.getStatusText(httpStatus.OK), { team });
  } catch (err) {
    return Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR,
      httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR, null, [{ message: 'couldn\'t connect to the database' }]));
  }
}

export async function viewTeam(req, res) {
  try {
    const team = await Team.findOne({ name: req.params.teamName }).populate('creator', 'email name').exec();
    if (!team) {
      return Utils.sendResponse(res, httpStatus.NOT_FOUND,
        httpStatus.getStatusText(httpStatus.NOT_FOUND), null, [{ message: 'Team not found!' }]);
    }
    return Utils.sendResponse(res, httpStatus.OK,
      httpStatus.getStatusText(httpStatus.OK), { team });
  } catch (err) {
    return Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR), null, [{ message: 'couldn\'t connect to the database' }]);
  }
}

export async function viewInvitations(req, res) {
  
try {
    let teams = await Team.find({
      members: {
        $elemMatch: {
          email: req.user.email, accepted: false
        }
      }
    });
    let respTeams = []
 for(var i = 0 ;i<teams.length;i++){
   let team =teams[i];
    const creator = await User.find({_id:team.creator});
      let respTeam = {"creatorName":creator[0].email , ...team._doc}
      respTeams.push(respTeam)
    }
   
    return Utils.sendResponse(res, httpStatus.OK,
      httpStatus.getStatusText(httpStatus.OK),  respTeams );
  } catch (err) {
    return Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR), null, [{ message: 'couldn\'t connect to the database' }]);
  }
}

export async function joinTeam(req, res){
  try {
    const team = await Team.findOneAndUpdate({ name: req.body.teamName },{ $addToSet: { members: { email: req.user.email } } });
    if (!team) {
      return Utils.sendResponse(res, httpStatus.NOT_FOUND, httpStatus.getStatusText(
        httpStatus.NOT_FOUND
      ), null, [{ message: 'Team not found.' }]);
    }
    
    try {
      const user = await User.findOneAndUpdate({ email: req.user.email },
        { $set: { teamMember: req.body.teamName } }, { new: true });
      Utils.updateUserIndex(user);
      return Utils.sendResponse(res, httpStatus.OK,
        httpStatus.getStatusText(httpStatus.OK), { message: `Invitation to ${req.body.teamName} has been accepted!` });
    } catch (err) {
      return Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR,
        httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR), null, [{ message: 'couldn\'t update user\'s team.' }]);
    }
  } catch (err) {
    return Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR,
      httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR), null, [{ message: 'couldn\'t update team.' }]);
  }
}