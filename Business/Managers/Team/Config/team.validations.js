import Joi from 'joi';

const user = Joi.object().keys({
  email: Joi.string().required(),
  name: Joi.string().required()
});

  // POST /teams
export const _createTeam = {
  body: {
    teamName: Joi.string().required(),
    members: Joi.array().items(user).required(),
  }
};
  // POST /delete/member
export const _deleteTeamMember = {
  params: {
    email: Joi.string().required()
  }
};

  // POST /add/member
export const _addTeamMember = {
  body: {
    email: Joi.string().required()
  }
};

export const _respondToInvitation = {
  body: {
    accepted: Joi.boolean().required()
  },
  params: {
    teamName: Joi.string().required()
  }
};

export const _deleteTeam = {
  body: {
    teamName: Joi.string().required(),
  }
};
export const _joinTeam = {
  body:{
    teamName: Joi.string().required()
  }
};
