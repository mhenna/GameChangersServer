import mongoose from 'mongoose';
import httpStatus from 'http-status-codes';
import config from '../../../config/config';
import Team from './Models/team';
import User from '../User/Models/user';
// import MailService from '../../../Services/MailServer';
import Utils from '../utils';
import elasticsearch from '../../../Services/elasticsearch';
import Mail from '../../../Services/MailServer';

const esClient = elasticsearch.esClient;

export async function createTeam(req, res) {
  const uniqueMembers = [];
  if (req.user.teamMember == -1) {
    try {
      const user = await User.findOneAndUpdate({ email: req.user.email },
        { teamMember: req.body.teamName, creatorOf: req.body.teamName }, { new: true });

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
      for (let i = 0; i < members.length; i += 1) {
        const member = members[i];
        try {
          /* eslint-disable no-await-in-loop */
          const tempUser = await User.findOne({ email: member.email.toLowerCase() });
          if (tempUser != null) {
            try {
              const userTemp = await User.findOneAndUpdate({ email: member.email.toLowerCase() },
                { $set: { teamMember: req.body.teamName } }, { new: true });
              uniqueMembers.push(member);
              /* eslint-enable no-await-in-loop */
              Utils.updateUserIndex(userTemp);
            } catch (err) {
              return Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR,
                httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR), null, [{ message: 'couldn\'t update users team Name from database.' }]);
            }
          }
          if (tempUser == null) {
            try {
              const tempMember = new User({
                email: member.email,
                name: member.name,
                password: 'password123',
                passConf: 'password123',
                location: user.location,
                previousParticipation: 'no',
                teamMember: req.body.teamName,
                position: 'ww',
                chapter: 'ay kalam'
              });
              const body = ' account has been created with your email and password is password123 please change it after the first time you log in';
              Mail.sendEmail(member.email, 'account creation', body);
              /* eslint-disable no-await-in-loop */
              await tempMember.save();
              /* eslint-enable no-await-in-loop */
              uniqueMembers.push(member);
            } catch (err) {
              console.log(err, 'ERROORRRRRRRRRRRRRRRRRRRRRRR');
              return Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR,
                httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR), null, [{ message: 'couldn\'t create database.' }]);
            }
          }
        } catch (err) {
          return Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(
            httpStatus.INTERNAL_SERVER_ERROR
          ), null, [{ message: 'couldn\'t fetch users from database.' }]);
        }
      }
      try {
        const team = new Team({
          name: req.body.teamName,
          members: uniqueMembers,
          creator: user._id,
          allowOthers: req.body.allowOthers,
          lookingFor: req.body.lookingFor
        });
        await team.save();
      } catch (err) {
        return Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(
          httpStatus.INTERNAL_SERVER_ERROR
        ), null, [{ message: 'couldn\'t save team .' }]);
      }
    } catch (err) {
      return Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(
        httpStatus.INTERNAL_SERVER_ERROR
      ), null, [{ message: 'couldn\'t fetch users from database.' }]);
    }
    return Utils.sendResponse(res, httpStatus.OK, httpStatus.getStatusText(httpStatus.OK), { message: 'Team has been created.' });
  }
  return Utils.sendResponse(res, httpStatus.BAD_REQUEST,
    httpStatus.getStatusText(httpStatus.BAD_REQUEST),
    null, [{ message: 'you already have a team' }]);
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
      { $addToSet: { members: { email: req.user.email, name: req.user.name } } }, { new: true });
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
  console.log('JKHEKKJHKJHEKKEJHFKJEFHKJHKJFHEKHEKFJKEFHKLFEHK');
  console.log();
  console.log();
  console.log();
  console.log();
  console.log();
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase() });

    console.log(user);
    console.log();
    console.log();
    console.log();
    console.log();
    console.log();
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
      console.log('EMAILLLLLLLLLLLLLL', req.user.email);
      const team = req.user.isAdmin ? await Team.findOne({ teamName: req.params.teamName })
        : await Team.findOne({ creator: req.user.email });
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
    const teams = await Team.find({
      members: {
        $elemMatch: {
          email: req.user.email, accepted: false
        }
      }
    });
    const respTeams = [];
    for (let i = 0; i < teams.length; i++) {
      const team = teams[i];
      const creator = await User.find({ _id: team.creator });
      const respTeam = { creatorName: creator[0].email, ...team._doc };
      respTeams.push(respTeam);
    }

    return Utils.sendResponse(res, httpStatus.OK,
      httpStatus.getStatusText(httpStatus.OK), respTeams);
  } catch (err) {
    return Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR), null, [{ message: 'couldn\'t connect to the database' }]);
  }
}

export async function joinTeam(req, res) {
  try {
    const team = await Team.findOneAndUpdate({ name: req.body.teamName }, { $addToSet: { members: { email: req.user.email } } });
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
