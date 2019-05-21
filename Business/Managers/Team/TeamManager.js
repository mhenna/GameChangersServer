import mongoose from 'mongoose';
import httpStatus from 'http-status-codes';
import jwt from 'jsonwebtoken';
import config from '../../../config/config';
import Team from './Models/team';
import User from '../User/Models/user';
// import MailService from '../../../Services/MailServer';
import Utils from '../utils';
import elasticsearch from '../../../Services/elasticsearch';
import Mail from '../../../Services/MailServer';
import forgotPassword2 from '../User/UserManager';

const esClient = elasticsearch.esClient;

export async function createTeam(req, res) {
  const uniqueMembers = [];
  let user;
  if (req.user.teamMember == -1) {
    try {
      user = await User.findOneAndUpdate({ email: req.user.email },
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
      if (req.body.members.length < 1) {
        return Utils.sendResponse(res, httpStatus.BAD_REQUEST,
          httpStatus.getStatusText(httpStatus.BAD_REQUEST),
          null, [{ message: 'Team cannot have less than 2 members!' }]);
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

              Utils.updateUserIndex(userTemp);
              const body = `Hi ${member.name}, /nWe are excited to let you know that ${req.user.name} has added you as a member of the GameChangers ${req.body.teamName
              } team. \nFor more details about the competition, visit https://inside.dell.com/groups/gamechangers at Inside Dell.\nWe look forward to your participation.\nGameChangers 2019`;
              await Mail.sendEmail(member.email, 'Welcome to GameChangers 2019!', body);
              /* eslint-enable no-await-in-loop */
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
                region: user.region,
                chapter: user.chapter,
                previousParticipation: 'no',
                teamMember: req.body.teamName
              });
              await tempMember.save();

              newUser(tempMember, req.user.name, req.body.teamName);

              // /* eslint-disable no-await-in-loop */
              // await tempMember.save();

              // const request = {
              //   body: {
              //     "email" : member.email
              //   }
              // }
              // console.log('helloooooooooooooooooooooooooooooo')
              // forgotPassword2(member.email, res)
              // console.log('afterrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr')
              // const body = "Hi "+member.name +", \nWe are excited to let you know that "+ req.user.name +" has added you as a member of the GameChangers "+ req.body.teamName +
              // " team. \nYou can log in to your account at http://ec2-54-153-49-90.us-west-1.compute.amazonaws.com with the following credentials:\nemail: " + member.email +
              // "\npassword: password123 \nFor more details about the competition, visit https://inside.dell.com/groups/gamechangers at Inside Dell.\nWe look forward to your participation.\nGameChangers 2019";
              // Mail.sendEmail(member.email, 'Welcome to GameChangers 2019!', body);
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
          lookingFor: req.body.lookingFor,
          region: user.region,
          chapter: user.chapter
        });
        await team.save();
      } catch (err) {
        console.log(err);
        return Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(
          httpStatus.INTERNAL_SERVER_ERROR
        ), null, [{ message: 'couldn\'t save team .' }]);
      }
    } catch (err) {
      return Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(
        httpStatus.INTERNAL_SERVER_ERROR
      ), null, [{ message: 'couldn\'t fetch users from database.' }]);
    }
    const token = jwt.sign(user.toJSON(), config.jwtSecret);
    return Utils.sendResponse(res, httpStatus.OK, httpStatus.getStatusText(httpStatus.OK), { message: 'Team has been created.', token });
  }
  return Utils.sendResponse(res, httpStatus.BAD_REQUEST,
    httpStatus.getStatusText(httpStatus.BAD_REQUEST),
    null, [{ message: 'you already have a team' }]);
}

async function newUser(user, teamLeader, teamName) {
  console.log('63287g23urg92fgudegf92o3fgdwgf3qwgeogfw');

  const token = await Utils.getRandomToken();

  await User.findByIdAndUpdate({ _id: user._id },
    { resetPasswordToken: token, resetPasswordExpires: Date.now() + 86400000 },
    { upsert: true, new: true });
  /**
     * TODO send a mail to the user containing the token.
     */
  // const body = "Hi "+member.name +", \nWe are excited to let you know that "+ req.user.name +" has added you as a member of the GameChangers "+ req.body.teamName +
  // " team. \nYou can log in to your account at http://ec2-54-153-49-90.us-west-1.compute.amazonaws.com with the following credentials:\nemail: " + member.email +
  // "\npassword: password123 \nFor more details about the competition, visit https://inside.dell.com/groups/gamechangers at Inside Dell.\nWe look forward to your participation.\nGameChangers 2019";
  const body = `Hi ${user.name} ,
        We are excited to let you know that ${teamLeader} has added you as a member of the\n GameChangers ${teamName} team.
      Please follow this link to set a password and be able to login to your account
      http://ec2-54-153-49-90.us-west-1.compute.amazonaws.com/#/reset-password/${token}
      For more details about the competition, visit https://inside.dell.com/groups/gamechangers at Inside Dell.
      We look forward to your participation.
      GameChangers 2019
    Regards,
      `;

  // mailService.sendEmail(user.email, "Password reset", body)
  //   .then(message => res.status(200).json({ message, token }))
  //   .catch(error => res.status(500).json({ message: error }));
  // if (process.env.ENVIRONMENT === 'testing') {
  //   Utils.sendResponse(res, httpStatus.OK, httpStatus.getStatusText(httpStatus.OK),
  //     token);
  //   return;
  // }

  Mail.sendEmail(user.email, 'Password Set', body);
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
  let user = {};
  console.log(req.user, 'REQUSER');
  try {
    const team = req.user.isAdmin ? await Team.findOne({ teamName: req.params.teamName })
      : await Team.findOne({ creator: req.user._id });

    console.log('TEAM', team);
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
    try {
      user = await User.findOne({ email: req.body.email.toLowerCase() });
      if (user == null) {
        const tempMember = new User({
          email: req.body.email,
          name: req.body.name,
          password: 'password123',
          passConf: 'password123',
          region: req.user.region,
          chapter: req.user.chapter,
          previousParticipation: 'no',
          teamMember: req.user.teamMember
        });
        await tempMember.save();
        try {
        // newUser(tempMember, req.user.name, req.body.teamName);
          const rests = await Team.findOneAndUpdate({ creator: req.user._id }, {
            $push: { members: { email: req.body.email, name: req.body.name } }

          });
          console.log('new team', rests);
          return Utils.sendResponse(res, httpStatus.OK,
            httpStatus.getStatusText(httpStatus.OK), { rests });
        } catch (error) {
          return Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR,
            httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR), null, [{ message: 'couldn\'t automatically reject other invitations.' }]);
        }
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
        const rest = await Team.findOneAndUpdate({ creator: req.user._id }, {
          $push: { members: { email: req.body.email, name: req.body.name } }
        });

        console.log('TEAM NEW', rest);
        await user.findByIdAndUpdate(user._id, { teamMember: team.name });
        Utils.updateUserIndex(user);
        return Utils.sendResponse(res, httpStatus.OK,
          httpStatus.getStatusText(httpStatus.OK), { rest });
      } catch (err) {
        return Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR,
          httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR), null, [{ message: 'couldn\'t automatically reject other invitations.' }]);
      }
    } catch (error) {
      return Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR,
        httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR), null, [{ message: `${error} couldn't fetch user please try again!` }]);
    }
  } catch (err) {
    return Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR,
      httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR), null, [{ message: 'couldn\'t fetch team please try again!' }]);
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


export async function deleteTeam(req, res) {
  try {
    const team = await Team.findOne({ name: req.body.teamName, creator: req.user._id });
    if (!team) {
      console.log(req.user._id);
      return Utils.sendResponse(res, httpStatus.NOT_FOUND,
        httpStatus.getStatusText(httpStatus.NOT_FOUND), null, [{ message: 'Team not found or you have no authority to remove it!' }]);
    }

    try {
      for (let i = 0; i < team.members.length; i++) {
        /* eslint-disable no-await-in-loop */
        const user = await User.findOneAndUpdate({ email: team.members[i].email.toLowerCase() },
          { $set: { teamMember: '-1' } }, { new: true });
        /* eslint-enable no-await-in-loop */
        Utils.updateUserIndex(user);
      }
    } catch (err) {
      return Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(
        httpStatus.INTERNAL_SERVER_ERROR
      ), null, [{ message: 'couldn\'t update users teamMember field.' }]);
    }

    await team.remove();
    return Utils.sendResponse(res, httpStatus.OK,
      httpStatus.getStatusText(httpStatus.OK), { message: `Team ${req.body.teamName} has been deleted!` });
  } catch (err) {
    return Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR), null, [{ message: 'couldn\'t connect to the database' }]);
  }
}

export async function joinTeam(req, res) {
  let team;
  try {
    team = await Team.findOneAndUpdate({ name: req.body.teamName },
      { $addToSet: { members: { email: req.user.email } } });
    if (!team) {
      return Utils.sendResponse(res, httpStatus.NOT_FOUND, httpStatus.getStatusText(
        httpStatus.NOT_FOUND
      ), null, [{ message: 'Team not found.' }]);
    }

    try {
      const user = await User.findOneAndUpdate({ email: req.user.email },
        { $set: { teamMember: req.body.teamName } }, { new: true });
      Utils.updateUserIndex(user);
      const token = jwt.sign(user.toJSON(), config.jwtSecret);
      try {
        const creator = await User.findById(team.creator);
        const body = `Hi ${creator.name},\n We are excited to let you know that ${req.user.name} has joined your GameChangers ${req.body.teamName
        } team.\nWe recommend you contact them at ${creator.email
        } to share your idea and learn how they can enhance your idea development.\nFor more details about the competition, visit https://inside.dell.com/groups/gamechangers at Inside Dell.`
          + '\nWishing you and your team success!\nGameChangers 2019';
        await Mail.sendEmail(creator.email, 'Your GameChangers team has grown!', body);
      } catch (err) {
        console.log(err);
        return Utils.sendResponse(res, httpStatus.NOT_FOUND, httpStatus.getStatusText(
          httpStatus.NOT_FOUND
        ), null, [{ message: 'can\'t email team creator' }]);
      }
      return Utils.sendResponse(res, httpStatus.OK,
        httpStatus.getStatusText(httpStatus.OK), { message: `Invitation to ${req.body.teamName} has been accepted!`, token });
    } catch (err) {
      return Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR,
        httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR), null, [{ message: 'couldn\'t update user\'s team.' }]);
    }
  } catch (err) {
    return Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR,
      httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR), null, [{ message: 'couldn\'t update team.' }]);
  }
}

export async function getAllTeams(_, res) {
  try {
    const teams = await Team.find().populate('creator', 'email name');
    Utils.sendResponse(res, httpStatus.OK, httpStatus.getStatusText(httpStatus.OK),
      teams);
  } catch (error) {
    Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(
      httpStatus.INTERNAL_SERVER_ERROR
    ), null, [{ message: 'couldn\'t connect to the database' }]);
  }
}

export async function editTeam(req, res) {
  console.log(req.user.email);
  try {
    const team = await Team.findOne(
      {
        name: req.body.teamName,
        // creator: req.user.email
      }
    );
    team.allowOthers = req.body.allowOthers;
    team.lookingFor = req.body.lookingFor;
    await team.save();
    return Utils.sendResponse(res, httpStatus.OK,
      httpStatus.getStatusText(httpStatus.OK), { message: 'Team updated', team });
  } catch (err) {
    console.log(err);
    return Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR,
      httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR), null, [{ message: 'couldn\'t fetch team please try again!' }]);
  }
}
