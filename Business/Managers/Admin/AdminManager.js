import httpStatus from 'http-status-codes';
import config from '../../../config/config';
import Idea from '../Idea/Models/idea';
import Utils from '../utils';
import Team from '../Team/Models/team';
import User from '../User/Models/user';
import Judgment from '../Judge/Models/judgment';
import Domain from './Models/domain.model';
import Challenge from './Models/challenge.model';
import gridfs from '../../../db/grid-fs';
import Deadline from './Models/deadline.model';
import Mail from './Models/mail.model';
import redis from '../../../config/redis.config';
import Question from './Models/judgment-questions.model';
import elasticsearch from '../../../Services/elasticsearch';
import Region from './Models/region.model';
import Chapter from './Models/chapter.model';
import SendMail from '../../../Services/MailServer'


const esClient = elasticsearch.esClient;


export async function getAllUsers(_, res) {
  try {
    const users = await User.find({}, 'name email region chapter teamMember');
    Utils.sendResponse(res, httpStatus.OK, httpStatus.getStatusText(httpStatus.OK),
      users);
  } catch (error) {
    Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(
      httpStatus.INTERNAL_SERVER_ERROR
    ), null, [{ message: 'couldn\'t connect to the database' }]);
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
export async function getAllTeamsR(req, res) {
  try {
    const teams = await Team.find({ region: req.params.region }).populate('creator', 'email name');
    Utils.sendResponse(res, httpStatus.OK, httpStatus.getStatusText(httpStatus.OK),
      teams);
  } catch (error) {
    Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(
      httpStatus.INTERNAL_SERVER_ERROR
    ), null, [{ message: 'couldn\'t connect to the database' }]);
  }
}
export async function getAllTeamsC(req, res) {
  try {
    const teams = await Team.find({ chapter: req.params.chapter }).populate('creator', 'email name');
    Utils.sendResponse(res, httpStatus.OK, httpStatus.getStatusText(httpStatus.OK),
      teams);
  } catch (error) {
    Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(
      httpStatus.INTERNAL_SERVER_ERROR
    ), null, [{ message: 'couldn\'t connect to the database' }]);
  }
}

export async function getAllDomains(req, res) {
  try {
    const domains = await Domain.find({});
    Utils.sendResponse(res, httpStatus.OK, httpStatus.getStatusText(httpStatus.OK),
      domains);
  } catch (error) {
    Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(
      httpStatus.INTERNAL_SERVER_ERROR
    ), null, [{ message: 'couldn\'t connect to the database' }]);
  }
}
export async function getAllUsersC(req, res) {
  try {
    const users = await User.find({ chapter: req.params.chapter });
    Utils.sendResponse(res, httpStatus.OK, httpStatus.getStatusText(httpStatus.OK),
      users);
  } catch (error) {
    Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(
      httpStatus.INTERNAL_SERVER_ERROR
    ), null, [{ message: 'couldn\'t connect to the database' }]);
  }
}
export async function getAllUsersR(req, res) {
  try {
    const users = await User.find({ region: req.params.region });
    Utils.sendResponse(res, httpStatus.OK, httpStatus.getStatusText(httpStatus.OK),
      users);
  } catch (error) {
    Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(
      httpStatus.INTERNAL_SERVER_ERROR
    ), null, [{ message: 'couldn\'t connect to the database' }]);
  }
}

export async function createDomain(req, res) {
  const domain = new Domain({
    name: req.body.name
  });
  try {
    await domain.save();
    Utils.sendResponse(res, httpStatus.OK, httpStatus.getStatusText(httpStatus.OK));
  } catch (error) {
    const uniqueColumnKey = Object.keys(error.errors)[0];
    Utils.sendResponse(res, httpStatus.BAD_REQUEST, httpStatus.getStatusText(
      httpStatus.BAD_REQUEST
    ), null, [{ message: error.errors[uniqueColumnKey].message }]);
  }
}

export async function removeDomain(req, res) {
  try {
    const domain = await Domain.findOneAndRemove({
      name: req.params.name
    });
    if (domain) {
      Utils.sendResponse(res, httpStatus.NO_CONTENT,
        httpStatus.getStatusText(httpStatus.NO_CONTENT));
      return;
    }
    Utils.sendResponse(res, httpStatus.NOT_FOUND, httpStatus.getStatusText(httpStatus.NOT_FOUND));
  } catch (error) {
    Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(
      httpStatus.INTERNAL_SERVER_ERROR
    ), null, [{ message: 'couldn\'t connect to the database' }]);
  }
}

export async function updateDomain(req, res) {
  try {
    const domain = await Domain.findOneAndUpdate({
      name: req.params.name
    }, {
        name: req.body.name
      }, {
        new: true
      });
    if (domain) {
      Utils.sendResponse(res, httpStatus.OK,
        httpStatus.getStatusText(httpStatus.OK));
      return;
    }
    Utils.sendResponse(res, httpStatus.NOT_FOUND,
      httpStatus.getStatusText(httpStatus.NOT_FOUND));
  } catch (error) {
    Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(
      httpStatus.INTERNAL_SERVER_ERROR
    ), null, [{ message: 'couldn\'t connect to the database' }]);
  }
}

export async function createChallenge(req, res) {
  const challenge = new Challenge({
    name: req.body.name
  });
  try {
    await challenge.save();
    Utils.sendResponse(res, httpStatus.OK,
      httpStatus.getStatusText(httpStatus.OK));
  } catch (error) {
    Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(
      httpStatus.INTERNAL_SERVER_ERROR
    ), null, [{ message: 'couldn\'t connect to the database' }]);
  }
}

export async function removeChallenge(req, res) {
  try {
    const challenge = await Challenge.findOneAndRemove({
      name: req.params.name
    });
    if (challenge) {
      Utils.sendResponse(res, httpStatus.NO_CONTENT,
        httpStatus.getStatusText(httpStatus.NO_CONTENT));
      return;
    }
    Utils.sendResponse(res, httpStatus.NOT_FOUND, httpStatus.getStatusText(httpStatus.NOT_FOUND));
  } catch (error) {
    Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(
      httpStatus.INTERNAL_SERVER_ERROR
    ), null, [{ message: 'couldn\'t connect to the database' }]);
  }
}

export async function updateChallenge(req, res) {
  try {
    const challenge = await Challenge.findOneAndUpdate({
      name: req.params.name
    }, {
        name: req.body.name
      }, {
        new: true
      });
    if (challenge) {
      Utils.sendResponse(res, httpStatus.OK,
        httpStatus.getStatusText(httpStatus.OK));
      return;
    }
    Utils.sendResponse(res, httpStatus.NOT_FOUND,
      httpStatus.getStatusText(httpStatus.NOT_FOUND));
  } catch (error) {
    Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(
      httpStatus.INTERNAL_SERVER_ERROR
    ), null, [{ message: 'couldn\'t connect to the database' }]);
  }
}

export async function viewUser(req, res) {
  try {
    const user = await User.findOne({
      email: req.params.email
    });
    if (user) {
      Utils.sendResponse(res, httpStatus.OK,
        httpStatus.getStatusText(httpStatus.OK), user);
      return;
    }
    Utils.sendResponse(res, httpStatus.NOT_FOUND, httpStatus.getStatusText(
      httpStatus.NOT_FOUND
    ), null, [{ message: 'User not found' }]);
  } catch (error) {
    Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(
      httpStatus.INTERNAL_SERVER_ERROR
    ), null, [{ message: 'couldn\'t connect to the database' }]);
  }
}

export async function viewTeam(req, res) {
  try {
    const team = await Team.findOne({
      email: req.params.teamName
    });
    if (team) {
      Utils.sendResponse(res, httpStatus.OK,
        httpStatus.getStatusText(httpStatus.OK), team);
      return;
    }
    Utils.sendResponse(res, httpStatus.NOT_FOUND, httpStatus.getStatusText(
      httpStatus.NOT_FOUND
    ), null, [{ message: 'Team not found' }]);
  } catch (error) {
    Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(
      httpStatus.INTERNAL_SERVER_ERROR
    ), null, [{ message: 'couldn\'t connect to the database' }]);
  }
}

export async function viewIdea(req, res) {
  try {
    const user = await User.findOne({
      email: req.params.email
    });
    if (!user) {
      Utils.sendResponse(res, httpStatus.NOT_FOUND, httpStatus.getStatusText(
        httpStatus.NOT_FOUND
      ), null, [{ message: 'User not found' }]);
      return;
    }
    try {
      const idea = await Idea.find({
        teamName: user.teamMember
      });
      if (!idea) {
        Utils.sendResponse(res, httpStatus.NOT_FOUND, httpStatus.getStatusText(
          httpStatus.NOT_FOUND
        ), null, [{ message: 'Idea not found' }]);
        return;
      }
      if (idea.length === 0) {
        Utils.sendResponse(res, httpStatus.NOT_FOUND, httpStatus.getStatusText(
          httpStatus.NOT_FOUND
        ), null, [{ message: 'no idea for this user' }]);
        return;
      }
      Utils.sendResponse(res, httpStatus.OK,
        httpStatus.getStatusText(httpStatus.OK), idea);
      return;
    } catch (error) {
      Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(
        httpStatus.INTERNAL_SERVER_ERROR
      ), null, [{ message: 'couldn\'t connect to the database' }]);
    }
  } catch (error) {
    Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(
      httpStatus.INTERNAL_SERVER_ERROR
    ), null, [{ message: 'couldn\'t connect to the database' }]);
  }
}

export function download(req, res) {
  gridfs.read(req, res);
}
export async function getStats(req, res) {
  const stats = await redis.get('stats');

  if (!stats) {
    const users = await User.find({});
    const ideas = await Idea.find({});
    const teams = await Team.find({});
    const judges = users.filter(user => user.isJudge);
    const ideasUnjudged = ideas.filter(idea => idea.score === -1);
    const response = {
      numberOfUsers: users.length,
      numberOfJudges: judges.length,
      numberofTeamsThatSubmittedIdeas: ideas.length,
      numberofTeamsThatDidntSubmittedIdeas: teams.length - ideas.length,
      numberOfUnjudgedIdeas: ideasUnjudged.length,
      numberOfJudgedIdeas: (ideas.length - ideasUnjudged.length)
    };
    redis.setSiteStatistics(response);
    return Utils.sendResponse(res, httpStatus.OK,
      httpStatus.getStatusText(httpStatus.OK), response);
  }
  return Utils.sendResponse(res, httpStatus.OK,
    httpStatus.getStatusText(httpStatus.OK), JSON.parse(stats));
}

export async function getAllDeadlines(_, res) {
  try {
    const deadlines = await Deadline.findOne({});
    Utils.sendResponse(res, httpStatus.OK, httpStatus.getStatusText(
      httpStatus.OK
    ), deadlines);
  } catch (error) {
    Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(
      httpStatus.INTERNAL_SERVER_ERROR
    ), null, [{ message: 'couldn\'t connect to the database' }]);
  }
}

export async function createDeadline(req, res) {
  const deadline = new Deadline({
    registration: req.body.registration,
    submission: req.body.submission,
    teams: req.body.teams,
    judging: req.body.judging,
  });
  try {
    await deadline.save();
    Utils.sendResponse(res, httpStatus.OK,
      httpStatus.getStatusText(httpStatus.OK));
  } catch (error) {
    const uniqueColumnKey = Object.keys(error.errors)[0];
    Utils.sendResponse(res, httpStatus.BAD_REQUEST, httpStatus.getStatusText(
      httpStatus.BAD_REQUEST
    ), null, [{ message: uniqueColumnKey }]);
  }
}

export async function removeDeadline(req, res) {
  try {
    const deadline = await Deadline.findOneAndRemove({
      name: req.params.name
    });
    if (deadline) {
      Utils.sendResponse(res, httpStatus.NO_CONTENT,
        httpStatus.getStatusText(httpStatus.NO_CONTENT));
      return;
    }
    Utils.sendResponse(res, httpStatus.NOT_FOUND, httpStatus.getStatusText(httpStatus.NOT_FOUND));
  } catch (error) {
    Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(
      httpStatus.INTERNAL_SERVER_ERROR
    ), null, [{ message: 'couldn\'t connect to the database' }]);
  }
}

export async function updateDeadline(req, res) {
  try {
    const deadline = await Deadline.findOneAndUpdate({}, {
      registration: req.body.registration,
      submission: req.body.submission,
      teams: req.body.teams,
      judging: req.body.judging
    }, {
        new: true
      });
    if (deadline) {
      redis.setDeadlines();
      Utils.sendResponse(res, httpStatus.OK,
        httpStatus.getStatusText(httpStatus.OK), deadline);
      return;
    }
    Utils.sendResponse(res, httpStatus.NOT_FOUND, httpStatus.getStatusText(
      httpStatus.NOT_FOUND
    ), null, [{ message: 'Not found' }]);
  } catch (error) {
    Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(
      httpStatus.INTERNAL_SERVER_ERROR
    ), null, [{ message: 'couldn\'t connect to the database' }]);
  }
}

export async function updateMail(req, res) {
  try {
    const mail = await Mail.findOneAndUpdate({}, {
      host: req.body.host,
      port: req.body.port,
      username: req.body.username,
      password: req.body.password
    }, {
        new: true
      });
    if (mail) {
      redis.populateWithConfig(mail);
      Utils.sendResponse(res, httpStatus.OK,
        httpStatus.getStatusText(httpStatus.OK), mail);
      return;
    }
    Utils.sendResponse(res, httpStatus.NOT_FOUND, httpStatus.getStatusText(
      httpStatus.NOT_FOUND
    ), null, [{ message: 'Not found' }]);
  } catch (error) {
    Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(
      httpStatus.INTERNAL_SERVER_ERROR
    ), null, [{ message: 'couldn\'t connect to the database' }]);
  }
}

export async function getMail(_, res) {
  try {
    const mail = await Mail.findOne({});
    Utils.sendResponse(res, httpStatus.OK,
      httpStatus.getStatusText(httpStatus.OK), mail);
  } catch (error) {
    Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(
      httpStatus.INTERNAL_SERVER_ERROR
    ), null, [{ message: 'couldn\'t connect to the database' }]);
  }
}

export async function getTopIdeas(_, res) {
  try {
    const ideas = await Idea.find({});
    const teams = await Team.find({});
    const topIdeas = [];
    await ideas.forEach((idea) => {
      let email = teams.filter(team => team.name === idea.teamName);
      email = email[0].members;

      const topIdea = {
        teamName: idea.teamName,
        averageScore: idea.score,
        team: email,
        title: idea.title,
        category: idea.category
      };

      topIdeas.push(topIdea);
      topIdeas.sort((a, b) => {
        if (a.averageScore < b.averageScore) { return 1; }
        if (a.averageScore > b.averageScore) { return -1; }
        return 0;
      });
    });
    const result = {};
    topIdeas.forEach((idea) => {
      let catIdeas = [];
      if (result[idea.category] !== undefined) { catIdeas = result[idea.category]; }
      catIdeas.push(idea);
      result[idea.category] = catIdeas;
    });
    Utils.sendResponse(res, httpStatus.OK,
      httpStatus.getStatusText(httpStatus.OK), result);
  } catch (error) {
    Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, httpStatus.getStatusText(
      httpStatus.INTERNAL_SERVER_ERROR
    ), null, [{ message: 'couldn\'t connect to the database' }]);
  }
}
export async function addTeamMember(req, res) { // change user's teamMember to team name
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (!user) {
      Utils.sendResponse(res, httpStatus.NOT_FOUND, httpStatus.getStatusText(
        httpStatus.NOT_FOUND
      ), null, [{ message: 'User not found' }]);
      return;
    }
    if (user.teamMember !== '-1') {
      Utils.sendResponse(res, httpStatus.CONFLICT,
        httpStatus.getStatusText(httpStatus.CONFLICT), null,
        [{ message: 'User already in a team' }]);
      return;
    }
    if (user.teamMember === req.params.teamName) {
      Utils.sendResponse(res, httpStatus.CONFLICT,
        httpStatus.getStatusText(httpStatus.CONFLICT), null,
        [{ message: 'User already in this team' }]);
      return;
    }
    try {
      const team = await Team.findOne({ name: req.params.teamName });
      if (!team) {
        Utils.sendResponse(res, httpStatus.NOT_FOUND, httpStatus.getStatusText(
          httpStatus.NOT_FOUND
        ), null, [{ message: 'Team not found' }]);
        return;
      }
      if (team.members.length >= 5) {
        Utils.sendResponse(res, httpStatus.BAD_REQUEST,
          httpStatus.getStatusText(httpStatus.BAD_REQUEST),
          null, [{ message: 'max 5 team members allowed' }]);
        return;
      }
      team.members.push({ email: req.body.email.toLowerCase(), accepted: true });
      try {
        const teams = await Team.findOneAndUpdate({ name: req.params.teamName },
          { $set: { members: team.members } },
          { new: true });
        if (!teams) {
          Utils.sendResponse(res, httpStatus.NOT_FOUND, httpStatus.getStatusText(
            httpStatus.NOT_FOUND
          ), null, [{ message: 'Team not found' }]);
          return;
        }
        try {
          await User.findOneAndUpdate({ email: req.body.email.toLowerCase() },
            { $set: { teamMember: req.params.teamName } },
            { new: true });
          Utils.updateUserIndex(user);
          Utils.sendResponse(res, httpStatus.OK, httpStatus.getStatusText(httpStatus.OK), teams);
          return;
        } catch (error) {
          Utils.sendResponse(res, httpStatus.BAD_REQUEST,
            httpStatus.getStatusText(httpStatus.BAD_REQUEST), null,
            [{ message: error.message }]);
          return;
        }
      } catch (error) {
        Utils.sendResponse(res, httpStatus.BAD_REQUEST,
          httpStatus.getStatusText(httpStatus.BAD_REQUEST), null,
          [{ message: error.message }]);
        return;
      }
    } catch (error) {
      Utils.sendResponse(res, httpStatus.BAD_REQUEST,
        httpStatus.getStatusText(httpStatus.BAD_REQUEST), null,
        [{ message: error.message }]);
      return;
    }
  } catch (error) {
    Utils.sendResponse(res, httpStatus.BAD_REQUEST,
      httpStatus.getStatusText(httpStatus.BAD_REQUEST), null,
      [{ message: error.message }]);
  }
}

export async function deleteTeamMember(req, res) {
  try {
    const team = await Team.findOne({ name: req.params.teamName });
    if (!team) {
      Utils.sendResponse(res, httpStatus.NOT_FOUND, httpStatus.getStatusText(
        httpStatus.NOT_FOUND
      ), null, [{ message: 'Team not found' }]);
      return;
    }
    const newMembers = [];
    for (let i = 0; i < team.members.length; i += 1) {
      if (team.members[i].email !== req.body.email.toLowerCase()) {
        newMembers.push(team.members[i]);
      }
    }
    if (team.members.length === newMembers.length) {
      Utils.sendResponse(res, httpStatus.NOT_FOUND, httpStatus.getStatusText(
        httpStatus.NOT_FOUND
      ), null, [{ message: 'User not found in team' }]);
      return;
    }
    if (newMembers < 2) {
      Utils.sendResponse(res, httpStatus.BAD_REQUEST, httpStatus.getStatusText(
        httpStatus.BAD_REQUEST
      ), null, [{ message: 'A team cannot have less than two members.' }]);
      return;
    }
    try {
      const doc = await Team.findOneAndUpdate({ name: req.params.teamName },
        { $set: { members: newMembers } }, { new: true });
      if (!doc) {
        Utils.sendResponse(res, httpStatus.NOT_FOUND, httpStatus.getStatusText(
          httpStatus.NOT_FOUND
        ), null, [{ message: 'team not found' }]);
        return;
      }
      try {
        const newUser = await User.findOneAndUpdate({ email: req.body.email.toLowerCase() },
          { $set: { teamMember: '-1' } }, { new: true });
        if (!newUser) {
          Utils.sendResponse(res, httpStatus.NOT_FOUND, httpStatus.getStatusText(
            httpStatus.NOT_FOUND
          ), null, [{ message: 'user not found' }]);
          return;
        }
        Utils.sendResponse(res, httpStatus.OK, httpStatus.getStatusText(httpStatus.OK), doc);
      } catch (error) {
        Utils.sendResponse(res, httpStatus.BAD_REQUEST,
          httpStatus.getStatusText(httpStatus.BAD_REQUEST), null, [{ message: error.message }]);
        return;
      }
    } catch (error) {
      Utils.sendResponse(res, httpStatus.BAD_REQUEST,
        httpStatus.getStatusText(httpStatus.BAD_REQUEST), null, [{ message: error.message }]);
      return;
    }
  } catch (error) {
    Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR,
      httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR), null,
      [{ message: error.message }]);
  }
}

export async function searchUsers(req, res) {
  const email = req.params.email.toLowerCase();
  try {
    const results = await esClient.search({
      index: config.esIndex,
      type: elasticsearch.userType,
      body: {
        size: 10,
        query: {
          bool: {
            must: [{
              wildcard: {
                email: `${email}*`
              }
            },
            {
              term: {
                teamMember: '-1'
              }
            },
            ],
          }
        },
      }
    });
    Utils.sendResponse(res, httpStatus.OK,
      httpStatus.getStatusText(httpStatus.OK), results.hits.hits);
    return;
  } catch (error) {
    Utils.sendResponse(res, httpStatus.BAD_REQUEST,
      httpStatus.getStatusText(httpStatus.BAD_REQUEST), null, [{ message: error }]);
  }
}
export async function saveQuestions(req, res) {
  const questions = req.body.questions;
  console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$', questions)
  try {
    await Question.deleteMany();
    questions.forEach((question) => {
      const questionsJudges = new Question(question);
      try {
        (async () => {
          await questionsJudges.save();
        })();
      } catch (error) {
        Utils.sendResponse(res, httpStatus.CONFLICT,
          httpStatus.getStatusText(httpStatus.CONFLICT),
          null, [{ message: 'Question already exists' }]);
      }
    });
    Utils.sendResponse(res, httpStatus.OK,
      httpStatus.getStatusText(httpStatus.OK));
  } catch (error) {
    Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR,
      httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR),
      null, [{ message: 'couldn\'t connect to the database' }]);
  }
}

function makePassword() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 10; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export async function createJudge(req, res) {
  const password = makePassword();
  try {
    let user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (user) {
      if (user.isJudge || user.isAdmin || user.isCLeader || user.isRLeader || user.isGLeader) {
        Utils.sendResponse(res, httpStatus.BAD_REQUEST,
          httpStatus.getStatusText(httpStatus.BAD_REQUEST), null, [{ message: 'Judge cannot be a leader or admin' }]);
        return;
      }
      else if (user.teamMember != -1 || user.creatorOf != -1) {
        Utils.sendResponse(res, httpStatus.BAD_REQUEST,
          httpStatus.getStatusText(httpStatus.BAD_REQUEST), null, [{ message: 'Judge cannot be in a team or a creator of a team' }]);
        return;
      }
      else {
        user = await User.findOneAndUpdate({ email: req.body.email.toLowerCase() },
          { $set: { isJudge: true } });

        const body = `Hi ${req.body.email},\nThank you for volunteering to judge the idea pitches for GameChangers 2019.`
          +`\nFor more details about the competition, visit https://inside.dell.com/groups/gamechangers at Inside Dell, or email us at DellGameChangers@dell.com.`
          + '\nWe appreciate your participation and partnership in encouraging innovation and team spirit at Dell,\nGameChangers 2019';
        SendMail.sendEmail(req.body.email, 'Welcome to GameChangers 2019!', body);
      }
    } else {
      // {"name":"aq","email":"q@emc.com","password":"123123","passConf":"123123","region":"EMEA","chapter":"Chapter1"}
      user = new User();
      user.email = req.body.email.toLowerCase();
      user.name = req.body.email;
      // user.chapter = 'Chapter1';
      // user.region = "EMEA";
      user.password = '123123';
      user.isJudge = true;
      const usr = await user.save();
      console.log()
      console.log()
      console.log()
      console.log()
      console.log()
      console.log(usr)
      if (!usr) {
        Utils.sendResponse(res, httpStatus.BAD_REQUEST,
          httpStatus.getStatusText(httpStatus.BAD_REQUEST), null, [{ message: 'couldn\'t save judge' }]);
        return;
      }
      const token = await Utils.getRandomToken();

      await User.findByIdAndUpdate({ _id: user._id },
        { resetPasswordToken: token, resetPasswordExpires: Date.now() + 86400000 },
        { upsert: true, new: true });
      // http://ec2-54-153-49-90.us-west-1.compute.amazonaws.com
      const body = `Hi ${req.body.email},\nThank you for volunteering to judge the idea pitches for GameChangers 2019.`
        + `\nYou can create a password for your account by clicking on the following link: http://ec2-54-153-49-90.us-west-1.compute.amazonaws.com/#/reset-password/${token} 
        \nFor more details about the competition, visit https://inside.dell.com/groups/gamechangers at Inside Dell, or email us at DellGameChangers@dell.com.`
        + '\nWe appreciate your participation and partnership in encouraging innovation and team spirit at Dell,\nGameChangers 2019';
      SendMail.sendEmail(req.body.email, 'Welcome to GameChangers 2019!', body);
    }

    // const judgment = new Judgment({ judgeId: user._id, ideasID: [] });
    // const judgeSaved = await judgment.save();
    // if (!judgeSaved) {
    //   Utils.sendResponse(res, httpStatus.BAD_REQUEST,
    //     httpStatus.getStatusText(httpStatus.BAD_REQUEST), null, [{ message: 'couldn\'t save judge' }]);
    //   return;
    // }
    Utils.sendResponse(res, httpStatus.OK,
      httpStatus.getStatusText(httpStatus.OK), user._id);
    return;
  } catch (err) {
    Utils.sendResponse(res, httpStatus.BAD_REQUEST,
      httpStatus.getStatusText(httpStatus.BAD_REQUEST), null, [{ message: err.message }]);
  }
}

export async function getAllJudges(_, res) {
  try {
    const judges = await User.find({ isJudge: true }, 'name isJudge email');
    Utils.sendResponse(res, httpStatus.OK, httpStatus.getStatusText(httpStatus.OK), judges);
  } catch (error) {
    Utils.sendResponse(res, httpStatus.BAD_REQUEST,
      httpStatus.getStatusText(httpStatus.BAD_REQUEST), null, [{ message: error.message }]);
  }
}

export async function getJudge(req, res) {
  try {
    const judge = await User.findOne({ _id: req.params.judgeId }, 'name isJudge email');
    if (!judge) {
      Utils.sendResponse(res, httpStatus.NOT_FOUND,
        httpStatus.getStatusText(httpStatus.NOT_FOUND), null, [{ message: 'Judge not found' }]);
      return;
    }
    Utils.sendResponse(res, httpStatus.OK, httpStatus.getStatusText(httpStatus.OK), judge);
  } catch (error) {
    Utils.sendResponse(res, httpStatus.BAD_REQUEST,
      httpStatus.getStatusText(httpStatus.BAD_REQUEST), null, error.message);
  }
}

export async function isJudge(req, res) {
  try {
    const user = await User.findOne({ email: req.params.email }, '_id isJudge');
    if (!user) {
      return Utils.sendResponse(res, httpStatus.NOT_FOUND,
        httpStatus.getStatusText(httpStatus.NOT_FOUND), null, [{ message: 'User not found' }]);
    }
    return Utils.sendResponse(res, httpStatus.OK, httpStatus.getStatusText(httpStatus.OK), user);
  } catch (err) {
    return Utils.sendResponse(res, httpStatus.BAD_REQUEST,
      httpStatus.getStatusText(httpStatus.BAD_REQUEST), null, [{ message: err.message }]);
  }
}

export async function addRegion(req, res) {
  const region = new Region({
    name: req.body.name
  });
  try {
    await region.save();
    Utils.sendResponse(res, httpStatus.OK, httpStatus.getStatusText(httpStatus.OK));
  } catch (error) {
    const uniqueColumnKey = Object.keys(error.errors)[0];
    Utils.sendResponse(res, httpStatus.BAD_REQUEST, httpStatus.getStatusText(
      httpStatus.BAD_REQUEST
    ), null, [{ message: error.errors[uniqueColumnKey].message }]);
  }
}

export async function getRegions(req, res) {
  try {
    const regions = await Region.find({});
    Utils.sendResponse(res, httpStatus.OK, httpStatus.getStatusText(httpStatus.OK), regions);
  } catch (err) {
    Utils.sendResponse(res, httpStatus.BAD_REQUEST,
      httpStatus.getStatusText(httpStatus.BAD_REQUEST), null, [{ message: err.message }]);
  }
}

export async function getChapters(req, res) {
  try {
    const chapters = await Chapter.find({}).populate('region', 'name');
    Utils.sendResponse(res, httpStatus.OK, httpStatus.getStatusText(httpStatus.OK), chapters);
  } catch (err) {
    Utils.sendResponse(res, httpStatus.BAD_REQUEST,
      httpStatus.getStatusText(httpStatus.BAD_REQUEST), null, [{ message: err.message }]);
  }
}

export async function addChapter(req, res) {
  const chapter = new Chapter({
    name: req.body.name,
    region: req.body.region
  });
  try {
    await chapter.save();
    Utils.sendResponse(res, httpStatus.OK, httpStatus.getStatusText(httpStatus.OK));
  } catch (error) {
    Utils.sendResponse(res, httpStatus.BAD_REQUEST, httpStatus.getStatusText(
      httpStatus.BAD_REQUEST
    ), null, [{ message: error }]);
  }
}
export async function deleteChapter(req, res) {
  try {
    Chapter.findOneAndDelete({ name: req.body.name });
    Utils.sendResponse(res, httpStatus.OK, httpStatus.getStatusText(httpStatus.OK));
  } catch (error) {
    Utils.sendResponse(res, httpStatus.BAD_REQUEST, httpStatus.getStatusText(
      httpStatus.BAD_REQUEST
    ), null, [{ message: error }]);
  }
}
export async function newLeader(user, kind) {
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
        We are excited to let you know that you have been added you as a ${kind} leader  of the\n GameChangers 2019.
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

  SendMail.sendEmail(user.email, 'Welcome to GameChangers', body);
}

export async function inviteCLeader(req, res) {
  try {
    let user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (user) {
      user = await User.findOneAndUpdate({ email: req.body.email.toLowerCase() },
        { $set: { isCLeader: true, teamMember: '-1', isRLeader: false } });
      const body = `Hi ${user.name} ,
      We are excited to let you know that you have been added you as a chapter leader of the GameChangers 2019.
    Please follow this link to login to your account
    http://ec2-54-153-49-90.us-west-1.compute.amazonaws.com/
    For more details about the competition, visit https://inside.dell.com/groups/gamechangers at Inside Dell.
    We look forward to your participation.
    GameChangers 2019
    Regards,
    `;
      SendMail.sendEmail(user.email, 'Welcome to GameChangers', body)
    } else {
      user = new User();
      user.email = req.body.email.toLowerCase();
      user.name = req.body.name;
      user.chapter = req.body.chapter;
      user.region = req.body.region;
      user.password = '123123';
      user.isCLeader = true;
      const usr = await user.save();
      if (!usr) {
        Utils.sendResponse(res, httpStatus.BAD_REQUEST,
          httpStatus.getStatusText(httpStatus.BAD_REQUEST), null, [{ message: 'couldn\'t save Leader' }]);
        return;
      }
      newLeader(user, 'Chapter');
    }


    Utils.sendResponse(res, httpStatus.OK,
      httpStatus.getStatusText(httpStatus.OK), user._id);
    return;
  } catch (err) {
    Utils.sendResponse(res, httpStatus.BAD_REQUEST,
      httpStatus.getStatusText(httpStatus.BAD_REQUEST), null, [{ message: err.message }]);
  }
}
export async function inviteRLeader(req, res) {
  try {
    let user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (user) {
      user = await User.findOneAndUpdate({ email: req.body.email.toLowerCase() },
        { $set: { isRLeader: true, teamMember: '-1', isCLeader: false } });
      const body = `Hi ${user.name} ,
      We are excited to let you know that you have been added you as a region leader of the GameChangers 2019.
    Please follow this link to login to your account
    http://ec2-54-153-49-90.us-west-1.compute.amazonaws.com/
    For more details about the competition, visit https://inside.dell.com/groups/gamechangers at Inside Dell.
    We look forward to your participation.
    GameChangers 2019
    Regards,
    `;
      SendMail.sendEmail(user.email, 'Welcome to GameChangers', body)
    } else {
      user = new User();
      user.email = req.body.email.toLowerCase();
      user.name = req.body.name;
      user.chapter = req.body.chapter;
      user.region = req.body.region;
      user.password = '123123';
      user.isRLeader = true;
      const usr = await user.save();
      if (!usr) {
        Utils.sendResponse(res, httpStatus.BAD_REQUEST,
          httpStatus.getStatusText(httpStatus.BAD_REQUEST), null, [{ message: 'couldn\'t save Leader' }]);
        return;
      }
      newLeader(user, 'Region');
    }


    Utils.sendResponse(res, httpStatus.OK,
      httpStatus.getStatusText(httpStatus.OK), user._id);
    return;
  } catch (err) {
    Utils.sendResponse(res, httpStatus.BAD_REQUEST,
      httpStatus.getStatusText(httpStatus.BAD_REQUEST), null, [{ message: err.message }]);
  }
}
export async function inviteGLeader(req, res) {
  try {
    let user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (user) {
      user = await User.findOneAndUpdate({ email: req.body.email.toLowerCase() },
        { $set: { isGLeader: true, teamMember: '-1', isCLeader: false, isRLeader: false } });
      const body = `Hi ${user.name} ,
      We are excited to let you know that you have been added you as a Gloabl leader of the GameChangers 2019.
    Please follow this link to login to your account
    http://ec2-54-153-49-90.us-west-1.compute.amazonaws.com/
    For more details about the competition, visit https://inside.dell.com/groups/gamechangers at Inside Dell.
    We look forward to your participation.
    GameChangers 2019
    Regards,
    `;
      SendMail.sendEmail(user.email, 'Welcome to GameChangers', body)
    } else {
      user = new User();
      user.email = req.body.email.toLowerCase();
      user.name = req.body.name;
      user.chapter = "-1";
      user.region = "-1";
      user.password = '123123';
      user.isGLeader = true;
      const usr = await user.save();
      if (!usr) {
        Utils.sendResponse(res, httpStatus.BAD_REQUEST,
          httpStatus.getStatusText(httpStatus.BAD_REQUEST), null, [{ message: 'couldn\'t save Leader' }]);
        return;
      }
      newLeader(user, 'Global');
    }


    Utils.sendResponse(res, httpStatus.OK,
      httpStatus.getStatusText(httpStatus.OK), user._id);
    return;
  } catch (err) {
    Utils.sendResponse(res, httpStatus.BAD_REQUEST,
      httpStatus.getStatusText(httpStatus.BAD_REQUEST), null, [{ message: err.message }]);
  }
}

export async function emailRegion(req, res) {
  try {
    const emails = [];
    const teams = await Team.find({ region: req.body.region }).populate('creator', 'email name');
    teams.forEach((team) => {
      emails.push(team.creator.email);
    });
    SendMail.sendNotification(emails, req.body.subject, req.body.emailBody);
    Utils.sendResponse(res, httpStatus.OK,
      httpStatus.getStatusText(httpStatus.OK), req.body.region);
    return;
  } catch (error) {
    console.log(error);
    Utils.sendResponse(res, httpStatus.BAD_REQUEST,
      httpStatus.getStatusText(httpStatus.BAD_REQUEST), null, [{ message: error }]);
  }
}
export async function emailChapter(req, res) {
  try {
    const emails = [];
    const teams = await Team.find({ chapter: req.body.chapter }).populate('creator', 'email name');
    teams.forEach((team) => {
      emails.push(team.creator.email);
    });
    SendMail.sendNotification(emails, req.body.subject, req.body.emailBody);
    Utils.sendResponse(res, httpStatus.OK,
      httpStatus.getStatusText(httpStatus.OK), req.body.region);
    return;
  } catch (error) {
    console.log(error);
    Utils.sendResponse(res, httpStatus.BAD_REQUEST,
      httpStatus.getStatusText(httpStatus.BAD_REQUEST), null, [{ message: error }]);
  }
}
export async function sendEmails(req, res) {
  let emailList = req.body.emails
  let subject = req.body.subject
  let body = req.body.emailBody

  console.log(emailList)
  try {
    SendMail.sendEmail(emailList, subject, body)
    return Utils.sendResponse(res, httpStatus.OK, httpStatus.getStatusText(httpStatus.OK), null)
  } catch (error) {
    console.log(error)
    return Utils.sendResponse(res, httpStatus.BAD_REQUEST,
      httpStatus.getStatusText(httpStatus.BAD_REQUEST), null, [{ message: error }]);
  }

}
// export async function makeAuserAJudge(req, res) {
//   try {
//     const user = await User.findOne({ email: req.params.email.toLowerCase() });
//     if (!user) {
//       Utils.sendResponse(res, httpStatus.BAD_REQUEST,
//         httpStatus.getStatusText(httpStatus.BAD_REQUEST),
//         null, [{ message: 'User not found' }]);
//       return;
//     }
//     user.isJudge = true;
//     try {
//       await user.save();
//       const judgment = new Judgment({ judgeId: user._id, ideasID: [] });
//       try {
//         await judgment.save();
//         Utils.sendResponse(res, httpStatus.OK, httpStatus.getStatusText(httpStatus.OK),
//           user._id);
//       } catch (error) {
//         Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR,
//           httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR),
//           null, [{ message: 'couldn\'t connect to the database' }]);
//         return;
//       }
//     } catch (error) {
//       Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR,
//         httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR),
//         null, [{ message: 'couldn\'t connect to the database' }]);
//       return;
//     }
//   } catch (error) {
//     Utils.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR,
//       httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR),
//       null, [{ message: 'couldn\'t connect to the database' }]);
//   }
// }
